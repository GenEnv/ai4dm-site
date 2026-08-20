/* ============ Measures: Studio — iterate on one image ============ */
(function(){
"use strict";
var $=MX.$, esc=MX.esc, el=MX.el;

var S={ nodes:[], activeId:null, compare:false, busy:false,
        mark:{ on:false, strokes:0, canvas:null, composite:null, forId:null } };
var built=false, pendingPrompt=null, pendingAdopt=null;

/* journal shared entry point (workflow pushes here too) */
MX.journalPush=function(o){
  ensureBuilt();
  var n={ id:MX.uid("s"), parent:o.parent||null, kind:o.kind||"gen",
          label:o.label||(o.prompt||"").slice(0,40), prompt:o.prompt||"",
          img:o.img, provider:o.provider||"—",
          depth:o.parent?(byId(o.parent)?byId(o.parent).depth+1:0):0 };
  S.nodes.push(n);
  if(o.activate!==false){ S.activeId=n.id; }
  renderLineage(); renderStage(); syncGen();
  return n;
};
MX.studioAdopt=function(img,label){
  ensureBuilt();
  MX.journalPush({img:img,kind:"base",label:label||"adopted",prompt:"",provider:"—"});
};
MX.studioLoadPrompt=function(text){
  ensureBuilt();
  var ta=$("#stPrompt"); if(ta){ ta.value=text; syncGen(); }
  else pendingPrompt=text;
};

function byId(id){ return S.nodes.find(function(n){return n.id===id;}); }
function active(){ return byId(S.activeId)||null; }

function ensureBuilt(){
  if(built) return; built=true;
  var v=$("#view-studio");
  v.innerHTML=
  '<div class="st-main">'+
    '<div class="st-work">'+
      '<div class="st-stage" id="stStage">'+
        '<div class="empty" id="stEmpty"><h2>One image, every move on the record.</h2>'+
        '<div>Upload a drawing, plan, model photo or site image — or take a sample — then transform it. Every generation lands on the version tree; branch from any node.</div></div>'+
      '</div>'+
      '<div class="st-statusbar" id="stBar" hidden>'+
        '<span class="t" id="stName">—</span><span class="pr" id="stPr"></span>'+
        '<button id="stMark" aria-pressed="false" title="draw red instructions on the image — like redlines on trace paper. The marks steer the edit and are not reproduced.">✎ redline</button>'+
        '<button id="stCmp" aria-pressed="false">compare to parent</button>'+
      '</div>'+
      '<div class="st-composer">'+
        '<div class="st-baserow"><span class="lab">base</span>'+
          '<button class="btn small" id="stUp">↑ Upload</button>'+
          '<button class="btn small" id="stSample">Sample</button>'+
          '<input type="file" id="stFile" accept="image/*" hidden>'+
          '<span id="stBase" style="color:var(--soft)">none — generating from scratch</span>'+
          '<span class="spring"></span>'+
          '<button class="btn small" id="stStyleRef" title="upload any reference image — its style is analysed into a reusable prompt fragment (uses your Gemini key)">⤵ style from reference</button></div>'+
        '<div class="st-baserow"><span class="lab">skill</span>'+
          '<select id="stSkill" style="border:1px solid var(--line);border-radius:6px;background:#fff;padding:4px 7px;font-size:12px;max-width:320px"><option value="">choose a representation skill…</option></select>'+
          '<button class="btn small" id="stSkillUse">Use</button>'+
          '<span id="stSkillWhat" style="color:var(--soft);font-size:11.5px"></span></div>'+
        '<div class="lenses" id="stLenses"></div>'+
        '<div class="prow">'+
          '<textarea id="stPrompt" placeholder="Describe the move. e.g. redraw this as a hard-line ink elevation on white; keep the proportions exactly; no text"></textarea>'+
          '<div class="go"><button class="btn primary" id="stGen" disabled>Generate</button>'+
          '<span class="chint" id="stHint">⌘/Ctrl + Enter</span></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="st-rail">'+
      '<h3>Version tree <span style="display:flex;gap:8px;align-items:center"><button class="btn small" id="stExport" title="export the whole process record as a submittable document" style="font-size:10px;padding:2px 8px">export journal</button><span id="stCount">0</span></span></h3>'+
      '<div class="lineage" id="stLineage"><div class="lin-empty">Every generation lands here as a node linked to what it came from. Click a node to branch from it.</div></div>'+
    '</div>'+
  '</div>';

  /* lenses */
  var lw=$("#stLenses");
  MX_LENSES.forEach(function(grp){
    var g=el("div","lgroup");
    g.appendChild(el("span","glab",esc(grp[0])));
    grp[1].forEach(function(l){
      var b=el("button","lens",esc(l[0])); b.type="button"; b.title=l[1];
      b.onclick=function(){
        var ta=$("#stPrompt"), cur=ta.value.trim();
        ta.value = cur ? cur.replace(/[;,.\s]*$/,"")+"; "+l[1] : l[1].charAt(0).toUpperCase()+l[1].slice(1);
        ta.focus(); syncGen();
      };
      g.appendChild(b);
    });
    lw.appendChild(g);
  });

  $("#stExport").onclick=exportJournal;
  (function(){
    var sel=$("#stSkill");
    (window.MX_SKILLS||[]).forEach(function(s){ var o=document.createElement("option"); o.value=s.id; o.textContent=s.title; sel.appendChild(o); });
    sel.onchange=function(){ var s=(window.MX_SKILLS||[]).find(function(x){return x.id===sel.value;}); $("#stSkillWhat").textContent=s?s.what:""; };
    $("#stSkillUse").onclick=function(){
      var s=(window.MX_SKILLS||[]).find(function(x){return x.id===sel.value;});
      if(!s){ MX.toast("Pick a skill first"); return; }
      $("#stPrompt").value=s.template; syncGen();
      MX.toast(s.needsBase?"Skill loaded — needs a base image; fill any [SLOTS]":"Skill loaded — fill any [SLOTS]");
    };
  })();
  $("#stStyleRef").onclick=function(){
    var btn=this;
    MX.pickImage().then(function(img){
      btn.disabled=true; btn.textContent="analysing…";
      return MX.textGen(
        "You are an architectural representation tutor. Describe the STYLE of this image as a reusable image-generation prompt fragment: medium and technique, line quality, colour palette, light, composition, level of abstraction. Do NOT describe the subject or content. Output exactly one line, at most 40 words, lowercase fragments separated by commas, no preamble.", img);
    }).then(function(frag){
      var ta=$("#stPrompt"), cur=ta.value.trim();
      ta.value = cur ? cur.replace(/[;,.\s]*$/,"")+"; in this style: "+frag : "In this style: "+frag;
      syncGen(); MX.toast("Style extracted from reference");
    }).catch(function(e){ if(e.message!=="cancelled") MX.toast(e.message); })
      .finally(function(){ btn.disabled=false; btn.textContent="⤵ style from reference"; });
  };
  $("#stUp").onclick=function(){ $("#stFile").click(); };
  $("#stFile").onchange=function(e){
    var f=e.target.files[0]; if(!f)return;
    var r=new FileReader();
    r.onload=function(){ MX.journalPush({img:r.result,kind:"base",label:"uploaded",provider:"—"}); };
    r.readAsDataURL(f); e.target.value="";
  };
  $("#stSample").onclick=function(){ MX.journalPush({img:MX.sampleImage(),kind:"base",label:"sample drawing",provider:"—"}); };
  $("#stCmp").onclick=function(){ S.compare=!S.compare; this.setAttribute("aria-pressed",S.compare?"true":"false"); renderStage(); };
  $("#stMark").onclick=function(){
    if(!active()){ MX.toast("Add a base image first"); return; }
    S.mark.on=!S.mark.on;
    if(S.mark.on){ S.compare=false; $("#stCmp").setAttribute("aria-pressed","false"); }
    renderStage();
  };
  $("#stPrompt").addEventListener("input",syncGen);
  $("#stPrompt").addEventListener("keydown",function(e){ if((e.metaKey||e.ctrlKey)&&e.key==="Enter"){ e.preventDefault(); generate(); } });
  $("#stGen").onclick=generate;
  document.addEventListener("mx:provider",syncGen);

  if(pendingPrompt){ $("#stPrompt").value=pendingPrompt; pendingPrompt=null; }
  syncGen();
}
MX.studioEnsure=ensureBuilt;

function renderStage(){
  var a=active(), stage=$("#stStage"), bar=$("#stBar");
  stage.querySelectorAll(".viewimg,.pair,.mk-wrap,.mk-tools").forEach(function(e){e.remove();});
  $("#stEmpty").style.display = a?"none":"block";
  if(a && S.mark.forId && S.mark.forId!==a.id) resetMark();   // redlines belong to one base image
  if(!a){ bar.hidden=true; return; }
  bar.hidden=false;
  $("#stName").textContent = a.kind==="base" ? a.label : a.id+" · "+a.provider;
  $("#stPr").textContent = a.prompt||"";
  syncMarkBtn();
  if(S.mark.on){ renderMarkup(stage,a); return; }
  if(S.compare&&a.parent){
    var p=byId(a.parent);
    var pair=el("div","pair");
    pair.innerHTML='<figure><img src="'+p.img+'" alt="before"><figcaption>'+(p.kind==="base"?"base":esc(p.id))+' · before</figcaption></figure>'+
                   '<figure><img src="'+a.img+'" alt="after"><figcaption>'+esc(a.id)+' · after</figcaption></figure>';
    stage.appendChild(pair);
  } else {
    var img=el("img","viewimg"); img.src=a.img; img.alt="active version";
    stage.appendChild(img);
  }
}
/* ---------- redline markup: draw instructions on the image, like redlines on trace ---------- */
function resetMark(){ S.mark={on:false,strokes:0,canvas:null,composite:null,forId:null}; }
function syncMarkBtn(){
  var b=$("#stMark"); if(!b) return;
  b.setAttribute("aria-pressed",S.mark.on?"true":"false");
  b.textContent = S.mark.on ? "✎ drawing…" : (S.mark.strokes>0 ? "✎ redlined ("+S.mark.strokes+")" : "✎ redline");
  b.classList.toggle("marked",S.mark.strokes>0||S.mark.on);
}
function renderMarkup(stage,a){
  var wrap=el("div","mk-wrap");
  var img=el("img"); img.src=a.img; img.alt="base for redlines"; img.draggable=false;
  var cv=document.createElement("canvas"); cv.className="mk-canvas";
  wrap.appendChild(img); wrap.appendChild(cv);
  var tools=el("div","mk-tools",
    '<span class="mk-hint">Draw red instructions directly on the drawing — circle what changes, arrow where things go. Marks steer the edit; they are not reproduced.</span>'+
    '<button class="btn small" id="mkClear">clear</button>'+
    '<button class="btn small" id="mkCancel">discard</button>'+
    '<button class="btn small primary" id="mkDone">keep redlines</button>');
  stage.appendChild(wrap); stage.appendChild(tools);

  var ctx=cv.getContext("2d"), drawing=false, strokes=S.mark.strokes;
  function setup(){
    cv.width=img.naturalWidth||800; cv.height=img.naturalHeight||600;
    if(S.mark.canvas) ctx.drawImage(S.mark.canvas,0,0);
    ctx.strokeStyle="#D3341F"; ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.lineWidth=Math.max(4,Math.round(cv.width/220));
  }
  if(img.complete) setup(); else img.onload=setup;
  function pos(e){
    var r=cv.getBoundingClientRect();
    if(!r.width||!r.height) return null;
    var p={ x:(e.clientX-r.left)*cv.width/r.width, y:(e.clientY-r.top)*cv.height/r.height };
    return (isFinite(p.x)&&isFinite(p.y))?p:null;
  }
  cv.addEventListener("pointerdown",function(e){
    e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){}
    var p=pos(e); if(!p) return;
    drawing=true; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+0.01,p.y+0.01); ctx.stroke();
  });
  cv.addEventListener("pointermove",function(e){
    if(!drawing) return; var p=pos(e); if(!p) return; ctx.lineTo(p.x,p.y); ctx.stroke();
  });
  cv.addEventListener("pointerup",function(){ if(drawing){ drawing=false; strokes++; } });
  $("#mkClear").onclick=function(){ ctx.clearRect(0,0,cv.width,cv.height); strokes=0; S.mark.canvas=null; };
  $("#mkCancel").onclick=function(){ resetMark(); renderStage(); syncGen(); };
  $("#mkDone").onclick=function(){
    if(!strokes){ MX.toast("Nothing drawn — draw on the image, or discard"); return; }
    var c=document.createElement("canvas"); c.width=cv.width; c.height=cv.height;
    var x=c.getContext("2d"); x.drawImage(img,0,0,c.width,c.height); x.drawImage(cv,0,0);
    S.mark={ on:false, strokes:strokes, canvas:cv, composite:c.toDataURL("image/png"), forId:a.id };
    renderStage(); syncGen();
    MX.toast("Redlines kept — describe the move, then Generate");
  };
}

function depthColor(d){ var c=["#2E6E86","#3E7D5A","#9C6B1A","#6C5A9C","#B23A2E"]; return c[d%c.length]; }
function renderLineage(){
  var box=$("#stLineage"); $("#stCount").textContent=S.nodes.length;
  if(!S.nodes.length) return;
  box.innerHTML="";
  S.nodes.slice().reverse().forEach(function(n){
    var d=el("div","lnode"+(n.id===S.activeId?" active":""));
    var tag = n.kind==="base" ? '<span class="tag acc">base</span>'
            : n.kind==="redline" ? '<span class="tag red">redline</span>'
            : n.provider==="demo" ? '<span class="tag amber">demo</span>'
            : '<span class="tag">'+esc(n.provider)+'</span>';
    d.innerHTML='<div class="depth" style="background:'+depthColor(n.depth)+'"></div>'+
      '<div class="thumb"></div>'+
      '<div class="meta"><div class="top">'+tag+' <span class="id">'+esc(n.id)+(n.parent?" ← "+esc(n.parent):"")+'</span></div>'+
      '<div class="pr">'+(n.kind==="base"||n.kind==="redline"?'<em style="color:var(--faint)">'+esc(n.label)+'</em>':esc(n.prompt))+'</div></div>';
    d.querySelector(".thumb").style.backgroundImage='url("'+n.img+'")';
    d.onclick=function(){ S.activeId=n.id; renderLineage(); renderStage(); syncGen(); };
    box.appendChild(d);
  });
}
function syncGen(){
  if(!built) return;
  var hasPrompt=$("#stPrompt").value.trim().length>0;
  var ready=MX.ready(MX.state.provider);
  $("#stGen").disabled=!hasPrompt||!ready||S.busy;
  var a=active();
  var redlined = a && S.mark.strokes>0 && S.mark.forId===a.id;
  $("#stBase").textContent = a ? ("editing "+(a.kind==="base"?a.label:a.id)+(redlined?" · redlined":"")+" — generate makes a child of it")
                               : "none — generating from scratch";
  $("#stHint").textContent = (!ready&&hasPrompt) ? ("add your "+MX.state.provider+" key") : "⌘/Ctrl + Enter";
}
function setBusy(on,msg){
  S.busy=on;
  var stage=$("#stStage"), b=stage.querySelector(".busy");
  if(on){ if(!b){ b=el("div","busy"); stage.appendChild(b); } b.innerHTML='<div class="spin"></div><div>'+esc(msg||"generating…")+'</div>'; }
  else if(b) b.remove();
  syncGen();
}
function generate(){
  if(S.busy) return;
  var prompt=$("#stPrompt").value.trim(); if(!prompt) return;
  var prov=MX.state.provider;
  if(!MX.ready(prov)){ MX.openKeyModal(); return; }
  var a=active();
  var marked = a && S.mark.composite && S.mark.strokes>0 && S.mark.forId===a.id;
  var sendImg = marked ? S.mark.composite : (a?a.img:null);
  var sendPrompt = marked
    ? "The image contains RED freehand markings drawn over the base image. They are editing instructions (redlines), not part of the design: apply the requested change at the marked locations, keep everything unmarked exactly as it is, and do NOT reproduce any red markings in the output. "+prompt
    : prompt;
  setBusy(true, prov==="demo"?"applying local filter…":"asking "+prov+"…");
  MX.generate(prov,sendPrompt,sendImg).then(function(img){
    setBusy(false);
    MX.countGen(prov);
    var parentId=a?a.id:null;
    if(marked){
      var rn=MX.journalPush({img:S.mark.composite,kind:"redline",label:"redlines — "+S.mark.strokes+" marks",prompt:"",provider:"—",parent:a.id,activate:false});
      parentId=rn.id;
    }
    MX.journalPush({img:img,prompt:prompt,provider:prov,parent:parentId});
  }).catch(function(err){
    setBusy(false);
    var stage=$("#stStage");
    var b=el("div","busy"); b.style.background="rgba(120,30,24,.55)";
    b.innerHTML='<div style="max-width:340px;text-align:center"><b>Generation failed</b><br><span style="opacity:.85;font-size:11px">'+esc(err&&err.message||String(err))+'</span><br><br><button class="btn small" style="background:#fff" onclick="this.closest(\'.busy\').remove()">Dismiss</button></div>';
    stage.appendChild(b);
  });
}

/* ---------- process journal export: the tree IS the submission ---------- */
function exportJournal(){
  if(!S.nodes.length){ MX.toast("Nothing to export yet"); return; }
  var when=new Date();
  var rows=S.nodes.map(function(n,i){
    return '<article class="n">'+
      '<div class="img"><img src="'+n.img+'" alt="version '+esc(n.id)+'"></div>'+
      '<div class="meta">'+
        '<div class="line"><span class="badge'+(n.kind==="base"?" base":n.kind==="redline"?" red":"")+'">'+(n.kind==="base"?"base":n.kind==="redline"?"redline":esc(n.provider))+'</span>'+
        '<code>'+esc(n.id)+'</code>'+(n.parent?'<span class="from">← from <code>'+esc(n.parent)+'</code></span>':'<span class="from">origin</span>')+'</div>'+
        (n.prompt?'<p class="prompt">“'+esc(n.prompt)+'”</p>':'<p class="prompt muted">'+esc(n.label)+'</p>')+
        '<p class="note" contenteditable="true" data-ph="Why this move? What did it keep, what did it lose? (click to write)">Why this move? What did it keep, what did it lose? (click to write)</p>'+
      '</div></article>';
  }).join("");
  var html='<!doctype html><html><head><meta charset="utf-8"><title>Process journal — AI4DM</title><style>'+
    'body{font-family:system-ui,-apple-system,sans-serif;background:#E9E8E3;color:#1B1D21;margin:0;padding:40px 20px}'+
    '.wrap{max-width:860px;margin:0 auto}h1{font-family:Palatino,Georgia,serif;font-weight:600;font-size:26px;margin:0 0 4px}'+
    '.sub{color:#5B5F66;font-size:13px;margin:0 0 28px}'+
    '.n{display:grid;grid-template-columns:300px 1fr;gap:18px;background:#FBFAF7;border:1px solid #D3D1C8;border-radius:12px;padding:16px;margin-bottom:14px}'+
    '.n .img img{width:100%;border:1px solid #E1DFD7;border-radius:8px;background:#fff}'+
    '.badge{font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.07em;background:#E1DFD7;border-radius:100px;padding:2px 9px;color:#5B5F66}'+
    '.badge.base{background:#DCE9ED;color:#2E6E86}.badge.red{background:#F3DBD6;color:#B23A2E}'+
    '.line{display:flex;gap:9px;align-items:center;font-size:12px;color:#8C8F94}.line code{font-size:11px}'+
    '.prompt{font-size:14px;line-height:1.6;margin:10px 0}.muted{color:#8C8F94;font-style:italic}'+
    '.note{font-size:13px;color:#5B5F66;border-top:1px dashed #D3D1C8;padding-top:10px;min-height:2em;outline:none}'+
    '.note:focus{color:#1B1D21}'+
    '@media print{.n{break-inside:avoid}}'+
    '</style></head><body><div class="wrap">'+
    '<h1>Process journal</h1><p class="sub">'+S.nodes.length+' versions · exported '+when.toLocaleString()+
    ' · AI4DM — the record of the moves, not just the final image. Annotation fields are editable: write why each move was made, then print or re-save.</p>'+
    rows+'</div></body></html>';
  var blob=new Blob([html],{type:"text/html"});
  var fname="ai4dm-journal-"+when.toISOString().slice(0,10)+".html";
  if(window.showSaveFilePicker){
    window.showSaveFilePicker({suggestedName:fname,types:[{description:"HTML journal",accept:{"text/html":[".html"]}}]})
      .then(function(h){ return h.createWritable().then(function(w){ return w.write(blob).then(function(){ return w.close(); }); }); })
      .then(function(){ MX.toast("Journal saved — pick a OneDrive/Drive folder and it syncs automatically"); })
      .catch(function(e){ if(e && e.name!=="AbortError") MX.toast("Save failed: "+e.message); });
  } else {
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=fname;
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); },5000);
    MX.toast("Journal exported — "+S.nodes.length+" versions");
  }
}

document.addEventListener("DOMContentLoaded",ensureBuilt);
})();
