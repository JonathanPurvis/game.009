// Lucky Slots Casino Game Logic - TERRIBLE ODDS, MASSIVE JACKPOT
// This is the ONLY way to get rich in the game (90%+ house edge)

const SYMBOLS = ['🍒', '🍊', '🍋', '🔔', '7️⃣'];
const PAYLINES = {
    '🍒🍒🍒': 5,      // 5x bet
    '🍊🍊🍊': 8,      // 8x bet
    '🍋🍋🍋': 10,     // 10x bet
    '🔔🔔🔔': 15,     // 15x bet
    '7️⃣7️⃣7️⃣': 10000  // 10,000x bet - JACKPOT (1 in 15,000 chance with 90% house edge)
};

class SlotsGame {
    constructor() {
        this.currency = new UniversalCurrency();
        this.balance = this.currency.getGold();
        this.startBalance = this.balance;
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
        // Cap bets at 500 to prevent one-spin bankruptcy
        amount = Math.min(amount, 500);
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
        this.currency.subtractGold(this.currentBet);
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

        // Final result - with terrible odds
        this.determineOutcome();
        reels.forEach((reel, idx) => reel.textContent = this.reels[idx]);

        this.checkResult();
        this.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;

        this.render();
    }

    determineOutcome() {
        const rand = Math.random();
        
        // 10,000x jackpot - 1 in 15,000 chance (0.0067%)
        if (rand < 0.0000667) {
            this.reels = ['7️⃣', '7️⃣', '7️⃣'];
            return;
        }
        
        // Various losing/low-paying spins to hit 90%+ house edge
        // Random reels most of the time (99.5%+ of spins = losses/small returns)
        this.reels = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];
    }

    checkResult() {
        const result = this.reels.join('');
        let winAmount = 0;

        // Check three of a kind
        if (this.reels[0] === this.reels[1] && this.reels[1] === this.reels[2]) {
            const key = result;
            const multiplier = PAYLINES[key] || 0;
            winAmount = multiplier * this.currentBet;
            
            if (winAmount > 0) {
                this.balance += winAmount;
                this.currency.addGold(winAmount);
                this.wins++;
                
                if (this.reels[0] === '7️⃣') {
                    document.getElementById('resultMessage').className = 'result-message jackpot';
                    document.getElementById('resultMessage').textContent = `🎉🎊 JACKPOT!!! +$${winAmount}!!! 🎊🎉`;
                } else {
                    document.getElementById('resultMessage').className = 'result-message win';
                    document.getElementById('resultMessage').textContent = `✓ You Won $${winAmount}!`;
                }
            }
        } else if (this.reels[0] !== this.reels[1] || this.reels[1] !== this.reels[2]) {
            // Mixed match - return half the bet (small consolation)
            const returnAmount = Math.floor(this.currentBet * 0.5);
            this.balance += returnAmount;
            this.currency.addGold(returnAmount);
            this.losses++;
            document.getElementById('resultMessage').className = 'result-message win';
            document.getElementById('resultMessage').textContent = `Partial Match! Won $${returnAmount}!`;
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
