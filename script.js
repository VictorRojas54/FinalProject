// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const saveIcon = document.getElementById('saveIcon');

const canvasWidth = 800;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Game variables
let score = 0;
let pipesPassed = 0;
let gameOver = false;
let lastTime = 0;
let gameStartTime = 0;

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
const maxPipeHeight = 150;
const minPipeHeight = 50;
let lastPipeSpawnTime = 0;
const pipeSpawnInterval = 3000;

// Image Loading
const marioImage = new Image();
const backgroundImage = new Image();
const pipeImages = [];
for (let i = 1; i <= 10; i++) {
    const pipeImg = new Image();
    pipeImg.src = `./images/pipe${i}.png`;
    pipeImages.push(pipeImg);
}

marioImage.src = './images/mario.png';
backgroundImage.src = './images/background.png';

// Preload images before starting the game
Promise.all([
    new Promise((resolve) => marioImage.onload = resolve),
    new Promise((resolve) => backgroundImage.onload = resolve),
    ...pipeImages.map(pipeImg => new Promise((resolve) => pipeImg.onload = resolve))
])
.then(() => {
    // Start the game once images are loaded
    gameStartTime = performance.now();
    requestAnimationFrame(update);
})
.catch(error => {
    console.error("Error loading images:", error);
});

// Game update function
function update(timestamp) {
    if (gameOver) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Apply gravity to Mario
    mario.y += mario.velocityY;
    mario.velocityY += mario.gravity;

    if (mario.y > canvasHeight - mario.height) {
        mario.y = canvasHeight - mario.height;
        mario.velocityY = 0;
        mario.isJumping = false;
    }

    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < mario.x && !pipe.passed) {
            pipe.passed = true;
            pipesPassed += 1;
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }
    });

    // Collision detection with pipes
    pipes.forEach(pipe => {
        if (mario.x + mario.width > pipe.x && mario.x < pipe.x + pipeWidth) {
            if (mario.y + mario.height > pipe.y) {
                gameOver = true;
            }
        }
    });

    // Spawn new pipes
    if (timestamp - lastPipeSpawnTime > pipeSpawnInterval) {
        lastPipeSpawnTime = timestamp;
        const bottomPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight)) + minPipeHeight;
        const randomPipeImage = pipeImages[Math.floor(Math.random() * pipeImages.length)];
        pipes.push({
            x: canvasWidth,
            y: canvasHeight - bottomPipeHeight,
            image: randomPipeImage,
            height: bottomPipeHeight,
            passed: false
        });
    }

    // Update score
    if (!gameOver) {
        score = Math.floor((timestamp - gameStartTime) / 1000);
    }

    // Draw everything
    draw();
    requestAnimationFrame(update);
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
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

    // Display score and pipes passed
    scoreDisplay.textContent = `Time: ${score} | Pipes Passed: ${pipesPassed}`;

    // Show Game Over message
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

// Keyboard event listener
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        jump();
    }
    if (e.code === 'KeyR' && gameOver) {
        resetGame();
    }
});

// Jump function
function jump() {
    if (!mario.isJumping) {
        mario.velocityY = -mario.jumpHeight;
        mario.isJumping = true;
    }
}

// Reset game state
function resetGame() {
    score = 0;
    pipesPassed = 0;
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
