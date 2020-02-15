import React from 'react';
import './App.css';

function App() {
  var vibrateInterval;

  // Starts vibration at passed in level
  function start(){
    startPersistentVibrate(100,10);
  }

  function startVibrate(duration) {
    navigator.vibrate(duration);
  }

  // Stops vibration
  function stopVibrate() {
    // Clear interval and stop persistent vibrating
    if (vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
  }

  // Start persistent vibration at given duration and interval
  // Assumes a number value is given
  function startPersistentVibrate(duration, interval) {
    console.log("BUZZZzzZZZzzzzzzzzzzz");
    vibrateInterval = setInterval(function () {
      startVibrate(duration);
    }, interval);
  }

  return (
    <div className="App">
      <header className="App-header">
        <input type="button" value="Send" onClick={start} />
        <input type="button" value="Receive" />
      </header>
    </div>
  );
}

export default App;
