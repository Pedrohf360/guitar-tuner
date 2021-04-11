const canvas_width = 400;
const canvas_height = 400;

const model_crepe_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe';

let modifyX;

let pitch;
let mic
let currentFreq;
let diffFrequencyToDiffString = 15;

let moveXsecondPointRight = true;
let moveXsecondPointLeft = false;

let threshold = 1 ;

let guitarStrings = [{
  name: 'Mi (grave)',
  frequency: 82
},
{
  name: 'Lá',
  frequency: 110
},
{
  name: 'Ré',
  frequency: 146
},
{
  name: 'Sol',
  frequency: 196
},
{
  name: 'Si',
  frequency: 247
},
{
  name: 'Mi (agudo)',
  frequency: 330
}
];

let currentString;

const initial_point_x_sec_point = canvas_width / 2;
const initial_point_y_sec_point = canvas_height / 4;

let xSecondPoint = initial_point_x_sec_point;
let ySecondPoint = initial_point_y_sec_point;

function sortGuitarStringsByFreq(order = 'asc') {
  if (order === 'asc') {
    guitarStrings.sort((a, b) => a.frequency - b.frequency);
  } else {
    guitarStrings.sort((a, b) => b.frequency - a.frequency);
  }
}

function setup() {
  createCanvas(400, 400);
  sortGuitarStringsByFreq();
  setTextConfigs();
  displayButton();
}

function draw() {

  background(200);
  arc(canvas_width / 2, canvas_height / 2, 200, 200, -PI, 0, CHORD);

  if (!currentFreq) {

    showTuneText('--');

    // here, should move second point to right, because it's a high frequency
    line(canvas_width / 2, canvas_height / 2, xSecondPoint, ySecondPoint);
    return;
  }

  currentString = getCurrentString(currentFreq);

  if (!currentString) {
    showTuneText('--');
    return;
  }

  showTuneLine()

  showTuneText(currentString.name + ' - ' + currentFreq.toFixed(4));
}

function setTextConfigs() {
  textSize(25);
  textAlign(CENTER, CENTER);
}

function startPitch() {

  const audioContext = new AudioContext();

  pitch = ml5.pitchDetection(
    model_crepe_url,
    audioContext,
    mic.stream,
    getPitch,
  );
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      currentFreq = frequency;
    } else {
      currentFreq = '';
    }
    getPitch();
  })
}

function getCurrentString(frequency) {
  if (!frequency) {
    return;
  }

  return guitarStrings.find((currentGuitarStr, i) => {

    const beforeStr = guitarStrings[i - 1];
    const nextStr = guitarStrings[i + 1];

    let diffToBeforeStr = 0;
    let diffToNextStr = 0;

    let currStringFreq = currentGuitarStr.frequency;

    if (beforeStr) {
      diffToBeforeStr = (currStringFreq - beforeStr.frequency) / 2;
    } else {
      diffToBeforeStr = currStringFreq;
    }

    if (nextStr) {
      diffToNextStr = (nextStr.frequency - currStringFreq) / 2;
    } else {
      diffToNextStr = currStringFreq;
    }

    if ((currStringFreq + diffToNextStr) > frequency &&
      (currStringFreq - diffToBeforeStr) < frequency
    ) {

      if ((currStringFreq + threshold) > frequency && (currStringFreq - threshold) < frequency) {
        isTuned = true;
        moveXsecondPointRight = false;
        moveXsecondPointLeft = false;
      } else if (currStringFreq < frequency) {
        isTuned = false;
        moveXsecondPointRight = true;
        moveXsecondPointLeft = false;
      } else {
        isTuned = false;
        moveXsecondPointLeft = true;
        moveXsecondPointRight = false;
      }

      return currentGuitarStr;
    }
  });
}

function inicMic() {
  mic = new p5.AudioIn();
  mic.start(startPitch);
  button.hide();
}

function showTuneText(displayText) {
  const positionX = canvas_width / 2;
  const positionY = canvas_height / 5;

  text(displayText, positionX, positionY);
}

function showTuneLine() {
  const positionXfirstPoint = canvas_width / 2;
  const positionYfirstPoint = canvas_height / 2;

  if (moveXsecondPointRight) {
    modifyX = 20;
  } else if (moveXsecondPointLeft) {
    modifyX = -20;
  } else {
    stroke('green');
    modifyX = 0;
  }

  line(positionXfirstPoint, positionYfirstPoint, xSecondPoint + modifyX, ySecondPoint);
  stroke('black');
}

function displayButton() {
  const positionXfirstPoint = canvas_width / 2;
  const positionYfirstPoint = canvas_height / 2;

  button = createButton('Começar a Afinar');
  button.style('font-size', '30px');
  button.style('background-color', 'lightgreen');
  button.position(positionXfirstPoint - 118, positionYfirstPoint - 80);
  button.mousePressed(inicMic);
}