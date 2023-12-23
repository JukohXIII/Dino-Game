export default class Player{
    WALK_ANIMATION_TIMER=200;
    walkAnimationTimer = this.WALK_ANIMATION_TIMER;
    dinoRunImages = []

    jumpPressed = false;
    jumpInProgress = false;
    falling = false;
    JUMP_SPEED = 0.6;
    GRAVITY = 0.4;
    constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio) {
        this.ctx=ctx;
        this.canvas= ctx.canvas;
        this.width = width;
        this.height = height;
        this.scaleRatio = scaleRatio;
        this.maxJumpHeight = maxJumpHeight;
        this.minJumpHeight = minJumpHeight;

        this.x = 10 * scaleRatio;
        this.y = this.canvas.height - this.height - 1.5 * scaleRatio;
        this.yStandingPosition = this.y;

        this.standingStillImage = new Image();
        this.standingStillImage.src = "Images/standing_still.png";
        this.image = this.standingStillImage;

        const dinoRunImage1= new Image();
        dinoRunImage1.src = "./Images/dino_run1.png";

        const dinoRunImage2 = new Image();
        dinoRunImage2.src = "./Images/dino_run2.png";
        //Add both images into a table
        this.dinoRunImages.push(dinoRunImage1);
        this.dinoRunImages.push(dinoRunImage2);

        //Keyboard inputs
        window.removeEventListener('keydown', this.keydown);
        window.removeEventListener('keyup', this.keyup);

        window.addEventListener('keydown', this.keydown);
        window.addEventListener('keyup', this.keyup);

        //Touch inputs
        window.removeEventListener('touchstart', this.touchstart);
        window.removeEventListener('touchend', this.touchend);
        window.addEventListener('touchstart', this.touchstart);
        window.addEventListener('touchend', this.touchend);
    }

    //Arrow functions are alternatives to functions
    touchstart = ()=>{
        this.jumpPressed = true;
    };
    touchend = ()=>{
        this.jumpPressed = false;
    };
    keydown = (event)=> {
        if (event.code === "Space") {
            this.jumpPressed = true;
        }
    };

    keyup = (event)=> {
        if (event.code === "Space") {
            this.jumpPressed = false;
        }
    };

    update(gameSpeed,frameTimeDelta){
        //console.log(this.jumpPressed);
        this.run(gameSpeed, frameTimeDelta);
        this.jump(frameTimeDelta);
    }
    jump(frameTimeDelta){
        //Puts the dino in JumpInProgress state
        if(this.jumpPressed){
            this.jumpInProgress=true;
        }
        //Check if dino is jumping upwards
        if(this.jumpInProgress && !this.falling){
            /*Is the dino jumps at least at the minimum height or are we continuing to jump until the max height
            if we are touching the screen or the space bar*/
            if(this.y> this.canvas.height - this.minJumpHeight ||
            this.y > this.canvas.height - this.maxJumpHeight && this.jumpPressed){
                //Dino height decreases
                this.y -= this.JUMP_SPEED * frameTimeDelta * this.scaleRatio;
            } else {
                //Puts dino in a falling state
                this.falling=true;
            }
        } else {
            //If we are still falling
            if(this.y < this.yStandingPosition){
                this.y += this.GRAVITY* frameTimeDelta*this.scaleRatio;
                if(this.y + this.height > this.canvas.height){
                    this.y = this.yStandingPosition;
                }
            }else
            {
               this.falling = false;
               this.jumpInProgress=false;
            }
        }
    }
    run(gameSpeed, frameTimeDelta){
        //When the animation timer goes under 0, change the image to create animation
        if(this.walkAnimationTimer <=0){
            if(this.image===this.dinoRunImages[0]){
                this.image=this.dinoRunImages[1];
            }else{
                this.image=this.dinoRunImages[0];
            }
            this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
        }
        //Decrease the animation timer every frame
        this.walkAnimationTimer -= frameTimeDelta * gameSpeed;

    }
    draw(){
        this.ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
    }
}