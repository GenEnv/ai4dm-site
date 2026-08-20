/* ============ Measures: Workflow — executable node canvas ============ */
(function(){
"use strict";
var $=MX.$, esc=MX.esc, el=MX.el;

/* ---------- node type registry ---------- */
var TYPES={
  image:{ title:"Image input", ins:[], out:"image",
    body:function(n){ return '<div class="thumb" data-r="thumb">'+(n.cfg.data?'':'no image yet')+'</div>'+
      '<div class="mini"><button class="btn" data-r="up">Upload</button><button class="btn" data-r="sample">Sample</button></div>'+
      '<div class="stat" data-r="stat"></div>'; },
    wire:function(n,root){
      if(n.cfg.src==="sample"&&!n.cfg.data){ n.cfg.data=MX.sampleImage(); }
      var th=root.querySelector('[data-r=thumb]');
      if(n.cfg.data){ th.style.backgroundImage='url("'+n.cfg.data+'")'; th.textContent=''; }
      root.querySelector('[data-r=sample]').onclick=function(){ n.cfg.data=MX.sampleImage(); paintNode(n); };
      root.querySelector('[data-r=up]').onclick=function(){
        var f=document.createElement("input"); f.type="file"; f.accept="image/*";
        f.onchange=function(){ var file=f.files[0]; if(!file)return;
          var r=new FileReader(); r.onload=function(){ n.cfg.data=r.result; paintNode(n); }; r.readAsDataURL(file); };
        f.click();
      };
    },
    value:function(n){ return n.cfg.data||null; } },

  prompt:{ title:"Prompt", ins:[], out:"text",
    body:function(n){ return '<textarea data-r="t" placeholder="write the instruction…">'+esc(n.cfg.text||"")+'</textarea>'; },
    wire:function(n,root){ root.querySelector('[data-r=t]').addEventListener("input",function(){ n.cfg.text=this.value; }); },
    value:function(n){ return (n.cfg.text||"").trim(); } },

  lens:{ title:"Lens fragment", ins:[], out:"text",
    body:function(n){
      var opts="";
      MX_LENSES.forEach(function(g){
        opts+='<optgroup label="'+esc(g[0])+'">'+g[1].map(function(l){
          return '<option value="'+esc(l[0])+'"'+(n.cfg.sel===l[0]?" selected":"")+'>'+esc(l[0])+'</option>';
        }).join("")+'</optgroup>';
      });
      return '<select data-r="s">'+opts+'</select><div class="stat" data-r="frag"></div>';
    },
    wire:function(n,root){
      var sel=root.querySelector('[data-r=s]');
      if(!n.cfg.sel) n.cfg.sel=sel.value;
      var show=function(){ root.querySelector('[data-r=frag]').textContent=lensText(n.cfg.sel); };
      sel.onchange=function(){ n.cfg.sel=this.value; show(); }; show();
    },
    value:function(n){ return lensText(n.cfg.sel); } },

  compose:{ title:"Compose", ins:[{id:"t1",dt:"text"},{id:"t2",dt:"text"},{id:"t3",dt:"text"}], out:"text",
    body:function(){ return '<div class="stat">joins connected fragments with “; ”</div><div class="stat" data-r="prev"></div>'; },
    wire:function(){},
    value:function(n,inputs){ return [inputs.t1,inputs.t2,inputs.t3].filter(Boolean).join("; "); } },

  gen:{ title:"Generate", ins:[{id:"image",dt:"image"},{id:"ref",dt:"image"},{id:"prompt",dt:"text"}], out:"image",
    body:function(n){
      return '<select data-r="prov"><option value="">provider: session ('+esc(MX.state.provider)+')</option>'+
        '<option value="gemini"'+(n.cfg.prov==="gemini"?" selected":"")+'>gemini</option>'+
        '<option value="openai"'+(n.cfg.prov==="openai"?" selected":"")+'>openai</option>'+
        '<option value="demo"'+(n.cfg.prov==="demo"?" selected":"")+'>demo</option></select>'+
        '<div class="thumb" data-r="thumb">'+(n.result?'':'not run yet')+'</div><div class="stat" data-r="stat"></div>';
    },
    wire:function(n,root){
      if(n.result){ var th=root.querySelector('[data-r=thumb]'); th.style.backgroundImage='url("'+n.result+'")'; th.textContent=''; }
      root.querySelector('[data-r=prov]').onchange=function(){ n.cfg.prov=this.value||null; };
    },
    value:null /* async, handled by runner */ },

  describe:{ title:"Describe style", ins:[{id:"image",dt:"image"}], out:"text",
    body:function(){ return '<div class="stat">image → reusable style fragment (uses gemini)</div><div class="stat" data-r="prev"></div>'; },
    wire:function(){}, value:null },

  compare:{ title:"Compare", ins:[{id:"a",dt:"image"},{id:"b",dt:"image"}], out:null,
    body:function(n){ return '<div class="thumb two" data-r="two"><div data-r="a"></div><div data-r="b"></div></div><div class="stat">a · before &nbsp;&nbsp; b · after</div>'; },
    wire:function(n,root){
      if(n.va) root.querySelector('[data-r=a]').style.backgroundImage='url("'+n.va+'")';
      if(n.vb) root.querySelector('[data-r=b]').style.backgroundImage='url("'+n.vb+'")';
    },
    value:function(){ return null; } },

  output:{ title:"Output", ins:[{id:"image",dt:"image"}], out:null,
    body:function(n){ return '<div class="thumb" data-r="thumb" style="height:130px">'+(n.result?'':'run the graph')+'</div>'+
      '<div class="mini"><button class="btn" data-r="dl">Download</button><button class="btn" data-r="st">→ Studio</button></div>'; },
    wire:function(n,root){
      if(n.result){ var th=root.querySelector('[data-r=thumb]'); th.style.backgroundImage='url("'+n.result+'")'; th.textContent=''; }
      root.querySelector('[data-r=dl]').onclick=function(){
        if(!n.result){ MX.toast("Nothing to download yet"); return; }
        var a=document.createElement("a"); a.href=n.result; a.download="ai4dm-output.png"; a.click();
      };
      root.querySelector('[data-r=st]').onclick=function(){
        if(!n.result){ MX.toast("Run the graph first"); return; }
        MX.studioAdopt(n.result,"from workflow"); location.hash="#studio";
      };
    },
    value:function(){ return null; } }
};
function lensText(name){
  var out="";
  MX_LENSES.forEach(function(g){ g[1].forEach(function(l){ if(l[0]===name) out=l[1]; }); });
  return out;
}

/* ---------- graph state ---------- */
function TPLS(){ return (window.MX_WFLOWS&&window.MX_WFLOWS.length)?window.MX_WFLOWS:window.MX_TEMPLATES; }
var G={ nodes:[], wires:[] };
var sel={wire:null};
var built=false;

function addNode(type,x,y,cfg){
  var n={ id:MX.uid("w"), type:type, x:x, y:y, cfg:cfg||{}, result:null, status:"" };
  G.nodes.push(n); return n;
}
function nodeById(id){ return G.nodes.find(function(n){return n.id===id;}); }
function removeNode(id){
  G.nodes=G.nodes.filter(function(n){return n.id!==id;});
  G.wires=G.wires.filter(function(w){return w.from!==id&&w.to!==id;});
  paint();
}
function addWire(fromId,toId,port){
  var from=nodeById(fromId),to=nodeById(toId); if(!from||!to) return;
  var outDt=TYPES[from.type].out;
  var inDef=(TYPES[to.type].ins||[]).find(function(i){return i.id===port;});
  if(!outDt||!inDef||outDt!==inDef.dt){ MX.toast("Those ports don't match ("+(outDt||"none")+" → "+(inDef?inDef.dt:"?")+")"); return; }
  if(fromId===toId) return;
  G.wires=G.wires.filter(function(w){ return !(w.to===toId&&w.port===port); });
  G.wires.push({id:MX.uid("e"),from:fromId,to:toId,port:port});
  paint();
}

/* ---------- layout & paint ---------- */
var canvas,wiresSvg,wrap;
function portPos(n,portId){
  if(portId==="out") return {x:n.x+220+1, y:n.y+51};
  var ins=TYPES[n.type].ins||[];
  var i=ins.findIndex(function(p){return p.id===portId;});
  return {x:n.x-1, y:n.y+44+i*24};
}
function wirePath(a,b){
  var dx=Math.max(40,Math.abs(b.x-a.x)*.45);
  return "M"+a.x+" "+a.y+" C"+(a.x+dx)+" "+a.y+","+(b.x-dx)+" "+b.y+","+b.x+" "+b.y;
}
function paintWires(){
  var html="";
  G.wires.forEach(function(w){
    var f=nodeById(w.from),t=nodeById(w.to); if(!f||!t)return;
    var p=wirePath(portPos(f,"out"),portPos(t,w.port));
    html+='<path d="'+p+'" data-w="'+w.id+'"'+(sel.wire===w.id?' class="sel"':'')+'/>';
  });
  if(temp.active){ html+='<path class="temp" d="'+wirePath(temp.from,temp.at)+'"/>'; }
  wiresSvg.innerHTML=html;
}
function paintNode(n){
  var root=canvas.querySelector('[data-n="'+n.id+'"]');
  if(!root){ paint(); return; }
  root.style.left=n.x+"px"; root.style.top=n.y+"px";
  var T=TYPES[n.type];
  root.querySelector(".wbody").innerHTML=T.body(n);
  T.wire(n,root);
  var st=root.querySelector('[data-r=stat]');
  if(st){ st.textContent=n.status||""; st.classList.toggle("err",/fail|error|need/i.test(n.status||"")); }
  paintWires();
}
function paint(){
  if(!canvas) return;
  canvas.querySelectorAll(".wnode").forEach(function(e){e.remove();});
  G.nodes.forEach(function(n){
    var T=TYPES[n.type];
    var d=el("div","wnode"); d.dataset.n=n.id;
    d.style.left=n.x+"px"; d.style.top=n.y+"px";
    var ports='';
    (T.ins||[]).forEach(function(p,i){
      ports+='<span class="port in" data-port="'+p.id+'" data-dt="'+p.dt+'" style="top:'+(38+i*24)+'px"><span class="plab">'+p.id+'</span></span>';
    });
    if(T.out) ports+='<span class="port out" data-port="out" data-dt="'+T.out+'" style="top:44px"><span class="plab">'+T.out+'</span></span>';
    d.innerHTML='<div class="whead"><span class="ttl">'+esc(T.title)+'</span><button class="x" title="delete">×</button></div>'+
      '<div class="wbody">'+T.body(n)+'</div>'+ports;
    canvas.appendChild(d);
    T.wire(n,d);
    var st=d.querySelector('[data-r=stat]');
    if(st&&n.status){ st.textContent=n.status; st.classList.toggle("err",/fail|error|need/i.test(n.status)); }

    /* drag by header */
    var head=d.querySelector(".whead");
    head.addEventListener("mousedown",function(e){
      if(e.target.classList.contains("x")) return;
      e.preventDefault();
      var sx=e.clientX,sy=e.clientY,ox=n.x,oy=n.y;
      function mv(ev){ n.x=Math.max(0,ox+ev.clientX-sx); n.y=Math.max(0,oy+ev.clientY-sy);
        d.style.left=n.x+"px"; d.style.top=n.y+"px"; paintWires(); }
      function up(){ document.removeEventListener("mousemove",mv); document.removeEventListener("mouseup",up); }
      document.addEventListener("mousemove",mv); document.addEventListener("mouseup",up);
    });
    d.querySelector(".x").onclick=function(){ removeNode(n.id); };

    /* port wiring */
    d.querySelectorAll(".port").forEach(function(pEl){
      pEl.addEventListener("mousedown",function(e){
        e.preventDefault(); e.stopPropagation();
        var isOut=pEl.classList.contains("out");
        if(isOut){
          temp.active=true; temp.fromNode=n.id;
          temp.from=portPos(n,"out"); temp.at={x:temp.from.x,y:temp.from.y};
          function mv(ev){ var r=canvas.getBoundingClientRect();
            temp.at={x:ev.clientX-r.left,y:ev.clientY-r.top}; paintWires(); }
          function up(ev){
            document.removeEventListener("mousemove",mv); document.removeEventListener("mouseup",up);
            temp.active=false;
            var t=ev.target.closest?ev.target.closest(".port.in"):null;
            if(t){ var host=t.closest(".wnode"); addWire(temp.fromNode,host.dataset.n,t.dataset.port); }
            else paintWires();
          }
          document.addEventListener("mousemove",mv); document.addEventListener("mouseup",up);
        }
      });
    });
  });
  paintWires();
}
var temp={active:false,from:null,at:null,fromNode:null};

/* ---------- execution ---------- */
function topo(){
  var indeg={},adj={};
  G.nodes.forEach(function(n){ indeg[n.id]=0; adj[n.id]=[]; });
  G.wires.forEach(function(w){ if(indeg[w.to]!=null){ indeg[w.to]++; adj[w.from].push(w.to); } });
  var q=G.nodes.filter(function(n){return indeg[n.id]===0;}).map(function(n){return n.id;});
  var order=[];
  while(q.length){ var id=q.shift(); order.push(id);
    adj[id].forEach(function(t){ if(--indeg[t]===0) q.push(t); }); }
  return order.length===G.nodes.length ? order.map(nodeById) : null;
}
function inputsOf(n,values){
  var out={};
  (TYPES[n.type].ins||[]).forEach(function(p){
    var w=G.wires.find(function(w){return w.to===n.id&&w.port===p.id;});
    out[p.id]= w ? values[w.from] : null;
  });
  return out;
}
var running=false;
function runGraph(){
  if(running) return;
  var order=topo();
  if(!order){ MX.toast("The graph has a cycle — untangle it first"); return; }
  if(!G.nodes.some(function(n){return n.type==="gen";})){ MX.toast("Add a Generate node"); return; }
  running=true; $("#wfRun").disabled=true; $("#wfRun").textContent="Running…";
  var values={};
  var chain=Promise.resolve();
  order.forEach(function(n){
    chain=chain.then(function(){
      var ins=inputsOf(n,values);
      var root=canvas.querySelector('[data-n="'+n.id+'"]');
      if(n.type==="gen"){
        var provider=n.cfg.prov||MX.state.provider;
        var prompt=ins.prompt;
        if(!prompt){ n.status="needs a prompt input"; paintNode(n); return; }
        if(!MX.ready(provider)){ n.status="no "+provider+" key — connect or use demo"; paintNode(n); return; }
        n.status="generating via "+provider+"…";
        if(root) root.classList.add("running");
        paintNode(n); if(root) canvas.querySelector('[data-n="'+n.id+'"]').classList.add("running");
        return MX.generate(provider,prompt,ins.image||null, ins.ref?[ins.ref]:null).then(function(img){
          n.result=img; n.status="done · "+provider; values[n.id]=img;
          MX.countGen(provider);
          MX.journalPush({img:img,prompt:prompt,provider:provider,source:"workflow"});
          paintNode(n);
        }).catch(function(err){
          n.status="failed: "+(err&&err.message||err); paintNode(n);
        });
      }
      if(n.type==="describe"){
        if(!ins.image){ n.status="needs an image input"; paintNode(n); return; }
        n.status="analysing…"; paintNode(n);
        return MX.textGen("Describe the STYLE of this image as a reusable image-generation prompt fragment: medium and technique, line quality, colour palette, light, composition, level of abstraction. Do NOT describe the subject. One line, max 40 words, lowercase fragments separated by commas, no preamble.", ins.image)
          .then(function(t){ values[n.id]="in this style: "+t; n.status="done"; var pv=canvas.querySelector('[data-n="'+n.id+'"] [data-r=prev]'); if(pv) pv.textContent=t.slice(0,90); })
          .catch(function(err){ n.status="failed: "+(err&&err.message||err); paintNode(n); });
      }
      if(n.type==="compare"){ n.va=ins.a; n.vb=ins.b; paintNode(n); return; }
      if(n.type==="output"){ n.result=ins.image||null; paintNode(n); return; }
      var v=TYPES[n.type].value?TYPES[n.type].value(n,ins):null;
      values[n.id]=v;
      if(n.type==="compose"){ var pr=canvas.querySelector('[data-n="'+n.id+'"] [data-r=prev]'); if(pr) pr.textContent=(v||"").slice(0,90); }
    });
  });
  chain.then(function(){ running=false; $("#wfRun").disabled=false; $("#wfRun").textContent="▶ Run graph"; });
}

/* ---------- templates / persistence / entry points ---------- */
function loadTemplate(t){
  G={nodes:[],wires:[]};
  var made=t.nodes.map(function(sp){ return addNode(sp.type,sp.x,sp.y,JSON.parse(JSON.stringify(sp.cfg||{}))); });
  t.wires.forEach(function(w){ addWire(made[w[0]].id, made[w[2]].id, w[3]); });
  paint();
}
MX.flowFromExample=function(ex){
  ensureBuilt();
  G={nodes:[],wires:[]};
  var img=addNode("image",70,160,{});
  var pr=addNode("prompt",70,380,{text:MX.partsToPrompt(ex)});
  var gen=addNode("gen",400,240,{});
  var out=addNode("output",720,280,{});
  addWire(img.id,gen.id,"image"); addWire(pr.id,gen.id,"prompt"); addWire(gen.id,out.id,"image");
  paint();
};
function saveGraph(){
  try{
    localStorage.setItem("mx.flow",JSON.stringify({nodes:G.nodes.map(function(n){
      return {type:n.type,x:n.x,y:n.y,cfg:n.cfg};
    }),wires:G.wires.map(function(w){
      return {f:G.nodes.findIndex(function(n){return n.id===w.from;}),t:G.nodes.findIndex(function(n){return n.id===w.to;}),p:w.port};
    })}));
    MX.toast("Workflow saved in this browser");
  }catch(e){ MX.toast("Could not save (images may be too large)"); }
}
function loadGraph(){
  var raw=localStorage.getItem("mx.flow"); if(!raw){ MX.toast("Nothing saved yet"); return; }
  try{
    var d=JSON.parse(raw);
    G={nodes:[],wires:[]};
    var made=d.nodes.map(function(sp){ return addNode(sp.type,sp.x,sp.y,sp.cfg||{}); });
    d.wires.forEach(function(w){ addWire(made[w.f].id, made[w.t].id, w.p); });
    paint(); MX.toast("Workflow loaded");
  }catch(e){ MX.toast("Saved workflow was unreadable"); }
}

/* ---------- view ---------- */
function ensureBuilt(){
  if(built) return; built=true;
  var v=$("#view-flow");
  v.innerHTML=
    '<div class="wf-bar">'+
      '<span class="eyebrow">add node</span>'+
      '<button class="btn small" data-add="image">Image</button>'+
      '<button class="btn small" data-add="prompt">Prompt</button>'+
      '<button class="btn small" data-add="lens">Lens</button>'+
      '<button class="btn small" data-add="compose">Compose</button>'+
      '<button class="btn small" data-add="gen">Generate</button>'+
      '<button class="btn small" data-add="describe">Describe</button>'+
      '<button class="btn small" data-add="compare">Compare</button>'+
      '<button class="btn small" data-add="output">Output</button>'+
      '<span class="spring"></span>'+
      '<select id="wfTpl"><option value="">templates…</option>'+TPLS().map(function(t){
        return '<option value="'+t.id+'">'+esc(t.label)+'</option>';}).join("")+'</select>'+
      '<button class="btn small" id="wfSave">Save</button>'+
      '<button class="btn small" id="wfLoad">Load</button>'+
      '<button class="btn small warn" id="wfClear">Clear</button>'+
      '<button class="btn small primary" id="wfRun">▶ Run graph</button>'+
    '</div>'+
    '<div class="wf-canvas-wrap"><div class="wf-canvas" id="wfCanvas">'+
      '<svg class="wf-wires" id="wfWires"></svg>'+
    '</div><div class="wf-hud">drag from a round port to a square/round port to wire · click a wire then ⌫ to remove · image ports are round, text ports are square</div></div>';
  canvas=$("#wfCanvas"); wiresSvg=$("#wfWires"); wrap=v.querySelector(".wf-canvas-wrap");

  MX.$$("[data-add]",v).forEach(function(b){
    b.onclick=function(){
      var x=wrap.scrollLeft+80+Math.random()*120, y=wrap.scrollTop+80+Math.random()*120;
      addNode(b.dataset.add,x,y,{}); paint();
    };
  });
  $("#wfRun").onclick=runGraph;
  $("#wfClear").onclick=function(){ G={nodes:[],wires:[]}; paint(); };
  $("#wfSave").onclick=saveGraph;
  $("#wfLoad").onclick=loadGraph;
  $("#wfTpl").onchange=function(){
    var t=TPLS().find(function(tt){return tt.id===$("#wfTpl").value;});
    if(t) loadTemplate(t);
    this.value="";
  };
  wiresSvg.addEventListener("click",function(e){
    var p=e.target.closest("path[data-w]");
    sel.wire = p ? p.dataset.w : null;
    paintWires();
  });
  document.addEventListener("keydown",function(e){
    if((e.key==="Delete"||e.key==="Backspace")&&sel.wire&&location.hash==="#flow"){
      var t=document.activeElement&&/input|textarea/i.test(document.activeElement.tagName);
      if(t) return;
      G.wires=G.wires.filter(function(w){return w.id!==sel.wire;});
      sel.wire=null; paintWires();
    }
  });
  /* default: load first template so the canvas is never empty */
  loadTemplate(TPLS()[0]);
}
MX.flowEnsure=ensureBuilt;
})();
