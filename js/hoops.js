// Arcade Hoops Game Logic

class ArcadeHoops {
    constructor() {
        this.currency = new UniversalCurrency();
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 800;

        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.shotsMade = 0;
        this.totalShots = 0;
        this.timeLeft = 60;
        this.difficulty = 'normal';
        this.gameActive = true;
        this.powerUps = [];

        // Basketball object
        this.ball = {
            x: this.canvas.width / 2,
            y: 700,
            radius: 12,
            vx: 0,
            vy: 0,
            charging: false,
            chargeAmount: 0
        };

        // Hoop position
        this.hoop = {
            x: this.canvas.width / 2,
            y: 100,
            radius: 35,
            bobAmount: 0
        };

        // Aim line
        this.aimX = 0;
        this.aimY = 0;
        this.aimDistance = 100;

        this.startCountdown();
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', () => this.shoot());
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchstart', () => this.shoot());

        document.getElementById('btnPlayAgain').addEventListener('click', () => location.reload());
        document.getElementById('btnMainMenu').addEventListener('click', () => window.location.href = 'index.html');
    }

    setDifficulty(level) {
        this.difficulty = level;
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        const dx = x - this.ball.x;
        const dy = y - this.ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.aimX = (dx / distance) * this.aimDistance;
            this.aimY = (dy / distance) * this.aimDistance;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);

        const dx = x - this.ball.x;
        const dy = y - this.ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.aimX = (dx / distance) * this.aimDistance;
            this.aimY = (dy / distance) * this.aimDistance;
        }
    }

    shoot() {
        if (!this.gameActive || this.ball.vx !== 0 || this.ball.vy !== 0) return;

        const speeds = { easy: 8, normal: 12, hard: 16 };
        const speed = speeds[this.difficulty] || 12;
        const distance = Math.sqrt(this.aimX * this.aimX + this.aimY * this.aimY);

        this.ball.vx = (this.aimX / distance) * speed;
        this.ball.vy = (this.aimY / distance) * speed;
        this.totalShots++;
    }

    startCountdown() {
        const countdown = setInterval(() => {
            this.timeLeft--;
            this.updateHUD();

            if (this.timeLeft <= 0) {
                clearInterval(countdown);
                this.gameOver();
            }
        }, 1000);
    }

    gameLoop() {
        if (!this.gameActive) return;

        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.ball.vx === 0 && this.ball.vy === 0) return;

        // Apply physics
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        this.ball.vy += 0.4; // Gravity

        // Bounce off walls
        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.vx *= -0.8;
            this.ball.x = Math.max(this.ball.radius, Math.min(this.canvas.width - this.ball.radius, this.ball.x));
        }

        if (this.ball.y - this.ball.radius < 0) {
            this.ball.vy *= -0.8;
            this.ball.y = Math.max(this.ball.radius, this.ball.y);
        }

        // Check if ball went into hoop
        const hoopDist = Math.sqrt(
            Math.pow(this.ball.x - this.hoop.x, 2) +
            Math.pow(this.ball.y - this.hoop.y, 2)
        );

        if (hoopDist < this.hoop.radius - 5) {
            this.scorePoints();
            this.resetBall();
        }

        // Check if ball went off screen (reset)
        if (this.ball.y > this.canvas.height + 100) {
            this.combo = 0;
            this.resetBall();
        }

        // Update hoop bobbing
        this.hoop.bobAmount = Math.sin(Date.now() / 500) * 5;
    }

    scorePoints() {
        const baseScore = 100;
        this.combo++;
        this.shotsMade++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        const multiplier = 1 + (this.combo - 1) * 0.5;
        const points = Math.floor(baseScore * multiplier);
        this.score += points;
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = 700;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#55efc4';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw court lines
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);

        // Draw hoop
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(this.hoop.x, this.hoop.y + this.hoop.bobAmount, this.hoop.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw backboard
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.hoop.x - 60, this.hoop.y - 80, 120, 100);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.hoop.x - 60, this.hoop.y - 80, 120, 100);

        // Draw aim line
        if (this.ball.vx === 0 && this.ball.vy === 0) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ball.x, this.ball.y);
            this.ctx.lineTo(this.ball.x + this.aimX * 2, this.ball.y + this.aimY * 2);
            this.ctx.stroke();
        }

        // Draw ball
        this.ctx.fillStyle = '#ff8c42';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    updateHUD() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('comboDisplay').textContent = this.combo + 'x';
        document.getElementById('shotsDisplay').textContent = `${this.shotsMade} / ${this.totalShots}`;
        document.getElementById('timeDisplay').textContent = this.timeLeft;
    }

    gameOver() {
        this.gameActive = false;
        const accuracy = this.totalShots > 0 ? Math.floor((this.shotsMade / this.totalShots) * 100) : 0;

        document.getElementById('gameOverModal').classList.add('show');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalShots').textContent = this.shotsMade;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        document.getElementById('finalCombo').textContent = this.maxCombo + 'x';
    }
}

// Make setDifficulty globally accessible
function setDifficulty(level) {
    if (game) game.setDifficulty(level);
}

let game;
window.addEventListener('load', () => {
    game = new ArcadeHoops();
});
