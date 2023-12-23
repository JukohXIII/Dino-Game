import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";

const canvas = document.getElementById("game");
//Creates a CanvasRenderingContext2D object that represents bi-dimensional context
const ctx = canvas.getContext("2d");

const GAME_SPEED_START = 1
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88/1.5; //58
const PLAYER_HEIGHT = 94 /1.5; //62 to make it more logical compared to game height
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const CACTI_CONFIG = [
    {width:48/1.5, height:100/1.5, image:"./Images/cactus_1.png"},
    {width:98/1.5, height:100/1.5, image:"./Images/cactus_2.png"},
    {width:68/1.5, height:70/1.5, image:"./Images/cactus_3.png"},
]
//Game objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenerForRestart = false;
let waitingToStart = true;

function createSprites(){
    const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
    const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
    const minJumpHeight = MIN_JUMP_HEIGHT*scaleRatio;
    const maxJumpHeight = MAX_JUMP_HEIGHT*scaleRatio;

    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;
    player = new Player(
        ctx,
        playerWidthInGame,
        playerHeightInGame,
        minJumpHeight,
        maxJumpHeight,
        scaleRatio);
    ground = new Ground(ctx,groundWidthInGame,groundHeightInGame,GROUND_AND_CACTUS_SPEED,scaleRatio);

    const cactiImages = CACTI_CONFIG.map(cactus =>{
        const image = new Image();
        image.src = cactus.image;
        return{
            image:image,
            width:cactus.width * scaleRatio,
            height:cactus.height * scaleRatio,
        };
    });
    cactiController = new CactiController(ctx, cactiImages, scaleRatio,GROUND_AND_CACTUS_SPEED);
    score = new Score(ctx,scaleRatio);
}
function setScreen(){
    scaleRatio = getScaleRatio();
    canvas.width = GAME_WIDTH * scaleRatio;
    canvas.height = GAME_HEIGHT * scaleRatio;
    createSprites();
}
//Determine screen width based on client device and fits with any screen size

setScreen();

//On resize, redefine the screen size. Use setTimeout on Safari rotation otherwise works fine on desktop
window.addEventListener("resize", ()=>setTimeout(setScreen, 500));

//Makes sure screen orientation exists because doesn't exist on some browsers.
if(screen.orientation){
    screen.orientation.addEventListener('change', setScreen);
}
function getScaleRatio() {
    const screenHeight = Math.min(window.innerHeight,
        document.documentElement.clientHeight
    );
    const screenWidth = Math.min(window.innerWidth,
        document.documentElement.clientWidth
    );

    if(screenWidth/screenHeight<GAME_WIDTH/GAME_HEIGHT){
        return screenWidth/GAME_WIDTH
    }else{
        return screenHeight/GAME_HEIGHT;
    }
}
function showGameOver(){
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle='grey';
    const x = canvas.width /4.5;
    const y = canvas.height/2;
    ctx.fillText("GAME OVER", x,y);
}

function showScore(){
    const fontSize = 30 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle='grey';
    const x = canvas.width /2.5;
    const y = canvas.height/1.5;
    const values = Object.values(score);
    ctx.fillText("Score : "+ Math.floor(values[0]), x,y);
}

function setupGameReset(){
    if(!hasAddedEventListenerForRestart){
        hasAddedEventListenerForRestart=true;
        setTimeout(()=>{
            window.addEventListener("keyup", reset,{once:true});
            window.addEventListener("touchstart", reset,{once:true});
        }, 500) //Sets a timeout to delay the positibility to reset
    }
}

function reset(){
    hasAddedEventListenerForRestart = false;
    gameOver = false;
    waitingToStart = false;
    ground.reset();
    cactiController.reset();
    score.reset();
    gameSpeed = GAME_SPEED_START;
}

function showStartGameText(){
    const fontSize = 40 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle='grey';
    const x = canvas.width /14;
    const y = canvas.height/2;
    ctx.fillText("Press space or tap screen to start", x,y);
}

function updateGameSpeed(frameTimeDelta){
    gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}
function clearScreen(){
    ctx.fillStyle = "white";
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

function gameLoop(currentTime){
    if(previousTime == null){
        previousTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }
    const frameTimeDelta = currentTime - previousTime;
    previousTime = currentTime;

    clearScreen();

    if(!gameOver && !waitingToStart){ //Update the game while the game is not over
        //Update game objects
        ground.update(gameSpeed, frameTimeDelta);
        cactiController.update(gameSpeed,frameTimeDelta);
        player.update(gameSpeed,frameTimeDelta);
        score.update(frameTimeDelta);
        updateGameSpeed(frameTimeDelta);
    }//If player hits a cactus, the game is over
    if(!gameOver && cactiController.collideWith(player)){
        gameOver = true;
        setupGameReset();
        score.setHighScore();
    }
    //Draw game objects
    ground.draw();
    cactiController.draw();
    player.draw();
    score.draw();
    if(gameOver){
        showGameOver();
        showScore();
    }

    if(waitingToStart){
        showStartGameText();
    }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
window.addEventListener("keyup", reset,{once:true});
window.addEventListener("touchstart", reset,{once:true});
