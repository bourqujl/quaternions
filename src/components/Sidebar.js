import React, {Component} from 'react'
import {FormGroup, Slider, Button, InputGroup} from '@blueprintjs/core'
import {autorun} from 'mobx'
import {observer} from 'mobx-react'
import './Sidebar.css'

class Sidebar extends Component {
    
    constructor(props) {
        super(props)
        
        this.state = {
            x: this.props.rotationState.x,
            y: this.props.rotationState.y,
            z: this.props.rotationState.z
        }
    }

    componentDidMount() {
        autorun(() => {
            this.setState({
                x: this.props.rotationState.x,
                y: this.props.rotationState.y,
                z: this.props.rotationState.z
            })
        })
    }

    // We need to keep track of a local state for the buttons
    // so that we can intercept the input value before sending
    // it to the state manager
    updateRotationState(e, fn) {
        let value = parseInt(e.target.value, 10)
        if (isNaN(value)) {
            value = 0
        } else if (value > 180) {
            value = 180
        } else if (value < -180) {
            value = -180
        }
        e.target.value = value
        fn(value)
    }


    handleKeyDown(e, fn) {
        if (e.key === 'Enter') {
            this.updateRotationState(e, fn)
        }
    }

    handleBlur(e, fn) {
        this.updateRotationState(e, fn)
    }

    render() {
        return (
            <div className="Sidebar">
                <h1>Quaternions</h1>
                <FormGroup inline={true} label="x">
                    <Slider min={-180} max={180} showTrackFill={0} 
                        value={this.props.rotationState.x} 
                        onChange={this.props.rotationState.setX} labelStepSize={180}/>
                    <InputGroup value={this.state.x} 
                        onChange={(e) => {this.setState({x: e.target.value})}} 
                        onKeyDown={(e) => {this.handleKeyDown(e, this.props.rotationState.setX)}} 
                        onBlur={(e) => {this.handleBlur(e, this.props.rotationState.setX)}} />
                </FormGroup>
                <FormGroup inline={true} label="y">
                    <Slider min={-180} max={180} showTrackFill={0} 
                        value={this.props.rotationState.y} 
                        onChange={this.props.rotationState.setY} labelStepSize={180}/>
                    <InputGroup value={this.state.y} 
                        onChange={(e) => {this.setState({y: e.target.value})}} 
                        onKeyDown={(e) => {this.handleKeyDown(e, this.props.rotationState.setY)}} 
                        onBlur={(e) => {this.handleBlur(e, this.props.rotationState.setY)}} />
                </FormGroup>
                <FormGroup inline={true} label="z">
                    <Slider min={-180} max={180} showTrackFill={0} 
                        value={this.props.rotationState.z} 
                        onChange={this.props.rotationState.setZ} labelStepSize={180}/>
                    <InputGroup value={this.state.z} 
                        onChange={(e) => {this.setState({z: e.target.value})}} 
                        onKeyDown={(e) => {this.handleKeyDown(e, this.props.rotationState.setZ)}} 
                        onBlur={(e) => {this.handleBlur(e, this.props.rotationState.setZ)}} />
                </FormGroup>
                <div className="resetButton">
                    <Button onClick={this.props.rotationState.reset}>Reset</Button>
                </div>
            </div>
        )
    }
}

export default observer(Sidebar)
