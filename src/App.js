import React from 'react';
import './App.css';
import KalmanFilter from 'kalmanjs';
import { lowPassFilter } from 'low-pass-filter';

var vibrateInterval;
const SEGMENT_SIZE = 80;
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
    z: 0,
    ding: 'Ding!!',
    dingBoolean: false,
    isCalibrated: false,
  };

  precise = (x) => {
    return Number.parseFloat(x).toPrecision(2);
  }

  dec2bin = (dec) => {
    return (dec >>> 0).toString(2);
  }

  calibrate = (x, y, z) => {
    // const inital = z;
    // console.log("this should be called once!! ",inital);
    // setTimeout(() => {
    //   const final = z;
    // }, 6000);
    // console.log("end ",final,inital);
    // console.log("final - inital ", final - inital);
  }

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
    console.log("in loop ", duration);
    vibrateInterval = setInterval(() => {
      navigator.vibrate(duration);
    }, interval);
  }

  encode = (binary) => {
    let overFlow = [];
    let temp = [];
    let final = [];
    const timer = 2000;
    overFlow.push(binary);

    for (let i = 0; i < overFlow.length; i++) {
      temp.push(overFlow[i].split(''));
    }
    final.push(temp);
    console.log("pp ",final);
    // for (let i = 0; i < binary.length; i++) {
    //   overFlow.push(binary[i]);
    //   if (i % 2 === 0) {
    //     final.push(binary[i] * 10, timer);
    //   } else {
    //     final.push(binary[i] * 10, timer);
    //   }
    // console.log(final);
    // navigator.vibrate(final);
    // }
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
            if (current === segments.length + 1) {
              this.setState({ current: 0 });
              console.log("stop", this.intervalId);
              clearInterval(this.intervalId);
            } else {
              // this.stopVibrate();
              this.setState({ current });
              console.log("sending.... ", this.state.current);
              console.log("seg ", this.state.segments[current - 1]);
              let buffer = new Buffer(this.state.segments[current - 1], 'base64');
              // console.log("buffer  ", buffer);
              this.setState({ buffer: buffer });
              for (let i = 0; i < buffer.length; i++) {
                // console.log("dec to bin ", this.dec2bin(buffer[i]));
                let num = this.dec2bin(buffer[i]);
                this.encode(num);
              }
            }
            console.log(this.state.current, 'of', this.state.segments.length);
          }, 6000);
          console.log("intertval ", this.intervalId);
        }
        reader.readAsDataURL(selectedFile);
      }
    }
  }
  handleAccel = () => {
    if (window.DeviceOrientationEvent) {
      // We can listen for change in the device's orientation... works over https only :/
      // this.intervalId = this.setInterval(() => {

      window.addEventListener('devicemotion', (event) => {
        let x1 = this.precise(event.acceleration.x);
        let y1 = this.precise(event.acceleration.y);
        let z1 = this.precise(event.acceleration.z);

        // console.log("x ", x1, " y ", y1, " z ", z1);
        this.setState({ z: z1 });
        const kf = new KalmanFilter();
        // console.log();
        if (kf.filter(z1) < -.001) {
          console.log("DING!!");
        }
        // if (kf.filter(z1) < -.001) {
        //   console.log("ding");
        // }
      });
      // }, 6000);
    } else {
      // Not supported
      alert("Sorry, your browser doesn't support Device Orientation");
    }
    // this.intervalId();
  }

  handleReceive = () => {
    // vibrateInterval = setInterval(() => {
    this.handleAccel();
    // }, 6000);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.current}
          <input type="button" value="Send" onClick={this.start} />
          {/* <input type="button" value="Stop" onClick={this.stopVibrate} /> */}
          <input type="button" value="Receive" onClick={this.handleReceive} />
          {(this.state.dingBoolean === true) ? this.state.ding : ''}
          <div>
            <div>
              x {this.precise(this.state.x)}
            </div>
            <div>
              y {this.precise(this.state.y)}
            </div>
            <div>
              z {this.precise(this.state.z)}
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;