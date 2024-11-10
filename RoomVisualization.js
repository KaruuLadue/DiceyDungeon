const RoomVisualization = ({ 
    diceResults = {},
    gridColor = '#666666',
    backgroundColor = '#1a1a1a'
  }) => {
    const width = diceResults.D10 || 5;
    const length = Math.ceil((diceResults.D100 || 50) / 10);
    const CELL_SIZE = 48;
    
    const renderGrid = () => {
      const cells = [];
      for (let y = 0; y < length; y++) {
        for (let x = 0; x < width; x++) {
          cells.push(
            React.createElement('div', {
              key: `${x}-${y}`,
              style: {
                width: CELL_SIZE,
                height: CELL_SIZE,
                position: 'absolute',
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                border: `2px solid ${gridColor}`
              }
            })
          );
        }
      }
      return cells;
    };
  
    const diceOrder = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];
  
    return React.createElement('div', {
      className: 'flex items-start gap-12 p-6'
    }, [
      React.createElement('div', {
        key: 'grid',
        style: { 
          width: width * CELL_SIZE, 
          height: length * CELL_SIZE,
          minWidth: '400px',
          position: 'relative',
          backgroundColor: backgroundColor,
          border: `2px solid ${gridColor}`
        }
      }, renderGrid()),
      
      React.createElement('div', {
        key: 'results',
        style: {
          fontFamily: 'monospace',
          fontSize: '1.25rem'
        }
      }, diceOrder.map(die => 
        React.createElement('div', {
          key: die,
          style: { marginBottom: '0.75rem' }
        }, `${die} = ${diceResults[die] || 0}`)
      ))
    ]);
  };
  
  // We need to make this available globally since we're not using modules
  window.RoomVisualization = RoomVisualization;