/* ============ Measures: Prompt Lab ============ */
(function(){
"use strict";
var $=MX.$, esc=MX.esc, el=MX.el;
var values={};

function compiled(){
  var out=[];
  MX_SLOTS.forEach(function(s){
    var v=(values[s.k]||"").trim();
    if(v) out.push({k:s.k,t:v});
  });
  return out;
}
function compiledText(){
  return compiled().map(function(p){return p.t;}).join("; ");
}

function render(){
  var v=$("#view-prompt");
  v.innerHTML='';
  var wrap=el("div","pl");
  wrap.innerHTML=
    '<div class="pl-head"><h1>Write the instruction</h1>'+
    '<p>A prompt for an image model is a stack of decisions — task, what to keep, what to change, medium, camera, light. Build one slot by slot, watch it compile, and let the checker call out the classic mistakes.</p></div>';

  /* left: builder */
  var left=el("div","");
  var card=el("div","slotcard");
  MX_SLOTS.forEach(function(s){
    var slot=el("div","slot");
    slot.innerHTML=
      '<div class="sl"><span class="pkey pk-'+s.k+'"><i></i>'+esc(s.label)+'</span>'+
      '<span class="req">'+(s.req?"required":"optional")+'</span></div>';
    var right=el("div","");
    var inp=el("input"); inp.type="text"; inp.placeholder=s.ph; inp.value=values[s.k]||"";
    inp.addEventListener("input",function(){ values[s.k]=inp.value; sync(); });
    right.appendChild(inp);
    var chips=el("div","chips");
    s.chips.forEach(function(c){
      var b=el("button",null,esc(c.length>44?c.slice(0,42)+"…":c)); b.type="button"; b.title=c;
      b.onclick=function(){ values[s.k]=c; inp.value=c; sync(); };
      chips.appendChild(b);
    });
    right.appendChild(chips);
    slot.appendChild(right);
    card.appendChild(slot);
  });
  left.appendChild(card);
  left.insertAdjacentHTML("beforeend",'<div class="compiled" id="plCompiled"></div>');
  var acts=el("div","pl-acts");
  acts.innerHTML=
    '<button class="btn primary" id="plToStudio">Run in Studio →</button>'+
    '<button class="btn" id="plDraft" title="give a loose idea in the Task slot; AI expands it into three structured alternatives (uses your Gemini key)">✦ Draft 3 with AI</button>'+
    '<button class="btn" id="plCopy">Copy prompt</button>'+
    '<button class="btn" id="plClear">Clear</button>';
  left.appendChild(acts);
  left.insertAdjacentHTML("beforeend",'<div class="patterns" id="plDrafts" style="margin-top:12px"></div>');

  /* right: lint + patterns */
  var right=el("div","");
  var lint=el("div","lint");
  lint.innerHTML='<h3>Prompt check</h3>'+MX_LINT.map(function(r){
    return '<div class="rule" data-s="idle" data-rule="'+r.id+'"><span class="st">—</span><span><b>'+esc(r.label)+'</b><span class="why" style="display:block;font-size:11.5px;color:var(--faint)"></span></span></div>';
  }).join("");
  right.appendChild(lint);
  right.insertAdjacentHTML("beforeend",'<div class="eyebrow" style="margin:18px 0 0">Patterns worth stealing</div>');
  var pats=el("div","patterns");
  MX_PATTERNS.forEach(function(p){
    var pc=el("div","pat",'<h4>'+esc(p.t)+'</h4><p>'+esc(p.d)+'</p><span class="ex">'+esc(p.ex)+'</span>');
    pc.title="click to append the example to your prompt";
    pc.onclick=function(){
      var k = /keep|preserve|not appear|no text/i.test(p.ex) ? "preserve" : "change";
      values[k]=((values[k]||"")+" "+p.ex.replace(/^…/,"").trim()).trim();
      render(); sync();
    };
    pats.appendChild(pc);
  });
  right.appendChild(pats);

  wrap.appendChild(left); wrap.appendChild(right);
  v.appendChild(wrap);

  $("#plCopy").onclick=function(){
    var t=compiledText(); if(!t){ MX.toast("Nothing to copy yet"); return; }
    navigator.clipboard&&navigator.clipboard.writeText(t); MX.toast("Prompt copied");
  };
  $("#plClear").onclick=function(){ values={}; render(); };
  $("#plToStudio").onclick=function(){
    var t=compiledText(); if(!t){ MX.toast("Build a prompt first"); return; }
    MX.studioLoadPrompt(t); location.hash="#studio";
  };
  $("#plDraft").onclick=function(){
    var seed=compiledText()||values.task||"";
    if(!seed.trim()){ MX.toast("Give at least a loose idea in the Task slot first"); return; }
    var btn=this; btn.disabled=true; btn.textContent="drafting…";
    MX.textGen(
      "You are teaching architecture and landscape students to write image-model prompts. Expand this loose idea into exactly 3 alternative, well-structured prompts for an image model. Each must: name one clear task; include an explicit preserve clause; use material/light/technique language instead of vague adjectives; state camera and output format. The three should take genuinely different directions (e.g. different medium, viewpoint or degree of abstraction). Idea: \""+seed+"\". Output the 3 prompts as plain lines separated by a blank line — no numbering, no commentary.")
    .then(function(txt){
      var drafts=txt.split(/\n\s*\n/).map(function(s){return s.replace(/^[\d\.\)\-\s]+/,"").trim();}).filter(Boolean).slice(0,3);
      var box=$("#plDrafts"); box.innerHTML='<div class="eyebrow" style="margin-bottom:4px">AI drafts — click one to run it in Studio</div>';
      drafts.forEach(function(d,i){
        var pc=el("div","pat",'<h4>Draft '+(i+1)+'</h4><p>'+esc(d)+'</p>');
        pc.onclick=function(){ MX.studioLoadPrompt(d); location.hash="#studio"; };
        box.appendChild(pc);
      });
    })
    .catch(function(e){ MX.toast(e.message); })
    .finally(function(){ btn.disabled=false; btn.textContent="✦ Draft 3 with AI"; });
  };
  sync();
}

function sync(){
  var box=$("#plCompiled"); if(!box) return;
  var parts=compiled();
  if(!parts.length){ box.innerHTML='<span class="hintempty">Your compiled prompt appears here — fill any slot to start.</span>'; }
  else{
    box.innerHTML=parts.map(function(p){
      return '<span class="pseg pk-'+p.k+'">'+esc(p.t)+'</span>';
    }).join('<span style="opacity:.5">; </span>');
  }
  var text=compiledText();
  MX_LINT.forEach(function(r){
    var row=document.querySelector('.rule[data-rule="'+r.id+'"]'); if(!row) return;
    if(!text){ row.dataset.s="idle"; row.querySelector(".st").textContent="—"; row.querySelector(".why").textContent=""; return; }
    var ok=r.test(text);
    row.dataset.s=ok?"pass":"fail";
    row.querySelector(".st").textContent=ok?"ok":"fix";
    row.querySelector(".why").textContent=ok?"":r.fail;
  });
}

document.addEventListener("DOMContentLoaded",render);
MX.promptlabRender=render;
})();
