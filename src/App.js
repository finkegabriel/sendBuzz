import React from 'react';
import './App.css';

var vibrateInterval;
const SEGMENT_SIZE = 80;
const dur = 2;
const AMP = 100000;

class App extends React.Component {
  state = {
    mode: '',
    receiveSegments: {},
    totalReceived: 0,
    expecting: '?',
    receive: 0,
    buffer: [],
    decodeBuffer: [],
    testData: "00001000",
    testDataOff: "00000000",
    binarayBuffer: [],
    wait: 6000,
    x: 0,
    y: 0,
    z: 0
  };



  decode = (duration, interval) => {
    console.log("duration: ", duration, " interval: ", interval);
    setInterval(function () {
      // let decodeBuffer = Buffer();
      this.state.decodeBuffer.push(interval); //DIVIDE the data by AMP in post processing
    }, duration); //either duration or interval here...
  }


  // Stops vibration
  stopVibrate = () => {
    // Clear interval and stop persistent vibrating
    if (vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
  }

  // Start persistent vibration at given duration and interval
  // Assumes a number value is given
  startPersistentVibrate = (duration, interval) => {
    // console.log("BUZZZzzZZZzzzzzzzzzzz", duration, interval);
    console.log("in loop ", duration);
    vibrateInterval = setInterval(() => {
      navigator.vibrate(duration);
    }, interval);
  }

  encode = (binary) => {
    var str = binary;
    var res = str.split("", 8);
    let bip = res;

    for (let i = 0; i < bip.length; i++) {
      console.log(bip[i]);
      if (bip[i].toString() === "0") {
        console.log("dont send");
        this.stopVibrate();
      } else {
        console.log("data ", bip[i]);
        this.startPersistentVibrate(dur * AMP * 200, 500);
      }
    }
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
              // this.stopVibrate();
            } else {
              this.setState({ current });
              console.log("sending.... ", this.state.current);
              console.log("seg ", this.state.segments[current - 1]);
              let buffer = new Buffer(this.state.segments[current - 1], 'base64');
              this.setState({ buffer: buffer });
              console.log("boof ", buffer.reduce((a, b) => a + b, 0));
              let inti = buffer.reduce((a, b) => a + b, 0) * 100;
              this.setState({ wait: inti });
              for (let i = 0; i < this.state.buffer.length; i++) {
                console.log("in loop first", this.state.buffer[i]);
                var n = this.state.buffer[i].toString(2);
                n = "00000000".substr(n.length) + n;
                // console.log("bin ", n);
                this.encode(n);
              }
            }
            console.log(this.state.current, 'of', this.state.segments.length);
            console.log("wait for this long ", this.state.wait);
          }, this.state.wait);
          console.log("intertval ", this.intervalId);
        }
        reader.readAsDataURL(selectedFile);
      }
    }
  }


  handleReceive = () => {
    if (window.DeviceOrientationEvent) {
      // We can listen for change in the device's orientation... works over https only :/
      window.addEventListener('devicemotion', (event) => {
        let x1 = event.acceleration.x;
        let y1 = event.acceleration.y;
        let z1 = event.acceleration.z;

        let x = event.accelerationIncludingGravity.x;
        let y = event.accelerationIncludingGravity.y;
        let z = event.accelerationIncludingGravity.z;
        this.setInterval(() => {
          this.console.log("x ", x1, " y ", y1, " z ", z1);
          this.setState({ x: x, y: y, z: z });
        }, 500)
      });
    } else {
      // Not supported
      alert("Sorry, your browser doesn't support Device Orientation");
    }

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.current}
          <input type="button" value="Send" onClick={this.start} />
          {/* <input type="button" value="Stop" onClick={this.stopVibrate} /> */}
          <input type="button" value="Receive" onClick={this.handleReceive} />
          <div>
            {this.state.x, this.state.y, this.state.z}
          </div>
        </header>
      </div>
    );
  }
}

export default App;