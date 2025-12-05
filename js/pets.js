const PETS = {
    // Common Pets (10)
    common: [
        { id: 'cat', name: 'Cat', emoji: '🐱', eggPrice: 150, incomeBoost: 1.02, rarity: 'common' },
        { id: 'dog', name: 'Dog', emoji: '🐕', eggPrice: 160, incomeBoost: 1.03, rarity: 'common' },
        { id: 'bunny', name: 'Bunny', emoji: '🐰', eggPrice: 140, incomeBoost: 1.02, rarity: 'common' },
        { id: 'chick', name: 'Chick', emoji: '🐥', eggPrice: 120, incomeBoost: 1.02, rarity: 'common' },
        { id: 'pig', name: 'Pig', emoji: '🐷', eggPrice: 170, incomeBoost: 1.04, rarity: 'common' },
        { id: 'cow', name: 'Cow', emoji: '🐄', eggPrice: 180, incomeBoost: 1.04, rarity: 'common' },
        { id: 'sheep', name: 'Sheep', emoji: '🐑', eggPrice: 150, incomeBoost: 1.03, rarity: 'common' },
        { id: 'horse', name: 'Horse', emoji: '🐴', eggPrice: 190, incomeBoost: 1.05, rarity: 'common' },
        { id: 'duck', name: 'Duck', emoji: '🦆', eggPrice: 130, incomeBoost: 1.02, rarity: 'common' },
        { id: 'frog', name: 'Frog', emoji: '🐸', eggPrice: 125, incomeBoost: 1.02, rarity: 'common' },
    ],

    // Rare Pets (10)
    rare: [
        { id: 'dragon', name: 'Dragon', emoji: '🐉', eggPrice: 800, incomeBoost: 1.10, rarity: 'rare' },
        { id: 'phoenix', name: 'Phoenix', emoji: '🔥', eggPrice: 900, incomeBoost: 1.12, rarity: 'rare' },
        { id: 'unicorn', name: 'Unicorn', emoji: '🦄', eggPrice: 750, incomeBoost: 1.09, rarity: 'rare' },
        { id: 'griffin', name: 'Griffin', emoji: '🦅', eggPrice: 850, incomeBoost: 1.11, rarity: 'rare' },
        { id: 'kitsune', name: 'Kitsune', emoji: '🦊', eggPrice: 700, incomeBoost: 1.08, rarity: 'rare' },
        { id: 'basilisk', name: 'Basilisk', emoji: '🐍', eggPrice: 650, incomeBoost: 1.08, rarity: 'rare' },
        { id: 'pegasus', name: 'Pegasus', emoji: '🦇', eggPrice: 780, incomeBoost: 1.10, rarity: 'rare' },
        { id: 'cerberus', name: 'Cerberus', emoji: '👹', eggPrice: 920, incomeBoost: 1.13, rarity: 'rare' },
        { id: 'sphinx', name: 'Sphinx', emoji: '🦁', eggPrice: 820, incomeBoost: 1.11, rarity: 'rare' },
        { id: 'kraken', name: 'Kraken', emoji: '🐙', eggPrice: 950, incomeBoost: 1.15, rarity: 'rare' },
    ],

    // Exotic Pets (5)
    exotic: [
        { id: 'godling', name: 'Godling', emoji: '✨', eggPrice: 2500, incomeBoost: 1.30, rarity: 'exotic' },
        { id: 'timebeast', name: 'Time Beast', emoji: '⏰', eggPrice: 2800, incomeBoost: 1.35, rarity: 'exotic' },
        { id: 'starling', name: 'Starling', emoji: '⭐', eggPrice: 2300, incomeBoost: 1.28, rarity: 'exotic' },
        { id: 'voidworm', name: 'Voidworm', emoji: '🌌', eggPrice: 3000, incomeBoost: 1.40, rarity: 'exotic' },
        { id: 'luminary', name: 'Luminary', emoji: '💫', eggPrice: 2600, incomeBoost: 1.32, rarity: 'exotic' },
    ]
};

// Flat array for easy access
const ALL_PETS = [...PETS.common, ...PETS.rare, ...PETS.exotic];

function getPetById(id) {
    return ALL_PETS.find(pet => pet.id === id);
}

function getAllShopPets() {
    return ALL_PETS;
}
