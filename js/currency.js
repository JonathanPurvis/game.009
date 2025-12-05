// Universal Currency Manager
// All games share a single gold balance across localStorage

class UniversalCurrency {
    constructor() {
        this.STORAGE_KEY = 'universalGoldBalance';
        this.STARTING_GOLD = 100; // Scarce starting amount
        this.gold = this.loadGold();
    }

    loadGold() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved && !isNaN(parseInt(saved))) {
            return Math.max(0, parseInt(saved));
        }
        return this.STARTING_GOLD;
    }

    saveGold() {
        localStorage.setItem(this.STORAGE_KEY, Math.floor(this.gold).toString());
    }

    addGold(amount) {
        this.gold = Math.max(0, this.gold + amount);
        this.saveGold();
        return this.gold;
    }

    subtractGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.saveGold();
            return true;
        }
        return false;
    }

    getGold() {
        return Math.floor(this.gold);
    }

    setGold(amount) {
        this.gold = Math.max(0, amount);
        this.saveGold();
    }

    reset() {
        this.setGold(this.STARTING_GOLD);
    }
}

// Global currency instance
const currency = new UniversalCurrency();
