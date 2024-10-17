let rollTables = {};

async function loadRollTables() {
  try {
    const response = await fetch('rollTables.json');
    rollTables = await response.json();
  } catch (error) {
    console.error("Error loading roll tables:", error);
  }
}

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

async function rollAllDice() {
  if (Object.keys(rollTables).length === 0) {
    await loadRollTables();
  }

  const results = {
    D4: rollDice(4),
    D6: rollDice(6),
    D8: rollDice(8),
    D10: rollDice(10),
    D12: rollDice(12),
    D20: rollDice(20),
    D100: rollDice(100)
  };

  let output = '';
  for (const [die, result] of Object.entries(results)) {
    if (rollTables[die] && rollTables[die][result - 1]) {
      output += `${die}: ${result} - ${rollTables[die][result - 1]}<br>`;
    } else {
      output += `${die}: ${result}<br>`;
    }
  }

  document.getElementById("results").innerHTML = output;
}

window.onload = loadRollTables;
