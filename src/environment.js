'use strict';
import * as THREE from 'three';

// This function sets up the global environment
export function setup_environment(scene) {
    //
    setup_lights(scene);
  
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0x303030, opacity: 1 }),
      );
    floor.rotateX(- Math.PI / 2);
    floor.position.y = - 10;
    floor.receiveShadow = true;
    scene.add(floor);
  
    const floor_grid = new THREE.GridHelper(2000, 100);
    floor_grid.position.y = -10;
    floor_grid.material.opacity = 0.25;
    floor_grid.material.transparent = true;
    scene.add(floor_grid);
  }
  
  function setup_lights(scene) {
    // Create a light
    let hemisphere_light = new THREE.HemisphereLight(0xffffbb, 0x000000, 1.5);
    scene.add(hemisphere_light);
  
    let light = new THREE.DirectionalLight(0xff00c0, 0.4);
    light.position.set(1, 1, 0);
    scene.add(light);
  }
  
  
  