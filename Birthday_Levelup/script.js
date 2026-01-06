const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const xpFill = document.getElementById('xp-fill');
const scoreEl = document.getElementById('score');
const mainMsg = document.getElementById('main-msg');
const lvlText = document.getElementById('lvl-text');
const startOverlay = document.getElementById('start-overlay');
const uiLayer = document.getElementById('ui-layer');

// LOCAL AUDIO FILES
const clickSound = new Audio('click.mp3');
const winSound = new Audio('complete.mp3');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let shake = 0;
let particles = [];
let nodes = [];
let floatingTexts = [];
let gameActive = false;

// UNLOCK AND START
document.getElementById('start-btn').addEventListener('click', () => {
    startOverlay.style.display = 'none';
    uiLayer.style.display = 'flex';
    gameActive = true;
    
    // Play a short silent blip to wake up browser audio
    clickSound.volume = 0;
    clickSound.play().then(() => {
        clickSound.pause();
        clickSound.volume = 0.5;
        clickSound.currentTime = 0;
    });
});

class FloatingText {
    constructor(x, y, text) {
        this.x = x; this.y = y;
        this.text = text;
        this.opacity = 1;
    }
    update() { this.y -= 2; this.opacity -= 0.02; }
    draw() {
        ctx.fillStyle = `rgba(56, 189, 248, ${this.opacity})`;
        ctx.font = "bold 16px Orbitron";
        ctx.fillText(this.text, this.x, this.y);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02;
    }
}

class DataNode {
    constructor() {
        this.x = Math.random() * (canvas.width - 60) + 30;
        this.y = canvas.height + 50;
        this.size = 25;
        this.speed = Math.random() * 2 + 2;
    }
    draw() {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#38bdf8";
        ctx.stroke();
    }
    update() { this.y -= this.speed; }
}

function animate() {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (shake > 0) {
        ctx.save();
        ctx.translate(Math.random() * shake - shake/2, Math.random() * shake - shake/2);
        shake *= 0.9;
    }

    if (gameActive && Math.random() < 0.05) nodes.push(new DataNode());

    nodes.forEach((n, i) => {
        n.update(); n.draw();
        if (n.y < -50) nodes.splice(i, 1);
    });

    particles.forEach((p, i) => {
        p.update(); p.draw();
        if (p.alpha <= 0) particles.splice(i, 1);
    });

    floatingTexts.forEach((t, i) => {
        t.update(); t.draw();
        if (t.opacity <= 0) floatingTexts.splice(i, 1);
    });

    if (shake > 0) ctx.restore();
    requestAnimationFrame(animate);
}

window.addEventListener('mousedown', (e) => {
    if (!gameActive) return;
    
    nodes.forEach((n, i) => {
        const dist = Math.hypot(e.clientX - n.x, e.clientY - n.y);
        if (dist < 40) {
            // PLAY CLICK
            const s = clickSound.cloneNode();
            s.volume = 0.6;
            s.play();

            shake = 12;
            score += 10;
            scoreEl.innerText = Math.min(score, 100);
            xpFill.style.width = Math.min(score, 100) + "%";
            
            floatingTexts.push(new FloatingText(n.x, n.y, "+10 XP"));
            for(let j=0; j<15; j++) particles.push(new Particle(n.x, n.y, "#38bdf8"));
            nodes.splice(i, 1);
            
            if (score === 100) {
                gameActive = false;
                winSound.play();

                lvlText.innerText = "LEVEL 22";
                mainMsg.innerHTML = "LEVEL 22 DEPLOYED! 🚀<br><span style='font-size:1.2rem; color:#818cf8'>HAPPY BIRTHDAY NANDA PRASAD</span>";
                
                for(let k=0; k<120; k++) {
                    setTimeout(() => {
                        particles.push(new Particle(canvas.width/2, canvas.height/2, "#38bdf8"));
                    }, k * 8);
                }
            }
        }
    });
});

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});