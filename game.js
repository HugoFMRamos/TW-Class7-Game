const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

//Player
const player = {
    x: 40,
    y: 560,
    r: 10
};

//Tilt
let tiltX = 0;
let tiltY = 0;

const border = [
      { x: 0,   y: 0,   w: 400, h: 10 },
      { x: 0,   y: 590, w: 400, h: 10 },
      { x: 0,   y: 0,   w: 10,  h: 600 },
      { x: 390, y: 0,   w: 10,  h: 600 },
]

let lastTime = 0;
let gameStarted = false;

// Request permission on iOS / some browsers
async function enableOrientation() {
    try {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
        window.addEventListener("deviceorientation", handleOrientation);
        statusEl.textContent = "Sensores ativados! Jogo em curso.";
        gameStarted = true;
        } else {
        statusEl.textContent = "Permissão negada. Não é possível usar o sensor de movimento.";
        }
    } else {
        // Android / outros
        window.addEventListener("deviceorientation", handleOrientation);
        statusEl.textContent = "Sensores ativados! Jogo em curso.";
        gameStarted = true;
    }
    } catch (err) {
    console.error(err);
    statusEl.textContent = "Erro ao tentar aceder ao sensor de movimento.";
    }
}

let coins = [];

function generateCoin() {
    let valid = false;
    let coin = {};

    while (!valid) {
        coin = {
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            r: 8,
            collected: false
        };

        //Check collision
        valid = true;
        for(const wall of border) {
            if(circleRectCollision(coin.x, coin.y, coin.r + 2, wall)) {
                valid = false;
                break;
            }
        }
    }
    coins.push(coin);
}

function handleOrientation(event) {
    tiltX = event.gamma || 0;
    tiltY = event.beta || 0;
}

startBtn.addEventListener("click", () => {
    enableOrientation();
})

//Handle Collisions
function circleRectCollision(px, py, pr, rect) {
    const closestX = Math.max(rect.x, Math.min(px, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(py, rect.y + rect.h));
    const dx = px - closestX;
    const dy = py - closestY;
    return (dx * dx + dy * dy) < (pr * pr);
}

let collectedTotal = 0; // track total collected

function update(dt) {
    if (!gameStarted) return;

    const maxSpeed = 4;
    const vx = (tiltX / 45) * maxSpeed;
    const vy = (tiltY / 45) * maxSpeed;

    let oldx = player.x;
    player.x += vx * dt;
    for (const wall of border) {
        if (circleRectCollision(player.x, player.y, player.r, wall)) {
            player.x = oldx;
            break;
        }
    }

    let oldy = player.y;
    player.y += vy * dt;
    for (const wall of border) {
        if (circleRectCollision(player.x, player.y, player.r, wall)) {
            player.y = oldy;
            break;
        }
    }

    // Keep player inside canvas
    if (player.x - player.r < 0) player.x = player.r;
    if (player.x + player.r > canvas.width) player.x = canvas.width - player.r;
    if (player.y - player.r < 0) player.y = player.r;
    if (player.y + player.r > canvas.height) player.y = canvas.height - player.r;

    // Check for coin collection
    for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        const dx = player.x - c.x;
        const dy = player.y - c.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < (player.r + c.r) * (player.r + c.r)) {
            coins.splice(i, 1);  // remove collected coin
            generateCoin();      // add new one
            collectedTotal++;
        }
    }

    statusEl.textContent = `You’ve collected ${collectedTotal} coins!`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#bebebeff";
    
    ctx.fillStyle = "#eeeeeeff";
    border.forEach(w => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
    });

    coins.forEach(c => {
        if(!c.collected) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fillStyle = "gold";
            ctx.fill();
            ctx.lineWitdh = 2;
            ctx.strokeStyle = "#b8860b";
            ctx.stroke();
        }
    });

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff0a0aff";
    ctx.fill();
    ctx.lineWitdh = 2;
    ctx.strokeStyle = "#660000ff";
    ctx.stroke();
}

function loop(timestamp) {
    if(!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 16.67;
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

generateCoin();
requestAnimationFrame(loop);