import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";

const fragment = require("./shader/fragment.glsl");
const vertex = require("./shader/vertex.glsl");

import mask from './mask.jpg'
import t1 from './piramid.png'
import t2 from './lol.png'
import t3 from './metal2.png'

export class Sketch {
    constructor() {

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
        this.camera.position.z = 1000;

        this.scene = new THREE.Scene();

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.points = new THREE.Vector2();

        this.textures = [
            new THREE.TextureLoader().load(t1),
            new THREE.TextureLoader().load(t2),
            new THREE.TextureLoader().load(t3),
        ]
        this.mask = new THREE.TextureLoader().load(mask);

        this.time = 0;
        this.move = 0;
        this.prevFr = 0
        this.currentFr = 1;
        this.nextFr = 2;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.addMash();

        this.mouseEffects(); 
        this.render();
    }

    mouseEffects() {

        this.test = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000),
            new THREE.MeshBasicMaterial()
        )

        const clickEventStart = (e) => {
            gsap.to(this.material.uniforms.mousePressed, {
                duration: 0.5,
                value: 1,
                // ease: 'elastic.out(1, 0.7)'
            })
        }
        const clickEventEnd = (e) => {
            gsap.to(this.material.uniforms.mousePressed, {
                duration: 0.5,
                value: 0,
                // ease: 'elastic.out(1, 0.6)'
            })
        }

        window.addEventListener('mousedown', clickEventStart)
        window.addEventListener('mouseup', clickEventEnd)

        let lastTouch = 0;

        window.addEventListener('touchstart', (e) => {
            console.log(e.touches[0]);
            lastTouch = e.touches[0].clientY;
        })
        window.addEventListener('touchend', (e) => {
            console.log(e.touches[0])
        })
        window.addEventListener('touchmove', async (e) => {
            console.log(e.touches[0].clientY)
            let currentTouch = e.touches[0].clientY || 0;
            if (lastTouch - currentTouch > 0) {
                gsap.to(this, {
                    duration: 3,
                    move: this.move + 1 > this.textures.length - 1 
                    ? 0 : Math.floor(this.move) + 1,
                })
            } else if (lastTouch - currentTouch < 0) {
                gsap.to(this, {
                    duration: 3,
                    move: this.move - 1 < 0 
                    ? this.textures.length - 1 : Math.floor(this.move) - 1,
                })
            }
            await gsap.to(this.material.uniforms.transition, {
                duration: 1.5,
                value: 0,
            })
            await gsap.to(this.material.uniforms.transition, {
                duration: 1.5,
                value: 1,
            })
            lastTouch = e.touches[0].clientY;
        })

        window.addEventListener('wheel', async (e) => {
            // this.move += e.deltaY*.001*Math.random();

            if (e.deltaY > 0) {
                
                gsap.to(this, {
                    duration: 3,
                    move: this.move + 1 > this.textures.length - 1 
                    ? 0 : Math.floor(this.move) + 1,
                })
                // gsap.to(this, {
                //     duration: 3,
                //     move: 1,
                // })
                // this.currentFr = this.currentFr === this.textures.length 
                //     ? 0 : this.currentFr + 1;
            } else {
                gsap.to(this, {
                    duration: 3,
                    move: this.move - 1 < 0 
                    ? this.textures.length - 1 : Math.floor(this.move) - 1,
                })
                // gsap.to(this, {
                //     duration: 3,
                //     move: 0,
                // })
                // this.currentFr = this.currentFr === 0 
                //     ? this.textures.length : this.currentFr - 1;
            }

            await gsap.to(this.material.uniforms.transition, {
                duration: 1.5,
                value: 0,
            })
            await gsap.to(this.material.uniforms.transition, {
                duration: 1.5,
                value: 1,
            })
        })

        window.addEventListener( 'mousemove', (event) => {
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            
            this.raycaster.setFromCamera( this.mouse, this.camera );

            // calculate objects intersecting the picking ray
            let intersects = this.raycaster.intersectObjects( [this.test] ); 
            this.points.x = intersects[0]?.point.x || 0;
            this.points.y = intersects[0]?.point.y || 0;

        }, false )
    }

    addMash() {
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: {
                progress: {type: 'f', value: 0},
                mask: {type: "t", value: this.mask},
                t1: {type: "t", value: this.textures[0]},
                t2: {type: "t", value: this.textures[1]},
                mouse: {type: "f", value: null},
                mousePressed: {type: "f", value: 0},
                move: {type: "f", value: 0},
                time: {type: "f", value: 0},
                transition: {type: "f", value: 1},
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            // depthWrite: false
        })
        this.geometry = new THREE.BufferGeometry()
        let number = 512*512;

        this.position = new THREE.BufferAttribute(new Float32Array(number*3), 3);
        this.coordinates = new THREE.BufferAttribute(new Float32Array(number*3), 3);
        this.speed = new THREE.BufferAttribute(new Float32Array(number*3), 3);
        this.offset = new THREE.BufferAttribute(new Float32Array(number*3), 3);
        this.direction = new THREE.BufferAttribute(new Float32Array(number*3), 3);
        this.press = new THREE.BufferAttribute(new Float32Array(number*3), 3);
        
        function rand(a,b){
            return a + (b-a)*Math.random();
        }
        let index = 0;
        for (let i = 0; i < 512; i++) {
            let posX = i - 226;
            for (let j = 0; j < 512; j++) {
                this.position.setXYZ(index, posX*2,(j-256)*2,0);
                this.coordinates.setXYZ(index,i,j,0);

                this.offset.setX(index, rand(-1000, 1000));
                this.speed.setX(index, rand(0.4, 1));
                this.direction.setX(index, Math.random() > 0.5 ? -1 : 1);
                this.press.setX(index, rand(0.4, 1));
                index++
            }
        }

        this.geometry.setAttribute("position", this.position);
        this.geometry.setAttribute("aCoordinates", this.coordinates);
        this.geometry.setAttribute("aSpeed", this.speed);
        this.geometry.setAttribute("aOffset", this.offset);
        this.geometry.setAttribute("aDirection", this.direction);
        this.geometry.setAttribute("aPress", this.press);

        this.mesh = new THREE.Points( this.geometry, this.material );
        this.scene.add( this.mesh );
    }

    render() {
        this.time++;
        let next = Math.floor(this.move);
        let prev = (Math.floor(this.move) + 1);

        
        this.material.uniforms.t1.value = this.textures[next];
        this.material.uniforms.t2.value = this.textures[prev];

        this.material.uniforms.time.value = this.time;
        this.material.uniforms.move.value = this.move;
        this.material.uniforms.mouse.value = this.points;
        this.renderer.render( this.scene, this.camera );
        window.requestAnimationFrame(this.render.bind(this), this.time)
    }

    start() {
        document.getElementById('container').appendChild( this.renderer.domElement );
    }
}