'use strict';
import * as THREE from 'three';


/** 
 * Object4D represents a 4-dimensional object
 * @extends THREE.Group
 * @property {Float32Array} vertexes - a buffer of coordinates of vertexes arranged linearly; has lenght divisible by 4
 * @property {Float32Array} transformedVertexes - vertexes obtained after applying the object transformation matrix
 * @private  
 * @property {Mesh} mesh - the 4d projected mesh
 * @property {LineSegments} edges - the 4d projected edges
 * @property {Matrix4} matrix4D - the transformation matrix (read only access)
 * @private
 * @
 * @property {Object} rot - information about rotation
 * @property {number} rot.xy - rotation in the x-y plane
 * @property {number} rot.yz - rotation in the y-z plane
 * @property {number} rot.xz - rotation in the x-z plane
 * @property {number} rot.xt - rotation in the x-t plane
 * @property {number} rot.yt - rotation in the y-t plane
 * @property {number} rot.zt - rotation in the z-t plane
 * 
 */
export class Object4D extends THREE.Group {
  vertexes;
  transformedVertexes;
  edges;
  mesh;
  rot = { xy: 0, xz: 0, yz: 0, xt: 0, yt: 0, zt: 0 };
  #matrix4D;
  get matrix4D() { return this.#matrix4D }

  /**
   * Creates an instance of Object4D.
   * @param {Array.<[number,number,number,number]>} vertexes - an array of 4-vectors specifying vertexes
   * @param {Array.<[number,number]>} edges - an array of edges, specified by 2 indexes of vertexes making a segment
   * @param {Array.<[number,number,number]>} faces - an array of faces, specified by 3 indexes of vertexes making a triangle 
   * @memberof Object4D
   */
  constructor(vertexes, edges, faces) {
    super();
    this.vertexes = new Float32Array(vertexes.flat());
    this.transformedVertexes = new Float32Array(this.vertexes);
    this.#init_edges(edges);
    this.#init_faces(faces);
    this.#matrix4D = new THREE.Matrix4().fromArray(
      [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
  }

  /**
   * Generate the edges of the shape
   *
   * @param {Array.<[number,number]>} edges - an array of edges, specified by 2 vertexes indexes
   * @memberof Object4D
   */
  #init_edges(edges) {
    // We use the {@link Object4D#transformedVertexes} as the common buffer for the geometry
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.transformedVertexes, 4));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.transformedVertexes.length * 4), 4));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.transformedVertexes * 2), 2));
    geometry.setIndex(edges.flat());

    let material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Add edges to shape
    this.edges = new THREE.LineSegments(geometry, material);
    this.add(this.edges);
  }
  /**
   * Generate the mesh of the object
   * @param {Array.<[number,number,number]>} faces - an array of faces specified as 3 vertex indexes
   */
  #init_faces(faces) {
    let geometry = new THREE.BufferGeometry();
    // We use the {@link Object4D#transformedVertexes} as the common buffer for the geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(this.transformedVertexes, 4));
    // initialize empty normals
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.transformedVertexes.length * 4), 4));
    // initialize empty uv coordinates
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.transformedVertexes.length * 2), 2));
    geometry.setIndex(faces.flat());
    // automatically compute the normals  
    geometry.computeVertexNormals();

    // We will allow multiple materials in the same shape. To do this we declare an Array of materials and then define the groups of faces.
    let faces_materials = [
      new THREE.MeshPhysicalMaterial({
      color: 0xA2D2DF,
      metalness: 0.1,
      roughness: 0.7,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      clearcoat: 0.2,
    })
    ,
    new THREE.MeshPhysicalMaterial({
      color: 0x003A2A,
      metalness: 0.1,
      roughness: 0.7,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      clearcoat: 0.2,
    })
  ];
  geometry.addGroup(0, Infinity, 0);
  //geometry.addGroup(4, Infinity, 1);
  geometry.setDrawRange(0,Infinity);

    // Add mesh to shape
    this.mesh = new THREE.Mesh(geometry, faces_materials);
    this.add(this.mesh);
  }

  /**
   * Update the {@link Object4D##matrix4D} from the angles specified in {@link Object4D#rot}
   *
   * @memberof Object4D
   */
  updateMatrix4D() {
    let xy = this.rot.xy;
    let xz = this.rot.xz;
    let yz = this.rot.yz;
    let xt = this.rot.xt;
    let yt = this.rot.yt;
    let zt = this.rot.zt;

    let dXY = new THREE.Matrix4().fromArray(
      [
        Math.cos(xy), Math.sin(xy), 0, 0,
        -Math.sin(xy), Math.cos(xy), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]
    );
    let dYZ = new THREE.Matrix4().fromArray(
      [
        1, 0, 0, 0,
        0, Math.cos(yz), Math.sin(yz), 0,
        0, -Math.sin(yz), Math.cos(yz), 0,
        0, 0, 0, 1
      ]
    );
    let dXZ = new THREE.Matrix4().fromArray(
      [
        Math.cos(xz), 0, Math.sin(xz), 0,
        0, 1, 0, 0,
        -Math.sin(xz), 0, Math.cos(xz), 0,
        0, 0, 0, 1
      ]
    );
    let dXT = new THREE.Matrix4().fromArray(
      [
        Math.cos(xt), 0, 0, Math.sin(xt),
        0, 1, 0, 0,
        0, 0, 1, 0,
        -Math.sin(xt), 0, 0, Math.cos(xt)
      ]
    );
    let dYT = new THREE.Matrix4().fromArray(
      [
        1, 0, 0, 0,
        0, Math.cos(yt), 0, Math.sin(yt),
        0, 0, 1, 0,
        0, -Math.sin(yt), 0, Math.cos(yt)
      ]
    );
    let dZT = new THREE.Matrix4().fromArray(
      [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, Math.cos(zt), Math.sin(zt),
        0, 0, -Math.sin(zt), Math.cos(zt)
      ]
    );
    let matrix4D = this.#matrix4D;
    matrix4D.identity();
    matrix4D.multiply(dXT);
    matrix4D.multiply(dYT);
    matrix4D.multiply(dZT);
    matrix4D.multiply(dXY);
    matrix4D.multiply(dYZ);
    matrix4D.multiply(dXZ);
  }


  /**
   * update {@link Object4D#transformedVertexes} by applying {@link Object4D##matrix4D} to {@link Object4D#vertexes}
   *
   * @memberof Object4D
   */
  updateVertexes() {
    // This is a cool hack (not really a hack, just linear algebra).
    // If you take a 16 dimensional vector and read it as a 4x4 matrix in a row-major order
    // then you multiply LEFT that matrix by another 4x4 matrix, you obtain a 4x4 matrix. 
    // if you read off the columns of that matrix you get 4 4-vectors that would be the result of multiplying
    // each of the 4-vectors that together comprise the original 16dim vector


    // WARNING, this work only if position consists of n vectors with n a multiple of 4
    // @todo add check to constructor to make sure to have the vertexes be a multiple of 4
    let vectors4 = new THREE.Matrix4();
    let originalVertexes = this.vertexes;
    let transformedVertexes = this.transformedVertexes;
    let matrix4D = this.#matrix4D;
    for (let i = 0; i < originalVertexes.length; i += 4 * 4) {
      vectors4.fromArray(originalVertexes, i);
      vectors4.premultiply(matrix4D);
      vectors4.toArray(transformedVertexes, i);
    }
    // After modifying the array, we need to tell threejs that the shapes need to update their positions.
    for (const child of this.children) { child.geometry.attributes.position.needsUpdate = true; }
  }
}


/**
 * Generate a {@link Object4D} that is a hyper-rectangle of dimensions l1 x l2 x l3 x l4
 * @param {number} lx - x dimension
 * @param {number} ly - y dimension
 * @param {number} lz - z dimension
 * @param {number} lt - t dimension
 * @returns {Object4D} - the hyper-rectangle
 */
export function Hyperbox(lx, ly, lz, lt) {
  let shape = new Object4D(hyperboxVertexes(lx, ly, lz, lt), hyperboxEdges(), hypercubeFaces());
  return shape;
}


/**
 * Generate a an array of vertexes of a hypercube of sidelengths lx x ly x lz x lt
 * each vertex is a 4-vector
 * @export
 * @param {number} lx - x dimension
 * @param {number} ly - y dimension
 * @param {number} lz - z dimension
 * @param {number} lt - t dimension
 * @returns {Array<[number,number,number,number]>} - the hyper-rectangle
 */
export function hyperboxVertexes(lx, ly, lz, lt) {
    let vertexes = [];
    for (let i = 0; i < 2 ** 4; i++) {
      let vert = [(i % 2),
      (i % 4 - i % 2) / 2,
      (i % 8 - i % 4) / 4,
      (i % 16 - i % 8) / 8,];
      vert[0] = lx * (vert[0] - 0.5);
      vert[1] = ly * (vert[1] - 0.5);
      vert[2] = lz * (vert[2] - 0.5);
      vert[3] = lt * (vert[3] - 0.5);
      vertexes.push(vert)
    }
    return vertexes
  }

  /**
   * Generate an array of edges for a hyperbox
   * @returns {Array<[number,number]>} - an array of edges that are pairs of vertex indexes
   */
  export function hyperboxEdges() {
    const edges = [];
    
    for (let i = 0; i < 2 ** 4; i++) {
      let vert = [(i % 2),
      (i % 4 - i % 2) / 2,
      (i % 8 - i % 4) / 4,
      (i % 16 - i % 8) / 8,
      ];

      for (const dir of [0, 1, 2, 3]) {
        if (vert[dir] == 0) {
          edges.push([i, i + 2 ** dir])
        }
      }
    }
    return edges
  }

  /**
   * Generate an array of faces for a hyperbox
   * @returns {Array<[number,number,number]>} - an array of faces that are tuples of 3 of vertex indexe
   */
  export function hypercubeFaces() {
    let faces = [];
    for (let i = 0; i < 2 ** 4; i++) {
      let vert = [(i % 2),
      (i % 4 - i % 2) / 2,
      (i % 8 - i % 4) / 4,
      (i % 16 - i % 8) / 8,
      ];

      for (const dir1 of [0, 1, 2, 3]) {
        for (const dir2 of [0, 1, 2, 3]) {
          if (dir2 > dir1&&vert[dir1] == 0 && vert[dir2] == 0 ) {
            faces.push([i, i + 2 ** dir1, i + 2 ** dir1 + 2 ** dir2]);
            faces.push([i, i + 2 ** dir1 + 2 ** dir2, i + 2 ** dir2])
          }
        }
      }
    }
    return faces
  }

