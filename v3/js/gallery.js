/* ============ Measures: Gallery — v2-faithful structure (Tasks / Methods) ============ */
(function(){
"use strict";
var $=MX.$, esc=MX.esc, el=MX.el;
var activeTab="tasks";

/* ---------- tier ---------- */
MX.tier=function(){ return localStorage.getItem("mx.tier")||"public"; };
function visible(entry){ return entry.tier!=="internal" || MX.tier()==="internal"; }

function lightbox(src){
  var lb=el("div","lightbox"); var im=el("img"); im.src=src; lb.appendChild(im);
  lb.onclick=function(){ lb.remove(); };
  document.body.appendChild(lb);
}
function partsToPrompt(ex){
  if(ex.prompt) return ex.prompt;
  return (ex.parts||[]).map(function(p){ return p.t; }).join("; ");
}
MX.partsToPrompt=partsToPrompt;

var GROUP_PICTO={g2d3d:"2d3d", g3d2d:"3d2d", grender:"restyle", gboards:"layout"};

/* ---------- render ---------- */
function render(){
  var v=$("#view-gallery");
  v.innerHTML="";
  var D=window.MX2;
  if(!D){
    v.innerHTML='<div class="g-head"><h1>Example library</h1><p>Loading the example dataset (data-examples2.js)…</p></div>';
    return;
  }
  var head=el("div","g-head",
    '<h1>What can it do — and how to work</h1>'+
    '<p><b>Tasks</b> are the transformations, each a real worked example with its prompt. <b>Methods</b> are the working discipline — how to ideate, iterate, finish, and recover — organized the way the course teaches them.</p>');
  v.appendChild(head);

  var tabs=el("div","g-tabs");
  [["tasks","Tasks — what to make"],["methods","Methods — how to work"]].forEach(function(t){
    var b=el("button","g-tab"+(activeTab===t[0]?" on":""),esc(t[1]));
    b.onclick=function(){ activeTab=t[0]; render(); };
    tabs.appendChild(b);
  });
  v.appendChild(tabs);

  if(activeTab==="tasks") renderTasks(v,D); else renderMethods(v,D);
}

function taskExamples(D,t){
  return D.examples.filter(function(e){ return e.task===t.id && visible(e); });
}
function picFor(ex,gid){
  if(ex&&ex.img&&ex.img.after&&ex.img.before)
    return '<div class="pic two"><span style="background-image:url(\''+ex.img.before+'\')"></span><span style="background-image:url(\''+ex.img.after+'\')"></span><i>→</i></div>';
  if(ex&&ex.img&&ex.img.after)
    return '<div class="pic real" style="background-image:url(\''+ex.img.after+'\')"></div>';
  return '<div class="pic">'+MX.picto(GROUP_PICTO[gid]||"restyle")+'</div>';
}
function renderTasks(v,D){
  D.taskGroups.forEach(function(g){
    var ts=(D.tasks||[]).filter(function(t){ return t.group===g.id && taskExamples(D,t).length; });
    if(!ts.length) return;
    var n=ts.reduce(function(s,t){ return s+taskExamples(D,t).length; },0);
    var sec=el("div","g-section",'<h2>'+esc(g.label)+'</h2><p class="gh">'+esc(g.hint)+' · '+ts.length+' transformations, '+n+' examples</p>');
    v.appendChild(sec);
    var grid=el("div","g-grid"); grid.style.paddingTop="8px";
    ts.forEach(function(t){
      var exs=taskExamples(D,t);
      var cover=exs.find(function(e){return e.id===t.cover;})||exs.find(function(e){return e.img&&e.img.before&&e.img.after;})||exs[0];
      var allRecipe=exs.every(function(e){return e.authored;});
      var card=el("article","gcard");
      card.innerHTML=picFor(cover,g.id)+
        '<div class="body"><h3>'+esc(t.title)+'</h3>'+
        '<div class="what">'+esc(t.what)+'</div>'+
        '<div class="meta"><span class="tag acc">'+exs.length+(exs.length>1?" examples":" example")+'</span>'+
        (allRecipe?'<span class="tag amber">recipe</span>':'')+
        '</div></div>';
      card.onclick=function(){ exs.length===1 ? openExample(exs[0],g) : openTask(t,g); };
      grid.appendChild(card);
    });
    v.appendChild(grid);
  });
}

function openTask(t,g){
  var D=window.MX2, w=$("#drawerWrap"), d=$("#drawer");
  var exs=taskExamples(D,t);
  d.innerHTML=
    '<div class="d-cat"><span class="tag acc">'+esc(g.label)+'</span><span class="tag">transformation</span></div>'+
    '<h2>'+esc(t.title)+'</h2>'+
    '<p class="d-what">'+esc(t.what)+'</p>'+
    '<div class="d-sec"><span class="eyebrow">'+exs.length+' worked examples — same move, different projects</span><div class="t-list">'+
    exs.map(function(ex,i){
      var tp = ex.img&&ex.img.before&&ex.img.after
        ? '<span class="tp"><span style="background-image:url(\''+ex.img.before+'\')"></span><span style="background-image:url(\''+ex.img.after+'\')"></span></span>'
        : '<span class="tp picto">'+MX.picto(GROUP_PICTO[g.id]||"restyle")+'</span>';
      return '<button class="t-ex" data-i="'+i+'">'+tp+
        '<span class="tt"><h4>'+esc(ex.title)+'</h4><span class="ts">'+
        (ex.authored?'platform recipe':'worked example')+(ex.input?' · from: '+esc(ex.input):'')+'</span></span>'+
        '<span class="go">→</span></button>';
    }).join("")+'</div></div>';
  w.hidden=false;
  MX.$$(".t-ex",d).forEach(function(b){
    b.onclick=function(){ openExample(exs[+b.dataset.i],g); };
  });
}

function renderMethods(v,D){
  D.stages.forEach(function(st){
    var items=D.methods.filter(function(m){ return m.stage===st.id && visible(m); });
    if(!items.length) return;
    var sec=el("div","g-section",'<h2>'+esc(st.label)+'</h2>');
    v.appendChild(sec);
    var grid=el("div","g-grid"); grid.style.paddingTop="8px";
    items.forEach(function(m){
      var firstImg=(m.steps||[]).map(function(s){return s.img;}).filter(Boolean)[0];
      var pic=firstImg
        ? '<div class="pic real" style="background-image:url(\''+firstImg+'\')"></div>'
        : '<div class="pic">'+MX.picto("diagram")+'</div>';
      var card=el("article","gcard");
      card.innerHTML=pic+
        '<div class="body"><h3>'+esc(m.title)+'</h3>'+
        '<div class="what">'+esc(m.what)+'</div>'+
        '<div class="meta"><span class="tag acc">method</span></div></div>';
      card.onclick=function(){ openMethod(m,st); };
      grid.appendChild(card);
    });
    v.appendChild(grid);
  });
}

/* ---------- drawers ---------- */
function annotated(ex){
  if(ex.parts&&ex.parts.length){
    return ex.parts.map(function(p){
      return '<span class="pseg pk-'+esc(p.k)+'">'+esc(p.t)+'</span>';
    }).join('<span style="color:var(--faint)">; </span>');
  }
  return esc(ex.prompt||"");
}
function legend(ex){
  var seen={};
  return (ex.parts||[]).filter(function(p){ if(seen[p.k])return false; seen[p.k]=1; return true; })
    .map(function(p){ return '<span class="pkey pk-'+esc(p.k)+'"><i></i>'+esc(p.k)+'</span>'; }).join("");
}

MX.galleryOpenId=function(id){
  var D=window.MX2; if(!D) return;
  var ex=D.examples.find(function(e){return e.id===id;});
  if(!ex||!visible(ex)) return;
  var g=D.taskGroups.find(function(x){return x.id===ex.group;});
  activeTab="tasks";
  if(location.hash!=="#gallery/"+id) location.hash="#gallery/"+id;
  render();
  openExample(ex,g);
};

function modeChips(ex){
  var A=window.MX_ATLAS;
  if(!A||!ex.modes||!ex.modes.length) return "";
  var chips=ex.modes.map(function(mid){
    var m=A.modes.find(function(x){return x.id===mid;});
    return m?'<button class="mchip" data-mode="'+esc(mid)+'" title="open in the Representation Atlas">◳ '+esc(m.title)+'</button>':'';
  }).join("");
  return chips?'<div class="d-modes"><span class="eyebrow" style="margin:0">Representation modes</span>'+chips+'</div>':"";
}

function openExample(ex,g){
  var w=$("#drawerWrap"), d=$("#drawer");
  var hasImg=ex.img&&ex.img.after;
  var D=window.MX2;
  var task=(D.tasks||[]).find(function(t){return t.id===ex.task;});
  var sibs=task?taskExamples(D,task).length:0;
  d.innerHTML=
    (task&&sibs>1?'<button class="d-back" id="dBack">← '+esc(task.title)+' · '+sibs+' examples</button>':'')+
    '<div class="d-cat"><span class="tag acc">'+esc(g.label)+'</span>'+
      (ex.authored?'<span class="tag amber">platform recipe</span>':'<span class="tag ok">worked example</span>')+
      (ex.srcPage?'<span class="tag">'+esc(ex.srcPage)+'</span>':'')+'</div>'+
    '<h2>'+esc(ex.title)+'</h2>'+
    '<p class="d-what">'+esc(ex.what)+'</p>'+
    modeChips(ex)+
    (hasImg?
      '<div class="d-sec"><span class="eyebrow">'+(ex.img.before?"Before / after":"Result")+'</span>'+
      (ex.img.before
        ? '<div class="d-pair">'+
          '<figure data-lb="'+esc(ex.img.before)+'"><img src="'+esc(ex.img.before)+'" alt="before"><figcaption>before</figcaption></figure>'+
          '<figure data-lb="'+esc(ex.img.after)+'"><img src="'+esc(ex.img.after)+'" alt="after"><figcaption>after</figcaption></figure></div>'
        : '<figure style="margin:0" data-lb="'+esc(ex.img.after)+'"><img style="width:100%;border:1px solid var(--line);border-radius:8px" src="'+esc(ex.img.after)+'" alt="result"></figure>')+
      (ex.img.steps&&ex.img.steps.length?'<div class="steps-strip">'+ex.img.steps.map(function(s){return '<img src="'+esc(s)+'" data-lb="'+esc(s)+'" alt="step">';}).join("")+'</div>':'')+
      '</div>':"")+
    (ex.input?'<div class="d-sec"><span class="eyebrow">Start from</span><div class="d-input">'+esc(ex.input)+'</div></div>':"")+
    '<div class="d-sec"><span class="eyebrow">The prompt</span>'+
      '<div class="d-prompt">'+annotated(ex)+'</div>'+
      (ex.parts&&ex.parts.length?'<div class="d-legend">'+legend(ex)+'</div>':'')+'</div>'+
    (ex.followups&&ex.followups.length?
      '<div class="d-sec"><span class="eyebrow">Then iterate — one change per prompt</span><div class="d-follow">'+
      ex.followups.map(function(f,i){ return '<div class="f"><span class="no">'+(i+2)+'</span><span>'+esc(f)+'</span></div>'; }).join("")+
      '</div></div>':"")+
    ((ex.notes&&ex.notes.length)||(ex.pitfalls&&ex.pitfalls.length)?
      '<div class="d-sec"><span class="eyebrow">Notes & warnings</span><div class="d-pits">'+
      (ex.notes||[]).concat(ex.pitfalls||[]).map(function(p){ return '<div class="p"><span>'+esc(p)+'</span></div>'; }).join("")+
      '</div></div>':"")+
    '<div class="d-acts">'+
      '<button class="btn primary" id="dToStudio">Run in Studio →</button>'+
      '<button class="btn" id="dToFlow">Open as workflow</button>'+
      '<button class="btn" id="dCopy">Copy prompt</button>'+
    '</div>';
  w.hidden=false;
  wireDrawer(ex);
}

function openMethod(m,st){
  var w=$("#drawerWrap"), d=$("#drawer");
  d.innerHTML=
    '<div class="d-cat"><span class="tag acc">'+esc(st.label)+'</span><span class="tag">method</span></div>'+
    '<h2>'+esc(m.title)+'</h2>'+
    '<p class="d-what">'+esc(m.what)+'</p>'+
    (m.keyIdeas&&m.keyIdeas.length?
      '<div class="d-sec"><span class="eyebrow">Key ideas</span><ul class="a-ul">'+
      m.keyIdeas.map(function(k){return '<li>'+esc(k)+'</li>';}).join("")+'</ul></div>':"")+
    (m.template?
      '<div class="d-sec"><span class="eyebrow">Template grammar</span><div class="m-template">'+esc(m.template)+'</div></div>':"")+
    (m.steps&&m.steps.length?
      '<div class="d-sec"><span class="eyebrow">Worked sequence</span>'+
      m.steps.map(function(s,i){
        return '<div class="m-step"><span class="no">'+(i+1)+'</span><div>'+esc(s.text)+
          (s.img?'<br><img src="'+esc(s.img)+'" data-lb="'+esc(s.img)+'" alt="step '+(i+1)+'">':'')+'</div></div>';
      }).join("")+'</div>':"");
  w.hidden=false;
  MX.$$("[data-lb]",d).forEach(function(f){
    f.addEventListener("click",function(e){ e.stopPropagation(); lightbox(f.getAttribute("data-lb")); });
  });
}

function wireDrawer(ex){
  var d=$("#drawer"), w=$("#drawerWrap");
  MX.$$("[data-lb]",d).forEach(function(f){
    f.addEventListener("click",function(e){ e.stopPropagation(); lightbox(f.getAttribute("data-lb")); });
  });
  MX.$$("[data-mode]",d).forEach(function(b){
    b.onclick=function(e){ e.stopPropagation();
      w.hidden=true;
      if(MX.atlasOpenId) MX.atlasOpenId(b.dataset.mode); };
  });
  var back=$("#dBack");
  if(back){
    back.onclick=function(){
      var D=window.MX2;
      var task=D.tasks.find(function(t){return t.id===ex.task;});
      var g2=D.taskGroups.find(function(x){return x.id===task.group;});
      openTask(task,g2);
    };
  }
  $("#dCopy").onclick=function(){
    navigator.clipboard&&navigator.clipboard.writeText(partsToPrompt(ex));
    MX.toast("Prompt copied");
  };
  $("#dToStudio").onclick=function(){
    w.hidden=true;
    MX.studioLoadPrompt(partsToPrompt(ex));
    location.hash="#studio";
    MX.toast("Loaded into Studio — add your base image");
  };
  $("#dToFlow").onclick=function(){
    w.hidden=true;
    MX.flowFromExample(ex);
    location.hash="#flow";
    MX.toast("Built a workflow from this example");
  };
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded",function(){
  $("#drawerScrim").addEventListener("click",function(){ $("#drawerWrap").hidden=true; });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") $("#drawerWrap").hidden=true; });
  var tc=$("#tierChip");
  function syncTier(){
    var t=MX.tier();
    tc.textContent=t;
    tc.classList.toggle("internal",t==="internal");
  }
  tc.addEventListener("click",function(){
    var next=MX.tier()==="internal"?"public":"internal";
    localStorage.setItem("mx.tier",next);
    syncTier(); render();
    if(MX.atlasRender) MX.atlasRender();
    MX.toast(next==="internal"
      ? "Internal tier — course-only material visible"
      : "Public tier — course-only material hidden");
  });
  syncTier();
  render();
});
MX.galleryRender=render;
})();
