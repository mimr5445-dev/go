// engine/threeStage.ts — Low-poly 3D orbit stage using Three.js (replicates three-kit.js)
import * as THREE from 'three';
import { E, mood, clamp } from './core';

export class ThreeOrbitStage {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cubeGroup: THREE.Group;
  maxFigure: THREE.Group;
  jakeFigure: THREE.Group;
  cupMesh: THREE.Mesh;

  constructor(width = 640, height = 360) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#3d3360');
    this.scene.fog = new THREE.Fog(new THREE.Color('#2a1814'), 10, 45);

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0x4a3a50, 0x1a1216, 1.2);
    this.scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffcf8f, 2.8);
    sun.position.set(-8, 9, 6);
    sun.castShadow = true;
    this.scene.add(sun);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x45302a, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Cafe facade wall
    const wallGeo = new THREE.BoxGeometry(30, 7, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x5a3a34, roughness: 0.8 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3.5, -4);
    wall.receiveShadow = true;
    this.scene.add(wall);

    // Glowing warm windows
    for (const x of [-6, -3, 3, 6]) {
      const winGeo = new THREE.PlaneGeometry(2.2, 2.6);
      const winMat = new THREE.MeshBasicMaterial({ color: 0xffe7b0 });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(x, 2.1, -3.78);
      this.scene.add(win);
    }

    // Cafe table
    const tableTopGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 24);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x2a1d22 });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 0.75, 0);
    tableTop.castShadow = true;
    this.scene.add(tableTop);

    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.75, 12);
    const leg = new THREE.Mesh(legGeo, tableMat);
    leg.position.set(0, 0.37, 0);
    this.scene.add(leg);

    // Coffee cup on table
    const cupGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xf2ece4 });
    this.cupMesh = new THREE.Mesh(cupGeo, cupMat);
    this.cupMesh.position.set(0.15, 0.82, 0.05);
    this.cupMesh.castShadow = true;
    this.scene.add(this.cupMesh);

    // 3D Stick figures
    this.maxFigure = this.buildStickFigure(0xd64a33); // Red hoodie
    this.maxFigure.position.set(-0.85, 0, 0);
    this.scene.add(this.maxFigure);

    this.jakeFigure = this.buildStickFigure(0x3a6ea5, 0xf2c21a); // Blue tee + yellow cap
    this.jakeFigure.position.set(0.85, 0, 0);
    this.jakeFigure.rotation.y = Math.PI;
    this.scene.add(this.jakeFigure);

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);
  }

  buildStickFigure(bodyColor: number, hatColor?: number): THREE.Group {
    const group = new THREE.Group();
    const inkMat = new THREE.MeshStandardMaterial({ color: 0x0e0b12, roughness: 0.5 });
    const clothMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 });

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
    const torso = new THREE.Mesh(torsoGeo, clothMat);
    torso.position.set(0, 0.85, 0);
    torso.castShadow = true;
    group.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const head = new THREE.Mesh(headGeo, inkMat);
    head.position.set(0, 1.25, 0);
    head.castShadow = true;
    group.add(head);

    if (hatColor) {
      const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: hatColor });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 1.34, 0.05);
      group.add(cap);
    }

    // Legs
    for (const sx of [-0.08, 0.08]) {
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const legMesh = new THREE.Mesh(legGeo, inkMat);
      legMesh.position.set(sx, 0.3, 0);
      legMesh.castShadow = true;
      group.add(legMesh);
    }

    // Arms
    for (const sx of [-0.18, 0.18]) {
      const armGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8);
      const armMesh = new THREE.Mesh(armGeo, clothMat);
      armMesh.position.set(sx, 0.8, 0.05);
      armMesh.castShadow = true;
      group.add(armMesh);
    }

    return group;
  }

  render(t: number, dur = 3.45) {
    // Camera orbit animation from -0.9 to 0.35 rad
    const k = clamp(t / dur);
    const from = -0.9;
    const to = 0.35;
    const a = from + (to - from) * k;
    const radius = 5.2;
    const height = 2.4 - 0.5 * k;

    this.camera.position.set(Math.sin(a) * radius, height, Math.cos(a) * radius);
    this.camera.lookAt(0, 0.9, 0);

    this.renderer.render(this.scene, this.camera);
  }

  resize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
