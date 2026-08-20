/* ============ Measures: Representation Atlas — the knowledge layer ============ */
(function(){
"use strict";
var $=MX.$, esc=MX.esc, el=MX.el;

function render(){
  var v=$("#view-atlas");
  var A=window.MX_ATLAS;
  v.innerHTML="";
  if(!A){ v.innerHTML='<div class="g-head"><h1>Representation Atlas</h1><p>Content loading — data-representation.js not found.</p></div>'; return; }

  var head=el("div","g-head",
    '<h1>Representation is not rendering.</h1>'+
    '<p>'+esc(A.intro)+'</p>');
  v.appendChild(head);

  var grid=el("div","atlas-grid");
  A.modes.forEach(function(m,i){
    var card=el("article","acard");
    card.innerHTML=
      '<div class="ano">'+String(i+1).padStart(2,"0")+'</div>'+
      '<h3>'+esc(m.title)+'</h3>'+
      '<p class="tg">'+esc(m.tagline)+'</p>'+
      '<div class="acanon">'+(m.canon||[]).slice(0,3).map(function(c){return esc(c.who);}).join(" · ")+(m.canon&&m.canon.length>3?" …":"")+'</div>'+
      (visibleExamples(m).length?'<div class="aex">'+visibleExamples(m).length+' worked examples in the Gallery</div>':'');
    card.onclick=function(){ openMode(m,i); };
    grid.appendChild(card);
  });
  v.appendChild(grid);
}

function visibleExamples(m){
  var internal=(MX.tier&&MX.tier()==="internal");
  return (m.examples||[]).filter(function(x){ return x.tier!=="internal"||internal; });
}

MX.atlasOpenId=function(id){
  var A=window.MX_ATLAS; if(!A) return;
  var i=A.modes.findIndex(function(m){return m.id===id;});
  if(i<0) return;
  if(location.hash!=="#atlas/"+id) location.hash="#atlas/"+id;
  openMode(A.modes[i],i);
};

function openMode(m,i){
  var w=$("#drawerWrap"), d=$("#drawer");
  var internal = (MX.tier&&MX.tier()==="internal");
  var exs=visibleExamples(m);
  d.innerHTML=
    '<div class="d-cat"><span class="tag acc">mode '+String(i+1).padStart(2,"0")+'</span><span class="tag">representation</span></div>'+
    '<h2>'+esc(m.title)+'</h2>'+
    '<p class="d-what" style="font-family:var(--serif);font-style:italic;font-size:15px">'+esc(m.tagline)+'</p>'+
    '<p class="d-what">'+esc(m.definition)+'</p>'+

    '<div class="d-sec"><span class="eyebrow">What it is for</span><ul class="a-ul">'+
      (m.purpose||[]).map(function(p){return '<li>'+esc(p)+'</li>';}).join("")+'</ul></div>'+

    '<div class="d-sec"><span class="eyebrow">Conventions of the mode</span><ul class="a-ul">'+
      (m.conventions||[]).map(function(p){return '<li>'+esc(p)+'</li>';}).join("")+'</ul></div>'+

    '<div class="d-sec"><span class="eyebrow">The canon — validated exemplars</span><div class="a-canon">'+
      (m.canon||[]).map(function(c){
        var name=esc(c.who)+', <i>'+esc(c.work)+'</i>'+(c.year?' ('+esc(c.year)+')':'');
        var body='<div><div class="cw">'+(c.url?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener">'+name+'</a>':name)+'</div>'+
          '<div class="cy">'+esc(c.why)+'</div></div>';
        var showThumb=c.thumb&&(internal||c.tier!=="internal");
        var th=showThumb?'<img class="cthumb" src="'+esc(c.thumb)+'" alt="" loading="lazy">':'';
        return '<div class="cn'+(showThumb?' has-thumb':'')+'">'+th+body+'</div>';
      }).join("")+'</div>'+
      (internal
        ? '<div class="a-int on">Internal tier · '+esc(m.internalNote||"drop course exemplar images into assets/representation/"+m.id+"/")+'</div>'
        : '<div class="a-int">Exemplar images are course material (copyright) — visible on the internal tier only. Public tier shows citations and links.</div>')+
    '</div>'+

    '<div class="d-sec"><span class="eyebrow">Where AI helps / where it breaks</span>'+
      '<div class="a-two">'+
        '<div class="a-col ok"><h5>helps</h5><ul class="a-ul">'+(m.ai&&m.ai.helps||[]).map(function(p){return '<li>'+esc(p)+'</li>';}).join("")+'</ul></div>'+
        '<div class="a-col bad"><h5>breaks</h5><ul class="a-ul">'+(m.ai&&m.ai.breaks||[]).map(function(p){return '<li>'+esc(p)+'</li>';}).join("")+'</ul></div>'+
      '</div></div>'+

    '<div class="d-sec"><span class="eyebrow">Recipes — push the model toward this mode</span><div class="a-recipes">'+
      (m.ai&&m.ai.recipes||[]).map(function(r,ri){
        return '<div class="rc"><div class="rh"><b>'+esc(r.label)+'</b>'+
          '<span class="spring"></span>'+
          '<button class="btn small" data-copy="'+ri+'">copy</button>'+
          '<button class="btn small primary" data-try="'+ri+'">try in Studio →</button></div>'+
          '<p>'+esc(r.prompt)+'</p></div>';
      }).join("")+'</div></div>'+

    (exs.length?
      '<div class="d-sec"><span class="eyebrow">In the Gallery — worked examples of this mode</span><div class="a-exs">'+
      exs.map(function(x){return '<button class="a-ex" data-ex="'+esc(x.id)+'">'+esc(x.title)+' <span>→</span></button>';}).join("")+
      '</div></div>':"")+

    (m.lensPack&&m.lensPack.length?
      '<div class="d-sec"><span class="eyebrow">Quick fragments</span><div class="slot"><div class="chips" style="margin:0">'+
      m.lensPack.map(function(l,li){return '<button data-lens="'+li+'" title="'+esc(l[1])+'">'+esc(l[0])+'</button>';}).join("")+
      '</div></div></div>':"");

  w.hidden=false;
  MX.$$("[data-copy]",d).forEach(function(b){
    b.onclick=function(e){ e.stopPropagation();
      navigator.clipboard&&navigator.clipboard.writeText(m.ai.recipes[+b.dataset.copy].prompt);
      MX.toast("Recipe copied"); };
  });
  MX.$$("[data-try]",d).forEach(function(b){
    b.onclick=function(e){ e.stopPropagation();
      w.hidden=true;
      MX.studioLoadPrompt(m.ai.recipes[+b.dataset.try].prompt);
      location.hash="#studio";
      MX.toast("Recipe loaded — add your base image"); };
  });
  MX.$$("[data-ex]",d).forEach(function(b){
    b.onclick=function(e){ e.stopPropagation();
      w.hidden=true;
      if(MX.galleryOpenId) MX.galleryOpenId(b.dataset.ex); };
  });
  MX.$$("[data-lens]",d).forEach(function(b){
    b.onclick=function(e){ e.stopPropagation();
      w.hidden=true;
      MX.studioLoadPrompt(m.lensPack[+b.dataset.lens][1]);
      location.hash="#studio"; };
  });
}

document.addEventListener("DOMContentLoaded",render);
MX.atlasRender=render;
})();
