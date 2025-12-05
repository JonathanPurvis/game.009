// Space Runner Game Logic

class SpaceRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 800;

        this.playerX = this.canvas.width / 2;
        this.playerY = this.canvas.height - 100;
        this.playerWidth = 30;
        this.playerHeight = 40;
        this.playerSpeed = 6;
        this.score = 0;
        this.distance = 0;
        this.shield = 100;
        this.maxShield = 100;
        this.multiplier = 1;
        this.gameActive = true;
        this.gameRunning = true;
        this.highScore = parseInt(localStorage.getItem('spaceRunnerHighScore') || 0);
        this.powerUpsCollected = 0;

        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];
        this.keys = {};

        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.dash();
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        document.getElementById('btnPlayAgain').addEventListener('click', () => location.reload());
        document.getElementById('btnMainMenu').addEventListener('click', () => window.location.href = 'index.html');
    }

    gameLoop() {
        if (!this.gameActive) {
            this.renderGameOver();
            return;
        }

        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Player movement
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.playerX = Math.max(this.playerWidth / 2, this.playerX - this.playerSpeed);
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.playerX = Math.min(this.canvas.width - this.playerWidth / 2, this.playerX + this.playerSpeed);
        }

        // Generate asteroids
        if (Math.random() < 0.04) {
            this.asteroids.push({
                x: Math.random() * this.canvas.width,
                y: -30,
                size: 20,
                speed: 3 + this.distance / 5000
            });
        }

        // Update asteroids
        this.asteroids.forEach((ast, idx) => {
            ast.y += ast.speed;
            if (ast.y > this.canvas.height) {
                this.asteroids.splice(idx, 1);
                this.distance += 10;
                this.score += 10 * this.multiplier;
            }
        });

        // Generate power-ups
        if (Math.random() < 0.01 && this.powerUps.length < 3) {
            this.powerUps.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                type: Math.random() < 0.6 ? 'shield' : 'multiplier',
                speed: 2,
                size: 15
            });
        }

        // Update power-ups
        this.powerUps.forEach((pu, idx) => {
            pu.y += pu.speed;
            if (pu.y > this.canvas.height) {
                this.powerUps.splice(idx, 1);
            }

            if (this.checkCollision(this.playerX, this.playerY, this.playerWidth, this.playerHeight, pu.x, pu.y, pu.size, pu.size)) {
                this.powerUps.splice(idx, 1);
                if (pu.type === 'shield') {
                    this.shield = Math.min(this.maxShield, this.shield + 25);
                } else {
                    this.multiplier = Math.min(5, this.multiplier + 0.5);
                }
                this.powerUpsCollected++;
                this.createParticles(pu.x, pu.y, '#00ff88');
            }
        });

        // Check asteroid collisions
        this.asteroids.forEach((ast, idx) => {
            if (this.checkCollision(this.playerX, this.playerY, this.playerWidth, this.playerHeight, ast.x, ast.y, ast.size, ast.size)) {
                this.asteroids.splice(idx, 1);
                this.shield -= 25;
                this.createParticles(ast.x, ast.y, '#ff4444');
                if (this.shield <= 0) {
                    this.shield = 0;
                    this.endGame();
                }
            }
        });

        // Update particles
        this.particles.forEach((p, idx) => {
            p.life--;
            p.x += p.vx;
            p.y += p.vy;
            if (p.life <= 0) {
                this.particles.splice(idx, 1);
            }
        });

        this.updateHUD();
    }

    dash() {
        if (this.shield >= 10) {
            this.shield -= 10;
            this.playerX += (this.keys['a'] || this.keys['arrowleft']) ? -80 : 80;
            this.playerX = Math.max(this.playerWidth / 2, Math.min(this.canvas.width - this.playerWidth / 2, this.playerX));
        }
    }

    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x, y, color,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                size: Math.random() * 5 + 2
            });
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars background
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 50 + this.distance / 5) % this.canvas.width;
            const y = (i * 16) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2);
        }

        // Draw asteroids
        this.ctx.fillStyle = '#ff6b6b';
        this.asteroids.forEach(ast => {
            this.ctx.beginPath();
            this.ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw power-ups
        this.powerUps.forEach(pu => {
            this.ctx.fillStyle = pu.type === 'shield' ? '#00ff88' : '#ffaa00';
            this.ctx.fillRect(pu.x - pu.size / 2, pu.y - pu.size / 2, pu.size, pu.size);
        });

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / 30;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
            this.ctx.globalAlpha = 1;
        });

        // Draw player
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(this.playerX - this.playerWidth / 2, this.playerY - this.playerHeight / 2, this.playerWidth, this.playerHeight);
        this.ctx.fillStyle = '#00cc6a';
        this.ctx.fillRect(this.playerX - this.playerWidth / 2 + 8, this.playerY - this.playerHeight / 2 + 5, this.playerWidth - 16, 10);
    }

    updateHUD() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('distanceDisplay').textContent = this.distance;
        document.getElementById('shieldDisplay').textContent = this.shield;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('multiplier').textContent = this.multiplier.toFixed(1) + 'x';
        document.getElementById('powerUpsCount').textContent = this.powerUpsCollected;
    }

    endGame() {
        this.gameActive = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceRunnerHighScore', this.highScore);
        }
    }

    renderGameOver() {
        setTimeout(() => {
            document.getElementById('gameOverModal').classList.add('show');
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('finalDistance').textContent = this.distance;
            document.getElementById('bestScore').textContent = this.highScore;
            document.getElementById('finalPowerUps').textContent = this.powerUpsCollected;
        }, 500);
    }
}

window.addEventListener('load', () => {
    new SpaceRunner();
});
