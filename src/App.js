import React, { Component } from 'react';
import {rotationState} from './state/rotation'
import Visualization from './components/Visualization'
import Sidebar from './components/Sidebar'
import './App.css'

export default class App extends Component {
  render() {
    return (
      <div className="App bp3-dark">
        <Sidebar rotationState={rotationState} />
        <Visualization rotationState={rotationState} />
      </div>
    );
  }
}
