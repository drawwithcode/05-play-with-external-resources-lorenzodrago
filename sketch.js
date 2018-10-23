var canvas, mySong, menuImage, analyzer, fft;
//Song start times (in seconds). These are picked randomly after the first run.
var startTime = [0, 30, 60, 90, 120, 150]

function preload(){
  mySong = loadSound("./Rhinoceros.mp3");
  failSound = loadSound("./fail.wav");
  menuImage = loadImage("./menu.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  analyzer = new p5.Amplitude();
  analyzer.setInput(mySong);
  fft = new p5.FFT();
  pixelDensity(1); //to avoid my laptop crapping itself cause of HiDpi.
  angleMode(DEGREES);
  stroke(255);
}


var speed=8; //can be changed. Will not break spiral patterns
var avatarSpeed=10; //DO NOT change. Will break spiral patterns.
var polySides = 6; //can be changed. Patterns DO NOT adapt.
var sideAngle=360/polySides;
//Full mode enabled by default.
var audioVisualMode=true;
//time-related vars.
var timeCount = 0; var timeCountStore=0;
var score=0; var lastScore = 0; var scoreText = 0;
var hit=0;
var offset=-90; //starting angle for player triangle.
var gamePaused=true;
var firstRun=true;
var now, delta;

function draw() {
  if (gamePaused==false) {
    timeCount = millis()*0.06 - timeCountStore;
  }

  background(10,20,30);
  translate(width/2, height/2);



  push(); //the following part is transformed;

  // World Spin.
  if (timeCount%720>360) {
    rotate(-timeCount);
  } else {
    rotate(timeCount);
  }
  //MEGA SPIN. In second half of level.
  if (timeCount%720>360 && timeCount%720<395 && timeCount>1440) {
    rotate(-timeCount*5);
  }
  if (timeCount%1440>395 && timeCount%1440<720+395 && timeCount>1440) {
    rotate(180);
  }

  //Audio visuals here.
  volume = analyzer.getLevel();
  if(audioVisualMode) {
    push();
    colorMode(HSB);
    strokeWeight(1);
    var alpha, deltaX, deltaY;
    var spectrum = fft.analyze();
    var length = map(spectrum.length, 0, 255, 0, 360);
    for (alpha=0; alpha<length; alpha+=6) {
      var x = map(alpha, 0, spectrum.length/20, 0, 360);
      var h = map(spectrum[alpha], 0, 255, 0, 360);
      deltaX=cos(x+frameCount*0.1)*h*3;
      deltaY=sin(x+frameCount*0.1)*h*3;
      stroke(lerpColor(color(255,200,70), color(0,200,70), volume*6*h/360));
      line(0,0, deltaX, deltaY);
    }
    pop();
  }


  //Player triangle here. Now with TIME BASED MOVEMENT!! As with the rest of the sketch.
  //If your pc can't run this at 60fps, it'll still have the same speed.
  //Also holy carp p5js has shit performance everywhere.
  function calcSpeed(DELTA, SPEED) {
    return (SPEED*DELTA)*0.06;
  }
  if (keyIsDown(RIGHT_ARROW) && gamePaused==false) {
    now = millis();
    delta = now - then;
    offset+= calcSpeed(delta, avatarSpeed);
    then = now;
  } else if (keyIsDown(LEFT_ARROW) && gamePaused==false) {
    now = millis();
    delta = now - then;
    offset+= -calcSpeed(delta, avatarSpeed);
    then = now;
  } else {
    then = millis();
  }
  push();
  fill(255);
  beginShape();
  vertex(cos(offset)*110,sin(offset)*110);
  vertex(cos(offset-5)*95,sin(offset-5)*95);
  vertex(cos(offset+5)*95,sin(offset+5)*95);
  endShape(CLOSE);
  pop();

  //LEVEL STARTS HERE! lv var determines succession.
  //All patterns calculate lv automatically, but it doesn't always work
  //because I suck at maths.
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

  //Closing pattern.
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
  fill(10,20,30);
  beginShape();
  scale(0.9+volume,0.9+volume);
  for (i=0; i<360; i+=sideAngle) {
    vertex(cos(i)*60, sin(i)*60);
    line(0,0, cos(i)*width*2, sin(i)*width*2)
  }
  endShape(CLOSE);
  pop();

  //song, menu, game pause, score and other stuff.
  score = Math.floor(timeCount*10/6)/100;
  scoreText = score;
  if (gamePaused) {
    timeCount=0;
    mySong.stop();
    rectMode(CENTER);
    fill(10,20,30,230);
    rect(0,0, 800, 500, 10);
    imageMode(CENTER);
    image(menuImage, 0, 0, 800, 500);
    scoreText = lastScore;
  }
  if (gamePaused && keyIsDown(ENTER)) {
    if (firstRun) {
      mySong.loop(0,1,1,0,360);
    } else {
      mySong.loop(0,1,1,startTime[Math.floor(random(0,startTime.length))],360);
    }
    scoreText = score;
    gamePaused=false;
    timeCountStore=millis()*0.06;
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

//Visual mode toggle.
function keyPressed() {
  if (keyCode === DELETE && audioVisualMode==false) {
    audioVisualMode = true;
  } else if (keyCode === DELETE && audioVisualMode==true) {
    audioVisualMode = false;
  }
}

//POSSIBLE PATTERNS follow.
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
//BASIC LINE. All patterns use this.
function addLine(SIDE1, SIDE2, OFFSET) {
  this.thickness=40;
  side1Angle=sideAngle*SIDE1;
  side2Angle=sideAngle*SIDE2;
  tolerance = 10;
  var r1 = (width-timeCount*speed)+OFFSET*300;
  if (r1<0) {r1 = 0};
  r2=r1-thickness; //thickness
  r1a=r1-tolerance; r2a=r1-thickness+tolerance; //collision thickness
  if(r1<width && r1>60) {
    push();
    fill(255);
    beginShape();
    vertex(cos(side1Angle)*r1 ,sin(side1Angle)*r1);
    vertex(cos(side2Angle)*r1, sin(side2Angle)*r1);
    vertex(cos(side2Angle)*r2, sin(side2Angle)*r2);
    vertex(cos(side1Angle)*r2,sin(side1Angle)*r2);
    endShape(CLOSE);
    //Blatantly unoptimized collision code.
    hit = collidePointLine(cos(offset)*110,sin(offset)*110,
    cos(side1Angle)*r2a, sin(side1Angle)*r2a,
    cos(side2Angle)*r2a, sin(side2Angle)*r2a, 1)
    || collidePointLine(cos(offset)*110,sin(offset)*110,
    cos(side1Angle)*r1a ,sin(side1Angle)*r1a,
    cos(side1Angle)*r2a,sin(side1Angle)*r2a, 1)
    || collidePointLine(cos(offset)*110,sin(offset)*110,
    cos(side2Angle)*r1a ,sin(side2Angle)*r1a,
    cos(side2Angle)*r2a,sin(side2Angle)*r2a, 1);
    pop();
  }
  if (hit) {
    lastScore = score;
    failSound.play();
    gamePaused=true;
    firstRun=false;
  }
}


function windowResized() {
  resizeCanvas(windowWidth,windowHeight);
}
