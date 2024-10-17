const rollTables = {
  D4: ["Definition 1", "Definition 2", "Definition 3", "Definition 4"],
  D6: ["Def 1", "Def 2", "Def 3", "Def 4", "Def 5", "Def 6"],
  D8: ["Def 1", "Def 2", "Def 3", "Def 4", "Def 5", "Def 6", "Def 7", "Def 8"],
  D10: ["Def 1", "Def 2", "Def 3", "Def 4", "Def 5", "Def 6", "Def 7", "Def 8", "Def 9", "Def 10"],
  D12: ["Def 1", "Def 2", "Def 3", "Def 4", "Def 5", "Def 6", "Def 7", "Def 8", "Def 9", "Def 10", "Def 11", "Def 12"],
  D20: ["Def 1", "Def 2", "Def 3", "Def 4", "Def 5", "Def 6", "Def 7", "Def 8", "Def 9", "Def 10", "Def 11", "Def 12", "Def 13", "Def 14", "Def 15", "Def 16", "Def 17", "Def 18", "Def 19", "Def 20"],
  D100: ["Def 1", "Def 2", "Def 3", "... up to 100"]
};

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollAllDice() {
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
    output += `${die}: Rolled a ${result} - ${rollTables[die][result - 1]}<br>`;
  }

  document.getElementById("results").innerHTML = output;
}
