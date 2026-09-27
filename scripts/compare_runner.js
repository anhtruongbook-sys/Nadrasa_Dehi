const fs = require('fs');

// Create sandbox
const sandbox = {
  window: {},
  console: console
};
sandbox.window = sandbox;

function loadScript(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const fn = new Function('window', 'global', code);
  fn(sandbox, sandbox);
}

loadScript('engines/calendar_engine.js');
loadScript('engines/tuvi_engine.js');

const input = JSON.parse(process.argv[2]);
const chart = sandbox.NetaTuViEngine.generateTuViChart(input);
console.log(JSON.stringify(chart));
