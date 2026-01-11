import { Component } from '@angular/core';
import { Planet } from '../planet';
import { DisplayOptions } from '../display-options';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'ory-display',
  imports: [],
  templateUrl: './display.html',
  styleUrl: './display.css',
})
export class Display {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private sun!: THREE.Mesh;
  private planetMeshes: Map<string, THREE.Mesh> = new Map();
  private orbitLines: Map<string, THREE.Line> = new Map();
  private labels: Map<string, HTMLDivElement> = new Map();
  private container!: HTMLElement;

  public planets: Record<string, Planet> = {}
  private currentOptions: DisplayOptions = new DisplayOptions();

  ngAfterViewInit() {
    this.container = document.getElementById('canvas-container') as HTMLElement;
    this.initThreeJS();
    this.setupLighting();
    this.createSun();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });

    this.render(new DisplayOptions());
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.removeEventListener('wheel', (event) => this.onWheel(event));
    this.controls.dispose();
    this.renderer.dispose();
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault();
    
    // Adjust zoom based on wheel delta
    const zoomSpeed = 0.001;
    const delta = event.deltaY * zoomSpeed;
    
    // Update zoom (clamp between 0.1 and 5)
    this.currentOptions.zoom = Math.max(0.1, Math.min(5, this.currentOptions.zoom + delta));
    
    // Update camera distance
    const baseDistance = 400;
    this.camera.position.setLength(baseDistance / this.currentOptions.zoom);
  }

  private initThreeJS() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 200, 400);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 2000;
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);

    // Point light from sun
    const pointLight = new THREE.PointLight(0xffffff, 2, 0);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
  }

  private createSun() {
    const geometry = new THREE.SphereGeometry(7, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffaa00
    });
    this.sun = new THREE.Mesh(geometry, material);
    this.scene.add(this.sun);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private updateLabels() {
    this.labels.forEach((label, planetName) => {
      const mesh = this.planetMeshes.get(planetName);
      if (mesh) {
        const planet = this.planets[planetName];
        const vector = new THREE.Vector3();
        mesh.getWorldPosition(vector);
        vector.project(this.camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth + planet.radius + 2;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight - planet.radius - 2;

        label.style.left = `${x}px`;
        label.style.top = `${y - 10}px`;
      }
    });
  }

  public render(options: DisplayOptions) {
    // Store current options
    this.currentOptions = options;
    
    // Update zoom (camera distance)
    const baseDistance = 400;
    this.camera.position.setLength(baseDistance / options.zoom);

    // Update or create planet meshes
    Object.values(this.planets).forEach(planet => {
      // Update or create orbit line
      if (options.showOrbits) {
        if (!this.orbitLines.has(planet.name)) {
          // Create ellipse in the orbital plane
          const curve = new THREE.EllipseCurve(
            0, 0,
            planet.orbit.semiMajorAxis * 50, planet.orbit.semiMinorAxis * 50,
            0, 2 * Math.PI,
            false,
            0
          );
          const points = curve.getPoints(100);
          
          // Convert 2D ellipse points to 3D and apply orbital transformations
          const orbitPoints = points.map(p => {
            // Start with ellipse in XZ plane (ecliptic)
            let vec = new THREE.Vector3(p.x, 0, p.y);
            
            // Apply rotation for longitude of perihelion (argument of periapsis)
            // This rotates the ellipse within its orbital plane around Y axis (ecliptic pole)
            const argPeriapsis = (planet.orbit.longitudeOfPerihelion || 0) - (planet.orbit.longitudeOfAscendingNode || 0);
            vec.applyAxisAngle(new THREE.Vector3(0, 1, 0), argPeriapsis * Math.PI / 180);
            
            // Apply longitude of ascending node first (rotate around the ecliptic pole Y axis)
            const longitudeOfAscendingNode = planet.orbit.longitudeOfAscendingNode || 0;
            const nodeAxis = new THREE.Vector3(Math.cos(longitudeOfAscendingNode * Math.PI / 180), 0, Math.sin(longitudeOfAscendingNode * Math.PI / 180));
            
            // Apply inclination (tilt the orbital plane around the line of nodes)
            const inclination = planet.orbit.inclination || 0;
            vec.applyAxisAngle(nodeAxis, inclination * Math.PI / 180);
            
            return vec;
          });
          
          const geometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
          const material = new THREE.LineBasicMaterial({ color: 0x2f2f2f });
          const line = new THREE.Line(geometry, material);
          this.scene.add(line);
          this.orbitLines.set(planet.name, line);
        }
        this.orbitLines.get(planet.name)!.visible = true;
      } else {
        if (this.orbitLines.has(planet.name)) {
          this.orbitLines.get(planet.name)!.visible = false;
        }
      }

      // Update or create planet mesh
      if (!this.planetMeshes.has(planet.name)) {
        const radius = options.scaledSizes ? Math.max(planet.size / 10000, 1) : 2.5;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(planet.color),
          emissive: new THREE.Color(planet.color),
          emissiveIntensity: 0.4,
          metalness: 0.2,
          roughness: 0.7
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.planetMeshes.set(planet.name, mesh);
      }

      // Update planet position
      const mesh = this.planetMeshes.get(planet.name)!;
      planet.radius = options.scaledSizes ? Math.max(planet.size / 10000, 1) : 2.5;
      (mesh.geometry as THREE.SphereGeometry).dispose();
      mesh.geometry = new THREE.SphereGeometry(planet.radius, 32, 32);

      // Update planet color
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.color.set(planet.color);
      material.emissive.set(planet.color);
      material.emissiveIntensity = 0.4;

      const x = planet.orbit.semiMajorAxis * 50 * Math.cos(planet.longitude * Math.PI / 180);
      const z = -planet.orbit.semiMinorAxis * 50 * Math.sin(planet.longitude * Math.PI / 180);
      
      // Create position vector in the ecliptic plane (XZ)
      let position = new THREE.Vector3(x, 0, z);
      
      // Apply rotation for longitude of perihelion (argument of periapsis) around Y axis (ecliptic pole)
      const argPeriapsis = (planet.orbit.longitudeOfPerihelion || 0) - (planet.orbit.longitudeOfAscendingNode || 0);
      position.applyAxisAngle(new THREE.Vector3(0, 1, 0), argPeriapsis * Math.PI / 180);
      
      // Apply longitude of ascending node to determine the tilt axis
      const longitudeOfAscendingNode = planet.orbit.longitudeOfAscendingNode || 0;
      const nodeAxis = new THREE.Vector3(Math.cos(longitudeOfAscendingNode * Math.PI / 180), 0, Math.sin(longitudeOfAscendingNode * Math.PI / 180));
      
      // Apply inclination (tilt the orbital plane around the line of nodes)
      const inclination = planet.orbit.inclination || 0;
      position.applyAxisAngle(nodeAxis, inclination * Math.PI / 180);
      
      mesh.position.set(position.x, position.y, position.z);

      // Update labels
      if (options.showLabels) {
        if (!this.labels.has(planet.name)) {
          const label = document.createElement('div');
          label.className = 'planet-label';
          label.textContent = planet.name;
          label.style.position = 'absolute';
          label.style.color = '#ffffff';
          label.style.fontSize = '12px';
          label.style.pointerEvents = 'none';

          this.container.appendChild(label);
          this.labels.set(planet.name, label);
        }
        const label = this.labels.get(planet.name)!;
        label.style.display = 'block';
      } else {
        if (this.labels.has(planet.name)) {
          this.labels.get(planet.name)!.style.display = 'none';
        }
      }
    });

    // Remove planets that no longer exist
    this.planetMeshes.forEach((mesh, name) => {
      if (!this.planets[name]) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        this.planetMeshes.delete(name);

        if (this.orbitLines.has(name)) {
          const line = this.orbitLines.get(name)!;
          this.scene.remove(line);
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
          this.orbitLines.delete(name);
        }

        if (this.labels.has(name)) {
          this.labels.get(name)!.remove();
          this.labels.delete(name);
        }
      }
    });
  }
}
