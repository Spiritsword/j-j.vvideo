//The location of the blank ("empty block") is initally in the centre of the 3x3 space - code = 4. (The location codes are counted from zero to 8 right to left and then top to bottom on the grid.)
let blankLocationVar = 4;
let previousLocation = 4;

let firstClick = false;
let background = this.add.image(0, 0, 'background');
let brightness = false;
let scale = 1;
let wIW = window.innerWidth;
let wIH = window.innerHeight;
let gridCentreX = centreX;
let gridCentreY = centreY * 0.6;

//EVENT LISTENERS

//When a game object (i.e. one of the squares) is clicked on, try to move it. (It will move to the space, if it neighbours it.)

this.input.on('gameobjectdown', clickHandler, this);

//INITIALISING ARRAYS; INITIAL DRAWING OF IMAGES

//Each "block with hole" is created, added in to blocks and assigned its preliminary position in the grid, matching the solution state.

for (var i = 0; i < 9; i++) {
  if (i == 4) {
    blockAtLocation[i] = 'blank';
  } else {
    var currentBlock = this.add.image(0, 0, 'blocks');
    currentBlock.displayWidth = BLOCKDISPLAYWIDTH;
    currentBlock.displayHeight = BLOCKDISPLAYHEIGHT;
    currentBlock.setInteractive();
    currentBlock.location = i;
    currentBlock.number = i;
    blockAtLocation[i] = currentBlock;
    if (i > 4) {
      currentBlock.setFrame(i - 1);
    } else {
      currentBlock.setFrame(i);
    }
  }
}

//THE BLOCKS ARE MUDDLED TO FORM THE INITIAL CONFIGURATION

//The blocks will be moved a random number of times, but according to the laws of the game, in order to reach the "initial" position. This process is carried out to ensure
//that the solution state is accessible from the initial position.

var numberOfMoves = Phaser.Math.Between(15, 30);
for (var i = 0; i < numberOfMoves; i++) {
  makeRandomMove();
}

//THE INITIAL POSITION OF THE GAME IS DRAWN

scaleSprites();
redrawGame();
flashBlock(selectMoveBlock());

//MAIN FUNCTIONS

function drawFinalText() {
  var style = { font: '25px Arial', fill: '#f7f890', align: 'center' };
  var finalText = this.add.text(
    //30,
    //520,
    centreX,
    centreY,
    'Jesus is the missing piece.',
    style
  );
  finalText.alpha = 0;
}

function drawLink() {
  var style = { font: '25px Arial', fill: '#f7f890', align: 'center' };
  var linkText = this.add.text(
    //40,
    //560,
    centreX,
    centreY,
    'Click here for more info.',
    style
  );
  console.log('linkText = ' + linkText);
  linkText.alpha = 0;
  linkText.disableInteractive();
  linkText.addListener('pointerover', makePurple);
}

//HELPER FUNCTIONS

function flashBlock(block) {
  i = block.number;
  var bBlock = brightBlockArray[i];
  bBlock.x = block.x;
  bBlock.y = block.y;
  flashBlockHelper(bBlock);
}

function flashBlockHelper(brightBlock) {
  setTimeout(() => {
    if (firstClick == false) {
      if (brightBlock.alpha == 0) {
        brightBlock.alpha = 1;
      } else {
        brightBlock.alpha = 0;
      }
      flashBlockHelper(brightBlock);
    } else {
      brightBlock.alpha = 0;
    }
  }, 500);
  return;
}

//FROM VERSION 1 TO ADAPT AND USE...

function brightenBlocks() {
  for (var i = 0; i < 9; i++) {
    var block;
    var brightBlock;
    if (i != blankLocationVar) {
      block = blockAtLocation[i];
      brightBlock = brightBlockArray[block.number];
    } else {
      continue;
    }
    if (i == 4) {
      brightBlock.alpha = 0;
      continue;
    }
    brightBlock.x = block.x;
    brightBlock.y = block.y;
    if (block.number == i) {
      brightBlock.alpha = 1;
      console.log(i + ' is bright');
    } else {
      brightBlock.alpha = 0;
      console.log(i + ' is dim');
    }
  }
}

function selectMoveBlock() {
  var possibleLocations = neighbouringLocations(blankLocationVar);
  var numberOfNeighbours = possibleLocations.length;
  var arrayElement = Phaser.Math.Between(0, numberOfNeighbours - 1);
  var selectedBlockLocation = possibleLocations[arrayElement];
  var selectedBlock = blockAtLocation[selectedBlockLocation];
  return selectedBlock;
}

function makeRandomMove() {
  var possibleLocations = neighbouringLocations(blankLocationVar);
  var numberOfNeighbours = possibleLocations.length;
  var arrayElement = Phaser.Math.Between(0, numberOfNeighbours - 1);
  var selectedBlockLocation = possibleLocations[arrayElement];
  if (selectedBlockLocation == previousLocation) {
    //If location is the one the block has just come from, choose a different location.
    possibleLocations.splice(arrayElement, 1);
    numberOfNeighbours = numberOfNeighbours - 1;
    arrayElement = Phaser.Math.Between(0, numberOfNeighbours - 1);
    selectedBlockLocation = possibleLocations[arrayElement];
  }
  //Moveblock and update arrays and blankLocation.
  previousLocation = blankLocationVar;
  moveBlock(selectedBlockLocation, blankLocationVar);
}

function moveBlock(loc1, loc2) {
  const movingBlock = blockAtLocation[loc1];
  //   console.log('loc1 =' + loc1);
  [
    blockAtLocation[loc1],
    blockAtLocation[loc2],
    movingBlock.location,
    blankLocationVar,
  ] = ['blank', movingBlock, loc2, loc1];
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

function clickHandler(pointer, object) {
  if (object === linkText) {
    window.location.replace('tract.html');
  } else {
    tryMoveBlock(pointer, object);
  }
}

function tryMoveBlock(pointer, block) {
  var possibleMoves = neighbouringLocations(block.location);
  firstClick = true;
  for (i = 0; i < possibleMoves.length; i++) {
    if (blockAtLocation[possibleMoves[i]] === 'blank') {
      moveBlock(block.location, possibleMoves[i]);
      drawGridWithHoles();
      brightenBlocks();
      drawGridLines();
      if (isFinished()) {
        console.log('Finished!');
        endLoop();
      }
      return;
    }
  }
  return 'blocked';
}

function isFinished() {
  for (var i = 0; i < 9; i++) {
    console.log('i = ' + i);
    if (i == 4) {
      if (blockAtLocation[i] != 'blank') {
        return false;
      }
    } else {
      if (blockAtLocation[i].number != i) return false;
    }
    console.log(i + ' is good.');
  }
  return true;
}

function endLoop() {
  freezeBlocks();
  console.log('Starting setTimeout');
  setTimeout(() => {
    console.log('Waited2');
    console.log('Waited3');
    fadeJesusIn();
    console.log('JesusFadingIn');
    setTimeout(() => {
      console.log('addedFinal');
      addFinalText();
      setTimeout(() => {
        console.log('addedLink');
        addLinkText();
      }, 0);
    }, 0);
  }, 0);
  console.log('Finished setTimeout');
}

function freezeBlocks() {
  for (i = 0; i < 9; i++) {
    if (i != 4) {
      blockAtLocation[i].disableInteractive();
    }
  }
}

function fadeJesusIn() {
  console.log('Drawing Grid with Jesus');
  drawGridWithJesus();
  console.log('Drawing Grid Lines');
  drawGridLines();
  for (i = 0; i < 9; i++) {
    console.log('Fading in jBlock at location' + i);
    fadeIn(jBlockAtLocation[i], 0);
  }
}

function fadeIn(object, opacity) {
  object.alpha = opacity;
  if (opacity >= 1) {
    return;
  } else opacity = opacity + 0.01;
  setTimeout(function () {
    fadeIn(object, opacity);
  }, 40);
}

function addFinalText() {
  fadeIn(finalText, 0);
}

function addLinkText() {
  fadeIn(linkText, 0);
  linkText.setInteractive();
  console.log('linkText is interactive');
}
function makePurple() {
  linkText.setFill('#830a9e');
}
