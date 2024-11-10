// Store the default roll tables
let defaultRollTables = {};
let currentRollTables = {};

// Load both default and custom roll tables
async function loadCurrentValues() {
    try {
        // Load default tables
        const response = await fetch('rollTables.json');
        defaultRollTables = await response.json();

        // Load custom tables if they exist
        const customTables = localStorage.getItem('customRollTables');
        currentRollTables = customTables ? JSON.parse(customTables) : {...defaultRollTables};

        // Populate all input fields
        populateAllFields();
    } catch (error) {
        console.error("Error loading roll tables:", error);
        showError("Failed to load roll tables", "global");
    }
}

// Populate input fields for a specific die
function populateFields(dieType) {
    const values = currentRollTables[dieType] || defaultRollTables[dieType] || [];
    values.forEach((value, index) => {
        const input = document.getElementById(`${dieType}-${index}`);
        if (input) {
            input.value = value;
        }
    });
}

// Populate all dice input fields
function populateAllFields() {
    Object.keys(diceConfig).forEach(dieType => {
        populateFields(dieType);
    });
}

// Reset a specific table to default values
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

// Save a specific table
function saveTable(dieType) {
    try {
        const values = [];
        const numSides = diceConfig[dieType].sides;

        // Collect all values
        for (let i = 0; i < numSides; i++) {
            const input = document.getElementById(`${dieType}-${i}`);
            if (!input.value.trim()) {
                throw new Error(`Entry ${i + 1} cannot be empty`);
            }
            values.push(input.value.trim());
        }

        // Update current tables
        currentRollTables[dieType] = values;

        // Save to localStorage
        localStorage.setItem('customRollTables', JSON.stringify(currentRollTables));

        showSuccess(`${dieType} table saved successfully`, dieType);
    } catch (error) {
        showError(error.message, dieType);
    }
}

// Random result generators (placeholder - expand these as needed)
const generators = {
    room: [
        "Dusty Chamber", "Hidden Alcove", "Grand Hall", "Dark Corridor",
        "Ancient Library", "Torture Chamber", "Treasury Room", "Guard Post",
        "Dining Hall", "Armory", "Sleeping Quarters", "Throne Room",
        "Temple Sanctuary", "Magic Workshop", "Prison Cell", "Storage Room",
        "War Room", "Council Chamber", "Training Area", "Secret Passage"
    ],
    
    modifier: [
        "Filled with cobwebs", "Eerily silent", "Dimly lit", "Partially flooded",
        "Covered in moss", "Magically enhanced", "Structurally unstable", "Trapped",
        "Recently occupied", "Ancient and worn", "Mysteriously clean", "Haunted",
        "Decorated ornately", "Completely dark", "Well maintained", "Abandoned",
        "Under construction", "Heavily guarded", "Partially collapsed", "Magical"
    ]
};

// Randomize a single entry
function randomizeEntry(dieType, index) {
    const input = document.getElementById(`${dieType}-${index}`);
    if (input) {
        // Choose appropriate generator based on die type
        const generator = generators.room; // Expand this logic based on die type
        const randomValue = generator[Math.floor(Math.random() * generator.length)];
        input.value = randomValue;
    }
}

// Randomize entire table
function randomizeTable(dieType) {
    const numSides = diceConfig[dieType].sides;
    for (let i = 0; i < numSides; i++) {
        randomizeEntry(dieType, i);
    }
    showSuccess(`${dieType} table randomized`, dieType);
}

// Show success message
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

// Show error message
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

// Initialize tooltips and other UI enhancements
function initializeUI() {
    // Add any additional UI initialization here
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});