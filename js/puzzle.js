// Puzzle Masters Game Logic

const PUZZLE_TYPES = [
    { type: 'memory', name: 'Memory Match', difficulty: 1 },
    { type: 'sequence', name: 'Number Sequence', difficulty: 1.2 },
    { type: 'tiles', name: 'Tile Match', difficulty: 1.1 }
];

class PuzzleMastersGame {
    constructor() {
        this.currency = new UniversalCurrency();
        this.level = 1;
        this.score = 0;
        this.streak = 0;
        this.timeLeft = 60;
        this.gameActive = true;
        this.startTime = Date.now();
        this.hintCount = 3;
        this.currentPuzzleType = PUZZLE_TYPES[0];
        this.puzzleData = {};

        this.setupEventListeners();
        this.startCountdown();
        this.generatePuzzle();
    }

    setupEventListeners() {
        document.getElementById('submitBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('btnPlayAgain').addEventListener('click', () => location.reload());
        document.getElementById('btnMainMenu').addEventListener('click', () => window.location.href = 'index.html');
    }

    startCountdown() {
        const countdown = setInterval(() => {
            this.timeLeft--;
            document.getElementById('time').textContent = `${this.timeLeft}s`;
            
            if (this.timeLeft <= 0) {
                clearInterval(countdown);
                this.gameOver();
            }
        }, 1000);
    }

    generatePuzzle() {
        const puzzleType = this.currentPuzzleType.type;

        if (puzzleType === 'memory') {
            this.generateMemoryPuzzle();
        } else if (puzzleType === 'sequence') {
            this.generateSequencePuzzle();
        } else if (puzzleType === 'tiles') {
            this.generateTilePuzzle();
        }

        this.render();
    }

    generateMemoryPuzzle() {
        const pairs = 8;
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

        const content = document.getElementById('puzzleContent');
        content.innerHTML = '<div class="memory-grid" id="memoryGrid"></div>';
        const grid = document.getElementById('memoryGrid');

        this.puzzleData = {
            cards: cards.map(emoji => ({ emoji, revealed: false, matched: false })),
            selected: [],
            pairs: 0
        };

        this.puzzleData.cards.forEach((card, idx) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.textContent = '?';
            cardEl.onclick = () => this.flipMemoryCard(idx);
            grid.appendChild(cardEl);
        });

        document.getElementById('hintText').textContent = 'Find all matching pairs!';
    }

    flipMemoryCard(idx) {
        const card = this.puzzleData.cards[idx];
        if (card.matched || card.revealed || this.puzzleData.selected.length >= 2) return;

        card.revealed = true;
        this.puzzleData.selected.push(idx);

        const cards = document.querySelectorAll('.memory-card');
        cards[idx].classList.add('revealed');
        cards[idx].textContent = card.emoji;

        if (this.puzzleData.selected.length === 2) {
            setTimeout(() => this.checkMemoryMatch(), 500);
        }
    }

    checkMemoryMatch() {
        const [idx1, idx2] = this.puzzleData.selected;
        const card1 = this.puzzleData.cards[idx1];
        const card2 = this.puzzleData.cards[idx2];
        const cards = document.querySelectorAll('.memory-card');

        if (card1.emoji === card2.emoji) {
            card1.matched = true;
            card2.matched = true;
            cards[idx1].classList.add('matched');
            cards[idx2].classList.add('matched');
            this.puzzleData.pairs++;

            if (this.puzzleData.pairs === 8) {
                this.completePuzzle();
            }
        } else {
            card1.revealed = false;
            card2.revealed = false;
            cards[idx1].classList.remove('revealed');
            cards[idx2].classList.remove('revealed');
            cards[idx1].textContent = '?';
            cards[idx2].textContent = '?';
        }

        this.puzzleData.selected = [];
    }

    generateSequencePuzzle() {
        const numbers = [2, 4, 8, 16, 32];
        const sequence = [];
        let current = 1;
        for (let i = 0; i < 5; i++) {
            current *= numbers[i];
            sequence.push(current);
        }

        const shuffled = [...sequence].sort(() => Math.random() - 0.5);
        const content = document.getElementById('puzzleContent');
        content.innerHTML = '<div class="sequence-inputs"></div>';
        const container = content.querySelector('.sequence-inputs');

        this.puzzleData = { sequence, selected: [] };

        shuffled.forEach((num, idx) => {
            const input = document.createElement('div');
            input.className = 'sequence-input';
            input.textContent = num;
            input.onclick = () => {
                input.classList.toggle('selected');
                if (input.classList.contains('selected')) {
                    this.puzzleData.selected.push(num);
                } else {
                    this.puzzleData.selected = this.puzzleData.selected.filter(n => n !== num);
                }
            };
            container.appendChild(input);
        });

        document.getElementById('hintText').textContent = 'Click numbers in ascending order to form a doubling sequence!';
    }

    generateTilePuzzle() {
        const emojis = ['🔥', '❄️', '⚡', '💧', '🌍', '🌪️', '💨', '🪨', '🌙'];
        const selected = emojis.slice(0, 9);
        const answer = selected[0];

        const content = document.getElementById('puzzleContent');
        content.innerHTML = '<div class="tile-grid" id="tileGrid"></div>';
        const grid = document.getElementById('tileGrid');

        this.puzzleData = { answer, selected: null };

        selected.forEach((emoji, idx) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = emoji;
            tile.onclick = () => this.selectTile(tile, emoji);
            grid.appendChild(tile);
        });

        document.getElementById('hintText').textContent = 'Select the tile that matches the pattern!';
    }

    selectTile(element, emoji) {
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
        element.classList.add('selected');
        this.puzzleData.selected = emoji;
    }

    checkAnswer() {
        if (this.currentPuzzleType.type === 'memory') {
            if (this.puzzleData.pairs === 8) {
                this.completePuzzle();
            }
        } else if (this.currentPuzzleType.type === 'sequence') {
            const isCorrect = JSON.stringify(this.puzzleData.selected) === JSON.stringify(this.puzzleData.sequence);
            if (isCorrect) {
                this.completePuzzle();
            } else {
                this.streak = 0;
                document.getElementById('hintText').textContent = '❌ Incorrect order. Try again!';
            }
        } else if (this.currentPuzzleType.type === 'tiles') {
            if (this.puzzleData.selected === this.puzzleData.answer) {
                this.completePuzzle();
            } else {
                this.streak = 0;
                document.getElementById('hintText').textContent = '❌ Wrong tile. Try again!';
            }
        }
    }

    showHint() {
        if (this.hintCount <= 0) {
            document.getElementById('hintText').textContent = '💡 No hints left!';
            return;
        }
        this.hintCount--;
        // Hint logic based on puzzle type
        document.getElementById('hintText').textContent = '💡 Here\'s a hint! Check the puzzle carefully.';
    }

    completePuzzle() {
        this.score += (100 + (this.timeLeft * 5)) * (1 + this.streak * 0.1);
        this.streak++;
        this.level++;

        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('streak').textContent = this.streak;

        // Change puzzle type on level up
        const puzzleIdx = (this.level - 1) % PUZZLE_TYPES.length;
        this.currentPuzzleType = PUZZLE_TYPES[puzzleIdx];
        document.getElementById('puzzleType').textContent = this.currentPuzzleType.name;

        setTimeout(() => this.generatePuzzle(), 1000);
    }

    gameOver() {
        this.gameActive = false;
        document.getElementById('gameOverModal').classList.add('show');
        document.getElementById('gameOverTitle').textContent = `Level ${this.level} Reached!`;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('finalStreak').textContent = this.streak;
        document.getElementById('finalTime').textContent = Math.floor((Date.now() - this.startTime) / 1000);
    }

    render() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('streak').textContent = this.streak;
    }
}

window.addEventListener('load', () => {
    new PuzzleMastersGame();
});
