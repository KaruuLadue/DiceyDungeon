// Global state
let rollHistory = [];
let rollTables = {};
const rollSound = new Audio('audio/rollsound.wav');

// Default configuration
const defaultConfig = {
    highlightMatches: true,
    enabledDice: {
        D4: true,
        D6: true,
        D8: true,
        D10: true,
        D12: true,
        D20: true,
        D100: true
    },
    generateImages: false,  // Start false until implementation
    soundEnabled: true
};

let activeConfig = { ...defaultConfig };

// Load roll tables from JSON file or localStorage
async function loadRollTables() {
    try {
        const cachedTables = localStorage.getItem('customRollTables');
        if (cachedTables) {
            rollTables = JSON.parse(cachedTables);
        } else {
            const response = await fetch('rollTables.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            rollTables = await response.json();
        }
        console.log("Roll tables loaded:", rollTables);
    } catch (error) {
        console.error("Error loading roll tables:", error);
        displayError("Failed to load roll tables. Using defaults.");
    }
}

// Load configuration from localStorage
function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('diceyDungeonConfig');
        if (savedConfig) {
            activeConfig = { ...defaultConfig, ...JSON.parse(savedConfig) };
        }
    } catch (error) {
        console.error("Error loading config:", error);
        activeConfig = { ...defaultConfig };
    }
}

// Save configuration to localStorage
function saveConfig() {
    try {
        localStorage.setItem('diceyDungeonConfig', JSON.stringify(activeConfig));
    } catch (error) {
        console.error("Error saving config:", error);
        displayError("Failed to save configuration.");
    }
}

// Roll dice with a given number of sides
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Process a single roll with all enabled dice
async function processRoll() {
    const results = {};
    const descriptions = {};
    
    // Only roll enabled dice
    for (const [die, enabled] of Object.entries(activeConfig.enabledDice)) {
        if (enabled) {
            results[die] = rollDice(parseInt(die.slice(1)));
            if (rollTables[die]) {
                descriptions[die] = rollTables[die][results[die] - 1];
            }
        }
    }

    // Structure the results
    const structuredResult = structureRoomData(results, descriptions);
    
    // Add to history and save
    rollHistory.push(structuredResult);
    saveRollsToCache();
    
    return structuredResult;
}

// Structure flat roll data into room format
function structureRoomData(results, descriptions) {
    return {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        rolls: {
            hallway: {
                length: results.D4 ? {
                    die: "D4",
                    value: results.D4,
                    description: descriptions.D4
                } : null,
                exits: results.D6 ? {
                    die: "D6",
                    value: results.D6,
                    description: descriptions.D6
                } : null
            },
            room: {
                encounter: results.D8 ? {
                    die: "D8",
                    value: results.D8,
                    description: descriptions.D8
                } : null,
                dimensions: {
                    width: results.D10 ? {
                        die: "D10",
                        value: results.D10,
                        description: descriptions.D10
                    } : null,
                    length: results.D100 ? {
                        die: "D100",
                        value: results.D100,
                        description: descriptions.D100
                    } : null
                },
                type: results.D12 ? {
                    die: "D12",
                    value: results.D12,
                    description: descriptions.D12
                } : null,
                modifier: results.D20 ? {
                    die: "D20",
                    value: results.D20,
                    description: descriptions.D20
                } : null
            }
        },
        imageGenerated: false,
        config: { ...activeConfig }
    };
}

// Display error message
function displayError(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), duration);
}

// Update the results display
function updateResultsDisplay(result) {
    const resultsDiv = document.getElementById("results");
    const recentRollContainer = document.createElement("div");
    recentRollContainer.className = 'recent-roll-container';

    // Add room details
    const rollTitle = document.createElement("h2");
    rollTitle.className = 'roll-title';
    rollTitle.textContent = `Roll ${rollHistory.length}:`;
    recentRollContainer.appendChild(rollTitle);

    // Add each enabled die result
    Object.entries(result.rolls).forEach(([section, data]) => {
        Object.entries(data).forEach(([key, rollData]) => {
            if (rollData && rollData.die) {
                const lineElement = document.createElement("div");
                lineElement.className = 'result-line';
                
                // Create icon and text
                lineElement.innerHTML = `
                    <img src="icons/${rollData.die}.png" alt="${rollData.die} icon" class="dice-icon">
                    <span>${rollData.die}: ${rollData.value} ${rollData.description ? `(${rollData.description})` : ''}</span>
                `;
                
                recentRollContainer.appendChild(lineElement);
            }
        });
    });

    // Add separator
    const separator = document.createElement("hr");
    separator.className = 'roll-separator';
    recentRollContainer.appendChild(separator);

    // Insert at the top
    resultsDiv.insertBefore(recentRollContainer, resultsDiv.firstChild);
}

// Roll all dice and update display
async function rollAllDice() {
    if (activeConfig.soundEnabled) {
        await rollSound.play().catch(console.error);
    }
    
    const result = await processRoll();
    updateResultsDisplay(result);
}

// Load cached rolls from localStorage
function loadCachedRolls() {
    try {
        const cachedRolls = localStorage.getItem('diceyDungeonRolls');
        if (cachedRolls) {
            rollHistory = JSON.parse(cachedRolls);
            rollHistory.forEach(result => updateResultsDisplay(result));
        }
    } catch (error) {
        console.error("Error loading cached rolls:", error);
        rollHistory = [];
    }
}

// Save current roll history to localStorage
function saveRollsToCache() {
    try {
        localStorage.setItem('diceyDungeonRolls', JSON.stringify(rollHistory));
    } catch (error) {
        console.error("Error saving rolls to cache:", error);
        displayError("Failed to save roll history.");
    }
}

// Reset all rolls
function resetRolls() {
    if (confirm("Are you sure you'd like to reset?")) {
        rollHistory = [];
        localStorage.removeItem('diceyDungeonRolls');
        document.getElementById("results").innerHTML = '';
    }
}

// Export roll history to text file
function exportRolls() {
    let exportText = "Roll History:\n\n";
    rollHistory.forEach((result, index) => {
        exportText += `Roll ${index + 1} (${result.timestamp}):\n`;
        Object.entries(result.rolls).forEach(([section, data]) => {
            Object.entries(data).forEach(([key, rollData]) => {
                if (rollData && rollData.die) {
                    exportText += `${rollData.die}: ${rollData.value} (${rollData.description || 'No description'})\n`;
                }
            });
        });
        exportText += "\n";
    });

    const blob = new Blob([exportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "roll_history.txt";
    link.click();
}

// Initialize on page load
window.onload = async () => {
    await loadRollTables();
    loadConfig();
    loadCachedRolls();
    
    // Update version display
    try {
        const response = await fetch('version.json');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('version').textContent = `Version: ${data.version}`;
        }
    } catch (error) {
        console.error('Error fetching version:', error);
        document.getElementById('version').textContent = 'Version: Unknown';
    }
};