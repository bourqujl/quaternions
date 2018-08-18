import {observable, action} from 'mobx';

export let rotationState = observable({
    x: 0,
    y: 0,
    z: 0,

    get xRad() {
        return this.x * (Math.PI/180)
    },

    get yRad() {
        return this.y * (Math.PI/180)
    },

    get zRad() {
        return this.z * (Math.PI/180)
    },

    setX(x) {
        this.x = x
    },

    setY(y) {
        this.y = y
    },

    setZ(z) {
        this.z = z
    },

    reset() {
        this.x = 0
        this.y = 0
        this.z = 0
    }
}, {
    setX: action.bound,
    setY: action.bound,
    setZ: action.bound,
    reset: action.bound
})