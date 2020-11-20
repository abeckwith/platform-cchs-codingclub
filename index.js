/**
 * @author: Coding Club at CCHS
 **/

//get the canvas for things like width and height (and to make the "context"):
const canvas = document.getElementById("myCanvas");

//get the "context" - which is what you use to draw on the canvas
const ctx = canvas.getContext("2d"); //get the ability to draw on canvas

//maximize canvas size to the size of the browser window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Link's starting point:
var linkX = canvas.width / 2;
var linkY = canvas.height / 2;

//starts a timer - calls draw() below
var SPEED = 3;
setInterval(draw, SPEED);


var bk_img = new Image();
bk_img.src = '../images/backgnd.png';

var zelda = new Image();
zelda.src = '../images/zelda.png';

/*
 * Deal with keypresses:
 */
window.addEventListener("keydown", keyPressed, true);
window.addEventListener("keyup", keyReleased, true);

var up = false;
var dn = false;
var lt = false;
var rt = false;

let moving = false;

function keyPressed(e) {
  switch (e.key) {
    //movement of sprite L/R
    case 'a':
    //   linkXSpeed = -3;

      for (var i = 0; i < numBlocks; i++) {
        blocksArray[i].speed = (blocksArray[i].speed <= 0) ? blocksArray[i].speed : -1 * blocksArray[i].speed;
      }
      moving = true;
      lt = true;
      break;
    case 'd':
    //   linkXSpeed = 3;
      for (var i = 0; i < numBlocks; i++) {
        blocksArray[i].speed = (blocksArray[i].speed >= 0) ? blocksArray[i].speed : -1 * blocksArray[i].speed;
      }
      moving = true;
      rt = true;
      break;
      //space bar makes jump, so start velocity and gravity:
    case ' ':
      linkVelocity = 2;
      linkGravity = -.02;
      break;
  }
}

function keyReleased(e) {
  //stop L/R motion

  if (e.key == 'a' || e.key == 'd') {
    moving = false;
  }

  if (e.keyCode == 65) { // 65: left (A)
    linkXSpeed = 0;
    lt = false;
  } else if (e.keyCode == 68) { // 68: right (D)
    linkXSpeed = 0;
    rt = false;
  }
}

/**
 * Creates and returns array of blocks
 */
function createBlocksArray(lvl) {
  //get level from function argument:
  var level = (lvl - 1).toString();
  var blockXLoc = -4000;
  var blocksArray = [];

  //get array of sizes (w,h of blocks) and number of blocks:
  var sizesArr = levelData.levels[level].sizes;
  var numBlocks = levelData.levels[level].sizes.length;

  //go through each pair of w, h and create block fro it
  for (var i = 0; i < sizesArr.length; i++) {
    //make a block JSON object
    var block = {
      x: blockXLoc,
      y: 700,

      width: sizesArr[i][0],
      height: sizesArr[i][1],
      speed: -3,

      //move block based on speed:
      update: function () {
        this.x -= this.speed;
      },
      init: function (context) {
        this.context = context;
      },
      /**
       * shows block as rectangle
       */
      draw: function () {
        this.context.beginPath();
        this.context.fillRect(this.x,
          this.y - this.height, //to make it start at bottom
          this.width, this.height);
        this.context.stroke();
      },
      /**
       * check if this block has intersected with a particular (x,y) point
       */
      checkCollisions: function (pX, pY) {
        var containsX = pX < this.x + this.width && pX > this.x;
        //was pY < this.y + this.height, but had to account for drawing starting ABOVE ground
        var containsY = pY < this.y && pY > this.y - this.height;
        var hasIntersected = containsX && containsY;
        return hasIntersected;
      }
    }
    //give the block the ctx so it can be drawn
    block.init(ctx);
    //add block to array
    blocksArray.push(block);

    blockXLoc += sizesArr[i][0] + 2; //next one starts current width away
  }
  return [
    numBlocks,
    blocksArray
  ];

}

var numBlocks, blocksArray;

//Link starts motionless:
var linkXSpeed = 0;
var linkYSpeed = 0;
//point of link's feet:
var feet;
//for jumping:
var linkGravity = 0;
var linkVelocity = 0;
/**
 * Called by timer
 * sets speeds and draws Link and all blocks
 */
function draw() {
  //will cause jump if V and G are non-zero:

  console.log(moving);

  linkY -= linkVelocity;
  linkVelocity += linkGravity;

  //draw black background:
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height); //clear the canvas (helps with efficiency)

  //draw background image:
  ctx.drawImage(bk_img, 10, 10);

  if (moving) {
    console.log("MOVING!")
    for (var i = 0; i < numBlocks; i++) {
      blocksArray[i].update();
    }
  }

  //draw all blocks:
  ctx.fillStyle = "#5593c6";
  for (var i = 0; i < numBlocks; i++) {
    blocksArray[i].draw();
  }

  //if it reaches an edge - stop it
  if (linkY < 0 && up) {
    linkYSpeed = 0;
  }
  if (linkY > canvas.height - 98 && dn) {
    linkYSpeed = 0;
  }
  if (linkX < 0 && lt) {
    linkXSpeed = 0;
  }
  if (linkX > canvas.width - 85 && rt) {
    linkXSpeed = 0;
  }

  //move Link position based on current speed:
//   linkY += linkYSpeed;
//   linkX += linkXSpeed;

  //bottom of link - needed for collision detection:
  feet = linkY + 98

  //if Link is on block, go at speed of block:

  for (var i = 0; i < numBlocks; i++) {
    if (blocksArray[i].checkCollisions(linkX, feet)) {
      if (dn)
        linkYSpeed = 0;
      linkXSpeed = -blocksArray[i].linkXSpeed;
      linkGravity = 0;
      linkVelocity = 0;
    }
  }
  ctx.drawImage(zelda, linkX, linkY);

}
//SET UP LEVELS:
var lvls = [];
var levelData;

function init() {
  lvls = [];
  //experimenting with creating random blocks ahead of time for level 1:
  for (var i = 0; i < 100; i++) {
    lvls.push([
      Math.floor(Math.random() * 330 + 10), //width
      Math.floor(Math.random() * 200 + 10) //height
    ]);
  }

  levelData = {
    levels: [
      {
        level: 1,
        sizes: lvls,
      },
      {
        level: 2,
        sizes: [ //width, height
                [100, 20],
                [50, 40],
                [100, 22],
                [30, 35],
                [100, 215],
                [100, 20],
                [50, 40],
                [100, 22],
                [30, 35],
                [100, 15]
            ],
    },
      {
        level: 3,
        sizes: [
                [10, 20],
                [50, 50],
                [150, 22],
                [30, 35],
                [1000, 60],
                  [10, 20],
                [50, 50],
                [150, 22],
                [30, 35],
                [1000, 60]
            ],
    },
  ]

  }

  data = createBlocksArray(1);
  numBlocks = data[0];
  blocksArray = data[1];
}
