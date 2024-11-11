// Global state
let rollHistory = [];
let rollTables = {};
const rollSound = new Audio('audio/rollsound.wav');
const { createElement } = React;

// Add React destructuring
const { createElement } = React;

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
    generateImages: false,
    soundEnabled: true
};

let activeConfig = { ...defaultConfig };

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

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

async function processRoll() {
    const results = {};
    const descriptions = {};

    for (const [die, enabled] of Object.entries(activeConfig.enabledDice)) {
        if (enabled) {
            results[die] = rollDice(parseInt(die.slice(1)));
            if (rollTables[die]) {
                descriptions[die] = rollTables[die][results[die] - 1];
            }
            console.log(`Rolled ${die}: ${results[die]} (${descriptions[die]})`); // Debugging log
        }
    }

    const structuredResult = structureRoomData(results, descriptions);
    rollHistory.push(structuredResult);
    saveRollsToCache();

    return structuredResult;
}

function structureRoomData(results, descriptions) {
    return {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        rolls: {
            // Ordered as D4, D6, D8, D10, D100, D12, D20
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

function displayError(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), duration);
}

function updateResultsDisplay(result) {
    const resultsDiv = document.getElementById("results");
    const recentRollContainer = document.createElement("div");
    recentRollContainer.className = 'recent-roll-container';

    const rollTitle = document.createElement("h2");
    rollTitle.className = 'roll-title';
    rollTitle.textContent = `Roll ${rollHistory.length}:`;
    recentRollContainer.appendChild(rollTitle);

    const rollValues = new Map();

    // Recursively process roll data
    function processRollData(data, parentKey = '') {
        Object.entries(data).forEach(([key, rollData]) => {
            if (rollData && rollData.die && rollData.value) {
                console.log(`Processing ${rollData.die}: ${rollData.value} ${rollData.description ? `(${rollData.description})` : ''}`);

                rollValues.set(rollData.value, (rollValues.get(rollData.value) || 0) + 1);

                const lineElement = document.createElement("div");
                lineElement.className = 'result-line';
                lineElement.setAttribute('data-value', rollData.value);

                lineElement.innerHTML = `
                    <img src="icons/${rollData.die}.png" alt="${rollData.die} icon" class="dice-icon">
                    <span>${rollData.die}: ${rollData.value} ${rollData.description ? `(${rollData.description})` : ''}</span>
                `;

                recentRollContainer.appendChild(lineElement);
            } else if (typeof rollData === 'object' && rollData !== null) {
                // Recursively process nested objects
                processRollData(rollData, `${parentKey}${key}.`);
            } else {
                console.error(`Invalid roll data for ${parentKey}${key}: `, rollData);
            }
        });
    }

    processRollData(result.rolls);

    if (activeConfig.generateImages) {
        const visualizationDiv = document.createElement("div");
        visualizationDiv.className = 'room-visualization';
        recentRollContainer.appendChild(visualizationDiv);

        try {
            // Create room visualization
            const roomProps = {
                diceResults: {
                    D4: result.rolls.hallway.length?.value,
                    D6: result.rolls.hallway.exits?.value,
                    D8: result.rolls.room.encounter?.value,
                    D10: result.rolls.room.dimensions?.width?.value,
                    D12: result.rolls.room.type?.value,
                    D20: result.rolls.room.modifier?.value,
                    D100: result.rolls.room.dimensions?.length?.value
                }
            };

            // Debugging log for roomProps
            console.log("Room Props for Visualization:", roomProps);
            
            if (!window.RoomVisualization) {
                throw new Error("RoomVisualization component is not available globally");
            }

            // Render the React component using global reference
            const root = ReactDOM.createRoot(visualizationDiv);
            root.render(createElement(window.RoomVisualization, roomProps));
        } catch (error) {
            console.error('Failed to render room visualization:', error);
            visualizationDiv.textContent = 'Failed to load room visualization';
        }
    }

    resultsDiv.insertBefore(recentRollContainer, resultsDiv.firstChild);
}

async function rollAllDice() {
    if (activeConfig.soundEnabled) {
        await rollSound.play().catch(console.error);
    }

    const result = await processRoll();

    // Logging result for debugging
    console.log("Roll result:", result);

    updateResultsDisplay(result);
}

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

function saveRollsToCache() {
    try {
        localStorage.setItem('diceyDungeonRolls', JSON.stringify(rollHistory));
    } catch (error) {
        console.error("Error saving rolls to cache:", error);
        displayError("Failed to save roll history.");
    }
}

function confirmReset() {
    if (confirm("Are you sure you'd like to reset?")) {
        resetRolls();
    }
}

function resetRolls() {
    rollHistory = [];
    localStorage.removeItem('diceyDungeonRolls');
    document.getElementById("results").innerHTML = '';
}

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

// Configuration Panel Functions
function toggleConfig() {
    const configPanel = document.getElementById('configPanel');
    configPanel.classList.toggle('hidden');

    if (!configPanel.classList.contains('hidden')) {
        updateConfigDisplay();
    }
}

function updateConfigDisplay() {
    document.getElementById('highlightMatches').checked = activeConfig.highlightMatches;
    document.getElementById('soundEnabled').checked = activeConfig.soundEnabled;
    document.getElementById('generateImages').checked = activeConfig.generateImages;

    Object.entries(activeConfig.enabledDice).forEach(([die, enabled]) => {
        const checkbox = document.getElementById(`${die}enabled`);
        if (checkbox) {
            checkbox.checked = enabled;
        }
    });
}

function updateConfig(setting, value) {
    activeConfig[setting] = value;
    saveConfig();

    switch(setting) {
        case 'highlightMatches':
            updateHighlightStyles();
            break;
        case 'generateImages':
            toggleRoomVisualization(value);
            break;
    }
}

function updateDiceConfig(die, enabled) {
    activeConfig.enabledDice[die] = enabled;
    saveConfig();
}

function toggleRoomVisualization(show) {
    const visualizationDiv = document.getElementById('roomVisualization');
    if (visualizationDiv) {
        visualizationDiv.classList.toggle('hidden', !show);
    }
}

function updateHighlightStyles() {
    const resultLines = document.querySelectorAll('.result-line');
    resultLines.forEach(line => {
        const value = line.getAttribute('data-value');
        if (value) {
            const matches = document.querySelectorAll(`[data-value="${value}"]`);
            if (matches.length > 1 && activeConfig.highlightMatches) {
                line.classList.add('match');
            } else {
                line.classList.remove('match');
            }
        }
    });
}

function saveConfig() {
    try {
        localStorage.setItem('diceyDungeonConfig', JSON.stringify(activeConfig));
    } catch (error) {
        console.error("Error saving config:", error);
        displayError("Failed to save configuration");
    }
}

function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('diceyDungeonConfig');
        if (savedConfig) {
            activeConfig = { ...defaultConfig, ...JSON.parse(savedConfig) };
        }
        updateConfigDisplay();
    } catch (error) {
        console.error("Error loading config:", error);
        activeConfig = { ...defaultConfig };
        displayError("Failed to load configuration. Using defaults.");
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired.");

    try {
        await loadRollTables();
        console.log("Roll tables loaded.");
    } catch (error) {
        console.error("Failed to load roll tables:", error);
    }

    try {
        loadConfig();
        console.log("Configuration loaded.");
    } catch (error) {
        console.error("Failed to load configuration:", error);
    }

    try {
        loadCachedRolls();
        console.log("Cached rolls loaded.");
    } catch (error) {
        console.error("Failed to load cached rolls:", error);
    }

    updateConfigDisplay();
    console.log("Configuration display updated.");

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
});