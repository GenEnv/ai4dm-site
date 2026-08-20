/* ============ AI4DM: router ============ */
(function(){
"use strict";
var $=MX.$;
var VIEWS={atlas:"Representation Atlas",gallery:"Gallery",prompt:"Prompt Lab",flow:"Workflow",studio:"Studio"};

function go(){
  var seg=(location.hash||"#gallery").slice(1).split("/");
  var h=seg[0];
  if(!VIEWS[h]) h="gallery";
  Object.keys(VIEWS).forEach(function(k){
    $("#view-"+k).hidden = k!==h;
  });
  MX.$$(".nav[data-view]").forEach(function(a){
    a.classList.toggle("active",a.dataset.view===h);
  });
  $("#crumbView").textContent=VIEWS[h];
  if(h==="flow") MX.flowEnsure();
  if(h==="studio") MX.studioEnsure();
  /* deep links: #atlas/<modeId> and #gallery/<exampleId> */
  if(seg[1]&&h==="atlas"&&MX.atlasOpenId) MX.atlasOpenId(seg[1]);
  if(seg[1]&&h==="gallery"&&MX.galleryOpenId) MX.galleryOpenId(seg[1]);
}
window.addEventListener("hashchange",go);
document.addEventListener("DOMContentLoaded",go);
})();
