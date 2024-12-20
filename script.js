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
    generateImages: false,
    soundEnabled: true
};

let activeConfig = { ...defaultConfig }; 

// Make functions globally accessible for onclick events
window.rollAllDice = rollAllDice;
window.confirmReset = confirmReset;
window.exportRolls = exportRolls;
window.toggleConfig = toggleConfig;
window.updateConfig = updateConfig;
window.updateDiceConfig = updateDiceConfig;

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
            const sides = die === 'D100' ? 10 : parseInt(die.slice(1));
results[die] = rollDice(sides);
            if (rollTables[die]) {
                descriptions[die] = rollTables[die][results[die] - 1];
            }
            console.log(`Rolled ${die}: ${results[die]} (${descriptions[die]})`);
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

function initializeRoomVisualization(result, recentRollContainer) {
  const visualizationDiv = document.createElement("div");
  visualizationDiv.className = 'room-visualization';
  recentRollContainer.appendChild(visualizationDiv);

  try {
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
      
      console.log("Room props:", roomProps);
      
      // Initialize visualization and store cleanup function
      const cleanup = window.RoomVisualization.initialize(roomProps.diceResults, visualizationDiv);
      
      // Store cleanup function on the container for later use
      visualizationDiv.cleanup = cleanup;
      
      console.log("Visualization rendered");
  } catch (error) {
      console.error('Failed to render room visualization:', error);
      console.error('Error details:', error.message);
      visualizationDiv.textContent = 'Failed to load room visualization';
  }
}

function updateResultsDisplay(result) {
    const resultsDiv = document.getElementById("results");
    const recentRollContainer = document.createElement("div");
    recentRollContainer.className = 'recent-roll-container';
    recentRollContainer.setAttribute('data-roll-group', Date.now());

    const rollTitle = document.createElement("h2");
    rollTitle.className = 'roll-title';
    rollTitle.textContent = `Roll ${rollHistory.length}:`;
    recentRollContainer.appendChild(rollTitle);

    function processRollData(data, parentKey = '') {
        Object.entries(data).forEach(([key, rollData]) => {
            if (rollData && rollData.die && rollData.value) {
                const lineElement = document.createElement("div");
                lineElement.className = 'result-line';
                lineElement.setAttribute('data-value', rollData.value);

                lineElement.innerHTML = `
                    <img src="icons/${rollData.die}.png" alt="${rollData.die} icon" class="dice-icon">
                    <span>${rollData.die}: ${rollData.value} ${rollData.description ? `(${rollData.description})` : ''}</span>
                `;

                recentRollContainer.appendChild(lineElement);
            } else if (typeof rollData === 'object' && rollData !== null) {
                processRollData(rollData, `${parentKey}${key}.`);
            }
        });
    }

    processRollData(result.rolls);

    // Add visualization if enabled
    if (activeConfig.generateImages) {
        initializeRoomVisualization(result, recentRollContainer);
    }

    resultsDiv.insertBefore(recentRollContainer, resultsDiv.firstChild);
    
    // Apply highlighting for this roll if enabled
    if (activeConfig.highlightMatches) {
        updateHighlightStylesForRoll(recentRollContainer);
    }
}

async function rollAllDice() {
    if (activeConfig.soundEnabled) {
        await rollSound.play().catch(console.error);
    }

    const result = await processRoll();
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
  document.querySelectorAll('.room-visualization').forEach(div => {
      if (div.cleanup) {
          div.cleanup();
      }
  });
  
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

    switch (setting) {
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

function updateHighlightStylesForRoll(rollContainer) {
    const resultLines = rollContainer.querySelectorAll('.result-line');
    const valueCount = new Map();

    resultLines.forEach(line => {
        const value = line.getAttribute('data-value');
        if (value) {
            valueCount.set(value, (valueCount.get(value) || 0) + 1);
        }
    });

    resultLines.forEach(line => {
        const value = line.getAttribute('data-value');
        if (value && valueCount.get(value) > 1) {
            line.classList.add('match');
        } else {
            line.classList.remove('match');
        }
    });
}

function updateHighlightStyles() {
    document.querySelectorAll('.recent-roll-container').forEach(container => {
        if (activeConfig.highlightMatches) {
            updateHighlightStylesForRoll(container);
        } else {
            container.querySelectorAll('.result-line').forEach(line => {
                line.classList.remove('match');
            });
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
        updateHighlightStyles();
    } catch (error) {
        console.error("Error loading config:", error);
        activeConfig = { ...defaultConfig };
        displayError("Failed to load configuration. Using defaults.");
    }
}



// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired.");

    window.addEventListener('resize', () => {
      if (activeConfig.generateImages) {
          document.querySelectorAll('.room-visualization').forEach(div => {
              const canvas = div.querySelector('canvas');
              if (canvas) {
                  const diceResults = rollHistory.find(roll => 
                      roll.id === div.closest('.recent-roll-container')?.getAttribute('data-roll-group')
                  )?.rolls;
                  if (diceResults) {
                      window.RoomVisualization.drawRoom(diceResults, canvas);
                  }
              }
          });
      }
  });

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
            document.getElementById('version').textContent = `${data.version}`;
        }
    } catch (error) {
        console.error('Error fetching version:', error);
        document.getElementById('version').textContent = 'Version: Unknown';
    }
});
