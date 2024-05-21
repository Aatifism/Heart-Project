//Display


function updateHeartRate(heartRate, systolic, diastolic, oxygenLevel) {

  modelContainer.style.transform = `rotateZ(${heartRate}deg)`; 
  
  const heartElement = document.querySelector('.heart');
  const animationDuration = 60 / heartRate; // Calculate the animation duration based on heart rate

  heartElement.style.animationDuration = `${animationDuration}s`;

  const heartRateDisplay = document.getElementById('heartRateDisplay');
  heartRateDisplay.textContent = `Heart Rate: ${heartRate}`;

  const systolicDisplay = document.getElementById('systolicDisplay');
  systolicDisplay.textContent = `Systolic: ${systolic}`;

  const diastolicDisplay = document.getElementById('diastolicDisplay');
  diastolicDisplay.textContent = `Diastolic: ${diastolic}`;

  const oxygenLevelDisplay = document.getElementById('oxygenLevelDisplay');
  oxygenLevelDisplay.textContent = `Oxygen Level: ${oxygenLevel}`;

}





async function fetchHeartRateData() {
  try {
    const response = await fetch('heartRateData.txt');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    const data = await response.text();
    const lines = data.trim().split('\n');

    let heartRate = '';
    let systolic = '';
    let diastolic = '';
    let oxygenLevel = '';

    lines.forEach(line => {
      if (line.startsWith('Heart Rate:')) {
        heartRate = line.split(': ')[1];
      } else if (line.startsWith('Systolic:')) {
        systolic = line.split(': ')[1];
      } else if (line.startsWith('Diastolic:')) {
        diastolic = line.split(': ')[1];
      } else if (line.startsWith('Oxygen Level:')) {
        oxygenLevel = line.split(': ')[1];
      }
    });

    updateHeartRate(heartRate, systolic, diastolic, oxygenLevel);
    createECGSignal(parseFloat(heartRate));
  } catch (error) {
    console.log('Error:', error);
  }
}

// Call the function to start fetching heart rate data initially
fetchHeartRateData();

// Schedule the next fetch at an interval of 1 second
setInterval(fetchHeartRateData, 1000);

function createECGSignal(heartRate) {
  const svg = document.querySelector('.ecg-signal');
  const bpmDisplay = document.getElementById('heartRateDisplay');
  const bpm = heartRate * 60; // Calculate the bpm
  bpmDisplay.textContent = `Heart Rate: ${heartRate}`;

  // Clear previous ECG signal if exists
  svg.innerHTML = '';

  const svgWidth = svg.clientWidth;
  const svgHeight = svg.clientHeight;
  const padding = 10; // Padding for the axes

  // Generate ECG waveform points
  const amplitude = (svgHeight - 2 * padding) * 0.4;
  const period = 60 / heartRate;
  const numCycles = 5;
  const numPoints = Math.floor(svgWidth / numCycles);

  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const x = (i / numPoints) * (svgWidth - 2 * padding) + padding;
    const t = (i / numPoints) * numCycles;
    const y = svgHeight / 2 + Math.sin(2 * Math.PI * t / period) * amplitude;

    points.push(x, y);
  }

  // Create SVG path element for the ECG signal
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${points[0]},${points[1]} L ${points.join(' ')}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#000');
  path.setAttribute('stroke-width', '1');

  // Create x-axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', padding);
  xAxis.setAttribute('y1', svgHeight / 2);
  xAxis.setAttribute('x2', svgWidth - padding);
  xAxis.setAttribute('y2', svgHeight / 2);
  // xAxis.classList.add('axis-line');

  // Create y-axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', svgWidth / 2);
  yAxis.setAttribute('y1', padding);
  yAxis.setAttribute('x2', svgWidth / 2);
  yAxis.setAttribute('y2', svgHeight - padding);
  // yAxis.classList.add('axis-line');

  // Create x-axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', svgWidth - padding);
  xLabel.setAttribute('y', svgHeight / 2 + 20);
  xLabel.setAttribute('dy', '2.5em');
  xLabel.setAttribute('text-anchor', 'end');
  xLabel.textContent = 'Time';

  // Create y-axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', svgWidth / 2 - 20);
  yLabel.setAttribute('y', padding);
  yLabel.setAttribute('dy', '0.35em');
  yLabel.setAttribute('text-anchor', 'end');
  yLabel.textContent = 'Amplitude';

  // Append elements to the SVG
  svg.appendChild(path);
  svg.appendChild(xAxis);
  svg.appendChild(yAxis);
  svg.appendChild(xLabel);
  svg.appendChild(yLabel);
}


function downloadECG() {
  const svgContainer = document.querySelector('.ecg-signal');

  // Create a canvas element
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set the canvas dimensions to match the SVG container
  const svgWidth = svgContainer.clientWidth;
  const svgHeight = svgContainer.clientHeight;
  canvas.width = svgWidth;
  canvas.height = svgHeight;

  // Draw the ECG signal on the canvas
  context.fillStyle = '#ffffff'; // Set the background color
  context.fillRect(0, 0, svgWidth, svgHeight);

  // Generate ECG waveform points
  const padding = 10; // Padding for the axes
  const amplitude = (svgHeight - 2 * padding) * 0.4;
  const heartRate = parseFloat(document.getElementById('heartRateDisplay').textContent.split(':')[1].trim());
  const period = 60 / heartRate;
  const numCycles = 5;
  const numPoints = Math.floor(svgWidth / numCycles);

  context.beginPath();
  for (let i = 0; i < numPoints; i++) {
    const x = (i / numPoints) * (svgWidth - 2 * padding) + padding;
    const t = (i / numPoints) * numCycles;
    const y = svgHeight / 2 + Math.sin(2 * Math.PI * t / period) * amplitude;

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.strokeStyle = '#000000'; // Set the ECG signal color
  context.lineWidth = 1;
  context.stroke();

   // Convert the canvas to a Blob object
   canvas.toBlob(async (blob) => {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: 'ecg_image.png', types: [{accept: {'image/png': ['.png']}}] }); // Open file picker dialog to choose the save location
      const writable = await handle.createWritable();
      await writable.write(blob); // Write the blob to the chosen file location
      await writable.close();
      console.log('Image saved successfully.');
    } catch (error) {
      console.error('Error saving image:', error);
    }
  }, 'image/png');
}

const saveLocation = 'C:/Users/aatif/Pictures/computer_vision/basedata/ testing';
downloadECG(saveLocation);

// Attach click event listener to the download button
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', downloadECG);


const outputElement = document.getElementById('output');

fetch('/textfile')
  .then(response => response.text())
  .then(data => {
    outputElement.textContent = data;
  })
  .catch(error => {
    console.error('Error:', error);
  });



  // Get the button element by its id
const runModelButton = document.getElementById('runModelButton');

// Add a click event listener to the button
runModelButton.addEventListener('click', () => {
  // Send an HTTP request to trigger the execution of the Python script
  fetch('/run-model')
    .then(response => {
      // Handle the response from the server, if needed
    })
    .catch(error => {
      // Handle any errors that occur during the request
    });
});
