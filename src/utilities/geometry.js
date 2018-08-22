export const THREE = require('three')

// Takes a three.js ring geometry object and return a new geometry 
// representing the highlighted area
export function ringHighlightGeometry(ring, theta) {
    // param ring: the ring geometry object we want to highlight
    // param theta: the amount (in degrees) of the ring we wish to highlight

    // Create a new geometry object 
    const geometry = new THREE.Geometry()

     // Return an empty geometry object in the case of 0 theta
    if (theta === 0) {
        return geometry
    }

    // If we know how many segments make up the ring, we can calculate 
    // how many degrees each segment represents.
    const n = ring.parameters.thetaSegments
    const segmentDelta = 2*Math.PI/n
    const segmentCount = Math.ceil(Math.abs(theta)/segmentDelta)

    // The segment count represents the number of verticies we 
    // need to clone from the ring geometry.
    geometry.vertices.push(ring.vertices[0].clone())
    if (theta < 0) {
        let i = n - 1
        while (i >= (n - segmentCount)) {
            geometry.vertices.push(ring.vertices[i].clone())
            i -= 1
        }
    } else {
        let i = 1
        while (i <= segmentCount) {
            geometry.vertices.push(ring.vertices[i].clone())
            i += 1
        }
    }

    geometry.vertices.push(ring.vertices[n].clone())
    if (theta < 0) {
        let i = 2*n - 1
        while (i >= (2*n - segmentCount)) {
            geometry.vertices.push(ring.vertices[i].clone())
            i -= 1
        }
    } else {
        let i = n + 1
        while (i <= (n + segmentCount)) {
            geometry.vertices.push(ring.vertices[i].clone())
            i += 1
        }
    }

    // Need to calculate the faces for the geometry
    // There should be at least 2 per segment
    let i = 0
    let m = geometry.vertices.length/2
    while (i < (m-1)) {
        geometry.faces.push(new THREE.Face3(i, i+1, m+i))
        geometry.faces.push(new THREE.Face3(i+1, m+i+1, m+i))
        i += 1
    }

    return geometry
}