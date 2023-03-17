'use strict';
import * as THREE from 'three';
import { OrbitControls, MapControls } from 'OrbitControls';
import { Camera } from 'three';

/* Boilerplate code to initialize the ThreeJS renderer */

export function init_all(canvas){
    const renderer = init_renderer(canvas);
    const scene = init_scene(); 
    const main_camera = init_main_camera(window,canvas);
    return [renderer,scene,main_camera]
}

/**
 * Initialize the ThreeJS renderer
 * @param {Object} canvas - the canvas to which to render
 * @returns the main WebGLRenderer renderer
 */
export function init_renderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    // next, set the renderer to the same size as our container element
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    // finally, set the pixel ratio so that our scene will look good on HiDPI displays
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
}

/**
 * Initialize the main ThreeJS Scene
 * @returns Main ThreeJS Scene object
 */
export function init_scene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    return scene;
}

/**
 * Initialize main camera that looks at [0,0,0]
 * @param {Object} canvas - the canvas to which to associate the camera controls
 * @param {[number,number,number]} [pos=[5,8,15]] - position of camera
 * @returns {Camera} A ThreeJS camera object
 */
export function init_main_camera(window, canvas, pos=[5,8,15], controls="MapControls") {
    let main_camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 3000);
    main_camera.position.set(...pos);
    main_camera.lookAt(0, 0, 0);
    if (controls == "MapControls") { init_camera_controls(window, canvas, main_camera) }
    return main_camera;
}

function init_camera_controls(window, canvas, camera) {
    // Camera control setup
    // We assume that the camera to control is the global variable "camera"
    let main_camera_controls = new MapControls(camera,canvas);
    main_camera_controls.maxDistance = 200;
    main_camera_controls.minDistance = 10;
    main_camera_controls.maxPolarAngle = Math.PI / 2;
    main_camera_controls.panSpeed = 10;
    main_camera_controls.keyPanSpeed = 100;
    main_camera_controls.listenToKeyEvents(window);
    main_camera_controls.update();
    return main_camera_controls
}
