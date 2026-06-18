import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    mount.appendChild(renderer.domElement);

    // Lighting — single indigo-tinted point light
    const light = new THREE.PointLight(0x7080FF, 3.5, 20);
    light.position.set(-4, 4, 4);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0x080820, 0.6);
    scene.add(ambient);

    // Node positions (hand-crafted — NOT random — for a balanced cluster)
    const nodeConfigs = [
      { pos: [0, 0.3, 0],   r: 0.30, type: 'large' },
      { pos: [1.2, 0.8, -0.3], r: 0.22, type: 'large' },
      { pos: [-0.9, 0.5, 0.4], r: 0.20, type: 'large' },
      { pos: [0.5, -0.8, 0.6],  r: 0.17, type: 'medium' },
      { pos: [-0.4, -0.6, -0.5], r: 0.15, type: 'medium' },
      { pos: [1.6, -0.3, 0.2],  r: 0.14, type: 'medium' },
      { pos: [-1.4, -0.2, 0.2], r: 0.13, type: 'medium' },
      { pos: [0.8, 1.5, 0.3],   r: 0.12, type: 'medium' },
      { pos: [-0.7, 1.2, -0.4], r: 0.11, type: 'medium' },
      { pos: [1.9, 0.6, -0.6],  r: 0.09, type: 'small' },
      { pos: [-1.8, 0.9, 0.1],  r: 0.09, type: 'small' },
      { pos: [0.2, -1.4, -0.3], r: 0.08, type: 'small' },
      { pos: [1.1, -1.2, -0.4], r: 0.08, type: 'small' },
      { pos: [-1.1, -1.0, 0.5], r: 0.07, type: 'small' },
      { pos: [2.2, -0.8, 0.3],  r: 0.07, type: 'small' },
    ] as const;

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0A0A22,
      roughness: 0.4,
      metalness: 0.7,
    });

    const nodes: THREE.Mesh[] = [];
    const group = new THREE.Group();

    for (const cfg of nodeConfigs) {
      const geo = new THREE.SphereGeometry(cfg.r, 32, 32);
      const mesh = new THREE.Mesh(geo, nodeMaterial.clone());
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      group.add(mesh);
      nodes.push(mesh);
    }

    // Connections — thin lines between nearby nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x5B6CF7,
      transparent: true,
      opacity: 0.18,
    });

    const connections = [
      [0,1],[0,2],[0,3],[0,4],[1,5],[1,7],[2,6],[2,8],[3,4],[3,5],
      [4,6],[5,9],[6,10],[7,8],[7,11],[8,12],[9,13],[10,14],
    ];

    for (const [a, b] of connections) {
      const points = [
        nodes[a].position.clone(),
        nodes[b].position.clone(),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMaterial.clone());
      group.add(line);
    }

    scene.add(group);

    // Animation loop
    let frameId: number;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.0003;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.3) * 0.08; // Very subtle tilt
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden">
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full opacity-90"
        style={{
          filter: 'url(#noise-filter)',
        }}
        aria-hidden="true"
      />
      <svg width="0" height="0" className="hidden">
        <filter id="noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.08 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="SourceGraphic" in2="coloredNoise" result="composite" />
          <feBlend mode="normal" in="SourceGraphic" in2="composite" />
        </filter>
      </svg>
    </div>
  );
}
