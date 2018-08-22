// Displays a graphical representation of the quaternion transformation

import React, {Component} from 'react'
import {autorun} from 'mobx'
import {ResizeSensor} from '@blueprintjs/core'
import {ringHighlightGeometry} from '../utilities/geometry'
import shuttle from '../resources/shuttle.obj'
import './Visualization.css'

const DISTANCE = 180
const THREE = require('three')
const OBJLoader = require('three-obj-loader')
OBJLoader(THREE)

const COLORS = [
    0xff0303,   // Red
    0x00ff28,   // Green
    0x0028ff    // Blue
]

export default class Visualization extends Component {

    componentDidMount() {
        this.scene = new THREE.Scene()

        const width = this.element.clientWidth
        const height = this.element.clientHeight
        const d = DISTANCE
        const ar = width/height
        this.camera = new THREE.OrthographicCamera(-d * ar, d * ar, d , -d, 0.1, 1000 )
        this.camera.position.set(d, d, d)
        this.camera.lookAt(this.scene.position)
        
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
        this.renderer.setSize(width, height)
        this.element.appendChild(this.renderer.domElement)
        
        this.light = new THREE.AmbientLight(0xffffff)
        this.scene.add(this.light)

        // Load 3D model
        const objectLoader = new THREE.OBJLoader()
        objectLoader.load(shuttle, (object) => {
            this.loadObject(object)
        })
    }

    componentWillUnmount() {
        this.element.removeChild(this.renderer.domElement)
    }

    /* Create the visualization object */
    loadObject(object) {
        
        // Draw the wireframe
        let wireframes = []
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.polygonOffset = true
                child.material.polygonOffsetFactor = 1
                child.material.polygonOffsetUnits = 1

                let geo = new THREE.WireframeGeometry(child.geometry)
                let mat = new THREE.LineBasicMaterial({ color: 0x333333})
                let wireframe = new THREE.LineSegments(geo, mat)
                wireframes.push(wireframe)
            }
        })
        wireframes.forEach((m) => {object.add(m)})
        
        // Caluculate the bouding box and sphere
        let boundingSphere = new THREE.Sphere()
        let boundingBox = new THREE.Box3().setFromObject(object)
        boundingBox.getBoundingSphere(boundingSphere)
        
        // Generate local axes for the object
        let axes = this.generateObjectAxes(boundingBox)
        axes.forEach((a) => {object.add(a)})

        // Generate protractor rings
        this.rings = this.generateProtractorRings(boundingSphere)
        this.rings.forEach((r) => {this.scene.add(r)})

        // Generate ring highlights
        this.ringHighlights = this.generateProtractorRingHighlights(this.rings)
        this.ringHighlights.forEach((r) => {this.scene.add(r)})
        
        // Add the object and render the scene
        this.object = object
        this.scene.add(object)
        this.renderScene()

        // Track state updates
        autorun(() => {
            const x = this.props.rotationState.xRad
            const y = this.props.rotationState.yRad
            const z = this.props.rotationState.zRad
            this.updateObjectRotation(x, y, z)
            this.updateRingHighlights(x, y, z)
        })
    }

    /* Update the object rotation based on user input */
    updateObjectRotation(x, y, z) {
        this.object.rotation.set(x, y, z)
        this.renderScene()
    }

    /* Update the amount of ring highlight based on the rotations */
    updateRingHighlights(x, y, z) {
        const rot = [x, y, z]
        this.rings.forEach((r, i) => {
            let geo = ringHighlightGeometry(r.children[0].geometry, rot[i])
            this.ringHighlights[i].geometry = geo
            this.renderScene()
        })
    }

    /* Generate Axes For The Object */
    generateObjectAxes(boundingBox) {
        let axes = []
        let x = Math.ceil(boundingBox.max.x)
        let y = Math.ceil(boundingBox.max.y)
        let z = Math.ceil(boundingBox.max.z)
        let size = [
            x + 0.2 * x,
            y + 0.2 * y,
            z + 0.2 * z
        ]
        
        for (let i=0; i < 3; i++) {
            let coords = [0, 0, 0]
            coords[i] = size[i]
            
            let lineGeo = new THREE.Geometry()
            lineGeo.vertices.push(new THREE.Vector3())
            lineGeo.vertices.push(new THREE.Vector3().fromArray(coords))
            let lineMat = new THREE.LineBasicMaterial({color: COLORS[i]})
            let line = new THREE.Line(lineGeo, lineMat)

            let coneGeo = new THREE.ConeGeometry(4, 16, 16)
            let coneMat = new THREE.MeshBasicMaterial({color: COLORS[i]})
            let cone = new THREE.Mesh(coneGeo, coneMat)
            cone.position.fromArray(coords)
            
            // Rotate the cones so that they point in the right direction
            if (i === 0) {
                cone.rotation.z = -Math.PI/2
                cone.position.x += 8
            } else if (i === 2) {
                cone.rotation.x = Math.PI/2
                cone.position.z += 8
            }

            let group = new THREE.Group()
            group.add(line)
            group.add(cone)

            axes.push(group)
        }

        return axes
    }

    generateProtractorRings(boundingSphere) {
        let r = Math.ceil(boundingSphere.radius)
        let innerRadius = r + 0.2 * r
        let outerRadius = innerRadius + 0.1 * innerRadius
        let rings = []

        for (let i = 0; i < 3; i++) {
            
            // Draw the solid part of the ring
            let geo = new THREE.RingGeometry(innerRadius, outerRadius, 64)
            let mat = new THREE.MeshBasicMaterial({
                color: 0xffffff, 
                side: THREE.DoubleSide,
                opacity: 0.1,
                transparent: true
            })
            let ring = new THREE.Mesh(geo, mat)

            // Draw the outlines
            ring.material.polygonOffset = true
            ring.material.polygonOffsetFactor = 1
            ring.material.polygonOffsetUnits = 1

            let edgeGeo = new THREE.EdgesGeometry(ring.geometry)
            let edgeMat = new THREE.LineBasicMaterial({ color: 0x333333})
            let ringEdge = new THREE.LineSegments(edgeGeo, edgeMat)

            // Rotate the rings to match the axes
            if (i === 0) {
                ring.rotation.y = Math.PI/2
                ringEdge.rotation.y = Math.PI/2
            } else if (i === 1) {
                ring.rotation.x = Math.PI/2
                ringEdge.rotation.x = Math.PI/2
            }
            
            let group = new THREE.Group()
            group.add(ring)
            group.add(ringEdge)
            rings.push(group)
        }
    
        return rings
    }

    generateProtractorRingHighlights(rings) {
        let highlights = []
        rings.forEach((r, i) => {
            let geo = ringHighlightGeometry(r.children[0].geometry, 0)
            let mat = new THREE.MeshBasicMaterial({
                color: COLORS[i], 
                side: THREE.DoubleSide
            })
            let highlight = new THREE.Mesh(geo, mat)
            highlight.rotation.fromArray(r.children[0].rotation.toArray())
            highlight.material.polygonOffset = true
            highlight.material.polygonOffsetFactor = 2
            highlight.material.polygonOffsetUnits = 2
            highlights.push(highlight)
        })
        return highlights
    }
    
    /* Resize the WebGL scene when the user resizes the window */
    resizeScene() {
        const width = this.element.clientWidth
        const height = this.element.clientHeight
        const d = DISTANCE
        const ar = width/height
        this.camera.left = -d * ar
        this.camera.right = d * ar
        this.camera.top = d
        this.camera.botton = -d
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
        this.renderScene()
    }

    /* Renders the WebGL scene */
    renderScene() {
        this.renderer.render(this.scene, this.camera)
    }

    render() {
        return (
            <ResizeSensor onResize={this.resizeScene.bind(this)}>
                <div className="Visualization" ref={(element) => {this.element = element}}/>
            </ResizeSensor>
        )
    }
}
