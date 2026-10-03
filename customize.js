let defaultRollTables = {};
let currentRollTables = {};

async function loadCurrentValues() {
    try {
        const response = await fetch('rollTables.json');
        defaultRollTables = await response.json();
        const customTables = JSON.parse(localStorage.getItem('customRollTables') || '{}');
        currentRollTables = {...defaultRollTables};
        // Keep only custom tables that still match the default table's shape
        Object.keys(defaultRollTables).forEach(dieType => {
            const custom = customTables[dieType];
            if (Array.isArray(custom) && custom.length === defaultRollTables[dieType].length) {
                currentRollTables[dieType] = custom;
            }
        });
        populateAllFields();
    } catch (error) {
        console.error("Error loading roll tables:", error);
        showGlobalError("Failed to load roll tables");
    }
}

function populateFields(dieType) {
    const values = currentRollTables[dieType] || defaultRollTables[dieType] || [];
    values.forEach((value, index) => {
        const input = document.getElementById(`${dieType}-${index}`);
        if (input) {
            input.value = value;
        }
    });
}

function populateAllFields() {
    Object.keys(diceConfig).forEach(dieType => {
        populateFields(dieType);
    });
}

function resetTable(dieType) {
    if (defaultRollTables[dieType]) {
        defaultRollTables[dieType].forEach((value, index) => {
            const input = document.getElementById(`${dieType}-${index}`);
            if (input) {
                input.value = value;
            }
        });
        showSuccess(`${dieType} table reset to defaults`, dieType);
    } else {
        showError(`No default values found for ${dieType}`, dieType);
    }
}

function saveTable(dieType) {
    try {
        const values = [];
        const numSides = diceConfig[dieType].sides;

        for (let i = 0; i < numSides; i++) {
            const input = document.getElementById(`${dieType}-${i}`);
            if (!input.value.trim()) {
                throw new Error(`Entry ${i + 1} cannot be empty`);
            }
            values.push(input.value.trim());
        }

        currentRollTables[dieType] = values;
        localStorage.setItem('customRollTables', JSON.stringify(currentRollTables));
        showSuccess(`${dieType} table saved successfully`, dieType);
    } catch (error) {
        showError(error.message, dieType);
    }
}

function saveAllTables() {
    try {
        Object.keys(diceConfig).forEach(dieType => {
            const values = [];
            const numSides = diceConfig[dieType].sides;

            for (let i = 0; i < numSides; i++) {
                const input = document.getElementById(`${dieType}-${i}`);
                if (!input.value.trim()) {
                    throw new Error(`${dieType}: Entry ${i + 1} cannot be empty`);
                }
                values.push(input.value.trim());
            }

            currentRollTables[dieType] = values;
        });

        localStorage.setItem('customRollTables', JSON.stringify(currentRollTables));
        showGlobalSuccess("All tables saved successfully");
    } catch (error) {
        showGlobalError(error.message);
    }
}

function exportTables() {
    try {
        const tables = localStorage.getItem('customRollTables');
        if (!tables) {
            throw new Error("No custom tables found to export");
        }

        const blob = new Blob([tables], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'dicey_dungeon_tables.json';
        link.click();
        showGlobalSuccess("Tables exported successfully");
    } catch (error) {
        showGlobalError("Failed to export tables: " + error.message);
    }
}

async function importTables(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const tables = JSON.parse(e.target.result);
                
                // Validate the imported data
                Object.keys(diceConfig).forEach(dieType => {
                    if (!Array.isArray(tables[dieType]) || 
                        tables[dieType].length !== diceConfig[dieType].sides) {
                        throw new Error(`Invalid data format for ${dieType}`);
                    }
                });

                if (localStorage.getItem('customRollTables')) {
                    if (confirm("Custom tables already exist. Do you want to replace them?")) {
                        currentRollTables = tables;
                        localStorage.setItem('customRollTables', JSON.stringify(tables));
                        populateAllFields();
                        showGlobalSuccess("Tables imported successfully");
                    }
                } else {
                    currentRollTables = tables;
                    localStorage.setItem('customRollTables', JSON.stringify(tables));
                    populateAllFields();
                    showGlobalSuccess("Tables imported successfully");
                }
            } catch (error) {
                showGlobalError("Invalid file format: " + error.message);
            }
        };
        reader.readAsText(file);
    } catch (error) {
        showGlobalError("Failed to import tables: " + error.message);
    }
    event.target.value = ''; // Reset file input
}

// Random entries per die. D4, D6, D10 and D100 have no generator: their
// roll value drives the room drawing, so random text would contradict it.
const generators = {
    D8: [
        "No Encounter - The room is quiet.", "Wandering Patrol - A few guards on their rounds.",
        "Lurking Predator - Something hunts from the shadows.", "Restless Dead - Spirits stir as you enter.",
        "Swarm - Vermin pour from the cracks.", "Rival Party - Another group of adventurers.",
        "Sleeping Beast - A large creature at rest.", "Captive - Someone pleads for rescue.",
        "Ambush - Hidden entities ready to strike.", "Merchant - A strange trader offers wares.",
        "Elite Threat - Dangerous entity, possibly guarding something.", "Construct - A mechanical guardian awakens."
    ],

    D12: [
        "Dusty Chamber", "Hidden Alcove", "Grand Hall", "Dark Corridor",
        "Ancient Library", "Torture Chamber", "Treasury Room", "Guard Post",
        "Dining Hall", "Armory", "Sleeping Quarters", "Throne Room",
        "Temple Sanctuary", "Magic Workshop", "Prison Cell", "Storage Room",
        "War Room", "Council Chamber", "Training Area", "Secret Passage"
    ],
    
    D20: [
        "Filled with cobwebs", "Eerily silent", "Dimly lit", "Partially flooded",
        "Covered in moss", "Magically enhanced", "Structurally unstable", "Trapped",
        "Recently occupied", "Ancient and worn", "Mysteriously clean", "Haunted",
        "Decorated ornately", "Completely dark", "Well maintained", "Abandoned",
        "Under construction", "Heavily guarded", "Partially collapsed", "Magical"
    ]
};

function randomizeEntry(dieType, index) {
    const input = document.getElementById(`${dieType}-${index}`);
    const generator = generators[dieType];
    if (input && generator) {
        const randomValue = generator[Math.floor(Math.random() * generator.length)];
        input.value = randomValue;
    }
}

function randomizeTable(dieType) {
    if (!generators[dieType]) {
        showError(`${dieType} drives the room drawing and can't be randomized`, dieType);
        return;
    }
    const numSides = diceConfig[dieType].sides;
    for (let i = 0; i < numSides; i++) {
        randomizeEntry(dieType, i);
    }
    showSuccess(`${dieType} table randomized`, dieType);
}

function showSuccess(message, dieType) {
    const successDiv = document.getElementById(`${dieType}-success`);
    const errorDiv = document.getElementById(`${dieType}-error`);
    
    if (successDiv && errorDiv) {
        errorDiv.classList.remove('show');
        successDiv.textContent = message;
        successDiv.classList.add('show');
        
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }
}

function showError(message, dieType) {
    const successDiv = document.getElementById(`${dieType}-success`);
    const errorDiv = document.getElementById(`${dieType}-error`);
    
    if (successDiv && errorDiv) {
        successDiv.classList.remove('show');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 3000);
    }
}

function showGlobalSuccess(message) {
    const globalMessage = document.getElementById('globalMessage');
    globalMessage.textContent = message;
    globalMessage.className = 'global-message success show';
    
    setTimeout(() => {
        globalMessage.classList.remove('show');
    }, 3000);
}

function showGlobalError(message) {
    const globalMessage = document.getElementById('globalMessage');
    globalMessage.textContent = message;
    globalMessage.className = 'global-message error show';
    
    setTimeout(() => {
        globalMessage.classList.remove('show');
    }, 3000);
}

function initializeUI() {
    // Add any additional UI initialization here
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});