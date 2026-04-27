// BlockyAnimal.js

// Vertex shader
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotation;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// WebGL globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;

// Camera angles from sliders
var g_globalAngleX = 0;
var g_globalAngleY = 0;

// Joint angles - all slider controlled
var g_headAngle = 0;
var g_tailAngle = 0;
var g_flUpperAngle = 0;  // front left upper leg
var g_flLowerAngle = 0;  // front left lower leg
var g_flHoofAngle = 0;   // front left hoof (3rd level)
var g_frUpperAngle = 0;  // front right upper leg
var g_frLowerAngle = 0;  // front right lower leg
var g_frHoofAngle = 0;   // front right hoof
var g_blUpperAngle = 0;  // back left upper leg
var g_blLowerAngle = 0;  // back left lower leg
var g_blHoofAngle = 0;   // back left hoof
var g_brUpperAngle = 0;  // back right upper leg
var g_brLowerAngle = 0;  // back right lower leg
var g_brHoofAngle = 0;   // back right hoof

// Animation
var g_animation = false;
var g_startTime = performance.now() / 1000.0;
var g_seconds = 0;

// Mouse rotation
var g_mouseDown = false;
var g_lastMouseX = 0;
var g_lastMouseY = 0;
var g_mouseAngleX = 0;
var g_mouseAngleY = 0;

// Poke animation
var g_poking = false;
var g_pokeStart = 0;
var g_pokeDuration = 1.5;


function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get WebGL context');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
}


// Mouse Handlers 

function setupMouseHandlers() {
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      startPoke();
      return;
    }
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;
    g_mouseAngleY += (ev.clientX - g_lastMouseX) * 0.5;
    g_mouseAngleX += (ev.clientY - g_lastMouseY) * 0.5;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene();
  };
}

// Poke Animation Module    

function startPoke() {
  g_poking = true;
  g_pokeStart = g_seconds;
}

// Animation Loop and Helpers

function updateAnimationAngles() {
  if (g_animation) {
    var t = g_seconds * 4;
    g_flUpperAngle = 25 * Math.sin(t);
    g_flLowerAngle = 15 * Math.sin(t + 0.5);
    g_flHoofAngle  = 10 * Math.sin(t + 1.0);

    g_frUpperAngle = 25 * Math.sin(t + Math.PI);
    g_frLowerAngle = 15 * Math.sin(t + Math.PI + 0.5);
    g_frHoofAngle  = 10 * Math.sin(t + Math.PI + 1.0);

    g_blUpperAngle = 25 * Math.sin(t + Math.PI);
    g_blLowerAngle = 15 * Math.sin(t + Math.PI + 0.5);
    g_blHoofAngle  = 10 * Math.sin(t + Math.PI + 1.0);

    g_brUpperAngle = 25 * Math.sin(t);
    g_brLowerAngle = 15 * Math.sin(t + 0.5);
    g_brHoofAngle  = 10 * Math.sin(t + 1.0);

    g_headAngle = 8 * Math.sin(g_seconds * 2);
    g_tailAngle = 20 * Math.sin(g_seconds * 6);

    // Update sliders to match animation
    document.getElementById('flUpperSlider').value = g_flUpperAngle;
    document.getElementById('flLowerSlider').value = g_flLowerAngle;
    document.getElementById('flHoofSlider').value = g_flHoofAngle;
    document.getElementById('frUpperSlider').value = g_frUpperAngle;
    document.getElementById('frLowerSlider').value = g_frLowerAngle;
    document.getElementById('frHoofSlider').value = g_frHoofAngle;
    document.getElementById('blUpperSlider').value = g_blUpperAngle;
    document.getElementById('blLowerSlider').value = g_blLowerAngle;
    document.getElementById('blHoofSlider').value = g_blHoofAngle;
    document.getElementById('brUpperSlider').value = g_brUpperAngle;
    document.getElementById('brLowerSlider').value = g_brLowerAngle;
    document.getElementById('brHoofSlider').value = g_brHoofAngle;
    document.getElementById('headSlider').value = g_headAngle;
    document.getElementById('tailSlider').value = g_tailAngle;
  }

  // End poke when duration is up
  if (g_poking) {
    if (g_seconds - g_pokeStart > g_pokeDuration) {
      g_poking = false;
    }
  }
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

// 

function drawLeg(baseM, upperAngle, lowerAngle, hoofAngle, xOff, zOff) {
  // Upper leg attaches to bottom of body
  var upperM = new Matrix4(baseM);
  upperM.translate(xOff, 0, zOff);                   // position on body
  upperM.rotate(parseFloat(upperAngle), 0, 0, 1);  // joint rotation

  var upper = new Cube();
  upper.color = [0.8, 0.7, 0.55, 1.0];
  upper.matrix = new Matrix4(upperM);
  upper.matrix.translate(-0.04, -0.18, -0.04);
  upper.matrix.scale(0.08, 0.18, 0.08);
  upper.render();

  // Lower leg hangs from bottom of upper leg
  var lowerM = new Matrix4(upperM);
  lowerM.translate(0, -0.18, 0);
  lowerM.rotate(parseFloat(lowerAngle), 0, 0, 1);

  var lower = new Cube();
  lower.color = [0.75, 0.65, 0.5, 1.0];
  lower.matrix = new Matrix4(lowerM);
  lower.matrix.translate(-0.035, -0.16, -0.035);
  lower.matrix.scale(0.07, 0.16, 0.07);
  lower.render();

  // Hoof at bottom of lower leg
  var hoofM = new Matrix4(lowerM);
  hoofM.translate(0, -0.16, 0);
  hoofM.rotate(parseFloat(hoofAngle), 0, 0, 1);

  var hoof = new Cube();
  hoof.color = [0.25, 0.2, 0.15, 1.0];
  hoof.matrix = new Matrix4(hoofM);
  hoof.matrix.translate(-0.045, -0.06, -0.045);
  hoof.matrix.scale(0.09, 0.06, 0.09);
  hoof.render();
}

// Render the entire scene

function renderScene() {
  var startTime = performance.now();

  // Global rotation from sliders + mouse drag
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(parseFloat(g_globalAngleX) + g_mouseAngleX, 1, 0, 0);
  globalRotMat.rotate(parseFloat(g_globalAngleY) + g_mouseAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Poke offsets
  var pokeY = 0;
  var pokeShake = 0;
  if (g_poking) {
    var pt = g_seconds - g_pokeStart;
    pokeY = 0.3 * Math.sin(pt / g_pokeDuration * Math.PI);
    pokeShake = 15 * Math.sin(pt * 20) * (1 - pt / g_pokeDuration);
  }

  // Body base matrix
  function bodyBase() {
    var m = new Matrix4();
    m.translate(0, pokeY, 0);
    m.rotate(pokeShake, 0, 0, 1);
    return m;
  }

  // Body
  var body = new Cube();
  body.color = [0.85, 0.75, 0.6, 1.0];
  body.matrix = bodyBase();
  body.matrix.translate(-0.25, -0.05, -0.15);
  body.matrix.scale(0.5, 0.3, 0.3);
  body.render();

  // Head 
  var headM = bodyBase();
  headM.translate(0.25, 0.1, 0);        // front of body, slightly up
  headM.rotate(parseFloat(g_headAngle), 0, 0, 1);

  var head = new Cube();
  head.color = [0.9, 0.8, 0.65, 1.0];
  head.matrix = new Matrix4(headM);
  head.matrix.translate(0, -0.05, -0.1);
  head.matrix.scale(0.18, 0.2, 0.2);
  head.render();

  // Snout
  var snout = new Cube();
  snout.color = [0.95, 0.85, 0.7, 1.0];
  snout.matrix = new Matrix4(headM);
  snout.matrix.translate(0.14, -0.07, -0.06);
  snout.matrix.scale(0.1, 0.1, 0.12);
  snout.render();

  // Ears
  var earL = new Cube();
  earL.color = [0.75, 0.6, 0.45, 1.0];
  earL.matrix = new Matrix4(headM);
  earL.matrix.translate(0.02, 0.14, -0.14);
  earL.matrix.rotate(-25, 1, 0, 0);
  earL.matrix.scale(0.06, 0.03, 0.07);
  earL.render();

  var earR = new Cube();
  earR.color = [0.75, 0.6, 0.45, 1.0];
  earR.matrix = new Matrix4(headM);
  earR.matrix.translate(0.02, 0.14, 0.07);
  earR.matrix.rotate(25, 1, 0, 0);
  earR.matrix.scale(0.06, 0.03, 0.07);
  earR.render();

  // Horns
  var hornL = new Cone();
  hornL.color = [0.55, 0.5, 0.4, 1.0];
  hornL.matrix = new Matrix4(headM);
  hornL.matrix.translate(0.02, 0.12, -0.12);
  hornL.matrix.rotate(15, 0, 0, 1);
  hornL.matrix.rotate(-20, 1, 0, 0);
  hornL.matrix.scale(0.04, 0.14, 0.04);
  hornL.render();

  var hornR = new Cone();
  hornR.color = [0.55, 0.5, 0.4, 1.0];
  hornR.matrix = new Matrix4(headM);
  hornR.matrix.translate(0.02, 0.12, 0.08);
  hornR.matrix.rotate(15, 0, 0, 1);
  hornR.matrix.rotate(20, 1, 0, 0);
  hornR.matrix.scale(0.04, 0.14, 0.04);
  hornR.render();

  // Beard
  var beard = new Cube();
  beard.color = [0.7, 0.6, 0.45, 1.0];
  beard.matrix = new Matrix4(headM);
  beard.matrix.translate(0.13, -0.12, -0.03);
  beard.matrix.scale(0.04, 0.08, 0.06);
  beard.render();

  // Tail
  var tail = new Cube();
  tail.color = [0.8, 0.7, 0.55, 1.0];
  tail.matrix = bodyBase();
  tail.matrix.translate(-0.25, 0.18, -0.03);
  tail.matrix.rotate(-40, 0, 0, 1);     
  tail.matrix.rotate(parseFloat(g_tailAngle), 1, 0, 0);  
  tail.matrix.translate(-0.12, 0, 0);      
  tail.matrix.scale(0.12, 0.05, 0.05);
  tail.render();

  // --- LEGS (4 legs, each 3 levels deep) ---
  // Body goes from x: -0.25 to 0.25, y: -0.05, z: -0.15 to 0.15

  var legBase = bodyBase();
  legBase.translate(0, -0.05, 0)

  // Front left
  drawLeg(legBase, g_flUpperAngle, g_flLowerAngle, g_flHoofAngle, 0.18, -0.1);

  // Front right
  drawLeg(legBase, g_frUpperAngle, g_frLowerAngle, g_frHoofAngle, 0.18, 0.1);

  // Back left
  drawLeg(legBase, g_blUpperAngle, g_blLowerAngle, g_blHoofAngle, -0.18, -0.1);

  // Back right
  drawLeg(legBase, g_brUpperAngle, g_brLowerAngle, g_brHoofAngle, -0.18, 0.1);

  // Performance indicator
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + "  fps: " + Math.floor(1000 / duration), "perf");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) return;
  htmlElm.innerHTML = text;
}

// main function

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  setupMouseHandlers();

  gl.clearColor(0.5, 0.7, 0.9, 1.0);

  tick();
}