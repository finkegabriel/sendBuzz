import React from 'react';
import './App.css';

var vibrateInterval;
const SEGMENT_SIZE = 80;

class App extends React.Component {
  state = {
    mode: '',
    qrSize: window.innerHeight < window.innerWidth ? window.innerHeight * 0.6 : window.innerWidth * 0.9,
    receiveSegments: {},
    totalReceived: 0,
    expecting: '?',
    receive: 0,
    buffer: []
  };

  // Starts vibration at passed in level



  // Stops vibration
  stopVibrate = () => {
    // Clear interval and stop persistent vibrating
    if (vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
  }

  // Start persistent vibration at given duration and interval
  // Assumes a number value is given
  startPersistentVibrate = (duration, interval) => {
    console.log("BUZZZzzZZZzzzzzzzzzzz",duration, interval);
    vibrateInterval = setInterval(function () {
      navigator.vibrate(duration);
    }, interval);
  }

  start = () => {
    const inputDialog = document.createElement('input');
    inputDialog.id = 'fileUpload';
    inputDialog.type = "file";
    inputDialog.click();
    inputDialog.onchange = (data) => {
      const selectedFile = data.target.files[0];

      console.log('fileInfo', selectedFile);

      if (selectedFile) {
        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (theFile) => {
          const result = theFile.target.result;
          // console.log('file read finished', theFile, result, result.length);
          const segments = [];
          const numSegments = Math.floor(result.length / SEGMENT_SIZE) + (result.length % SEGMENT_SIZE ? 1 : 0);
          console.log('remainder', result.length % SEGMENT_SIZE, 'div', result.length / SEGMENT_SIZE);
          for (let i = 0; i < numSegments; i++) {
            const start = i * SEGMENT_SIZE;
            const seg = result.substring(start, start + SEGMENT_SIZE);
            if (seg) {
              segments.push(seg);
            }
          }
          const joined = segments.join('');
          console.log('result  : ', result);
          console.log('segments: ', joined);
          console.log('equal', joined === result);

          this.setState({ mode: 'share', segments, current: 0 });
          console.log("segments ", segments);
          this.intervalId = setInterval(() => {
            let current = this.state.current + 1;
            if (current === segments.length) {
              this.setState({ current: 0 });
              console.log("stop", this.state.current);
            } else {
              this.setState({ current });
              console.log("sending.... ", this.state.current);
              console.log("seg ", this.state.segments[current - 1]);
              let buffer = new Buffer(this.state.segments[current - 1], 'base64');
              this.setState({ buffer: buffer });
              console.log("boof ", buffer);
              // setInterval(() => {
                for (let i = 0; i < this.state.buffer.length; i++) {
                  this.startPersistentVibrate(this.state.buffer[i],5);
                }
              // }, 9000);
            }
          }, 9000);
          // console.log(this.state.current, 'of', this.state.segments.length);
        }
        reader.readAsDataURL(selectedFile);
      }
    }
  }

  handleReceive = (event) => {

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.current}
          <input type="button" value="Send" onClick={this.start} />
          <input type="button" value="Stop" onClick={this.stopVibrate} />
          <input type="button" value="Receive" onClick={this.handleReceive} />
          {this.state.receive}
        </header>
      </div>
    );
  }
}



export default App;