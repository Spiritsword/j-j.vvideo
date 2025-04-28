'use strict';

class Sprite {
  constructor(image, frame) {
    this.image = image;
    this.frame = frame;
  }
}

//DECLARATIONS

//The location of the blank ("empty block") is initally in the centre of the 3x3 space - code = 4. (The location codes are counted from zero to 8 right to left and then top to bottom on the grid.)

let blankLocationVar = 4;

//Initiating Constants and Variables
let previousLocation = 4;
let firstClick = false;
let brightness = false;

const tilePuzzleCanvas = document.getElementById('tile-puzzle-canvas');
const ctx = tilePuzzleCanvas.getContext('2d');
const CANVAS_WIDTH = (tilePuzzleCanvas.width = 316);
const CANVAS_HEIGHT = (tilePuzzleCanvas.height = 316);
console.log(CANVAS_WIDTH);
console.log(CANVAS_HEIGHT);
const blocks = new Image();
blocks.src = 'images/JSHv5.png';
const jBlocks = new Image();
jBlocks.src = 'images/JSPv4.png';
const bBlocks = new Image();
bBlocks.src = 'images/JSHBv5.png';
const vLineSprite = new Image();
vLineSprite.src = 'images/VL.png';
const hLineSprite = new Image();
hLineSprite.src = 'images/HL.png';
const puzzleCaption = document.querySelector('.puzzle-caption');
console.log(`puzzleCaption = ${puzzleCaption}`);
const tractLink = document.querySelector('.tract-link');
let grid = [];
let flashBlockBright = false;

//GRIDSQUARE CLASS DEFINITION

class Gridsquare {
  constructor(positionNumber) {
    if (positionNumber < 4) {
      this.blockNumber = positionNumber;
    } else if (positionNumber === 4) {
      this.blockNumber = 'blank';
    } else if (positionNumber > 4) {
      this.blockNumber = positionNumber - 1;
    }
    this.bright = false;
  }
}

//START GAME

loading();

//FUNCTIONS

//Start Functions

function loading() {
  if (
    !blocks.complete ||
    !jBlocks.complete ||
    !bBlocks.complete ||
    !vLineSprite.complete ||
    !hLineSprite.complete
  ) {
    setTimeout(loading, 20);
    return;
  } else {
    start();
  }
}

function start() {
  protoInitialise();
  initialise();
  refreshGrid();
  const location = selectMoveBlockLocation();
  flashBlock(location);
}

function flashBlock(location) {
  setTimeout(() => {
    if (firstClick === false) {
      grid[location].bright = !grid[location].bright;
      drawBlock(location);
      drawLines();
      flashBlock(location);
    }
  }, 500);
  return;
}

function selectMoveBlockLocation() {
  var possibleLocations = neighbouringLocations(blankLocationVar);
  var numberOfNeighbours = possibleLocations.length;
  var arrayElement = integerBetween(0, numberOfNeighbours - 1);
  var selectedBlockLocation = possibleLocations[arrayElement];
  return selectedBlockLocation;
}

function protoInitialise() {
  console.log('protoInitialise');
  //THE BLOCKS ARE STARTED FROM FINAL CONFIGURATION
  for (let i = 0; i < 9; i++) {
    grid[i] = new Gridsquare(i);
  }
}

function initialise() {
  //THE BLOCKS ARE MUDDLED TO FORM THE INITIAL CONFIGURATION

  //The blocks will be moved a random number of times, but according to the laws of the game, in order to reach the "initial" position. This process is carried out to ensure
  //that the solution state is accessible from the initial position.

  var numberOfMoves = integerBetween(15, 30);
  console.log(`numberOfMoves = ${numberOfMoves}`);
  for (var i = 0; i < numberOfMoves; i++) {
    makeRandomMove();
  }
}

function integerBetween(a, b) {
  return a + Math.floor((b + 1 - a) * Math.random());
}

function makeRandomMove() {
  var possibleLocations = neighbouringLocations(blankLocationVar);
  var numberOfNeighbours = possibleLocations.length;
  var arrayElement = integerBetween(0, numberOfNeighbours - 1);
  var selectedBlockLocation = possibleLocations[arrayElement];
  if (selectedBlockLocation == previousLocation) {
    //If location is the one the block has just come from, choose a different location.
    possibleLocations.splice(arrayElement, 1);
    numberOfNeighbours = numberOfNeighbours - 1;
    arrayElement = integerBetween(0, numberOfNeighbours - 1);
    selectedBlockLocation = possibleLocations[arrayElement];
    console.log(`selectedBlockLocation = ${selectedBlockLocation}`);
  }
  previousLocation = blankLocationVar;
  moveBlock(selectedBlockLocation, blankLocationVar);
}

//Handling click on block

tilePuzzleCanvas.addEventListener('mousedown', clickHandler);

function clickHandler(event) {
  const array = getGridCoords(tilePuzzleCanvas, event);
  const gridNumber = getGridNumber(array[0], array[1]);
  console.log(`gridNumber = ${gridNumber}`);
  tryMoveBlock(gridNumber);
}

function getGridCoords(canvas, event) {
  console.log('canvas clicked');
  const rect = canvas.getBoundingClientRect();
  const canvasScale = (rect.right - rect.left - 16) / 300;
  const x = event.clientX - rect.left - 8;
  const y = event.clientY - rect.top - 8;
  const gridX = Math.floor(x / (100 * canvasScale));
  const gridY = Math.floor(y / (100 * canvasScale));
  console.log(`x = ${x}`);
  console.log(`y = ${y}`);
  console.log(`gridX = ${gridX}`);
  console.log(`gridY = ${gridY}`);
  return [gridX, gridY];
}

function getGridNumber(x, y) {
  switch (y) {
    case 0:
      switch (x) {
        case 0:
          return 0;
        case 1:
          return 1;
        case 2:
          return 2;
      }
    case 1:
      switch (x) {
        case 0:
          return 3;
        case 1:
          return 4;
        case 2:
          return 5;
      }
    case 2:
      switch (x) {
        case 0:
          return 6;
        case 1:
          return 7;
        case 2:
          return 8;
      }
  }
}

function tryMoveBlock(gridNumber) {
  var possibleMoves = neighbouringLocations(gridNumber);
  firstClick = true;
  for (let i = 0; i < possibleMoves.length; i++) {
    const trialSpaceNumber = possibleMoves[i];
    const trialBlockNumber = grid[trialSpaceNumber].blockNumber;
    if (trialBlockNumber === 'blank') {
      moveBlock(gridNumber, trialSpaceNumber);
      refreshGrid();
      if (isFinished()) {
        console.log('Finished!');
        endLoop();
      }
      return;
    }
  }
  return 'blocked';
}

//End-of-game Functions

function isFinished() {
  for (let i = 0; i < 9; i++) {
    const blockNumber = grid[i].blockNumber;
    if (i < 4 && blockNumber != i) return false;
    else if (i === 4 && blockNumber != 'blank') return false;
    else if (i > 4 && blockNumber != i - 1) return false;
  }
  return true;
}

function endLoop() {
  tilePuzzleCanvas.removeEventListener('mousedown', clickHandler);
  fadeInJesusAndLinks(0);
}

function fadeInJesusAndLinks(opacity) {
  if (opacity >= 1) {
    console.log(`opacity = ${opacity}`);
    console.log('Full Jesus!');
    fadeInLinks();
  } else {
    console.log(`opacity = ${opacity}`);
    drawJesus(opacity);
    setTimeout(function () {
      fadeInJesusAndLinks(opacity + 0.01);
    }, 20);
  }
}

function fadeInLinks() {
  puzzleCaption.style.display = 'block';
  tractLink.style.display = 'inline';
  fadeInTextObject(puzzleCaption, 0, () =>
    fadeInTextObject(tractLink, 0, () => {
      return;
    })
  );
}

function fadeInTextObject(object, opacity, callback) {
  console.log(`text opacity = ${opacity}`);
  console.log(`callback = ${callback}`);
  if (opacity >= 1) callback();
  else {
    object.style.opacity = opacity;
    setTimeout(() => fadeInTextObject(object, opacity + 0.01, callback), 20);
  }
}

function fadeOutTextObject(object, opacity, callback) {
  if (opacity <= 0) callback();
  else {
    object.style.opacity = opacity;
    setTimeout(() => fadeOutTextObject(object, opacity - 0.01, callback), 20);
  }
}

function drawJesus(opacity) {
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  refreshGrid();
  ctx.globalAlpha = opacity;
  for (let i = 0; i < 9; i++) {
    drawJesusBlock(i);
  }
  ctx.globalAlpha = 1;
  drawLines();
}

function drawJesusBlock(i) {
  let j;
  if (i < 4) {
    j = i;
  }
  if (i === 4) {
    j = 8;
  }
  if (i > 4) {
    j = i - 1;
  }
  ctx.drawImage(
    jBlocks,
    j * 100,
    0,
    100,
    100,
    (i % 3) * 100 + 8,
    [Math.floor(i / 3)] * 100 + 8,
    100,
    100
  );
}

//Helper Functions

function moveBlock(loc1, loc2) {
  [grid[loc1], grid[loc2]] = [grid[loc2], grid[loc1]];
  blankLocationVar = loc1;
}

function neighbouringLocations(location) {
  switch (location) {
    case 0:
      return [1, 3];
    case 1:
      return [0, 2, 4];
    case 2:
      return [1, 5];
    case 3:
      return [0, 4, 6];
    case 4:
      return [1, 3, 5, 7];
    case 5:
      return [2, 4, 8];
    case 6:
      return [3, 7];
    case 7:
      return [4, 6, 8];
    case 8:
      return [5, 7];
  }
}

function refreshGrid() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  brightenBlocks();
  for (let i = 0; i < 9; i++) {
    drawBlock(i);
  }
  drawLines();
}

function brightenBlocks() {
  for (let i = 0; i < 9; i++) {
    const GRIDSQUARE = grid[i];
    console.log(`GRIDSQUARE = ${GRIDSQUARE}`);
    const blockNumber = GRIDSQUARE.blockNumber;
    if (blockNumber === 'blank') continue;
    if (
      (blockNumber < 4 && blockNumber === i) ||
      (blockNumber > 4 && blockNumber === i - 1)
    ) {
      GRIDSQUARE.bright = true;
    } else {
      GRIDSQUARE.bright = false;
    }
  }
}

function drawBlock(i) {
  let blockSprite;
  if (grid[i].bright) {
    blockSprite = bBlocks;
  } else {
    blockSprite = blocks;
  }

  let j = grid[i].blockNumber;
  if (j === 'blank') return;
  ctx.drawImage(
    blockSprite,
    j * 100,
    0,
    100,
    100,
    (i % 3) * 100 + 8,
    [Math.floor(i / 3)] * 100 + 8,
    100,
    100
  );
}

function drawLines() {
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(vLineSprite, 0, 0, 4, 300, i * 100 + 6, 8, 4, 300);
  }
  for (let j = 0; j < 4; j++) {
    ctx.drawImage(hLineSprite, 0, 0, 300, 4, 8, j * 100 + 6, 300, 4);
  }
}
