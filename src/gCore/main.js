import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";

const fragment = require("./shader/fragment.glsl");
const vertex = require("./shader/vertex.glsl");

import mask from './mask.jpg'
import t1 from './myphoto.jpg'
import t2 from './pole2.jpg'

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
            new THREE.TextureLoader().load(t2)
        ]
        this.mask = new THREE.TextureLoader().load(mask);

        this.time = 0;
        this.move = 0;
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.addMash();

        this.mouseEffects(); 
        this.render();
    }

    mouseEffects() {

        this.test = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000),
            new THREE.MeshBasicMaterial()
        )

        window.addEventListener('mousedown', (e) => {
            gsap.to(this.material.uniforms.mousePressed, {
                duration: 0.5,
                value: 1,
                ease: 'elastic.out(1, 0.7'
            })
        })

        window.addEventListener('mouseup', (e) => {
            gsap.to(this.material.uniforms.mousePressed, {
                duration: 0.5,
                value: 0,
                ease: 'elastic.out(1, 0.3'
            })
        })

        window.addEventListener('wheel', (e) => {
            this.move += e.deltaY*.001*Math.random();
            console.log(this.move)
        })

        window.addEventListener( 'mousemove', (event) => {
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            
            this.raycaster.setFromCamera( this.mouse, this.camera );

            // calculate objects intersecting the picking ray
            let intersects = this.raycaster.intersectObjects( [this.test] ); 
            this.points.x = intersects[0].point.x || 0;
            this.points.y = intersects[0].point.y || 0;

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
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: false
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
        this.time++
        let next = Math.floor(this.move)%2;
        let prev = (Math.floor(this.move) + 1)%2;

        
        this.material.uniforms.t1.value = this.textures[prev];
        this.material.uniforms.t2.value = this.textures[next];

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