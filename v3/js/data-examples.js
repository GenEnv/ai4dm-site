/* Measures — worked examples library (generated content) */
window.MX_CATS = [
  {id:"2d3d", label:"2D → 3D", hint:"give a flat drawing depth"},
  {id:"3d2d", label:"3D → 2D", hint:"extract drawings from images"},
  {id:"restyle", label:"Restyle", hint:"same design, different medium"},
  {id:"edit", label:"Edit in place", hint:"change part, keep the rest"},
  {id:"diagram", label:"Diagram", hint:"abstract and explain"},
  {id:"site", label:"Site & context", hint:"work with real places"},
  {id:"layout", label:"Layout", hint:"boards and composition"}
];

window.MX_EXAMPLES = [

  /* ============ 2D -> 3D (6) ============ */

  {
    id: "site-plan-to-aerial",
    cat: "2d3d",
    title: "Site plan → aerial perspective",
    what: "Lifts a flat drafted plan into a bird's-eye view so reviewers can read massing, canopy and open space at a glance. Useful early in a project, before any 3D model exists.",
    input: "A drafted site plan, top-down, black linework with hatched building footprints, paths and planting areas",
    methods: ["preserve", "camera", "negative"],
    parts: [
      {k:"task", t:"Convert this drafted site plan into a photorealistic aerial perspective view of the same site"},
      {k:"preserve", t:"keep the exact footprint positions, building count, path alignments and plot proportions from the plan; do not add, merge, move or resize any building"},
      {k:"change", t:"extrude every hatched footprint into a simple 3-storey volume with a flat roof; render paths as light grey concrete pavers and the planting areas as low groundcover with scattered deciduous trees"},
      {k:"camera", t:"aerial three-quarter view from the south at about 45 degrees elevation, the whole site in frame with a narrow band of surrounding context"},
      {k:"light", t:"soft overcast daylight with mild shadows so the layout stays legible"},
      {k:"output", t:"one photorealistic image, no text labels, no dimension lines"},
      {k:"negative", t:"no invented towers, no water features that are not drawn in the plan, no cars unless a road appears in the drawing"}
    ],
    followups: [
      "Same view, but make the largest building 5 storeys; change nothing else",
      "Rotate the camera to view from the east; keep every building, path and tree identical",
      "Swap the overcast sky for low late-afternoon sun from the west; keep all geometry frozen"
    ],
    pitfalls: [
      "Models invent building heights freely — always state storey counts or the extrusion drifts between renders",
      "Orientation flips are common; check the layout against the plan corner by corner before trusting it",
      "Labels and dimension strings from the plan can resurface as garbled marks; explicitly ask for no text"
    ]
  },

  {
    id: "floor-plan-to-interior",
    cat: "2d3d",
    title: "Floor plan → eye-level interior",
    what: "Places a camera inside a drafted floor plan and renders what a person standing there would see. The fastest way to test whether a plan actually produces the space you imagine.",
    input: "A furnished floor plan of a small apartment at 1:50 style, with door swings, window openings and furniture symbols",
    methods: ["preserve", "camera", "material"],
    parts: [
      {k:"task", t:"Generate an eye-level interior view standing inside the living room of this floor plan, looking along the main axis toward the kitchen"},
      {k:"preserve", t:"respect the wall positions, door and window locations, and the furniture layout exactly as drawn; the sofa, dining table and kitchen island stay where their plan symbols place them"},
      {k:"style", t:"naturalistic interior with oak floorboards, white painted walls and matte black window frames"},
      {k:"camera", t:"eye level at 1.6 m, 24 mm full-frame lens equivalent, one-point view straight down the room axis"},
      {k:"light", t:"daylight entering through the windows drawn on the south wall, soft indirect bounce elsewhere, no artificial lights on"},
      {k:"output", t:"one photorealistic interior image"}
    ],
    followups: [
      "Turn the camera 90 degrees to face the window wall; keep the room, furniture and materials identical",
      "Replace the oak floor with polished concrete; change absolutely nothing else",
      "Same view at dusk with the pendant over the dining table switched on"
    ],
    pitfalls: [
      "The model frequently widens rooms to look pleasant — compare wall-to-wall proportions against the plan",
      "Doors and windows migrate to wherever they compose well; count openings against the drawing",
      "Furniture gets swapped for generic showroom pieces; name the key pieces you need kept"
    ]
  },

  {
    id: "section-to-sectional-perspective",
    cat: "2d3d",
    title: "Section → sectional perspective",
    what: "Adds depth behind a drafted section so the drawing explains both construction and spatial experience at once. A staple of competition boards and design reviews.",
    input: "A drafted building section with poché-filled cut walls and slabs, black linework, three floor levels",
    methods: ["preserve", "camera"],
    parts: [
      {k:"task", t:"Turn this drafted section into a sectional perspective: the cut plane stays flat and true to the drawing while the interior spaces recede behind it in perspective"},
      {k:"preserve", t:"keep every floor level, slab thickness, ceiling height and the exact cut profile line for line; the number of storeys must not change"},
      {k:"change", t:"fill the cut walls and slabs with solid black poché, and render the rooms behind the cut with light depth-cueing shading, furnishing them sparsely and only at plausible scale"},
      {k:"camera", t:"one-point perspective looking straight at the cut plane, vanishing point at the mid-height of the section"},
      {k:"style", t:"architectural sectional perspective, crisp black poché on the cut, muted desaturated colour in the spaces behind"},
      {k:"output", t:"one image on a white background, no text, no dimension strings"}
    ],
    followups: [
      "Add two or three human figures at correct scale on different levels; touch nothing else",
      "Warm the interior light as if late afternoon sun enters from the left; keep the poché pure black",
      "Deepen the perspective so more of the interior is visible; the cut profile must stay identical"
    ],
    pitfalls: [
      "Perspective often bends the cut plane itself — the cut must remain perfectly orthographic and flat",
      "Floor counts drift: a three-storey section quietly becomes four; count slabs after every render",
      "Poché degrades into a grey gradient; ask for solid black fill explicitly"
    ]
  },

  {
    id: "elevation-to-massing",
    cat: "2d3d",
    title: "Elevation → volumetric massing",
    what: "Uses a single orthographic elevation as the front face of a three-dimensional volume, so you can judge how the facade composition reads in the round.",
    input: "A street elevation drawing of a mid-rise facade, orthographic, with a regular window grid and parapet line",
    methods: ["preserve", "camera", "simplify"],
    parts: [
      {k:"task", t:"Use this elevation drawing as the front face of a simple building volume and show the building in three-quarter exterior view"},
      {k:"preserve", t:"keep the bay rhythm, storey count, opening proportions and parapet height exactly as drawn on the front face"},
      {k:"change", t:"give the volume a depth of roughly half its width; treat the side and rear faces as plain rendered surfaces with no openings so attention stays on the drawn facade"},
      {k:"camera", t:"three-quarter view from street level, about 20 m back, slight upward tilt, the whole building in frame"},
      {k:"light", t:"morning sun raking across the facade from the left to reveal reveal depths and shadow lines"},
      {k:"output", t:"one image, neutral paved foreground, plain sky, no signage or text"}
    ],
    followups: [
      "Repeat the window grid on the visible side face at the same rhythm; change nothing on the front",
      "Deepen the window reveals to about 300 mm; keep the grid and proportions frozen",
      "Show the same volume from the opposite corner under the same light"
    ],
    pitfalls: [
      "The model redesigns the facade while extruding it — verify the bay count and opening proportions",
      "Invented rooftop plant, railings and setbacks appear above the parapet; forbid them if unwanted",
      "Side faces get fully glazed by default; specify how the unseen faces should be treated"
    ]
  },

  {
    id: "contours-to-terrain",
    cat: "2d3d",
    title: "Contour map → terrain view",
    what: "Reads a topographic plan as a landform and renders the terrain in perspective. Essential for landscape students checking whether a grading strategy actually produces the landform intended.",
    input: "A topographic plan with contour lines at 1 m intervals, a stream corridor in the valley and a flat plateau marked at the top",
    methods: ["preserve", "camera"],
    parts: [
      {k:"task", t:"Convert this contour plan into a perspective view of the actual terrain it describes"},
      {k:"preserve", t:"keep the ridgeline positions, the valley alignment and the plateau location exactly as the contours place them; slope steepness must follow contour spacing, tightly spaced contours reading as steep faces and wide spacing as gentle grades"},
      {k:"change", t:"render the landform as mown and meadow grass with exposed rock only on the steepest faces, and the stream following the drawn corridor at the valley floor"},
      {k:"camera", t:"low aerial oblique from the downhill side looking up the valley, horizon in the top fifth of the frame"},
      {k:"light", t:"low sun from the side so the landform reads through shadow, clear sky"},
      {k:"output", t:"one photorealistic terrain image, no buildings, no roads, no text"}
    ],
    followups: [
      "Same terrain and camera, but render it in winter with light snow holding on north-facing slopes",
      "Add a single switchback path climbing the steep face at a walkable gradient; touch nothing else",
      "Move the camera to the plateau looking down the valley; the landform must not change"
    ],
    pitfalls: [
      "Contours get treated as surface decoration rather than elevation data — check that valleys are low and ridges are high, inversions are common",
      "Vertical scale is usually exaggerated for drama; state the contour interval and ask for true proportion",
      "The stream may wander off its drawn corridor or run uphill; trace it against the plan"
    ]
  },

  {
    id: "sketch-to-massing-study",
    cat: "2d3d",
    title: "Loose sketch → massing study",
    what: "Cleans a rough concept sketch into a disciplined massing image without redesigning it. Good for taking a napkin idea into a review without pretending it is further along than it is.",
    input: "A loose perspective pen sketch of two intersecting bar buildings, scanned from a sketchbook, wobbly lines and construction marks",
    methods: ["preserve", "simplify", "iterate"],
    parts: [
      {k:"task", t:"Interpret this loose sketch as a clean massing study of the same design"},
      {k:"preserve", t:"keep the relationship between the two bars exactly as sketched: their crossing angle, the point of overlap and their relative heights and lengths"},
      {k:"change", t:"resolve the wobbly linework into crisp rectilinear volumes; strip all detail, openings and texture"},
      {k:"style", t:"matte white study volumes on a plain mid-grey groundplane, like a foam model photographed in a studio"},
      {k:"camera", t:"three-quarter aerial view matching the viewpoint of the sketch as closely as possible"},
      {k:"light", t:"single soft studio light from the upper left, gentle contact shadows"},
      {k:"output", t:"one image, empty background, no context buildings, no entourage"}
    ],
    followups: [
      "Raise the shorter bar by one increment so the two volumes read as distinct heights; keep the crossing angle fixed",
      "Show the same massing from directly above as a top view; volumes unchanged",
      "Chamfer the corner where the bars meet; everything else stays frozen"
    ],
    pitfalls: [
      "The model resolves ambiguity by adding a third volume or a podium that was never sketched — count the parts",
      "Sketch charm becomes fake precision: the crossing angle gets rationalised to 90 degrees, check it",
      "Construction lines in the scan can be read as extra walls; crop or clean the scan first"
    ]
  },

  /* ============ 3D -> 2D (4) ============ */

  {
    id: "photo-to-elevation",
    cat: "3d2d",
    title: "Building photo → elevation drawing",
    what: "Rectifies a facade photograph into a flat orthographic elevation in drawing convention. Useful for survey work, precedent studies and as-built documentation.",
    input: "A photograph of a building facade taken from across the street, slight upward perspective, cars and wires in front",
    methods: ["preserve", "simplify", "negative"],
    parts: [
      {k:"task", t:"Redraw this facade photograph as a flat orthographic elevation drawing"},
      {k:"preserve", t:"keep the exact window count and positions, storey heights, door location and the pattern of material joints visible in the photo"},
      {k:"change", t:"remove all perspective so verticals are parallel and horizontals are level, and remove the cars, people, wires and foreground trees entirely"},
      {k:"style", t:"black line on white in three weights: heavy ground line, medium building outline and openings, fine mullions and joint lines; no colour, no rendered texture"},
      {k:"output", t:"one flat 2D elevation drawing, full facade in frame, white background"},
      {k:"negative", t:"no shading gradients, no vanishing-point convergence, no invented windows or floors beyond what the photo shows"}
    ],
    followups: [
      "Add a subtle flat grey fill to the glazing only; linework untouched",
      "Add hatching to indicate the brick areas; keep every line where it is",
      "Extend the ground line 5 m to each side with the neighbouring facades sketched in fine line"
    ],
    pitfalls: [
      "Perspective creeps back in — lay a straightedge on the verticals of the result before using it",
      "Repetitive window grids get miscounted; count openings per floor against the photo",
      "Parts hidden behind trees or cars are invented, sometimes plausibly; flag every occluded zone as unverified"
    ]
  },

  {
    id: "render-to-figure-ground",
    cat: "3d2d",
    title: "Render → figure-ground diagram",
    what: "Abstracts an aerial image into the classic black-and-white figure-ground, showing built mass against open space. The starting point of almost every urban analysis.",
    input: "An aerial render or drone photo of an urban block and its immediate surroundings, taken near vertical",
    methods: ["simplify", "preserve"],
    parts: [
      {k:"task", t:"Extract a figure-ground diagram from this aerial image: building footprints as solid black shapes, everything else pure white"},
      {k:"preserve", t:"keep every footprint shape, the gaps between buildings and the courtyard voids exactly as they appear in the image"},
      {k:"change", t:"drop all colour, texture, shadow, vegetation, roads and vehicles; nothing but black footprints on white remains"},
      {k:"style", t:"flat graphic diagram in the tradition of a Nolli-derived figure-ground, hard edges, no outlines around the black shapes"},
      {k:"camera", t:"true top-down orthographic view, no oblique angle"},
      {k:"output", t:"one flat black-and-white diagram, no text, no north arrow, no scale bar"}
    ],
    followups: [
      "Invert it: open space black, buildings white; geometry identical",
      "Add the primary streets back as thin grey lines; footprints untouched",
      "Fill only the buildings inside the central block in red; all others stay black"
    ],
    pitfalls: [
      "Cast shadows get merged into footprints, fattening buildings toward the sun side — compare edges on the shadow side",
      "Tree canopies become black blobs counted as built mass; check anything round and fuzzy",
      "The model often adds a helpful grey road layer you did not ask for; forbid intermediate tones"
    ]
  },

  {
    id: "interior-photo-to-section",
    cat: "3d2d",
    title: "Interior photo → measured-style section",
    what: "Reconstructs a drawn cross-section from an interior photograph, turning experienced space back into drawing convention. Strong exercise for understanding how sections encode space.",
    input: "A wide interior photograph of a double-height space with a mezzanine, taken roughly perpendicular to the long wall",
    methods: ["preserve", "simplify"],
    parts: [
      {k:"task", t:"Reconstruct this interior photograph as a measured-style orthographic cross-section through the space"},
      {k:"preserve", t:"keep the proportion of height to width, the mezzanine level, the ceiling profile and the window positions on the far wall as the photo shows them"},
      {k:"change", t:"cut the section where the camera stands: draw cut walls, floor slabs and roof as solid black poché, and the far wall beyond the cut as a fine-line interior elevation"},
      {k:"style", t:"architectural section convention, black poché, fine grey interior lines, a single human figure at 1.7 m for scale"},
      {k:"output", t:"one flat orthographic drawing on white, no perspective, no photo texture, no text"}
    ],
    followups: [
      "Add the furniture visible in the photo as fine outline only; poché and walls untouched",
      "Thicken the roof buildup to show a plausible construction depth; spatial proportions frozen",
      "Render the same section with a soft grey shadow wash to show daylight direction"
    ],
    pitfalls: [
      "Wide-angle lens distortion becomes wrong proportion in the drawing — the space usually comes out too tall",
      "Slab and wall thicknesses are pure invention; treat the poché as diagrammatic, not measurable",
      "Elements behind the camera get imagined into the cut; state that the cut is at the camera position"
    ]
  },

  {
    id: "model-photo-to-orthographic",
    cat: "3d2d",
    title: "Model photo → front and side views",
    what: "Derives paired orthographic drawings from a single photo of a physical massing model. Lets a quick desk model stand in for a drawn set during early reviews.",
    input: "A photo of a chipboard massing model on a desk, taken at a three-quarter angle showing two faces",
    methods: ["preserve", "sequence", "simplify"],
    parts: [
      {k:"task", t:"From this model photo, produce two orthographic drawings side by side: the front elevation and the side elevation of the massing"},
      {k:"preserve", t:"keep the relative heights, widths and setbacks of every volume as built in the model; the two drawings must be mutually consistent, sharing the same heights"},
      {k:"change", t:"remove the desk, hands, cutting mat and background entirely; flatten each face to true orthographic projection with no foreshortening"},
      {k:"style", t:"clean black linework, light grey fill on the tallest volume in both views to key them together"},
      {k:"output", t:"one white sheet, two aligned drawings on a shared ground line, front view left, side view right, no text"}
    ],
    followups: [
      "Add a roof plan above the two elevations, aligned on the same sheet; the elevations must not change",
      "Add overall height ticks as plain marks without numerals; linework untouched",
      "Redraw only the side elevation assuming the hidden rear volume is the same depth as the front one"
    ],
    pitfalls: [
      "The two views often disagree — a tower is four units tall in front and three in side view; cross-check every height",
      "Faces hidden in the photo are invented from symmetry assumptions; mark unseen faces as provisional",
      "Perspective foreshortening survives into the so-called orthographic views; check that parallel edges stay parallel"
    ]
  },

  /* ============ Restyle (6) ============ */

  {
    id: "render-to-watercolour",
    cat: "restyle",
    title: "Render → watercolour",
    what: "Repaints a finished render as a loose architectural watercolour, trading photoreal certainty for atmosphere. Good for concept-stage presentations where a render would overpromise.",
    input: "A photorealistic exterior render of a low pavilion in a park, daylight, fixed camera",
    methods: ["preserve", "material"],
    parts: [
      {k:"task", t:"Repaint this render as a loose architectural watercolour of exactly the same scene"},
      {k:"preserve", t:"keep the composition, camera, building geometry and shadow direction identical; every building edge stays where it is"},
      {k:"style", t:"transparent layered washes, a wet-on-wet sky, granulating pigment in the greens, white paper reserved for the brightest highlights, and a few faint pencil construction lines left visible under the paint"},
      {k:"light", t:"same daylight as the render, translated into warm and cool wash temperature rather than rendered shading"},
      {k:"output", t:"one image with a cold-press paper texture and a ragged unpainted border, no signature, no text"}
    ],
    followups: [
      "Loosen the vegetation further into wet blooms, but keep the building edges crisp",
      "Reduce the palette to ultramarine, burnt sienna and yellow ochre; composition unchanged",
      "Same painting at dusk: warm windows, cool violet shadows, geometry frozen"
    ],
    pitfalls: [
      "Edges melt: the building geometry drifts under the brushwork — overlay the result on the render to check",
      "Results often look like a digital filter, evenly textured everywhere; asking for reserved white paper and visible pencil fights this",
      "Watercolour prompts tend to oversaturate; name a limited pigment palette to keep it honest"
    ]
  },

  {
    id: "render-to-ink-hardline",
    cat: "restyle",
    title: "Render → hard-line ink drawing",
    what: "Converts a render into a disciplined pen-and-ink drawing with hatching, in the tradition of hand-drafted perspectives. Reads as authored rather than generated.",
    input: "An exterior render of a courtyard building, three-quarter view, strong sun",
    methods: ["preserve", "simplify"],
    parts: [
      {k:"task", t:"Redraw this render as a hard-line black ink perspective drawing of the same scene"},
      {k:"preserve", t:"keep the camera, geometry, opening positions and shadow shapes exactly as rendered"},
      {k:"change", t:"replace all tone and colour with line: parallel hatching for shadow areas, cross-hatching only in the deepest shade, stippling for foliage, and pure white for lit surfaces"},
      {k:"style", t:"uniform 0.3 mm pen weight for detail with a heavier outline on the building silhouette, ruled lines on architecture, freehand lines on planting"},
      {k:"output", t:"one black-and-white line drawing on white, no grey tones, no text"}
    ],
    followups: [
      "Densify the hatching in the courtyard shadow only; leave every line elsewhere untouched",
      "Add three figures in loose freehand outline at correct scale near the entrance",
      "Same drawing with the sky treated as horizontal ruled lines fading toward the horizon"
    ],
    pitfalls: [
      "Grey washes sneak in where hatching was requested — insist on pure black and white and check the histogram",
      "Hatching direction becomes random noise instead of following surfaces; ask for parallel hatching aligned to each plane",
      "Fine linework garbles repeated elements like railings and mullions; verify counts against the render"
    ]
  },

  {
    id: "render-to-physical-model",
    cat: "restyle",
    title: "Design → physical model photo",
    what: "Re-presents a design as a photograph of a handmade study model on a desk. Signals process and invites critique in a way a slick render never does.",
    input: "An exterior render or clean massing view of a small institutional building",
    methods: ["preserve", "material", "camera"],
    parts: [
      {k:"task", t:"Re-present this design as a photograph of a physical study model sitting on a studio desk"},
      {k:"preserve", t:"keep the massing, roof profile and opening positions exactly as designed; the model must clearly be this building"},
      {k:"style", t:"laser-cut chipboard walls with visible material thickness at every edge and corner, basswood strips for mullions, a museum-board groundplane, faint glue joints and slightly imperfect seams"},
      {k:"camera", t:"tabletop shot at model eye level, 50 mm equivalent, shallow depth of field, the front corner in sharp focus, a cutting mat and a pencil blurred at the frame edge"},
      {k:"light", t:"soft daylight from a window off-frame to the left, gentle warm cast"},
      {k:"output", t:"one photograph-style image, model at roughly 1:200 feel, no people, no text"}
    ],
    followups: [
      "Add small white scale figures made of paper, deliberately abstract; nothing else changes",
      "Same model rebuilt in white foam with pin joints; keep the massing and camera identical",
      "Pull the camera back to show the whole model on the desk with a roll of trace beside it"
    ],
    pitfalls: [
      "The giveaway failure is a render with cardboard texture: no edge thickness at wall openings — check every cut edge",
      "Scale figures come out photorealistic humans instead of model-like cutouts; specify the figure material",
      "Desk props multiply and steal the frame; limit and name the props"
    ]
  },

  {
    id: "day-to-dusk",
    cat: "restyle",
    title: "Day → dusk / night",
    what: "Relights an existing render or photo for the evening without touching the design. Dusk views sell public buildings and landscapes; this is the cheapest strong image in a submission.",
    input: "A daytime exterior render of a building or landscape scene with visible windows and paths",
    methods: ["preserve"],
    parts: [
      {k:"task", t:"Relight this exact scene at dusk, about twenty minutes after sunset"},
      {k:"preserve", t:"keep the geometry, camera, materials, vegetation and every object in the frame unchanged; this is a lighting change only"},
      {k:"change", t:"deep blue-hour sky with a faint warm band at the horizon, warm interior light glowing in roughly half the windows, path and bollard lighting on along the main route, wet-look subtle reflection on paving"},
      {k:"light", t:"tungsten-warm interiors around 3000 K against the cool ambient exterior, no visible light fixtures invented beyond those already present"},
      {k:"output", t:"one image, same crop and aspect ratio as the input"}
    ],
    followups: [
      "Push one hour later to full night, sky nearly black; lit windows and geometry stay as they are",
      "Turn off the interior lights in the upper floor only; everything else unchanged",
      "Add light fog catching the path lights; the architecture must not change"
    ],
    pitfalls: [
      "Relighting quietly remodels: window mullions, planting and even facade materials shift — difference-check against the day image",
      "Every window lights up like a showroom; specify what fraction of rooms are lit",
      "Invented lighting fixtures appear on facades and in trees; forbid new fixtures explicitly"
    ]
  },

  {
    id: "summer-to-winter",
    cat: "restyle",
    title: "Summer → winter scene",
    what: "Shifts season and atmosphere while freezing the design, proving a scheme works year-round. Landscape juries in particular ask for the leafless condition.",
    input: "A summer exterior view with deciduous trees in full leaf, lawns and planted beds",
    methods: ["preserve", "iterate"],
    parts: [
      {k:"task", t:"Show this exact scene in mid-winter"},
      {k:"preserve", t:"keep all geometry, the camera, hardscape materials and every tree in its existing position; deciduous trees become the same trees leafless, with believable branch structure, and any evergreens keep their foliage"},
      {k:"change", t:"a thin settled snow layer on horizontal surfaces only, paths cleared and darker where walked, lawns patchy white, planted beds cut back to stubble"},
      {k:"light", t:"low pale winter sun with long soft shadows, slightly desaturated overall"},
      {k:"output", t:"one image, same crop as the input"}
    ],
    followups: [
      "Same winter scene under heavy overcast with active light snowfall; nothing else changes",
      "Add fresh footprints crossing the lawn toward the entrance; scene otherwise frozen",
      "Now show the same view in autumn instead: turning leaves, wet paving, geometry identical"
    ],
    pitfalls: [
      "Trees teleport or change species when they lose leaves — count trunks against the summer image",
      "Snow buries design detail like kerbs, steps and paving patterns; ask for a thin layer with edges legible",
      "The model may winterise the architecture too, adding pitched snowy roofs; lock the building geometry"
    ]
  },

  {
    id: "photoreal-to-flat-illustration",
    cat: "restyle",
    title: "Photoreal → flat illustration",
    what: "Translates a render into the flat, limited-palette illustration style common on competition boards. Unifies mixed imagery and reads clearly at small print sizes.",
    input: "A photorealistic exterior render with people, planting and sky",
    methods: ["preserve", "simplify", "reference"],
    parts: [
      {k:"task", t:"Redraw this render as a flat competition-style architectural illustration of the same scene"},
      {k:"preserve", t:"keep the composition, camera, building geometry and the placement of people and trees exactly as in the render"},
      {k:"style", t:"flat colour shapes with no gradients and no outlines, a limited palette of six colours: off-white, warm sand, terracotta, sage green, slate blue and near-black, plus a subtle uniform paper-grain texture over everything"},
      {k:"change", t:"people become flat silhouettes with one small colour accent each, trees become simple layered canopy shapes, the sky a single flat tone"},
      {k:"output", t:"one flat illustration, crisp shape edges, same aspect ratio as the input, no text"}
    ],
    followups: [
      "Swap the palette to cool greys with a single coral accent; shapes and composition unchanged",
      "Add long flat cast shadows as a seventh transparent tone; geometry frozen",
      "Same style applied to the matching plan drawing so board images share one language"
    ],
    pitfalls: [
      "Gradients and soft shading creep back in, breaking the flat language — inspect large surfaces closely",
      "The stated palette silently grows to twenty colours; count the tones in the output",
      "Faces and hands on silhouette figures come out mangled; keep figures fully abstract"
    ]
  },

  /* ============ Edit in place (4) ============ */

  {
    id: "add-people-planting",
    cat: "edit",
    title: "Add people and planting at true scale",
    what: "Populates a finished but empty view with entourage at correct scale, without disturbing the architecture. The fix for renders that feel like ghost towns.",
    input: "A finished exterior render of a plaza and building entrance, currently empty of people and mostly unplanted",
    methods: ["preserve", "iterate", "negative"],
    parts: [
      {k:"task", t:"Add people and planting to this render as an in-place edit"},
      {k:"preserve", t:"the architecture, camera, paving, sky and lighting are untouched; this is an addition-only edit and nothing existing may move or be repainted"},
      {k:"change", t:"add eight to ten people in ordinary everyday clothing, walking, sitting on the existing steps and standing in pairs; add multi-stem serviceberry trees in the existing empty planters and a band of ornamental grasses along the building base"},
      {k:"camera", t:"keep the existing horizon discipline: the heads of standing adults on the same ground plane as the camera align with the horizon line"},
      {k:"output", t:"one image, same crop and resolution feel as the input"},
      {k:"negative", t:"no people looking at the camera, no crowds, no new furniture or umbrellas, no changes to the facade"}
    ],
    followups: [
      "Remove the two figures nearest the camera and add one cyclist mid-frame; nothing else changes",
      "Make the planting five years more mature; people and architecture stay as they are",
      "Add dappled canopy shadow on the paving under the new trees only"
    ],
    pitfalls: [
      "Figure scale drifts, especially in the middle ground — check heads against the horizon rule and door heights",
      "People float or sink relative to the ground plane; inspect every contact shadow",
      "New planting loves to cover the entrance and key facade moves; state what must remain visible"
    ]
  },

  {
    id: "replace-facade-material",
    cat: "edit",
    title: "Replace facade material, geometry locked",
    what: "Swaps a single material across a facade while every line of the design stays put. This constraint-locked edit is the core skill of iterating options with AI.",
    input: "An exterior render of a mid-rise building with a red brick facade",
    methods: ["preserve", "material", "iterate"],
    parts: [
      {k:"task", t:"Replace the red brick on this facade with board-formed concrete"},
      {k:"preserve", t:"keep the opening positions, window sizes, mullion layout, floor heights, camera, lighting and every other material in the scene exactly as they are; only the brick surfaces change"},
      {k:"change", t:"board-formed concrete with 150 mm horizontal board marks, visible tie holes on a regular grid, subtle pour-line variation and light weathering streaks below sills"},
      {k:"style", t:"the new concrete responds to the existing sun direction with the same shadow behaviour as the brick did"},
      {k:"output", t:"one image, identical framing to the input"}
    ],
    followups: [
      "Now try the same swap to charred timber cladding, vertical boards; all constraints still locked",
      "Back to concrete, but make the board marks vertical; nothing else changes",
      "Show brick, concrete and timber as three separate images from this identical view for side-by-side comparison"
    ],
    pitfalls: [
      "Material swaps drag geometry with them: window proportions and mullion counts shift — overlay input and output to compare",
      "The new material spills onto soffits, ground and adjacent buildings; name exactly which surfaces change",
      "Weathering and texture scale often read at the wrong size, boards a metre wide; give real dimensions"
    ]
  },

  {
    id: "cleanup-site-photo",
    cat: "edit",
    title: "Clean up a site photo",
    what: "Removes clutter from a survey photograph so it can serve as a clean base for proposals. Everything you keep must stay pixel-faithful, or the base is worthless.",
    input: "A street-level site photograph with parked cars, overhead wires, wheelie bins and temporary fencing",
    methods: ["preserve", "negative"],
    parts: [
      {k:"task", t:"Remove the parked cars, overhead wires, wheelie bins and temporary fencing from this site photograph"},
      {k:"preserve", t:"everything else stays pixel-faithful: buildings, paving pattern, kerb lines, trees, sky and lighting must be untouched outside the removed regions"},
      {k:"change", t:"fill the cleared areas by plausibly continuing what sits behind them, extending the paving joints, kerbs and facade bases through where the objects stood"},
      {k:"output", t:"one photograph, same crop, same colour balance as the original"},
      {k:"negative", t:"do not beautify the scene, do not clean the existing weathering or graffiti, do not add anything new"}
    ],
    followups: [
      "Also remove the road markings; kerbs and paving must not shift",
      "Slightly overcast the sky to flatten harsh shadows; buildings and ground untouched",
      "Extend this cleaned photo 20 percent to the right, continuing the street"
    ],
    pitfalls: [
      "Models improve regions you never touched — run a difference check between input and output",
      "Infill behind removed objects repeats cloned texture; look for stamped patterns in paving and facades",
      "Shadows of removed objects survive their owners; hunt for orphan shadows on the ground"
    ]
  },

  {
    id: "extend-canvas-outpaint",
    cat: "edit",
    title: "Extend the canvas (outpainting)",
    what: "Widens an image beyond its original frame, inventing consistent context on both sides. Rescues renders cropped too tight for a board or a wide-format panel.",
    input: "A render or photo of a building that is cropped too tightly, with the context cut off at both edges",
    methods: ["preserve", "sequence", "camera"],
    parts: [
      {k:"task", t:"Extend this image to the left and right until it is twice as wide, continuing the scene beyond the original frame"},
      {k:"preserve", t:"the original image area stays exact and unedited at the centre; the horizon height, perspective vanishing points, lighting direction and colour balance continue seamlessly into the new areas"},
      {k:"change", t:"continue the street logically: neighbouring buildings of similar height and grain, the pavement and kerb lines running on, planting consistent with what exists"},
      {k:"output", t:"one wide image at 2:1 of the original width, no visible seams"},
      {k:"negative", t:"no landmarks, no dramatic new focal buildings, nothing that competes with the original subject"}
    ],
    followups: [
      "Extend upward by 30 percent to gain sky for board text placement; sides and centre untouched",
      "Calm the left extension: simpler facades, fewer openings; the right side stays",
      "Continue one more step wider on the right only, holding everything already generated"
    ],
    pitfalls: [
      "Seams show as subtle shifts in grain, colour or perspective at the old frame line — zoom in along that boundary",
      "New context contradicts the vanishing points and the ground plane tilts; check kerbs and rooflines with a ruler",
      "Outpainting loves to duplicate the main building as its own neighbour; forbid lookalike structures"
    ]
  },

  /* ============ Diagram (3) ============ */

  {
    id: "exploded-isometric",
    cat: "diagram",
    title: "Building → exploded isometric",
    what: "Pulls a design apart into layered systems along a vertical axis, in strict parallel projection. The classic explainer diagram for how a building is put together.",
    input: "A render or clear photo of a small building whose parts you can name: roof, structure, envelope, floor plates",
    methods: ["preserve", "simplify", "sequence"],
    parts: [
      {k:"task", t:"Redraw this building as an exploded isometric diagram, separating it vertically into five layers: roof, structural frame, envelope, floor plates and groundplane"},
      {k:"preserve", t:"strict parallel projection throughout with no vanishing points and no foreshortening; all layers at the same scale, aligned on one shared vertical axis so they would visibly stack back together"},
      {k:"style", t:"white volumes with fine grey linework, one flat accent colour per layer, thin dashed vertical guide lines connecting the layers"},
      {k:"change", t:"strip all materials, entourage and context; each layer is simplified to its diagrammatic essentials"},
      {k:"output", t:"one diagram on a plain white background, generous spacing between layers, no text labels"}
    ],
    followups: [
      "Collapse the gap between envelope and floor plates by half; projection and alignment rules still hold",
      "Highlight only the structural frame in colour, all other layers grey; nothing moves",
      "Rotate the whole exploded stack 30 degrees in plan; keep it strictly isometric"
    ],
    pitfalls: [
      "Perspective creeps into the axon — check that parallel edges never converge anywhere in the image",
      "Layers drift off the shared axis so the diagram could not reassemble; sight down the dashed guides",
      "The model invents extra layers like MEP or furniture; fix the layer count in the prompt"
    ]
  },

  {
    id: "plan-to-program-diagram",
    cat: "diagram",
    title: "Plan → program diagram",
    what: "Recolours a floor plan into flat program zones so use and adjacency read instantly. The abstraction move every analysis board needs.",
    input: "A drafted floor plan with rooms of mixed uses: public hall, offices, service core, circulation",
    methods: ["preserve", "simplify"],
    parts: [
      {k:"task", t:"Convert this floor plan into a program diagram by filling each room with a flat colour according to use"},
      {k:"preserve", t:"keep the wall outlines and room boundaries exactly as drawn; no wall may move, thicken or disappear"},
      {k:"change", t:"drop furniture, dimensions and annotations; fill public spaces warm ochre, offices sage green, the service core dark grey and circulation pale blue"},
      {k:"style", t:"flat solid fills with no gradients or textures, thin black wall lines kept on top of the colour"},
      {k:"output", t:"one flat diagram on a white background, plus a simple legend of four plain colour chips in the corner with no text next to them"},
      {k:"negative", t:"no text labels anywhere, no hatching, no 3D effects or drop shadows"}
    ],
    followups: [
      "Merge circulation into the public colour to show one continuous open zone; walls untouched",
      "Add small arrows marking the two entrances; fills and walls stay as they are",
      "Same diagram with the service core hatched in fine diagonal lines instead of dark grey fill"
    ],
    pitfalls: [
      "Colour bleeds across walls, merging rooms that are actually separate — trace the boundaries against the plan",
      "Any request for labels yields garbled pseudo-text; keep the diagram wordless and add type later in Illustrator or InDesign",
      "The plan gets subtly redrawn and simplified during colouring; overlay input and output to verify walls"
    ]
  },

  {
    id: "circulation-overlay",
    cat: "diagram",
    title: "Render → circulation overlay",
    what: "Draws movement onto an existing view as a graphic overlay, keeping the image underneath intact. Explains how people flow through a scheme without a new drawing.",
    input: "An aerial or eye-level render of a building and its approach, entrances visible",
    methods: ["preserve", "simplify"],
    parts: [
      {k:"task", t:"Overlay a circulation diagram onto this render"},
      {k:"preserve", t:"the render itself is not repainted or altered; it may only be desaturated to about 40 percent so the overlay reads"},
      {k:"change", t:"draw the primary route as one bold continuous red line following the actual paths and doors, secondary routes as thinner dashed lines in the same red, and each entrance as a small solid circle"},
      {k:"style", t:"clean vector-like graphics with consistent line weight, lines sitting flat on the image plane with rounded corners at direction changes"},
      {k:"output", t:"one image, same crop as the input, no text or arrowhead clutter beyond a single arrowhead at each route end"}
    ],
    followups: [
      "Add a second colour for vehicle circulation on the road only; pedestrian lines unchanged",
      "Thin all lines by half and lighten the desaturation; routes stay exactly where they are",
      "Remove secondary routes, leaving only the primary line and entrance dots"
    ],
    pitfalls: [
      "Overlay lines happily pass through walls and hedges — trace each route against real doors and paths",
      "The base image gets restyled instead of just dimmed; compare the underlying render before and after",
      "Line weight wobbles along a single route, reading as multiple hierarchies; demand one consistent weight"
    ]
  },

  /* ============ Site & context (2) ============ */

  {
    id: "aerial-to-masterplan",
    cat: "site",
    title: "Aerial photo → masterplan render",
    what: "Renders a design proposal onto a real vacant parcel while the photographic context stays honest. The standard urban-scale before/after image.",
    input: "A near-vertical aerial or satellite photo of a vacant urban site with its surrounding blocks",
    methods: ["preserve", "reference", "negative"],
    parts: [
      {k:"task", t:"Render a masterplan proposal onto the vacant parcel at the centre of this aerial photo"},
      {k:"preserve", t:"the surrounding streets, existing buildings and everything outside the parcel boundary remain the untouched photograph; the proposal must stop exactly at the parcel edge"},
      {k:"change", t:"fill the parcel with a perimeter block of 4 to 5 storeys around a planted courtyard, a public pocket park at the south corner, and internal paths connecting to the existing street corners"},
      {k:"style", t:"the new block rendered in masterplan style, light roofs with visible roof forms, courtyard trees casting small shadows consistent with the shadows in the photo"},
      {k:"camera", t:"keep the exact top-down viewpoint and scale of the source photo"},
      {k:"negative", t:"no towers, no changes to neighbouring roofs, no redrawn roads outside the site"}
    ],
    followups: [
      "Open the perimeter block on the east side to connect the courtyard to the street; context still frozen",
      "Increase to 6 storeys on the north edge only; check the shadow falls consistently",
      "Show the identical proposal in a figure-ground diagram of the whole district"
    ],
    pitfalls: [
      "The photographic context quietly becomes a render, destroying the before/after credibility — inspect the neighbours",
      "The proposal overflows the parcel boundary into the street; trace the site edge in the result",
      "New roofs come out at a different graphic scale than the neighbourhood, making the block look toy-like; compare roof grain"
    ]
  },

  {
    id: "streetview-redesign",
    cat: "site",
    title: "Street view → streetscape proposal",
    what: "Redesigns the public realm inside a real street photo while the buildings stay as witnesses. The most persuasive image type for community consultation.",
    input: "A street-level photo of an existing road: wide asphalt, parked cars both sides, narrow cracked sidewalks, no trees",
    methods: ["preserve", "iterate", "negative"],
    parts: [
      {k:"task", t:"Redesign the streetscape in this photo as a proposal image"},
      {k:"preserve", t:"the building facades on both sides, the sky and the camera position and lens stay exactly as photographed; only the ground plane and street furniture zone change"},
      {k:"change", t:"narrow the carriageway to two lanes, widen both sidewalks with light concrete pavers, add a continuous row of honey locust street trees in permeable tree pits at 8 m spacing, a protected cycle lane on the right side, and simple dark-grey bollards and benches"},
      {k:"light", t:"keep the existing daylight and shadow direction, with new tree shadows falling consistently"},
      {k:"output", t:"one photorealistic image, same crop as the source photo"},
      {k:"negative", t:"do not renovate, clean or recolour the building facades; no new buildings; keep some ordinary parked cars so the street stays believable"}
    ],
    followups: [
      "Same proposal in winter with leafless trees, to show the honest worst case",
      "Remove the cycle lane and widen the planted verge instead; everything else stays",
      "Populate lightly: six pedestrians and one cyclist at true scale; design unchanged"
    ],
    pitfalls: [
      "Facades get freshly painted and re-glazed uninvited, which reads as dishonest in consultation — lock them explicitly",
      "New kerb lines ignore the photo's perspective and bend at the vanishing point; check convergence against the originals",
      "Street trees come out at ten years' growth with perfect lollipop crowns; specify age and spacing"
    ]
  },

  /* ============ Layout (1) ============ */

  {
    id: "views-to-presentation-board",
    cat: "layout",
    title: "Views → presentation board",
    what: "Composes several finished images into a single board-format sheet to test hierarchy and composition. Treat this as a layout sketch: AI arranges imagery well but cannot set type — final boards belong in InDesign.",
    input: "Four finished images supplied together: a hero perspective, a site plan, a section and a detail photo-style view",
    methods: ["reference", "sequence", "negative"],
    parts: [
      {k:"task", t:"Assemble the four supplied images into one A1 landscape presentation board layout"},
      {k:"preserve", t:"each supplied image is placed whole and unaltered: no repainting, no restyling, no cropping beyond straight rectangular crops"},
      {k:"change", t:"give the hero perspective roughly the left two-thirds at full bleed, and stack the plan, section and detail in a right-hand column on a white field with consistent gutters of about 10 mm at board scale"},
      {k:"style", t:"generous white margins, aligned edges on a simple grid, one thin grey rule separating the column from the hero image"},
      {k:"output", t:"one A1 landscape sheet at 2:1.41 proportion, with empty white rectangles reserved where the title block and captions will go"},
      {k:"negative", t:"absolutely no text, no lettering, no logos, no scale bars and no north arrows anywhere on the board; leave all text areas blank"}
    ],
    followups: [
      "Swap the section and the plan in the column; margins and hero untouched",
      "Reduce the hero to half the board and enlarge the section to sit beside it",
      "Same layout in portrait A1 to compare which orientation carries the hero better"
    ],
    pitfalls: [
      "Any text the model sets will be garbled pseudo-lettering — this is the hard rule: AI for imagery, InDesign or Illustrator for every word on the final board",
      "Placed images get subtly regenerated during layout, drifting from your approved versions; difference-check each one",
      "Margins and gutters wander so nothing truly aligns; use the AI board only as a composition study, then rebuild the grid precisely in layout software"
    ]
  }

];
