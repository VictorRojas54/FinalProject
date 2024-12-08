//Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const canvasWidth = 800;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Loads mario and background images
const marioImage = new Image();
marioImage.src = './images/mario.png';

const backgroundImage = new Image();
backgroundImage.src = './images/background.png';

// Loads pipe images
const pipeImages = [];
for (let i = 1; i <= 10; i++) {
    const pipeImg = new Image();
    pipeImg.src = `./images/pipe${i}.png`;
    pipeImages.push(pipeImg);
}

// Game settings
const mario = {
    x: 50,
    y: canvasHeight - 70,
    width: 50,
    height: 50,
    jumpHeight: 18,
    velocityY: 0,
    gravity: 0.6,
    isJumping: false
};

const pipes = [];
const pipeWidth = 50;
const pipeSpeed = 3;

// Pipe height range
const maxPipeHeight = 150;
const minPipeHeight = 50;
let lastPipeSpawnTime = 0;
const pipeSpawnInterval = 3000;

// Game Variables
let score = 0;
let gameOver = false;
let lastTime = 0;
let gameStartTime = 0;

//Mario jump function
function jump() {
    if (!mario.isJumping) {
        mario.velocityY = -mario.jumpHeight;
        mario.isJumping = true;
    }
}

function update(timestamp) {
    if (gameOver) return;

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Adds gravity to Mario
    mario.y += mario.velocityY;
    mario.velocityY += mario.gravity;

    // Makes sure mario doesn't fall off the screen
    if (mario.y > canvasHeight - mario.height) {
        mario.y = canvasHeight - mario.height;
        mario.velocityY = 0;
        mario.isJumping = false;
    }

    // Moves the pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }
    });

    // Collision of pipes
    pipes.forEach(pipe => {
        if (mario.x + mario.width > pipe.x && mario.x < pipe.x + pipeWidth) {
            if (mario.y + mario.height > pipe.y) {
                gameOver = true;
            }
        }
    });

    // Creates new pipes
    if (timestamp - lastPipeSpawnTime > pipeSpawnInterval) {
        lastPipeSpawnTime = timestamp;
        const bottomPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight)) + minPipeHeight;
        const randomPipeImage = pipeImages[Math.floor(Math.random() * pipeImages.length)];
        pipes.push({
            x: canvasWidth,
            y: canvasHeight - bottomPipeHeight,
            image: randomPipeImage,
            height: bottomPipeHeight
        });
    }

    //Calculation for score
    if (!gameOver) {
        score = Math.floor((timestamp - gameStartTime) / 1000);
    }

    draw();
    requestAnimationFrame(update);
}

// Draw all elements
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw scrolling background
    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(backgroundImage, canvasWidth, 0, canvasWidth, canvasHeight);

    // Draw Mario
    if (marioImage.complete) {
        ctx.drawImage(marioImage, mario.x, mario.y, mario.width, mario.height);
    }

    // Draw pipes
    pipes.forEach(pipe => {
        if (pipe.image.complete) {
            ctx.drawImage(pipe.image, pipe.x, pipe.y, pipeWidth, pipe.height);
        }
    });

    // Display Score
    scoreDisplay.textContent = `Time: ${score}`;

    // Display for game over and restart
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '48px Arial';
        const gameOverWidth = ctx.measureText('Game Over!').width;
        ctx.fillText('Game Over!', (canvasWidth - gameOverWidth) / 2, canvasHeight / 2 - 20);

        ctx.font = '24px Arial';
        const restartMessage = "Press 'R' to Restart";
        const restartMessageWidth = ctx.measureText(restartMessage).width;
        ctx.fillText(restartMessage, (canvasWidth - restartMessageWidth) / 2, canvasHeight / 2 + 30);
    }
}

// Inputs for jumping and retarting
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        jump();
    }
    if (e.code === 'KeyR' && gameOver) {
        resetGame();
    }
});

//Reset game state
function resetGame() {
    score = 0;
    mario.y = canvasHeight - 70;
    mario.velocityY = 0;
    mario.isJumping = false;
    pipes.length = 0;
    gameOver = false;
    lastPipeSpawnTime = 0;
    lastTime = 0;
    gameStartTime = performance.now();
    requestAnimationFrame(update);
}

// Waits for all the images before the game starts
Promise.all([
    new Promise((resolve) => marioImage.onload = resolve),
    new Promise((resolve) => backgroundImage.onload = resolve),
    ...pipeImages.map(pipeImg => new Promise((resolve) => pipeImg.onload = resolve))
])
.then(() => {
    gameStartTime = performance.now();
    requestAnimationFrame(update);
});
