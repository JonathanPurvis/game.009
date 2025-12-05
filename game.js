class FarmingGame {
    constructor() {
        this.grid = [];
        this.gridWidth = 1;
        this.gridHeight = 1;
        // Use universal currency system
        this.currency = new UniversalCurrency();
        this.energy = 100;
        this.maxEnergy = 100;
        this.day = 1;
        this.season = 'Spring';
        this.inventory = {};
        this.currentTool = null;
        this.pendingSeedTile = null;

        // Pet system - GACHA EGGS
        this.pets = new Set();
        this.petIncomeBoost = 1.0;
        this.eggs = {
            basic: { name: 'Basic Egg', price: 500, emoji: '🥚', pity: 50 },
            rare: { name: 'Rare Egg', price: 1500, emoji: '🟣', pity: 30 },
            exotic: { name: 'Exotic Egg', price: 5000, emoji: '✨', pity: 10 }
        };
        this.gacha = {
            basicPulls: 0,    // Pity counter for basic eggs
            rarePulls: 0,     // Pity counter for rare eggs
            exoticPulls: 0    // Pity counter for exotic eggs
        };

        // Upgrade system
        this.upgrades = {
            plow: { level: 0, radius: 0, cost: 1500 },
            water: { level: 0, radius: 0, cost: 2000 },
            harvest: { level: 0, radius: 0, cost: 2500 },
            plant: { level: 0, radius: 0, cost: 1200 },
            cropValue: { level: 0, multiplier: 1.0, cost: 1000 },
            land: { level: 0, cost: 2000 }
        };

        // Crop system - all crops available from start
        this.unlockedCrops = new Set();
        ALL_CROPS.forEach(crop => this.unlockedCrops.add(crop.id));

        this.initializeGrid();
        this.initializeInventory();
        this.loadGame();
        this.checkUnlocks();
        this.updatePetBoost();
        this.render();
        this.renderShop();
        this.renderPets();
        this.renderPetShop();
        this.renderUpgrades();
        this.showWelcomeScreen();
    }

    showWelcomeScreen() {
        const hasSeenTutorial = localStorage.getItem('tutorialSeen');
        if (!hasSeenTutorial) {
            const welcomeModal = document.getElementById('welcome-modal');
            if (welcomeModal) {
                welcomeModal.style.display = 'flex';
            }
        }
    }

    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridHeight; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridWidth; j++) {
                this.grid[i][j] = {
                    state: 'empty',
                    cropId: null,
                    growthDays: 0,
                    watered: false,
                    daysWatered: 0
                };
            }
        }
    }

    initializeInventory() {
        this.inventory = {};
        ALL_CROPS.forEach(crop => {
            this.inventory[crop.id] = 0;
        });
    }

    checkUnlocks() {
        this.unlockedCrops.clear();
        // All crops available from start
        ALL_CROPS.forEach(crop => this.unlockedCrops.add(crop.id));
    }

    selectTool(tool) {
        this.currentTool = tool;
        
        // Update button highlighting
        document.querySelectorAll('.btn-compact').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById(`btn-${tool}`).classList.add('selected');
        
        this.showMessage(`Selected: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
    }

    handleTileClick(row, col) {
        if (this.energy <= 0) {
            this.showMessage('Out of energy! Sleep to rest.');
            return;
        }

        const tile = this.grid[row][col];

        switch (this.currentTool) {
            case 'plow':
                this.plow(row, col);
                break;
            case 'water':
                this.water(row, col);
                break;
            case 'harvest':
                this.harvest(row, col);
                break;
            case 'seed':
                this.showSeedModal(row, col);
                break;
            case 'hoe':
                this.clearTile(row, col);
                break;
            default:
                this.showMessage('Select a tool first!');
                return;
        }
    }

    showSeedModal(row, col) {
        const tile = this.grid[row][col];
        if (tile.state !== 'plowed') {
            this.showMessage('Must plow the land first!');
            return;
        }

        this.pendingSeedTile = { row, col };
        const seedOptions = document.getElementById('seed-options');
        seedOptions.innerHTML = '';

        const unlockedList = Array.from(this.unlockedCrops);
        unlockedList.forEach(cropId => {
            const crop = getCropById(cropId);
            const hasSeeds = this.inventory[cropId] > 0;
            
            const option = document.createElement('div');
            option.className = `seed-option ${!hasSeeds ? 'locked' : ''}`;
            option.innerHTML = `
                <div class="emoji">${crop.emoji}</div>
                <div class="name">${crop.name}</div>
                <div class="cost">${crop.seedPrice}g</div>
                <div class="count" style="font-size: 10px; color: #2ecc71;">×${this.inventory[cropId]}</div>
            `;
            
            if (hasSeeds) {
                option.onclick = () => {
                    this.seed(row, col, cropId);
                    document.getElementById('seed-modal').style.display = 'none';
                };
            }
            
            seedOptions.appendChild(option);
        });

        document.getElementById('seed-modal').style.display = 'flex';
    }

    drawFromEgg(eggType) {
        const egg = this.eggs[eggType];
        if (!egg) return;

        if (!this.currency.subtractGold(egg.price)) {
            this.showMessage(`Not enough gold! Need ${egg.price}g`);
            return;
        }

        // Get a random pet based on rarity
        let pet;
        if (eggType === 'basic') {
            // Basic Egg: 60% Common, 40% Rare, pity at 50
            this.gacha.basicPulls++;
            if (this.gacha.basicPulls >= 50) {
                // Guaranteed rare
                const rarePets = PETS.rare;
                pet = rarePets[Math.floor(Math.random() * rarePets.length)];
                this.gacha.basicPulls = 0;
            } else {
                const roll = Math.random();
                if (roll < 0.6) {
                    const commonPets = PETS.common;
                    pet = commonPets[Math.floor(Math.random() * commonPets.length)];
                } else {
                    const rarePets = PETS.rare;
                    pet = rarePets[Math.floor(Math.random() * rarePets.length)];
                }
            }
        } else if (eggType === 'rare') {
            // Rare Egg: 70% Rare, 30% Exotic, pity at 30
            this.gacha.rarePulls++;
            if (this.gacha.rarePulls >= 30) {
                // Guaranteed exotic
                const exoticPets = PETS.exotic;
                pet = exoticPets[Math.floor(Math.random() * exoticPets.length)];
                this.gacha.rarePulls = 0;
            } else {
                const roll = Math.random();
                if (roll < 0.7) {
                    const rarePets = PETS.rare;
                    pet = rarePets[Math.floor(Math.random() * rarePets.length)];
                } else {
                    const exoticPets = PETS.exotic;
                    pet = exoticPets[Math.floor(Math.random() * exoticPets.length)];
                }
            }
        } else if (eggType === 'exotic') {
            // Exotic Egg: Guaranteed rare or higher, pity at 10
            this.gacha.exoticPulls++;
            if (this.gacha.exoticPulls >= 10) {
                // Guaranteed exotic
                const exoticPets = PETS.exotic;
                pet = exoticPets[Math.floor(Math.random() * exoticPets.length)];
                this.gacha.exoticPulls = 0;
            } else {
                const roll = Math.random();
                if (roll < 0.5) {
                    const rarePets = PETS.rare;
                    pet = rarePets[Math.floor(Math.random() * rarePets.length)];
                } else {
                    const exoticPets = PETS.exotic;
                    pet = exoticPets[Math.floor(Math.random() * exoticPets.length)];
                }
            }
        }

        if (pet && !this.pets.has(pet.id)) {
            this.pets.add(pet.id);
            this.updatePetBoost();
            this.showMessage(`✨ Got ${pet.name}! Income +${Math.round((pet.incomeBoost - 1) * 100)}%`);
        } else if (pet) {
            this.showMessage(`Already have ${pet.name}! Duplicate effect unknown (coming soon)`);
        }
        
        this.updateUI();
        this.renderPets();
        this.renderUpgrades();
        this.renderEggShop();
        this.saveGame();
    }

    updatePetBoost() {
        this.petIncomeBoost = 1.0;
        this.pets.forEach(petId => {
            const pet = getPetById(petId);
            if (pet) {
                this.petIncomeBoost *= pet.incomeBoost;
            }
        });
    }

    renderPets() {
        const petsDiv = document.getElementById('pets');
        if (!petsDiv) return;
        
        petsDiv.innerHTML = '';
        
        if (this.pets.size === 0) {
            petsDiv.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 10px;">No pets yet</div>';
            return;
        }

        const petList = Array.from(this.pets);
        petList.forEach(petId => {
            const pet = getPetById(petId);
            const div = document.createElement('div');
            div.className = 'pet-item';
            div.innerHTML = `
                <div class="pet-emoji">${pet.emoji}</div>
                <div class="pet-info">
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-boost">+${Math.round((pet.incomeBoost - 1) * 100)}% income</div>
                </div>
            `;
            petsDiv.appendChild(div);
        });
    }

    plow(row, col) {
        const tile = this.grid[row][col];
        if (tile.state === 'empty') {
            tile.state = 'plowed';
            this.energy -= 1;
            this.showMessage('Plowed land!');
            
            // AOE effect (only if upgraded)
            if (this.upgrades.plow.radius > 0) {
                this.applyAOE(row, col, this.upgrades.plow.radius, (r, c) => {
                    if (this.grid[r][c].state === 'empty') {
                        this.grid[r][c].state = 'plowed';
                    }
                });
            }
        } else if (tile.state === 'plowed') {
            this.showMessage('Land already plowed!');
        } else {
            this.showMessage('Clear the field first!');
        }
        this.updateUI();
        this.render();
        this.saveGame();
    }

    applyAOE(row, col, radius, callback) {
        for (let r = Math.max(0, row - radius); r <= Math.min(this.gridHeight - 1, row + radius); r++) {
            for (let c = Math.max(0, col - radius); c <= Math.min(this.gridWidth - 1, col + radius); c++) {
                if (r !== row || c !== col) {
                    callback(r, c);
                }
            }
        }
    }

    seed(row, col, cropId) {
        const tile = this.grid[row][col];
        if (tile.state !== 'plowed') {
            this.showMessage('Must plow the land first!');
            return false;
        }

        if (!this.inventory[cropId] || this.inventory[cropId] <= 0) {
            this.showMessage('No seeds in inventory!');
            return false;
        }

        tile.state = 'seeded';
        tile.cropId = cropId;
        tile.growthDays = 0;
        tile.watered = false;
        tile.daysWatered = 0;
        this.inventory[cropId]--;
        this.energy -= 1;
        
        const crop = getCropById(cropId);
        this.showMessage(`Planted ${crop.name}!`);
        
        // AOE planting effect (only if upgraded)
        if (this.upgrades.plant.radius > 0) {
            this.applyAOE(row, col, this.upgrades.plant.radius, (r, c) => {
                const t = this.grid[r][c];
                if (t.state === 'plowed' && this.inventory[cropId] > 0) {
                    t.state = 'seeded';
                    t.cropId = cropId;
                    t.growthDays = 0;
                    t.watered = false;
                    t.daysWatered = 0;
                    this.inventory[cropId]--;
                }
            });
        }
        
        this.updateUI();
        this.render();
        this.saveGame();
        return true;
    }

    water(row, col) {
        const tile = this.grid[row][col];
        if (tile.state === 'empty') {
            this.showMessage('Nothing to water!');
            return;
        }

        if (tile.state === 'watered') {
            this.showMessage('Already watered today!');
            return;
        }

        if (tile.state === 'seeded' || tile.state === 'growing') {
            this.waterTile(row, col);
            
            // AOE effect (only if upgraded)
            if (this.upgrades.water.radius > 0) {
                this.applyAOE(row, col, this.upgrades.water.radius, (r, c) => {
                    const t = this.grid[r][c];
                    if ((t.state === 'seeded' || t.state === 'growing') && !t.watered) {
                        this.waterTile(r, c);
                    }
                });
            }
        } else {
            this.showMessage('Cannot water this tile!');
        }
        this.updateUI();
        this.render();
    }

    waterTile(row, col) {
        const tile = this.grid[row][col];
        tile.watered = true;
        tile.daysWatered++;
        this.energy -= 1;
        
        if (tile.watered) {
            tile.growthDays++;
            const crop = getCropById(tile.cropId);
            if (tile.growthDays >= crop.growTime) {
                tile.state = 'harvestable';
                this.showMessage(`${crop.name} is ready to harvest!`);
            } else {
                tile.state = 'growing';
            }
        }
    }

    harvest(row, col) {
        const tile = this.grid[row][col];
        if (tile.state !== 'harvestable') {
            this.showMessage('Crop not ready to harvest!');
            return;
        }

        this.harvestTile(row, col);

        // AOE effect (only if upgraded)
        if (this.upgrades.harvest.radius > 0) {
            this.applyAOE(row, col, this.upgrades.harvest.radius, (r, c) => {
                if (this.grid[r][c].state === 'harvestable') {
                    this.harvestTile(r, c);
                }
            });
        }

        this.updateUI();
        this.render();
        this.saveGame();
    }

    harvestTile(row, col) {
        const tile = this.grid[row][col];
        const crop = getCropById(tile.cropId);
        // Very scarce rewards - 1-5 gold per harvest
        const baseValue = Math.min(3, Math.max(1, Math.floor(crop.harvestPrice / 20)));
        const value = Math.round(baseValue * this.upgrades.cropValue.multiplier * this.petIncomeBoost);
        this.currency.addGold(value);
        this.energy -= 2;
        
        this.showMessage(`Harvested ${crop.name} for ${value}g!`);
        
        tile.state = 'empty';
        tile.cropId = null;
        tile.growthDays = 0;
        tile.watered = false;
        tile.daysWatered = 0;
    }

    clearTile(row, col) {
        const tile = this.grid[row][col];
        if (tile.state === 'empty') {
            this.showMessage('Nothing to clear!');
            return;
        }

        tile.state = 'empty';
        tile.cropId = null;
        tile.growthDays = 0;
        tile.watered = false;
        tile.daysWatered = 0;
        this.energy -= 1;
        
        this.showMessage('Cleared the field!');
        this.updateUI();
        this.render();
        this.saveGame();
    }

    buySeed(cropId) {
        const crop = getCropById(cropId);
        if (!this.currency.subtractGold(crop.seedPrice)) {
            this.showMessage('Not enough gold!');
            return;
        }

        this.inventory[cropId]++;
        this.showMessage(`Bought ${crop.name} seed!`);
        this.updateUI();
        this.renderShop();
        this.renderPetShop();
        this.renderUpgrades();
        this.saveGame();
    }

    buyUpgrade(upgradeType) {
        let upgrade = this.upgrades[upgradeType];
        if (!this.currency.subtractGold(upgrade.cost)) {
            this.showMessage('Not enough gold!');
            return;
        }

        if (upgradeType === 'land') {
            this.upgrades.land.level++;
            const newSize = this.upgrades.land.level + 1;
            this.gridWidth = newSize;
            this.gridHeight = newSize;
            this.initializeGrid();
            this.upgrades.land.cost = Math.round(800 * Math.pow(1.6, this.upgrades.land.level));
            this.showMessage(`Land expanded to ${this.gridWidth}×${this.gridHeight}!`);
            this.render();
        } else if (upgradeType === 'cropValue') {
            this.upgrades.cropValue.level++;
            this.upgrades.cropValue.multiplier += 0.15;
            this.upgrades.cropValue.cost = Math.round(400 * Math.pow(1.6, this.upgrades.cropValue.level));
            this.showMessage(`Crop value increased by 15%!`);
        } else {
            this.upgrades[upgradeType].level++;
            this.upgrades[upgradeType].radius = this.upgrades[upgradeType].level;
            this.upgrades[upgradeType].cost = Math.round(this.upgrades[upgradeType].cost * 1.9);
            const toolName = upgradeType === 'plant' ? 'Plant' : (upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1));
            this.showMessage(`${toolName} AOE upgraded to radius ${this.upgrades[upgradeType].radius}!`);
        }

        this.updateUI();
        this.renderShop();
        this.renderPetShop();
        this.renderUpgrades();
        this.checkUnlocks();
        this.saveGame();
    }

    sleep() {
        if (this.energy < this.maxEnergy) {
            this.day++;
            this.energy = this.maxEnergy;
            this.currentTool = null;
            
            const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
            this.season = seasons[Math.floor((this.day - 1) / 30) % 4];
            
            for (let i = 0; i < this.gridHeight; i++) {
                for (let j = 0; j < this.gridWidth; j++) {
                    this.grid[i][j].watered = false;
                }
            }
            
            this.checkUnlocks();
            this.showMessage(`Day ${this.day} - ${this.season}`);
            this.updateUI();
            this.renderShop();
            this.renderPetShop();
            this.renderUpgrades();
            this.render();
            this.saveGame();
        } else {
            this.showMessage('You\'re not tired yet! Do more work first.');
        }
    }

    updateUI() {
        document.getElementById('gold').textContent = this.currency.getGold();
        document.getElementById('energy').textContent = this.energy;
        document.getElementById('day').textContent = this.day;
        document.getElementById('season').textContent = this.season;
        document.getElementById('field-size').textContent = `${this.gridWidth}×${this.gridHeight}`;

        // Update inventory
        const inventoryDiv = document.getElementById('inventory');
        inventoryDiv.innerHTML = '';
        let hasItems = false;
        for (const cropId in this.inventory) {
            if (this.inventory[cropId] > 0) {
                hasItems = true;
                const crop = getCropById(cropId);
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <span>${crop.name}</span>
                    <span>${this.inventory[cropId]}</span>
                `;
                inventoryDiv.appendChild(div);
            }
        }
        if (!hasItems) {
            inventoryDiv.innerHTML = '<div class="inventory-item">Empty</div>';
        }
    }

    renderShop() {
        const shopDiv = document.getElementById('shop-items');
        shopDiv.innerHTML = '';

        const unlockedList = Array.from(this.unlockedCrops);
        unlockedList.forEach(cropId => {
            const crop = getCropById(cropId);
            const canBuy = this.currency.getGold() >= crop.seedPrice;
            const div = document.createElement('div');
            div.className = `shop-item ${crop.rarity}`;
            div.innerHTML = `
                <div>
                    <span>${crop.emoji}</span>
                    <span>${crop.name}</span>
                    <span style="color: #f1c40f; font-size: 11px;">${crop.seedPrice}g</span>
                </div>
                <button onclick="game.buySeed('${crop.id}')" ${!canBuy ? 'disabled' : ''}>Buy</button>
            `;
            shopDiv.appendChild(div);
        });
    }

    renderUpgrades() {
        const upgradesDiv = document.getElementById('upgrades-list');
        upgradesDiv.innerHTML = '';

        // Land Upgrade
        const landUpgrade = this.upgrades.land;
        const canBuyLand = this.currency.getGold() >= landUpgrade.cost;
        const landDiv = document.createElement('div');
        landDiv.className = `upgrade-item land`;
        landDiv.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">Expand Land</div>
                <div class="upgrade-desc">${this.gridWidth}×${this.gridHeight} tiles</div>
            </div>
            <button onclick="game.buyUpgrade('land')" ${!canBuyLand ? 'disabled' : ''}>${landUpgrade.cost}g</button>
        `;
        upgradesDiv.appendChild(landDiv);

        // Tool Upgrades
        ['plow', 'water', 'harvest', 'plant'].forEach(toolType => {
            const upgrade = this.upgrades[toolType];
            const canBuy = this.currency.getGold() >= upgrade.cost;
            const div = document.createElement('div');
            div.className = `upgrade-item tool`;
            const toolName = toolType === 'plant' ? 'Plant' : (toolType.charAt(0).toUpperCase() + toolType.slice(1));
            const radiusText = upgrade.radius === 0 ? 'Inactive' : `Radius: ${upgrade.radius}`;
            div.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${toolName} AOE</div>
                    <div class="upgrade-desc">Lvl ${upgrade.level} • ${radiusText}</div>
                </div>
                <button onclick="game.buyUpgrade('${toolType}')" ${!canBuy ? 'disabled' : ''}>${upgrade.cost}g</button>
            `;
            upgradesDiv.appendChild(div);
        });

        // Crop Value Upgrade
        const cropUpgrade = this.upgrades.cropValue;
        const canBuyCrop = this.currency.getGold() >= cropUpgrade.cost;
        const div = document.createElement('div');
        div.className = `upgrade-item crop`;
        div.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">Crop Value</div>
                <div class="upgrade-desc">Lvl ${cropUpgrade.level} • ×${cropUpgrade.multiplier.toFixed(2)}</div>
            </div>
            <button onclick="game.buyUpgrade('cropValue')" ${!canBuyCrop ? 'disabled' : ''}>${cropUpgrade.cost}g</button>
        `;
        upgradesDiv.appendChild(div);
    }

    renderPetShop() {
        // Pet shop is now the egg shop
        this.renderEggShop();
    }

    renderEggShop() {
        const eggShopDiv = document.getElementById('pet-shop-items');
        if (!eggShopDiv) return;
        
        eggShopDiv.innerHTML = '';
        
        // Display egg types
        Object.keys(this.eggs).forEach(eggType => {
            const egg = this.eggs[eggType];
            const canBuy = this.currency.getGold() >= egg.price;
            const div = document.createElement('div');
            div.className = `shop-item ${eggType === 'exotic' ? 'elite' : (eggType === 'rare' ? 'rare' : 'basic')}`;
            const pityCounter = this.gacha[`${eggType}Pulls`];
            const pityText = pityCounter > 0 ? ` (${pityCounter}/${egg.pity})` : '';
            div.innerHTML = `
                <div>
                    <span>${egg.emoji}</span>
                    <span>${egg.name}</span>
                    <span style="color: #f1c40f; font-size: 11px;">${egg.price}g</span>
                    <div style="font-size: 10px; color: #95a5a6;">${pityText}</div>
                </div>
                <button onclick="game.drawFromEgg('${eggType}')" ${!canBuy ? 'disabled' : ''}>Draw</button>
            `;
            eggShopDiv.appendChild(div);
        });
    }

    render() {
        const fieldDiv = document.getElementById('field');
        fieldDiv.innerHTML = '';

        // Dynamically set grid columns based on field size - always match width for square alignment
        fieldDiv.style.gridTemplateColumns = `repeat(${this.gridWidth}, 1fr)`;

        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.grid[row][col];
                const tileDiv = document.createElement('div');
                tileDiv.className = `tile ${tile.state}`;
                
                // Add crop emoji if applicable
                if (tile.cropId) {
                    const crop = getCropById(tile.cropId);
                    tileDiv.textContent = crop.emoji;
                    
                    if (tile.state === 'growing') {
                        const progress = Math.round((tile.growthDays / crop.growTime) * 100);
                        tileDiv.title = `${crop.name} - ${progress}% grown`;
                    }
                }

                tileDiv.onclick = () => this.handleTileClick(row, col);
                fieldDiv.appendChild(tileDiv);
            }
        }
    }

    saveGame() {
        const saveData = {
            gold: this.gold,
            energy: this.energy,
            day: this.day,
            season: this.season,
            gridWidth: this.gridWidth,
            gridHeight: this.gridHeight,
            grid: this.grid,
            inventory: this.inventory,
            upgrades: this.upgrades,
            pets: Array.from(this.pets),
            petIncomeBoost: this.petIncomeBoost,
            gacha: this.gacha
        };
        localStorage.setItem('farmingGameSave', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('farmingGameSave');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.gold = data.gold || 50;
                this.energy = data.energy || 100;
                this.day = data.day || 1;
                this.season = data.season || 'Spring';
                // Ensure grid dimensions are reasonable (min 1x1, max 20x20 to prevent massive grids)
                this.gridWidth = Math.max(1, Math.min(20, data.gridWidth || 1));
                this.gridHeight = Math.max(1, Math.min(20, data.gridHeight || 1));
                this.grid = data.grid || [];
                this.inventory = data.inventory || {};
                // Deep merge upgrades to preserve structure
                if (data.upgrades) {
                    this.upgrades = { ...this.upgrades, ...data.upgrades };
                }
                this.pets = new Set(data.pets || []);
                this.petIncomeBoost = data.petIncomeBoost || 1.0;
                this.gacha = data.gacha || this.gacha;
                // Reinitialize grid after loading to ensure consistency
                this.initializeGrid();
                this.showMessage('Game loaded!');
            } catch (e) {
                console.error('Failed to load game:', e);
                // Reset to defaults if load fails
                this.initializeGrid();
            }
        }
    }

    showMessage(text) {
        const messageBox = document.getElementById('message-box');
        messageBox.textContent = text;
        messageBox.classList.remove('fade-out');
        
        setTimeout(() => {
            messageBox.classList.add('fade-out');
        }, 3000);
    }
}

// Initialize game
const game = new FarmingGame();
game.selectTool('plow');
