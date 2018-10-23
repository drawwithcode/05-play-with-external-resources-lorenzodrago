var canvas, mySong, analyzer;
var osc, envelope, fft;
var startTime = [0, 30, 60, 90, 120, 150]
var menuImage;

function preload(){
  mySong = loadSound("./Rhinoceros.mp3");
  failSound = loadSound("./fail.wav");
  menuImage = loadImage("./menu.png");
}
function setup() {
  pixelDensity(1);
  analyzer = new p5.Amplitude();
  analyzer.setInput(mySong);
  envelope = new p5.Env();
  fft = new p5.FFT();
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  stroke(255);
  frameRate(60);
  // put setup code here
}
var radius = 300;
var alpha, beta, lerpVar;
var deltaX=0;
var deltaY=0;
var mult1=0;
var mult2=5;
var score=0; var lastScore = 0; var scoreText = 0;
var hit=0;
var offset=0;
var speed=6;
var avatarSpeed=5; //do not change. it will break spiral patterns.
var polySides = 6;
var sideAngle=360/polySides;
var audioVisualMode=true;

var gamePaused=true;
var firstRun=true;
function draw() {

  background(10,20,30);
  //framerate counter (commented out).
  /*push();
  noStroke();
  fill(255);
  textSize(30);
  text(Math.floor(frameRate()), 20, 40);
  pop();*/


  if (frameCount>10000) {
    frameCount=0;
  }
  if (keyIsDown(RIGHT_ARROW) && gamePaused==false) {
    offset+= avatarSpeed*2;
  } else if (keyIsDown(LEFT_ARROW) && gamePaused==false) {
    offset+= -avatarSpeed*2;
  }
  volume = analyzer.getLevel();
  translate(width/2, height/2);

  push(); //the following part is transformed;


  // BIG SPIN
  if (frameCount%720>360) {
    rotate(-frameCount);
  } else {
    rotate(frameCount);
  }
  if (frameCount%720>360 && frameCount%720<396 && frameCount>1440) {
    rotate(-frameCount*5);
  }
  if (frameCount%1440>395 && frameCount%1440<720+396 && frameCount>1440) {
    rotate(180);
  }






  fill(10,20,30);

  //Audio visuals here.
  push();
  colorMode(HSB);
  strokeWeight(1);


  if(audioVisualMode) {
  var spectrum = fft.analyze();
  var length = map(spectrum.length, 0, 255, 0, 360);
  for (alpha=0; alpha<length; alpha+=6) {
    var x = map(alpha, 0, spectrum.length/20, 0, 360);
    var h = map(spectrum[alpha], 0, 255, 0, 360);
    deltaX=cos(x+frameCount*0.1)*h*3;
    deltaY=sin(x+frameCount*0.1)*h*3;
    beta=(alpha+frameCount*mult2)%360;

    if(beta<=180) {
      lerpVar=beta/180;
    } else {
      lerpVar=(360-beta)/180;
    }
    stroke(lerpColor(color(255,200,70), color(0,200,70), volume*6*h/360));
    line(0,0, deltaX, deltaY);
  }
  }
  pop();

  //Player triangle here.
  push();
  fill(255);
  beginShape();
  vertex(cos(offset+15)*110,sin(offset+15)*110);
  vertex(cos(offset-5+15)*95,sin(offset-5+15)*95);
  vertex(cos(offset+5+15)*95,sin(offset+5+15)*95);
  endShape(CLOSE);
  pop();

  //Level starts here!
  if (firstRun) {
    lv = 5;
  } else {
    lv = 0;
  }
  addZigZag(2,1);
  lv+=1;
  addCPattern(0);
  addCPattern(2);
  addCPattern(4);
  addCPattern(0);
  addZigZag(2,1);
  lv+=0.5;
  addGameCube(0);
  addCPattern(2);
  addCPattern(4);
  addZigZag(0,10);
  lv+=-3;
  addZigZag(3,2);
  addSpiral(0,50);
  addCPattern(0);
  addCPattern(3);
  addCPattern(0);
  addCPattern(2);
  addCPattern(5);
  addCPattern(2);
  addSpiral(0,20);
  lv++;
  addGameCube(0);
  addCPattern(2);
  addCPattern(4);
  addCPattern(0);
  addZigZag(6,10);
  addZigZag(3,2);
  addCPattern(2);
  addCPattern(5);
  addZigZag(2,1);
  addCPattern(2);
  addCPattern(4);
  addGameCube(0);
  addZigZag(0,10);
  addZigZag(3,2);
  addSpiral(0,50);

  lv+=0.5;
  addCPattern(0);
  addCPattern(3);

  //end of level.
  lv+=5;
  addCPattern(0);
  lv+=-1;
  addCPattern(3);
  lv+=-0.7;
  addCPattern(0);
  lv+=-1;
  addCPattern(3);
  //LEVEL ENDS HERE

  //CENTER POLYGON
  beginShape();
  scale(0.9+volume,0.9+volume);
  for (i=0; i<360; i+=sideAngle) {
    vertex(cos(i)*60, sin(i)*60);
    line(0,0, cos(i)*width*2, sin(i)*width*2)
  }
  endShape(CLOSE);
  pop();

  //song, menu, game pause
  score = Math.floor(frameCount/60);
  scoreText = score;
  if (gamePaused) {
    frameCount=0;
    mySong.stop();
    rectMode(CENTER);
    fill(10,20,30,230);
    rect(0,0, 800, 500, 10);
    imageMode(CENTER);
    image(menuImage, 0, 0, 800, 500);
  }
  if (gamePaused && keyIsDown(ENTER)) {
    if (firstRun) {
      mySong.loop(0,1,1,0,360);
    } else {
      mySong.loop(0,1,1,startTime[Math.floor(random(0,startTime.length))],360);
    }
    scoreText = score;
    gamePaused=false;
  }
  if (gamePaused) {
    scoreText = lastScore;
  }
  push();
  noStroke();
  fill(255);
  translate(-width/2,-height/2);
  textFont('Lato');
  textSize(30);
  text('SCORE: '+scoreText, 20, 40)
  pop();

}

function keyPressed() {
  if (keyCode === DELETE && audioVisualMode==false) {
    audioVisualMode = true;
  } else if (keyCode === DELETE && audioVisualMode==true) {
    audioVisualMode = false;
  }
}

//POSSIBLE PATTERNS
function addZigZag(OFFSET, LENGTH) {
  for (i=0; i<LENGTH; i++) {
    lv+=0.5; OFFSET++;
    addLine(1+OFFSET,2+OFFSET,lv);
    addLine(3+OFFSET,4+OFFSET,lv);
    addLine(5+OFFSET,6+OFFSET,lv);
  }
  lv+=LENGTH*0.5;
}
function addSpiral(OFFSET, LENGTH) {
  for (i=0; i<LENGTH; i++) {
    lv+=speed/50; OFFSET++;
    addLine(1+OFFSET,2+OFFSET,lv);
  }
  lv+=LENGTH*speed/50-2;
}
function addCPattern(OFFSET) {
  addLine(2+OFFSET,3+OFFSET,lv);
  addLine(3+OFFSET,4+OFFSET,lv);
  addLine(5+OFFSET,6+OFFSET,lv);
  addLine(4+OFFSET,5+OFFSET,lv);
  addLine(6+OFFSET,7+OFFSET,lv);
  lv++;
}
function addGameCube(OFFSET) {
  var length=21;
  addLine(2,3,lv);
  addLine(3,4,lv);
  addLine(4,5,lv);
  addLine(5,6,lv);
  lv+=1;
  addLine(6,7,lv);
  addLine(3,4,lv);
  addLine(4,5,lv);
  addLine(5,6,lv);
  lv+=1;
  addLine(2,3,lv);
  addLine(3,4,lv);
  addLine(4,5,lv);
  addLine(5,6,lv);
  lv+=-2
  for (i=0; i<length; i++) {
    addLine(1,2,lv);
    lv+=0.1;
  }
  lv+=length*0.1-1;
}
//Basic line.
function addLine(SIDE1, SIDE2, OFFSET) {
  this.thickness=40;
  var radius = (width-frameCount*speed)+OFFSET*300;
  if (radius<0) {
    radius = 0;
  }
  push();
  fill(255);
  if(radius<width && radius>60) {
    beginShape();
    vertex(cos(sideAngle*SIDE1)*radius ,sin(sideAngle*SIDE1)*radius);
    vertex(cos(sideAngle*SIDE2)*radius, sin(sideAngle*SIDE2)*radius);
    vertex(cos(sideAngle*SIDE2)*(radius-thickness), sin(sideAngle*SIDE2)*(radius-thickness));
    vertex(cos(sideAngle*SIDE1)*(radius-thickness),sin(sideAngle*SIDE1)*(radius-thickness));
    endShape(CLOSE);
    hit = collidePointLine(cos(offset+15)*110,sin(offset+15)*110,
    cos(sideAngle*SIDE1)*(radius-thickness+10),sin(sideAngle*SIDE1)*(radius-thickness+10),
    cos(sideAngle*SIDE2)*(radius-thickness+10), sin(sideAngle*SIDE2)*(radius-thickness+10), 1)
    || collidePointLine(cos(offset+15)*110,sin(offset+15)*110,
    cos(sideAngle*SIDE1)*(radius-10) ,sin(sideAngle*SIDE1)*(radius-10),
    cos(sideAngle*SIDE1)*(radius-thickness+10),sin(sideAngle*SIDE1)*(radius-thickness+10), 1)
    || collidePointLine(cos(offset+15)*110,sin(offset+15)*110,
    cos(sideAngle*SIDE2)*(radius-10) ,sin(sideAngle*SIDE2)*(radius-10),
    cos(sideAngle*SIDE2)*(radius-thickness+10),sin(sideAngle*SIDE2)*(radius-thickness+10), 1);
  }
  pop();

  //Blatantly unoptimized collision code.

  if (hit) {
    lastScore = score;
    gamePaused=true;
    failSound.play();
    firstRun=false;
  }
  //print("colliding? " + hit);
}


function windowResized() {
  resizeCanvas(windowWidth,windowHeight);
}
