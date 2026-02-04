/**
 * Three.js Animated Background - Multiple Styles
 * Choose from 5 premium 3D background effects
 */

class ThreeJSBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;
        this.container = null;

        // CHOOSE YOUR STYLE HERE (1-6):
        // 1 = Particle Wave (default - purple/pink particles)
        // 2 = Galaxy Spiral (rotating galaxy effect)
        // 3 = Geometric Grid (animated wireframe grid)
        // 4 = Floating Orbs (glowing spheres)
        // 5 = Neural Network (connected dots)
        // 6 = Lost & Found Pathfinder ⭐ (RECOMMENDED - items finding their way home!)
        this.currentStyle = 6;
    }

    /**
     * Initialize Three.js scene
     */
    init() {
        // Only run in dark mode
        if (document.documentElement.getAttribute('data-theme') !== 'dark') {
            return;
        }

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'threejs-background';
        document.body.prepend(this.container);

        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Create selected style
        this.createStyle(this.currentStyle);

        // Add lights
        this.addLights();

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());

        console.log(`✨ Three.js background initialized - Style ${this.currentStyle}`);
    }

    /**
     * Create the selected background style
     */
    createStyle(style) {
        switch (style) {
            case 1:
                this.createParticleWave();
                break;
            case 2:
                this.createGalaxySpiral();
                break;
            case 3:
                this.createGeometricGrid();
                break;
            case 4:
                this.createFloatingOrbs();
                break;
            case 5:
                this.createNeuralNetwork();
                break;
            case 6:
                this.createLostFoundPathfinder();
                break;
            default:
                this.createParticleWave();
        }
    }

    /**
     * STYLE 1: Particle Wave (Default)
     * Purple/pink particles in wave motion
     */
    createParticleWave() {
        const particleCount = 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;

            const color = new THREE.Color();
            color.setHSL(0.7 + Math.random() * 0.1, 0.8, 0.5 + Math.random() * 0.3);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    /**
     * STYLE 2: Galaxy Spiral
     * Rotating spiral galaxy effect
     */
    createGalaxySpiral() {
        const particleCount = 8000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = Math.random() * 50;
            const spinAngle = radius * 0.3;
            const branchAngle = (i % 3) * (Math.PI * 2 / 3);

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;

            const color = new THREE.Color();
            color.setHSL(0.6 + Math.random() * 0.2, 1.0, 0.5 + Math.random() * 0.3);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    /**
     * STYLE 3: Geometric Grid
     * Animated wireframe grid
     */
    createGeometricGrid() {
        const size = 50;
        const divisions = 20;

        // Create grid
        const gridHelper = new THREE.GridHelper(size, divisions, 0x8b5cf6, 0x6366f1);
        gridHelper.rotation.x = Math.PI / 4;
        this.scene.add(gridHelper);

        // Create second grid
        const gridHelper2 = new THREE.GridHelper(size, divisions, 0xd946ef, 0x8b5cf6);
        gridHelper2.rotation.z = Math.PI / 4;
        this.scene.add(gridHelper2);

        this.particles = { grid1: gridHelper, grid2: gridHelper2 };
    }

    /**
     * STYLE 4: Floating Orbs
     * Large glowing spheres
     */
    createFloatingOrbs() {
        this.particles = new THREE.Group();

        const orbCount = 15;
        for (let i = 0; i < orbCount; i++) {
            const geometry = new THREE.SphereGeometry(Math.random() * 2 + 1, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(0.7 + Math.random() * 0.1, 0.8, 0.6),
                transparent: true,
                opacity: 0.3,
                emissive: new THREE.Color().setHSL(0.7 + Math.random() * 0.1, 0.8, 0.4),
                shininess: 100
            });

            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60
            );

            this.particles.add(orb);
        }

        this.scene.add(this.particles);
    }

    /**
     * STYLE 5: Neural Network
     * Connected dots with lines
     */
    createNeuralNetwork() {
        this.particles = new THREE.Group();

        const nodeCount = 100;
        const nodes = [];

        // Create nodes
        const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        for (let i = 0; i < nodeCount; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.7, 0.8, 0.6),
                transparent: true,
                opacity: 0.8
            });

            const node = new THREE.Mesh(nodeGeometry, material);
            node.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            );

            nodes.push(node);
            this.particles.add(node);
        }

        // Create connections
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.2
        });

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const distance = nodes[i].position.distanceTo(nodes[j].position);
                if (distance < 20) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        nodes[i].position,
                        nodes[j].position
                    ]);
                    const line = new THREE.Line(geometry, lineMaterial);
                    this.particles.add(line);
                }
            }
        }

        this.scene.add(this.particles);
    }

    /**
     * STYLE 6: Lost & Found Pathfinder ⭐
     * Items traveling along glowing paths to reunite
     * Symbolizes lost items finding their way home!
     */
    createLostFoundPathfinder() {
        this.particles = new THREE.Group();

        // Create "home" points (destinations where items reunite)
        const homeCount = 8;
        const homes = [];

        for (let i = 0; i < homeCount; i++) {
            const angle = (i / homeCount) * Math.PI * 2;
            const radius = 30;
            const home = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius * 0.5,
                z: Math.sin(angle) * radius
            };
            homes.push(home);

            // Create glowing home marker
            const homeGeometry = new THREE.SphereGeometry(1.5, 32, 32);
            const homeMaterial = new THREE.MeshPhongMaterial({
                color: 0x10b981, // Green - found/reunited
                emissive: 0x10b981,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.6
            });
            const homeMesh = new THREE.Mesh(homeGeometry, homeMaterial);
            homeMesh.position.set(home.x, home.y, home.z);
            this.particles.add(homeMesh);
        }

        // Create "lost items" traveling to homes
        const itemCount = 50;
        const items = [];

        for (let i = 0; i < itemCount; i++) {
            // Random starting position (lost)
            const startPos = {
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 80,
                z: (Math.random() - 0.5) * 80
            };

            // Assign a home (destination)
            const targetHome = homes[Math.floor(Math.random() * homeCount)];

            // Create item particle
            const itemGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const itemMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.7 + Math.random() * 0.1, 0.9, 0.6),
                transparent: true,
                opacity: 0.8
            });

            const item = new THREE.Mesh(itemGeometry, itemMaterial);
            item.position.set(startPos.x, startPos.y, startPos.z);

            // Store item data
            item.userData = {
                startPos: startPos,
                targetHome: targetHome,
                progress: Math.random(), // Random starting progress
                speed: 0.002 + Math.random() * 0.003
            };

            items.push(item);
            this.particles.add(item);

            // Create glowing trail/path
            const pathPoints = [];
            for (let j = 0; j <= 20; j++) {
                const t = j / 20;
                pathPoints.push(new THREE.Vector3(
                    startPos.x + (targetHome.x - startPos.x) * t,
                    startPos.y + (targetHome.y - startPos.y) * t + Math.sin(t * Math.PI) * 5,
                    startPos.z + (targetHome.z - startPos.z) * t
                ));
            }

            const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
            const pathMaterial = new THREE.LineBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.15
            });
            const path = new THREE.Line(pathGeometry, pathMaterial);
            this.particles.add(path);
        }

        // Store items for animation
        this.particles.userData.items = items;
        this.particles.userData.homes = homes;

        this.scene.add(this.particles);
    }

    /**
     * Add ambient lighting
     */
    addLights() {
        const ambientLight = new THREE.AmbientLight(0x8b5cf6, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xd946ef, 1, 100);
        pointLight.position.set(0, 0, 50);
        this.scene.add(pointLight);
    }

    /**
     * Animation loop - different for each style
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.0001;

        switch (this.currentStyle) {
            case 1: // Particle Wave
                this.animateParticleWave(time);
                break;
            case 2: // Galaxy Spiral
                this.animateGalaxySpiral(time);
                break;
            case 3: // Geometric Grid
                this.animateGeometricGrid(time);
                break;
            case 4: // Floating Orbs
                this.animateFloatingOrbs(time);
                break;
            case 5: // Neural Network
                this.animateNeuralNetwork(time);
                break;
            case 6: // Lost & Found Pathfinder
                this.animateLostFoundPathfinder(time);
                break;
        }

        this.renderer.render(this.scene, this.camera);
    }

    animateParticleWave(time) {
        this.particles.rotation.x = time * 0.2;
        this.particles.rotation.y = 0.3;

        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = Math.sin((x + time * 10) * 0.1) * 5 +
                Math.cos((y + time * 10) * 0.1) * 5;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    animateGalaxySpiral(time) {
        this.particles.rotation.y = time * 0.1;
    }

    animateGeometricGrid(time) {
        this.particles.grid1.rotation.y = time * 0.2;
        this.particles.grid2.rotation.x = time * 0.15;
    }

    animateFloatingOrbs(time) {
        this.particles.children.forEach((orb, i) => {
            orb.position.y += Math.sin(time * 2 + i) * 0.02;
            orb.rotation.x += 0.01;
            orb.rotation.y += 0.01;
        });
    }

    animateNeuralNetwork(time) {
        this.particles.rotation.y = time * 0.05;
        this.particles.rotation.x = Math.sin(time) * 0.1;
    }

    animateLostFoundPathfinder(time) {
        // Slow rotation of entire scene
        this.particles.rotation.y = time * 0.03;

        // Animate items traveling along paths
        const items = this.particles.userData.items;
        if (items) {
            items.forEach((item) => {
                // Update progress
                item.userData.progress += item.userData.speed;

                // Loop when reaching destination
                if (item.userData.progress >= 1) {
                    item.userData.progress = 0;
                }

                const t = item.userData.progress;
                const start = item.userData.startPos;
                const target = item.userData.targetHome;

                // Calculate position along curved path
                item.position.x = start.x + (target.x - start.x) * t;
                item.position.y = start.y + (target.y - start.y) * t + Math.sin(t * Math.PI) * 5;
                item.position.z = start.z + (target.z - start.z) * t;

                // Pulse effect as it gets closer to home
                const scale = 1 + Math.sin(t * Math.PI) * 0.3;
                item.scale.set(scale, scale, scale);
            });
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Destroy the background
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.container) {
            this.container.remove();
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        console.log('🗑️ Three.js background destroyed');
    }

    /**
     * Toggle based on theme
     */
    toggleForTheme(theme) {
        if (theme === 'dark') {
            this.init();
        } else {
            this.destroy();
        }
    }

    /**
     * Change style on the fly
     */
    changeStyle(styleNumber) {
        this.destroy();
        this.currentStyle = styleNumber;
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            this.init();
        }
    }
}

// Initialize background manager
const threejsBackground = new ThreeJSBackground();

// Make globally accessible
window.threejsBackground = threejsBackground;

console.log('✓ Three.js Background module loaded - 6 styles available');
console.log('💡 To change style: threejsBackground.changeStyle(1-6)');
console.log('⭐ RECOMMENDED: Style 6 (Lost & Found Pathfinder) - Perfect for this portal!');
