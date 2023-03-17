'use strict';
import * as THREE from 'three';

import * as dat from 'dat.gui';
import { init_all } from './init.js'
import { setup_environment } from './environment.js'

import { Hyperbox, hyperboxVertexes, hyperboxEdges } from './shapes.js'


const canvas = document.querySelector('#threejs-main-canvas');
const [renderer, scene, main_camera] = init_all(canvas);
// Animation functions
// Each animation function has 2 arguments:
// time - global time
// dt - increment of time from previous 
const animation_functions = [];
setup_environment(scene);

// Create the gui controls
// State is a global object that contains variables you might want to tweak
// To add a controllable variable to the global state add it in the object 
// and then add it to gui 
// Setup functions
const gui = new dat.GUI();
const state = {};

let pyodide = await loadPyodide();
await pyodide.loadPackage("numpy");

pyodide.runPython(`
import numpy
import sys
print(sys.version)
print(numpy.version)
`);




// Start creating shapes

{// The hyperBox
  let shape;
  shape = Hyperbox(3, 3, 3, 10);
  scene.add(shape);
  {
    let guiFolder = gui.addFolder("hyperBox");
    guiFolder.open();

    // The following is a closure https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
    // it allows us to reuse the variable shape later in the code
    let onChangeFunc = (shape => function () {
      shape.updateMatrix4D();
      shape.updateVertexes();
    })(shape);
    guiFolder.add(shape.rot, "xy", 0, 2 * Math.PI).step(0.01).onChange(onChangeFunc);
    guiFolder.add(shape.rot, "xz", 0, 2 * Math.PI).step(0.01).onChange(onChangeFunc);
    guiFolder.add(shape.rot, "yz", 0, 2 * Math.PI).step(0.01).onChange(onChangeFunc);
    guiFolder.add(shape.rot, "xt", 0, 2 * Math.PI).step(0.01).onChange(onChangeFunc);
    guiFolder.add(shape.rot, "yt", 0, 2 * Math.PI).step(0.01).onChange(onChangeFunc);
    guiFolder.add(shape.rot, "zt", 0, 2 * Math.PI).step(0.01).onChange(onChangeFunc);

    const drawrange = { drawrange: 0, onChangeFunc: null, };
    drawrange.onChangeFunc = (function (shape) {
      return function () {
        shape.mesh.geometry.setDrawRange(0, this.drawrange);
        console.log(shape.mesh.geometry.DrawRange);
        shape.updateVertexes();
      }
    })(shape);
    guiFolder.add(drawrange, "drawrange", 0, 147).step(1).onChange(() => drawrange.onChangeFunc());


    // Again a closure
    const diagonalize4DRotation = (shape => function () {
      console.log("shape.matrix4D.elements=", shape.matrix4D.elements);
      // populate a math.js matrix from the Matrix4 of shape
      const m = math.matrix([4, 4]);
      for (const [index, value] of shape.matrix4D.elements.entries()) {
        let i = index % 4;
        let j = (index / 4 >> 0);
        m.set([i, j], value);
      }
      console.log("m=", m);
      let ans = math.eigs(m);
      console.log("eigs=", ans);
    })(shape);

    guiFolder.add({ diagonalize4DRotation: diagonalize4DRotation }, "diagonalize4DRotation").name("Diagonalize(console)");
  };
}




/* 
***********************************************
***********************************************
***********************************************
*/

{// Animation loop
  let lastrender = 0;
  renderer.setAnimationLoop(render_loop);
  // The render loop
  function render_loop(timestamp, lastrender) {
    let dt = (timestamp - lastrender) * 0.001; // time in sec since the previous render
    let time = timestamp * 0.001;  // current time converted to seconds
    lastrender = timestamp // record the current timestamp as last render time

    // Call all animation functions 
    animation_functions.forEach(function (func) { func(time, dt) });

    // Render and loop
    renderer.render(scene, main_camera);
  }
}
