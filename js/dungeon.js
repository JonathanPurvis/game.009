// Epic Quest Dungeon Game Logic

const ENEMIES = [
    { name: 'Goblin', emoji: '👹', baseHealth: 30, level: 1, minDamage: 5, maxDamage: 10, xpReward: 50 },
    { name: 'Orc', emoji: '🗡️', baseHealth: 50, level: 2, minDamage: 8, maxDamage: 15, xpReward: 100 },
    { name: 'Troll', emoji: '👿', baseHealth: 80, level: 3, minDamage: 12, maxDamage: 20, xpReward: 150 },
    { name: 'Dragon', emoji: '🐉', baseHealth: 150, level: 4, minDamage: 20, maxDamage: 35, xpReward: 300 },
    { name: 'Demon Lord', emoji: '😈', baseHealth: 200, level: 5, minDamage: 30, maxDamage: 50, xpReward: 500 }
];

const ITEMS = [
    { name: 'Health Potion', emoji: '🧪', type: 'heal', effect: 30, quantity: 0, maxQuantity: 99 },
    { name: 'Mana Potion', emoji: '💜', type: 'mana', effect: 20, quantity: 0, maxQuantity: 99 },
    { name: 'Strength Elixir', emoji: '💪', type: 'buff', effect: 1.5, duration: 3, quantity: 0, maxQuantity: 5 },
    { name: 'Golden Apple', emoji: '🍎', type: 'heal', effect: 50, quantity: 0, maxQuantity: 3 }
];

class DungeonGame {
    constructor() {
        this.currency = new UniversalCurrency();
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.playerLevel = 1;
        this.playerXP = 0;
        this.playerXPToLevel = 100;
        this.currentFloor = 1;
        this.baseAttackMin = 5;
        this.baseAttackMax = 10;
        this.inventory = ITEMS.map(item => ({ ...item }));
        this.currentEnemy = null;
        this.gameActive = true;
        this.defendMode = false;
        this.strengthBuff = 0;
        this.enemiesDefeated = 0;
        this.totalXPEarned = 0;

        this.generateEnemy();
        this.render();
        this.setupEventListeners();
        this.loadGameState();
    }

    setupEventListeners() {
        document.getElementById('btnAttack').addEventListener('click', () => this.playerAttack());
        document.getElementById('btnAbility').addEventListener('click', () => this.playerAbility());
        document.getElementById('btnPotion').addEventListener('click', () => this.showPotionMenu());
        document.getElementById('btnDefend').addEventListener('click', () => this.playerDefend());
        document.getElementById('btnNewGame').addEventListener('click', () => location.reload());
        document.getElementById('btnMainMenu').addEventListener('click', () => window.location.href = 'index.html');
    }

    generateEnemy() {
        const difficultyMultiplier = 1 + (this.currentFloor - 1) * 0.2;
        const enemyTemplate = ENEMIES[Math.min(this.currentFloor - 1, ENEMIES.length - 1)];
        this.currentEnemy = {
            ...enemyTemplate,
            health: Math.floor(enemyTemplate.baseHealth * difficultyMultiplier),
            maxHealth: Math.floor(enemyTemplate.baseHealth * difficultyMultiplier),
            minDamage: Math.floor(enemyTemplate.minDamage * difficultyMultiplier),
            maxDamage: Math.floor(enemyTemplate.maxDamage * difficultyMultiplier)
        };
    }

    playerAttack() {
        if (!this.gameActive || !this.currentEnemy) return;

        const damage = this.calculateDamage();
        let enemyDamage = this.getRandomInt(this.currentEnemy.minDamage, this.currentEnemy.maxDamage);

        this.currentEnemy.health -= damage;
        this.addMessage(`⚔️ You hit for ${damage} damage!`, 'damage');

        if (this.currentEnemy.health <= 0) {
            this.enemyDefeated();
            return;
        }

        if (!this.defendMode) {
            this.playerHealth -= enemyDamage;
            this.addMessage(`🗡️ ${this.currentEnemy.name} attacks for ${enemyDamage} damage!`, 'enemy');
        } else {
            enemyDamage = Math.floor(enemyDamage * 0.3);
            this.playerHealth -= enemyDamage;
            this.addMessage(`🛡️ Blocked! ${this.currentEnemy.name} deals ${enemyDamage} damage!`, 'buff');
            this.defendMode = false;
        }

        if (this.playerHealth <= 0) {
            this.gameOver();
            return;
        }

        this.render();
    }

    playerAbility() {
        if (!this.gameActive || !this.currentEnemy) return;

        const damage = Math.floor(this.calculateDamage() * 1.5);
        const cost = 15;

        this.currentEnemy.health -= damage;
        this.addMessage(`✨ Special Attack for ${damage} damage!`, 'buff');

        if (this.currentEnemy.health <= 0) {
            this.enemyDefeated();
            return;
        }

        const enemyDamage = this.getRandomInt(
            Math.floor(this.currentEnemy.minDamage * 0.5),
            Math.floor(this.currentEnemy.maxDamage * 0.5)
        );
        this.playerHealth -= enemyDamage;
        this.addMessage(`🗡️ ${this.currentEnemy.name} counter-attacks for ${enemyDamage} damage!`, 'enemy');

        if (this.playerHealth <= 0) {
            this.gameOver();
            return;
        }

        this.render();
    }

    playerDefend() {
        if (!this.gameActive) return;
        this.defendMode = true;
        this.addMessage(`🛡️ Defending! Next attack damage reduced by 70%!`, 'buff');
        
        const enemyDamage = Math.floor(this.getRandomInt(this.currentEnemy.minDamage, this.currentEnemy.maxDamage) * 0.3);
        this.playerHealth -= enemyDamage;
        this.addMessage(`🗡️ ${this.currentEnemy.name} attacks for ${enemyDamage} damage!`, 'enemy');

        if (this.playerHealth <= 0) {
            this.gameOver();
            return;
        }

        this.render();
    }

    showPotionMenu() {
        const potions = this.inventory.filter(item => item.type === 'heal' && item.quantity > 0);
        if (potions.length === 0) {
            this.addMessage('❌ No potions available!', 'enemy');
            return;
        }

        const potion = potions[0];
        this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + potion.effect);
        potion.quantity--;
        this.addMessage(`💚 Used ${potion.name}! Healed ${potion.effect} HP!`, 'heal');
        this.render();
    }

    calculateDamage() {
        let damage = this.getRandomInt(this.baseAttackMin, this.baseAttackMax);
        damage = Math.floor(damage * (1 + this.playerLevel * 0.15));
        if (this.strengthBuff > 0) {
            damage = Math.floor(damage * 1.5);
            this.strengthBuff--;
        }
        return damage;
    }

    enemyDefeated() {
        // Minimal gold rewards (1-3 gold per enemy) - dungeon is NOT the path to wealth
        const baseGold = Math.max(1, Math.floor(this.currentEnemy.xpReward / 100));
        const goldReward = Math.min(3, baseGold + Math.floor(Math.random() * 2));
        this.currency.addGold(goldReward);
        
        this.playerXP += this.currentEnemy.xpReward;
        this.totalXPEarned += this.currentEnemy.xpReward;
        this.enemiesDefeated++;

        this.addMessage(`🎉 Victory! +${this.currentEnemy.xpReward} XP, +${goldReward}g!`, 'buff');

        if (this.playerXP >= this.playerXPToLevel) {
            this.levelUp();
        }

        this.currentFloor++;
        this.generateEnemy();
        this.render();
    }

    levelUp() {
        this.playerLevel++;
        this.playerXP = 0;
        this.playerXPToLevel = Math.floor(100 + (this.playerLevel - 1) * 50);
        this.playerMaxHealth = Math.floor(100 + (this.playerLevel - 1) * 15);
        this.playerHealth = this.playerMaxHealth;
        this.baseAttackMin = Math.floor(5 + (this.playerLevel - 1) * 2);
        this.baseAttackMax = Math.floor(10 + (this.playerLevel - 1) * 3);
        this.addMessage(`📈 Level Up! Now level ${this.playerLevel}!`, 'buff');
    }

    gameOver() {
        this.gameActive = false;
        document.getElementById('gameOverModal').classList.add('show');
        document.getElementById('finalFloors').textContent = this.currentFloor;
        document.getElementById('finalLevel').textContent = this.playerLevel;
        document.getElementById('finalXP').textContent = this.totalXPEarned;
        document.getElementById('finalEnemies').textContent = this.enemiesDefeated;
    }

    addMessage(text, type = 'normal') {
        const messageLog = document.getElementById('messageLog');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        messageLog.appendChild(message);
        messageLog.scrollTop = messageLog.scrollHeight;
    }

    render() {
        document.getElementById('playerHealthDisplay').textContent = `${this.playerHealth}/${this.playerMaxHealth}`;
        document.getElementById('playerLevel').textContent = this.playerLevel;
        document.getElementById('playerAttack').textContent = `${this.baseAttackMin}-${this.baseAttackMax}`;
        document.getElementById('playerXP').textContent = `${this.playerXP}/${this.playerXPToLevel}`;

        document.getElementById('enemyName').textContent = this.currentEnemy.name;
        document.getElementById('enemyEmoji').textContent = this.currentEnemy.emoji;
        const healthPercent = (this.currentEnemy.health / this.currentEnemy.maxHealth) * 100;
        document.getElementById('enemyHealth').style.width = `${Math.max(0, healthPercent)}%`;
        document.getElementById('enemyHealthText').textContent = `${Math.max(0, this.currentEnemy.health)}/${this.currentEnemy.maxHealth}`;

        document.getElementById('floorNumber').textContent = `Floor ${this.currentFloor}`;
        const floorNames = ['Goblin Warren', 'Orc Stronghold', 'Troll Bridge', 'Dragon Lair', 'Demon Abyss'];
        document.getElementById('floorDescription').textContent = floorNames[Math.min(this.currentFloor - 1, 4)];

        const inventoryContainer = document.getElementById('inventoryContainer');
        inventoryContainer.innerHTML = '';
        this.inventory.forEach(item => {
            if (item.quantity > 0) {
                const itemEl = document.createElement('div');
                itemEl.className = 'inventory-item';
                itemEl.textContent = `${item.emoji} ${item.name} ×${item.quantity}`;
                itemEl.title = item.effect ? `Effect: +${item.effect}` : '';
                inventoryContainer.appendChild(itemEl);
            }
        });
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    saveGameState() {
        const state = {
            floor: this.currentFloor,
            level: this.playerLevel,
            xp: this.totalXPEarned,
            enemies: this.enemiesDefeated
        };
        localStorage.setItem('dungeonGameState', JSON.stringify(state));
    }

    loadGameState() {
        // State loads from localStorage if needed
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new DungeonGame();
});
