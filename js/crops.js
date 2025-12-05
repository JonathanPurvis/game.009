const CROPS = {
    // Basic Crops (10)
    basic: [
        { id: 'parsnip', name: 'Parsnip', growTime: 4, seedPrice: 20, harvestPrice: 50, emoji: '🥕', rarity: 'basic' },
        { id: 'lettuce', name: 'Lettuce', growTime: 3, seedPrice: 30, harvestPrice: 75, emoji: '🥬', rarity: 'basic' },
        { id: 'cucumber', name: 'Cucumber', growTime: 4, seedPrice: 35, harvestPrice: 90, emoji: '🥒', rarity: 'basic' },
        { id: 'bean', name: 'Green Bean', growTime: 5, seedPrice: 40, harvestPrice: 100, emoji: '🫘', rarity: 'basic' },
        { id: 'potato', name: 'Potato', growTime: 5, seedPrice: 45, harvestPrice: 115, emoji: '🥔', rarity: 'basic' },
        { id: 'carrot', name: 'Carrot', growTime: 5, seedPrice: 50, harvestPrice: 125, emoji: '🥕', rarity: 'basic' },
        { id: 'tomato', name: 'Tomato', growTime: 6, seedPrice: 55, harvestPrice: 140, emoji: '🍅', rarity: 'basic' },
        { id: 'cauliflower', name: 'Cauliflower', growTime: 8, seedPrice: 70, harvestPrice: 175, emoji: '🥦', rarity: 'basic' },
        { id: 'corn', name: 'Corn', growTime: 10, seedPrice: 90, harvestPrice: 225, emoji: '🌽', rarity: 'basic' },
        { id: 'pumpkin', name: 'Pumpkin', growTime: 12, seedPrice: 105, harvestPrice: 265, emoji: '🎃', rarity: 'basic' },
    ],

    // Rare Crops (5)
    rare: [
        { id: 'garlic', name: 'Garlic', growTime: 6, seedPrice: 150, harvestPrice: 375, emoji: '🧄', rarity: 'rare' },
        { id: 'eggplant', name: 'Eggplant', growTime: 7, seedPrice: 175, harvestPrice: 440, emoji: '🍆', rarity: 'rare' },
        { id: 'artichoke', name: 'Artichoke', growTime: 8, seedPrice: 200, harvestPrice: 500, emoji: '🍀', rarity: 'rare' },
        { id: 'watermelon', name: 'Watermelon', growTime: 14, seedPrice: 250, harvestPrice: 625, emoji: '🍉', rarity: 'rare' },
        { id: 'grape', name: 'Grape Vine', growTime: 15, seedPrice: 300, harvestPrice: 750, emoji: '🍇', rarity: 'rare' },
    ],

    // Elite Crops (3)
    elite: [
        { id: 'saffron', name: 'Saffron', growTime: 18, seedPrice: 500, harvestPrice: 1500, emoji: '✨', rarity: 'elite' },
        { id: 'truffle', name: 'Truffle', growTime: 20, seedPrice: 700, harvestPrice: 1950, emoji: '💎', rarity: 'elite' },
        { id: 'moonflower', name: 'Moonflower', growTime: 22, seedPrice: 900, harvestPrice: 2400, emoji: '🌙', rarity: 'elite' },
    ]
};

// Flat array for easy access
const ALL_CROPS = [...CROPS.basic, ...CROPS.rare, ...CROPS.elite];

function getCropById(id) {
    return ALL_CROPS.find(crop => crop.id === id);
}

function getAllShopCrops() {
    return ALL_CROPS;
}
