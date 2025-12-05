// Lucky Slots Casino Game Logic

const SYMBOLS = ['🍒', '🍊', '🍋', '🔔', '7️⃣'];
const PAYLINES = {
    '🍒🍒🍒': 5,
    '🍊🍊🍊': 8,
    '🍋🍋🍋': 10,
    '🔔🔔🔔': 15,
    '7️⃣7️⃣7️⃣': 50
};

class SlotsGame {
    constructor() {
        this.balance = 500;
        this.startBalance = 500;
        this.currentBet = 10;
        this.totalSpins = 0;
        this.wins = 0;
        this.losses = 0;
        this.gameActive = true;
        this.reels = ['🍒', '🍒', '🍒'];
        this.isSpinning = false;

        this.setupEventListeners();
        this.render();
        this.loadGameState();
    }

    setupEventListeners() {
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        document.getElementById('customBet').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const amount = parseInt(document.getElementById('customBet').value);
                if (amount > 0 && amount <= this.balance) {
                    this.currentBet = amount;
                    this.render();
                }
            }
        });
        document.getElementById('btnPlayAgain').addEventListener('click', () => location.reload());
        document.getElementById('btnMainMenu').addEventListener('click', () => window.location.href = 'index.html');
    }

    setBet(amount) {
        if (amount <= this.balance) {
            this.currentBet = amount;
            document.getElementById('customBet').value = '';
            this.render();
        }
    }

    async spin() {
        if (this.isSpinning || !this.gameActive || this.currentBet > this.balance) return;

        this.isSpinning = true;
        this.balance -= this.currentBet;
        this.totalSpins++;
        document.getElementById('spinBtn').disabled = true;

        // Animate spinning
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        
        for (let i = 0; i < 20; i++) {
            this.reels[0] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            this.reels[1] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            this.reels[2] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            reels.forEach((reel, idx) => reel.textContent = this.reels[idx]);
            await new Promise(r => setTimeout(r, 50));
        }

        // Final result
        this.reels = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];

        reels.forEach((reel, idx) => reel.textContent = this.reels[idx]);

        this.checkResult();
        this.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;

        this.render();
    }

    checkResult() {
        const result = this.reels.join('');
        let winAmount = 0;

        // Check three of a kind
        if (this.reels[0] === this.reels[1] && this.reels[1] === this.reels[2]) {
            const key = result;
            winAmount = (PAYLINES[key] || 0) * this.currentBet;
            
            if (winAmount > 0) {
                this.balance += winAmount;
                this.wins++;
                
                if (this.reels[0] === '7️⃣') {
                    document.getElementById('resultMessage').className = 'result-message jackpot';
                    document.getElementById('resultMessage').textContent = `🎉 JACKPOT! Won $${winAmount}!`;
                } else {
                    document.getElementById('resultMessage').className = 'result-message win';
                    document.getElementById('resultMessage').textContent = `✓ You Won $${winAmount}!`;
                }
            }
        } else if (this.reels[0] !== this.reels[1] || this.reels[1] !== this.reels[2]) {
            // Mixed match - return bet
            this.balance += this.currentBet;
            this.wins++;
            document.getElementById('resultMessage').className = 'result-message win';
            document.getElementById('resultMessage').textContent = `Partial Match! Won $${this.currentBet}!`;
        } else {
            this.losses++;
            document.getElementById('resultMessage').className = 'result-message loss';
            document.getElementById('resultMessage').textContent = `✗ You Lost $${this.currentBet}`;
        }

        if (this.balance <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameActive = false;
        const profit = this.balance - this.startBalance;
        document.getElementById('gameOverModal').classList.add('show');
        document.getElementById('finalStartBalance').textContent = `$${this.startBalance}`;
        document.getElementById('finalBalance').textContent = `$${Math.max(0, this.balance)}`;
        document.getElementById('finalProfit').textContent = `${profit >= 0 ? '+' : ''}$${profit}`;
        document.getElementById('finalSpins').textContent = this.totalSpins;
        document.getElementById('gameOverTitle').textContent = profit >= 0 ? '🎉 YOU WON!' : 'GAME OVER';
    }

    render() {
        document.getElementById('balance').textContent = this.balance;
        document.getElementById('currentBet').textContent = this.currentBet;
        document.getElementById('totalSpins').textContent = this.totalSpins;
        document.getElementById('winLossRatio').textContent = `${this.wins} / ${this.losses}`;
        
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        reels.forEach((reel, idx) => reel.textContent = this.reels[idx]);
    }

    loadGameState() {
        const saved = localStorage.getItem('slotsGameState');
        if (saved) {
            const state = JSON.parse(saved);
            this.balance = state.balance || 500;
        }
    }

    saveGameState() {
        localStorage.setItem('slotsGameState', JSON.stringify({ balance: this.balance }));
    }
}

// Make setBet globally accessible
function setBet(amount) {
    game.setBet(amount);
}

let game;
window.addEventListener('load', () => {
    game = new SlotsGame();
});
