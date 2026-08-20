/* ============ Measures core: state, providers, utils ============ */
(function(){
"use strict";
window.MX = window.MX || {};

/* ---------- tiny utils ---------- */
MX.$ = function(s,root){ return (root||document).querySelector(s); };
MX.$$ = function(s,root){ return Array.prototype.slice.call((root||document).querySelectorAll(s)); };
MX.esc = function(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m];}); };
MX.el = function(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
MX.toast = function(msg){
  var t=MX.$("#toast"); t.textContent=msg; t.hidden=false;
  clearTimeout(t._tm); t._tm=setTimeout(function(){ t.hidden=true; },2400);
};
MX.uid = (function(){ var i=0; return function(p){ return (p||"n")+(++i)+"_"+Math.random().toString(36).slice(2,6); }; })();

/* ---------- global state ---------- */
MX.state = {
  provider: localStorage.getItem("mx.provider") || "gemini",
  gens: 0, cost: 0
};
MX.DEFAULT_MODEL = { gemini:"gemini-2.5-flash-image", openai:"gpt-image-1" };
MX.EST = { gemini:0.039, openai:0.04, demo:0 };

MX.keys = {
  get: function(p){ return sessionStorage.getItem("mx.key."+p) || localStorage.getItem("mx.key."+p) || ""; },
  model: function(p){ return localStorage.getItem("mx.model."+p) || MX.DEFAULT_MODEL[p]; },
  set: function(p,v,session){
    localStorage.removeItem("mx.key."+p); sessionStorage.removeItem("mx.key."+p);
    if(v) (session?sessionStorage:localStorage).setItem("mx.key."+p, v);
  },
  setModel: function(p,v){ if(v) localStorage.setItem("mx.model."+p, v); }
};

MX.countGen = function(provider){
  MX.state.gens++; MX.state.cost += (MX.EST[provider]||0);
  var el=MX.$("#costLabel");
  el.textContent = MX.state.gens+" gen"+(MX.state.gens===1?"":"s")+(MX.state.cost>0?" · ~$"+MX.state.cost.toFixed(2):"");
};

/* ---------- providers ---------- */
MX.generate = function(provider, prompt, baseDataUrl, refs){
  if(provider==="gemini") return genGemini(prompt, baseDataUrl, refs);
  if(provider==="openai") return genOpenAI(prompt, baseDataUrl);
  return genDemo(prompt, baseDataUrl);
};
MX.ready = function(provider){ return provider==="demo" || !!MX.keys.get(provider); };

/* text/vision analysis via Gemini flash (style extraction, ideation) */
MX.textGen = function(prompt, imageDataUrl){
  var key=MX.keys.get("gemini");
  if(!key) return Promise.reject(new Error("This assistant feature uses your Gemini key — connect one first."));
  var parts=[{text:prompt}];
  if(imageDataUrl){ var m=imageDataUrl.match(/^data:(.*?);base64,(.*)$/); if(m) parts.push({inline_data:{mime_type:m[1],data:m[2]}}); }
  var url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+encodeURIComponent(key);
  return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:parts}]})})
    .then(function(r){ return r.json().then(function(d){ return {ok:r.ok,d:d}; }); })
    .then(function(res){
      if(!res.ok) throw new Error((res.d&&res.d.error&&res.d.error.message)||"Gemini error");
      var ps=((res.d.candidates||[])[0]||{}).content; ps=(ps&&ps.parts)||[];
      var txt=ps.map(function(p){return p.text;}).filter(Boolean).join("\n").trim();
      if(!txt) throw new Error("No text returned.");
      return txt;
    });
};
MX.pickImage = function(){ /* file picker → dataURL promise */
  return new Promise(function(resolve,reject){
    var f=document.createElement("input"); f.type="file"; f.accept="image/*";
    f.onchange=function(){ var file=f.files[0]; if(!file){reject(new Error("cancelled"));return;}
      var r=new FileReader(); r.onload=function(){resolve(r.result);}; r.readAsDataURL(file); };
    f.click();
  });
};

function genGemini(prompt, base, refs){
  var key=MX.keys.get("gemini"), model=MX.keys.model("gemini");
  var parts=[{text:prompt}];
  if(base){ var m=base.match(/^data:(.*?);base64,(.*)$/); if(m) parts.push({inline_data:{mime_type:m[1],data:m[2]}}); }
  (refs||[]).forEach(function(r){ var mm=(r||"").match(/^data:(.*?);base64,(.*)$/); if(mm) parts.push({inline_data:{mime_type:mm[1],data:mm[2]}}); });
  var url="https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(key);
  return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:parts}]})})
    .then(function(r){ return r.json().then(function(d){ return {ok:r.ok,d:d}; }); })
    .then(function(res){
      if(!res.ok) throw new Error((res.d&&res.d.error&&res.d.error.message)||"Gemini HTTP error");
      var cand=(res.d.candidates||[])[0]||{};
      var ps=(cand.content&&cand.content.parts)||[];
      var img=null,txt=[];
      ps.forEach(function(p){ if(p.inline_data||p.inlineData) img=img||p; else if(p.text) txt.push(p.text); });
      if(!img) throw new Error(txt.join(" ")||"The model returned no image.");
      var inl=img.inline_data||img.inlineData;
      return "data:"+(inl.mime_type||inl.mimeType||"image/png")+";base64,"+inl.data;
    });
}

function genOpenAI(prompt, base){
  var key=MX.keys.get("openai"), model=MX.keys.model("openai");
  function parse(r){ return r.json().then(function(d){
    if(!r.ok) throw new Error((d&&d.error&&d.error.message)||"OpenAI error");
    var it=(d.data||[])[0]||{};
    if(it.b64_json) return "data:image/png;base64,"+it.b64_json;
    if(it.url) return it.url;
    throw new Error("No image in response.");
  }); }
  if(base){
    return fetch(base).then(function(r){return r.blob();}).then(function(blob){
      var fd=new FormData();
      fd.append("model",model); fd.append("prompt",prompt); fd.append("size","auto");
      fd.append("image", blob, "image.png");
      return fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:"Bearer "+key},body:fd});
    }).then(parse);
  }
  return fetch("https://api.openai.com/v1/images/generations",{method:"POST",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},
    body:JSON.stringify({model:model,prompt:prompt,size:"1024x1024"})}).then(parse);
}

/* demo: real local canvas transforms so the whole platform works with no key */
function genDemo(prompt, base){
  return new Promise(function(resolve){
    var src = base || MX.sampleImage();
    var img=new Image();
    img.onload=function(){
      var w=img.width,h=img.height,c=document.createElement("canvas"); c.width=w;c.height=h;
      var x=c.getContext("2d"); x.drawImage(img,0,0,w,h);
      var p=prompt.toLowerCase(), d=x.getImageData(0,0,w,h), a=d.data;
      var mode = /ink|line|elevation|section|plan|diagram|axonometric|figure/.test(p) ? "line"
               : /watercolour|watercolor|sketch|graphite|illustration/.test(p) ? "soft"
               : /night|dusk|evening/.test(p) ? "night"
               : /golden|sunset|warm|autumn/.test(p) ? "warm"
               : /winter|snow|overcast|fog/.test(p) ? "cool" : "tone";
      var i,l;
      if(mode==="line"){
        var g=new Float32Array(w*h);
        for(i=0;i<w*h;i++){ g[i]=0.3*a[i*4]+0.59*a[i*4+1]+0.11*a[i*4+2]; }
        for(var y=0;y<h;y++)for(var xx=0;xx<w;xx++){
          var idx=y*w+xx;
          var gx=g[idx]-g[idx+(xx<w-1?1:0)], gy=g[idx]-g[idx+(y<h-1?w:0)];
          var e=Math.min(255,(Math.abs(gx)+Math.abs(gy))*2.2);
          var v=e>60?15:250, o=idx*4; a[o]=a[o+1]=a[o+2]=v;
        }
      } else if(mode==="soft"){
        for(i=0;i<a.length;i+=4){ l=(a[i]+a[i+1]+a[i+2])/3; a[i]=l*.5+a[i]*.5+16; a[i+1]=l*.5+a[i+1]*.5+12; a[i+2]=l*.5+a[i+2]*.5+4; }
      } else if(mode==="night"){
        for(i=0;i<a.length;i+=4){ a[i]*=.34; a[i+1]*=.4; a[i+2]=Math.min(255,a[i+2]*.68+42); }
      } else if(mode==="warm"){
        for(i=0;i<a.length;i+=4){ a[i]=Math.min(255,a[i]*1.13+16); a[i+1]=Math.min(255,a[i+1]*1.02+5); a[i+2]*=.86; }
      } else if(mode==="cool"){
        for(i=0;i<a.length;i+=4){ l=(a[i]+a[i+1]+a[i+2])/3; a[i]=l*.7+50; a[i+1]=l*.75+55; a[i+2]=Math.min(255,l*.8+70); }
      } else {
        for(i=0;i<a.length;i+=4){ l=(a[i]+a[i+1]+a[i+2])/3; a[i]=a[i+1]=a[i+2]=l; }
      }
      x.putImageData(d,0,0);
      x.fillStyle="rgba(90,60,20,.85)"; x.font="12px ui-monospace,Menlo,monospace";
      x.fillText("demo · local "+mode+" filter — not AI", 12, h-12);
      setTimeout(function(){ resolve(c.toDataURL("image/png")); }, 420);
    };
    img.src=src;
  });
}

/* ---------- sample base image (drawn, not fake-AI) ---------- */
MX.sampleImage = function(){
  var c=document.createElement("canvas"); c.width=560; c.height=420;
  var x=c.getContext("2d");
  x.fillStyle="#fbfaf7"; x.fillRect(0,0,560,420);
  x.strokeStyle="#e7e5dd"; x.lineWidth=1;
  for(var i=20;i<560;i+=28){ x.beginPath();x.moveTo(i,0);x.lineTo(i,420);x.stroke(); }
  for(var j=20;j<420;j+=28){ x.beginPath();x.moveTo(0,j);x.lineTo(560,j);x.stroke(); }
  x.strokeStyle="#1e2024"; x.lineWidth=2.4; x.lineJoin="round"; x.lineCap="round";
  var ox=170,oy=250,ax=[54,-26],ay=[54,26],az=[0,-64];
  function P(a,b,cc){ return [ox+a*ax[0]+b*ay[0], oy+a*ax[1]+b*ay[1]+cc*az[1]]; }
  function poly(pts){ x.beginPath(); pts.forEach(function(p,k){ k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]); }); x.closePath(); x.stroke(); }
  var W=2.6,D=1.9,H=1.5;
  poly([P(0,0,0),P(W,0,0),P(W,D,0),P(0,D,0)]);
  poly([P(0,0,H),P(W,0,H),P(W,D,H),P(0,D,H)]);
  x.beginPath();
  [[0,0],[W,0],[W,D],[0,D]].forEach(function(p){ var a2=P(p[0],p[1],0),b2=P(p[0],p[1],H); x.moveTo(a2[0],a2[1]); x.lineTo(b2[0],b2[1]); });
  x.stroke();
  x.lineWidth=2;
  poly([P(-.3,-.3,H),P(W+.3,-.3,H),P(W+.3,D+.3,H),P(-.3,D+.3,H)]);
  poly([P(-.3,-.3,H+.18),P(W+.3,-.3,H+.18),P(W+.3,D+.3,H+.18),P(-.3,D+.3,H+.18)]);
  return c.toDataURL("image/png");
};

/* ---------- category pictograms for gallery cards (SVG strings) ---------- */
MX.picto = function(cat){
  var S='<svg viewBox="0 0 250 118" xmlns="http://www.w3.org/2000/svg">';
  var wash='#3a3d43', ink='#D8D9DC', acc='#7FB0C2', ok='#8FBFA5', amber='#D2A968';
  var arrow='<path d="M118 59h16m0 0-5-5m5 5-5 5" stroke="'+ink+'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  function box(x,y,w,h,st,dash){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+st+'" stroke-width="2"'+(dash?' stroke-dasharray="4 3"':'')+'/>'; }
  var L='',R='';
  if(cat==="2d3d"){
    L=box(30,30,60,58,ink)+'<path d="M40 44h40M40 56h40M40 68h24" stroke="'+acc+'" stroke-width="2"/>';
    R='<path d="M158 78 188 60l30 18-30 18z" fill="none" stroke="'+ink+'" stroke-width="2"/><path d="M158 78V48l30-18 30 18v30M188 60V30M158 48l30 18 30-18M188 96V66" stroke="'+ink+'" stroke-width="2" fill="none"/>';
  } else if(cat==="3d2d"){
    L='<path d="M40 80 70 62l30 18-30 18z" fill="none" stroke="'+ink+'" stroke-width="2"/><path d="M40 80V50l30-18 30 18v30M70 62V32" stroke="'+ink+'" stroke-width="2" fill="none"/>';
    R=box(158,30,64,58,ink)+'<path d="M166 74h48M166 62h48M180 42v32M204 50v24" stroke="'+acc+'" stroke-width="2"/>';
  } else if(cat==="restyle"){
    L=box(30,30,62,58,ink)+'<path d="M38 76c8-14 14-8 20-20s12-4 18-14" stroke="'+acc+'" stroke-width="2" fill="none"/>';
    R=box(158,30,62,58,ink)+'<path d="M164 80c10-18 18-6 24-24s14-2 22-16" stroke="'+amber+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
  } else if(cat==="edit"){
    L=box(30,30,190,58,ink)+'<circle cx="88" cy="58" r="17" fill="none" stroke="'+ok+'" stroke-width="2" stroke-dasharray="4 3"/>';
    R='<path d="M82 64l10-12 6 7" stroke="'+ok+'" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    return S+'<rect width="250" height="118" fill="'+wash+'"/>'+L+R+'</svg>';
  } else if(cat==="diagram"){
    L=box(30,30,62,58,ink)+'<path d="M38 40h46v18H38zM38 62h24v18H38z" fill="'+acc+'" opacity=".5"/>';
    R='<rect x="158" y="34" width="26" height="22" fill="'+acc+'"/><rect x="192" y="34" width="30" height="22" fill="'+ok+'"/><rect x="158" y="62" width="40" height="24" fill="'+amber+'"/><rect x="204" y="62" width="18" height="24" fill="'+ink+'" opacity=".5"/>';
  } else if(cat==="site"){
    L='<circle cx="61" cy="59" r="30" fill="none" stroke="'+ink+'" stroke-width="2"/><path d="M40 70c12-8 18 2 30-8s10-14 14-18" stroke="'+acc+'" stroke-width="2" fill="none"/>';
    R=box(158,30,64,58,ink)+'<path d="M164 78c12-10 20 0 30-10" stroke="'+ok+'" stroke-width="3" fill="none"/><circle cx="204" cy="48" r="8" fill="'+ok+'" opacity=".7"/>';
  } else { /* layout */
    L=box(30,30,26,26,ink)+box(62,30,30,26,ink)+box(30,62,62,26,ink);
    R=box(158,30,64,58,acc)+'<path d="M166 42h30M166 50h22" stroke="'+ink+'" stroke-width="2"/>'+box(192,60,22,20,ink);
  }
  return S+'<rect width="250" height="118" fill="'+wash+'"/>'+L+arrow+R+'</svg>';
};

/* ---------- key modal wiring (shared) ---------- */
function refreshKeyChip(){
  var p=MX.state.provider, dot=MX.$("#keyDot"), lab=MX.$("#keyLabel");
  if(p==="demo"){ dot.className="dot demo"; lab.textContent="demo"; return; }
  if(MX.keys.get(p)){ dot.className="dot on"; lab.textContent=p; }
  else { dot.className="dot"; lab.textContent="key"; }
}
MX.refreshKeyChip = refreshKeyChip;

MX.openKeyModal = function(){
  var p = MX.state.provider==="demo" ? "gemini" : MX.state.provider;
  MX.$("#mProv").value=p;
  MX.$("#mKey").value=MX.keys.get(p);
  MX.$("#mModel").value=MX.keys.model(p);
  MX.$("#mSession").checked=!!sessionStorage.getItem("mx.key."+p);
  MX.$("#mErr").textContent="";
  MX.$("#mKeyLab").textContent = p==="gemini" ? "Google AI Studio API key" : "OpenAI API key";
  MX.$("#keyModal").hidden=false;
  MX.$("#mKey").focus();
};

document.addEventListener("DOMContentLoaded",function(){
  MX.$("#keyChip").addEventListener("click",MX.openKeyModal);
  MX.$("#mProv").addEventListener("change",function(){
    MX.$("#mKey").value=MX.keys.get(this.value);
    MX.$("#mModel").value=MX.keys.model(this.value);
    MX.$("#mKeyLab").textContent = this.value==="gemini" ? "Google AI Studio API key" : "OpenAI API key";
  });
  MX.$("#mCancel").addEventListener("click",function(){ MX.$("#keyModal").hidden=true; });
  MX.$("#mClear").addEventListener("click",function(){
    var p=MX.$("#mProv").value; MX.keys.set(p,"",false); MX.$("#mKey").value=""; refreshKeyChip(); MX.toast("Key forgotten");
  });
  MX.$("#mSave").addEventListener("click",function(){
    var p=MX.$("#mProv").value, k=MX.$("#mKey").value.trim(), m=MX.$("#mModel").value.trim();
    if(!k){ MX.$("#mErr").textContent="Paste a key — or choose Demo in the top bar to explore without one."; return; }
    MX.keys.set(p,k,MX.$("#mSession").checked); MX.keys.setModel(p,m);
    MX.state.provider=p; localStorage.setItem("mx.provider",p);
    MX.$("#prov").value=p;
    MX.$("#keyModal").hidden=true;
    refreshKeyChip(); MX.toast("Connected to "+p);
    document.dispatchEvent(new CustomEvent("mx:provider"));
  });
  MX.$("#prov").value=MX.state.provider;
  MX.$("#prov").addEventListener("change",function(){
    MX.state.provider=this.value; localStorage.setItem("mx.provider",this.value);
    refreshKeyChip();
    document.dispatchEvent(new CustomEvent("mx:provider"));
    if(this.value!=="demo" && !MX.keys.get(this.value)) MX.openKeyModal();
  });
  refreshKeyChip();
});
})();
