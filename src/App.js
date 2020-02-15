import React from 'react';
import './App.css';

var vibrateInterval;

// Starts vibration at passed in level
function start() {
  startPersistentVibrate(10000, 1);
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
function App() {

  return (
    <div className="App">
      <header className="App-header">
        <input type="button" value="Send" onClick={start} />
        <input type="button" value="Stop" onClick={stopVibrate} />
      </header>
    </div>
  );
}

export default App;
