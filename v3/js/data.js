/* ============ Measures data: lenses, slots, patterns, lint, templates ============ */
(function(){
"use strict";

/* ---------- representation lenses (shared: studio + workflow lens node) ---------- */
window.MX_LENSES=[
  ["Projection",[
    ["Plan","redrawn as a measured plan view seen from directly above, parallel projection, no perspective"],
    ["Elevation","redrawn as a flat orthographic elevation, straight-on view, no perspective convergence"],
    ["Section","redrawn as a section cut, the cut poché filled solid black, space beyond in thin line"],
    ["Axonometric","redrawn as a clean axonometric, parallel projection, no vanishing points, edges stay parallel"],
    ["Eye-level","redrawn as an eye-level perspective from a person standing in the space"],
    ["Aerial","redrawn as a bird's-eye aerial perspective from 45 degrees above"]
  ]],
  ["Medium",[
    ["Ink line","as a hard-line ink drawing on white paper, uniform thin linework, no shading, no colour"],
    ["Graphite","as a loose graphite hand sketch, exploratory, visible construction lines, unfinished"],
    ["Watercolour","as a soft watercolour rendering, loose washes, white paper margin, pigment granulation"],
    ["Flat diagram","as a flat diagram with solid colour fills, no shadows, no gradients, white background"],
    ["Model photo","as a photograph of a physical chipboard and basswood study model on a plain desk, shallow depth of field"],
    ["Photoreal","as a photorealistic render, soft natural daylight, physically plausible materials and shadows"]
  ]],
  ["Scene",[
    ["Golden hour","lit by low golden-hour sun with long soft shadows"],
    ["Overcast","under flat overcast light, diffuse shadows"],
    ["Night","at night, warm interior light spilling out, cool blue ambient exterior"],
    ["Winter","in winter: bare branches, low pale sun, traces of snow on horizontal surfaces"],
    ["People","add a few people at correct human scale, mid-stride, not posing"],
    ["Planting","add site-appropriate planting: canopy trees, understorey shrubs, groundcover"]
  ]],
  ["Material",[
    ["Concrete","primary material board-formed concrete with visible formwork lines"],
    ["Timber","primary material warm timber cladding with visible board joints"],
    ["Brick","primary material brick with visible coursing and mortar joints"],
    ["Corten","primary material weathered corten steel, rust patina"]
  ]],
  ["Discipline",[
    ["Keep layout","keep the exact layout, footprint, proportions and camera position unchanged"],
    ["One change","change only this one thing and nothing else"],
    ["No text","do not add any text, labels, dimensions or watermarks"],
    ["No extras","do not invent new buildings, roads or objects that are not in the source"]
  ]]
];

/* ---------- prompt lab slots ---------- */
window.MX_SLOTS=[
  {k:"task", label:"Task", req:true, ph:"what operation? e.g. Turn this site plan into an aerial perspective rendering",
   chips:["Turn this site plan into a photorealistic aerial perspective","Redraw this photo as an orthographic elevation","Convert this section into a sectional perspective","Re-render this image as a watercolour","Replace the facade material of this building","Generate an exploded isometric diagram of this design"]},
  {k:"subject", label:"Subject", req:false, ph:"what is in the image? e.g. a small timber pavilion in a birch grove",
   chips:["a public plaza with a water feature","a two-storey timber house","a streetscape with wide sidewalks","a terraced hillside park"]},
  {k:"preserve", label:"Preserve", req:false, ph:"what must NOT change? the signature skill",
   chips:["keep the exact layout, proportions and building footprints","keep the camera angle and framing unchanged","preserve all existing materials outside the marked area","keep the path network exactly as drawn"]},
  {k:"change", label:"Change", req:false, ph:"what should change, specifically?",
   chips:["extrude the buildings to plausible heights","replace the paving with granite setts","add mature canopy trees along the street","open the facade with full-height glazing"]},
  {k:"style", label:"Style / medium", req:false, ph:"medium and look — name materials and technique, not adjectives",
   chips:["hard-line ink on white, no shading","soft watercolour washes","photorealistic, physically plausible materials","flat illustration, solid fills, no gradients"]},
  {k:"camera", label:"Camera", req:false, ph:"viewpoint and lens",
   chips:["eye-level, 35mm, standing on the main path","bird's-eye from 45 degrees above","straight-on, no perspective convergence","worm's-eye looking up through the canopy"]},
  {k:"light", label:"Light", req:false, ph:"time and quality of light",
   chips:["soft overcast daylight","low golden-hour sun, long shadows","night, warm interior glow"]},
  {k:"output", label:"Output", req:false, ph:"format constraints",
   chips:["16:9 landscape","square format","no text or labels anywhere","white background"]}
];

/* ---------- prompt patterns (teaching cards) ---------- */
window.MX_PATTERNS=[
  {t:"The preservation clause", d:"Image models redraw everything by default. Every edit prompt needs an explicit sentence about what must survive — layout, proportions, camera, materials.", ex:"…keep the exact footprint, proportions and camera angle unchanged."},
  {t:"One change per prompt", d:"Ask for three changes and the model trades them off against each other. Chain single changes instead — geometry first, then material, then atmosphere, then view.", ex:"Change only the paving material; everything else stays."},
  {t:"Material language beats adjectives", d:"'Beautiful', 'modern' and 'high quality' mean nothing to an image model. Name materials, light behaviour and technique instead.", ex:"board-formed concrete, low sun raking across the formwork lines"},
  {t:"Negative constraints", d:"Models eagerly invent. Say what must not appear — text is the classic case, since models garble lettering.", ex:"no text, no labels, no people, no added buildings"},
  {t:"Camera as a decision", d:"If you don't specify the view, the model picks a generic hero shot. The viewpoint is authorship — state it.", ex:"eye-level at the gate, 35mm, looking down the axis"},
  {t:"The iteration ladder", d:"A disciplined chain: geometry → materials → details → atmosphere → views. Lock each rung before climbing to the next.", ex:"Prompt 3 of 5: materials only. Geometry is locked from prompt 2."}
];

/* ---------- lint rules ---------- */
window.MX_LINT=[
  {id:"task", label:"Names one clear task", test:function(p){ return /\b(turn|convert|redraw|render|re-render|transform|replace|add|remove|generate|extend|draw)\b/i.test(p); },
   fail:"Start with an operation verb: turn / redraw / convert / replace…"},
  {id:"single", label:"One change at a time", test:function(p){ var verbs=(p.match(/\b(and also|as well as|plus|additionally)\b/gi)||[]).length; return verbs===0; },
   fail:"Reads like several asks in one — split into a chain of prompts."},
  {id:"vague", label:"No empty adjectives", test:function(p){ return !/\b(beautiful|stunning|amazing|modern|futuristic|high[- ]quality|nice|awesome)\b/i.test(p); },
   fail:"Replace vague adjectives with materials, light and technique."},
  {id:"preserve", label:"Says what to keep", test:function(p){ return /\b(keep|preserve|maintain|unchanged|do not change|stay|exact same|only)\b/i.test(p); },
   fail:"No preservation clause — the model will redraw everything."},
  {id:"len", label:"Under ~90 words", test:function(p){ return p.trim().split(/\s+/).length<=90; },
   fail:"Very long prompts get averaged. Move detail into follow-up steps."}
];

/* ---------- workflow templates ---------- */
window.MX_TEMPLATES=[
  {id:"sketch-render-restyle", label:"Sketch → render → restyle",
   nodes:[
     {type:"image", x:60,  y:140, cfg:{src:"sample"}},
     {type:"prompt",x:60,  y:330, cfg:{text:"Turn this axonometric line drawing into a photorealistic render of a small timber pavilion; keep the exact massing, proportions and view angle; soft overcast daylight; no text"}},
     {type:"gen",   x:360, y:200, cfg:{}},
     {type:"prompt",x:360, y:420, cfg:{text:"Re-render this image as a loose watercolour, keep composition and geometry identical, white paper margin"}},
     {type:"gen",   x:660, y:280, cfg:{}},
     {type:"compare",x:960,y:180, cfg:{}},
     {type:"output",x:960, y:420, cfg:{}}
   ],
   wires:[[0,"out",2,"image"],[1,"out",2,"prompt"],[2,"out",4,"image"],[3,"out",4,"prompt"],[2,"out",5,"a"],[4,"out",5,"b"],[4,"out",6,"image"]]},
  {id:"plan-aerial-season", label:"Plan → aerial → season",
   nodes:[
     {type:"image", x:60,  y:150, cfg:{src:"none"}},
     {type:"prompt",x:60,  y:340, cfg:{text:"Turn this site plan into a photorealistic bird's-eye aerial rendering; keep the exact layout, path network and building footprints; render vegetation as mature canopies; 45 degrees above; no text or labels"}},
     {type:"gen",   x:360, y:220, cfg:{}},
     {type:"prompt",x:360, y:430, cfg:{text:"Same view in winter: bare branches, pale low sun, snow on horizontal surfaces; change nothing else"}},
     {type:"gen",   x:660, y:300, cfg:{}},
     {type:"compare",x:960,y:240, cfg:{}}
   ],
   wires:[[0,"out",2,"image"],[1,"out",2,"prompt"],[2,"out",4,"image"],[3,"out",4,"prompt"],[2,"out",5,"a"],[4,"out",5,"b"]]},
  {id:"locked-iteration", label:"Constraint-locked iteration",
   nodes:[
     {type:"image", x:60,  y:160, cfg:{src:"sample"}},
     {type:"lens",  x:60,  y:350, cfg:{sel:"Keep layout"}},
     {type:"prompt",x:60,  y:480, cfg:{text:"Replace the primary material with board-formed concrete"}},
     {type:"compose",x:340,y:400, cfg:{}},
     {type:"gen",   x:620, y:260, cfg:{}},
     {type:"output",x:920, y:300, cfg:{}}
   ],
   wires:[[2,"out",3,"t1"],[1,"out",3,"t2"],[0,"out",4,"image"],[3,"out",4,"prompt"],[4,"out",5,"image"]]}
];
})();
