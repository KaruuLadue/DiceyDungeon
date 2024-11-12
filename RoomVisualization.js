// RoomVisualization.js
// Get React and hooks from global scope
const { useState, useEffect } = React;

const RoomVisualization = ({ diceResults }) => {
  const [cellSize, setCellSize] = useState(32);
  
  // Calculate room dimensions
  const width = diceResults?.D10 || 5;
  const length = Math.ceil((diceResults?.D100 || 50) / 10);
  const exits = Math.ceil((diceResults?.D6 || 0) / 2);

  useEffect(() => {
    const calculateCellSize = () => {
      const container = document.querySelector('.room-visualization');
      if (container) {
        const containerWidth = container.clientWidth - 40;
        const maxWidth = Math.min(800, containerWidth);
        const potentialCellSize = Math.floor(maxWidth / width);
        setCellSize(Math.min(32, potentialCellSize));
      }
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [width]);

  // Generate grid cells
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        cells.push(
          React.createElement('div', {
            key: `cell-${x}-${y}`,
            className: "border border-gray-600",
            style: {
              position: 'absolute',
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize,
              boxSizing: 'border-box',
              backgroundColor: 'transparent',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#4a5568'
            }
          })
        );
      }
    }
    return cells;
  };

  // Generate exits
  const generateExits = () => {
    const positions = [];
    const walls = ['top', 'left', 'right'];

    for (let i = 0; i < exits; i++) {
      const wall = walls[i % walls.length];
      let x = 0, y = 0;

      switch (wall) {
        case 'top':
          x = Math.floor(width / 2);
          y = 0;
          break;
        case 'left':
          x = 0;
          y = Math.floor(length / 2);
          break;
        case 'right':
          x = width - 1;
          y = Math.floor(length / 2);
          break;
      }

      positions.push({ x, y, wall });
    }

    return positions;
  };

  const exitPositions = generateExits();
  const entrancePosition = {
    x: Math.floor(width / 2),
    y: length - 1
  };

  return React.createElement('div', {
    className: "flex flex-col items-center gap-4 p-4 bg-black rounded-lg"
  }, [
    // Room size display
    React.createElement('div', {
      key: "size",
      className: "text-amber-600 text-lg font-bold"
    }, `Room Size: ${width * 5}ft x ${length * 5}ft`),
    
    // Room grid
    React.createElement('div', {
      key: "grid",
      className: "relative bg-gray-900 rounded border-2 border-amber-600",
      style: {
        width: width * cellSize + 4,
        height: length * cellSize + 4,
        padding: '2px'
      }
    }, [
      ...renderGrid(),
      
      // Entrance
      React.createElement('div', {
        key: "entrance",
        className: "absolute flex items-center justify-center",
        style: {
          left: entrancePosition.x * cellSize,
          top: (entrancePosition.y * cellSize) + (cellSize/2),
          width: cellSize,
          height: cellSize/2
        }
      }, React.createElement('span', {
        className: "text-3xl font-bold",
        style: { color: '#d4af37' }
      }, '↑')),
      
      // Exits
      ...exitPositions.map((exit, index) => {
        let style = {
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        };
        
        switch (exit.wall) {
          case 'top':
            style = {
              ...style,
              left: exit.x * cellSize,
              top: 0,
              width: cellSize,
              height: cellSize/2,
              transform: 'translateY(-50%)'
            };
            break;
          case 'left':
            style = {
              ...style,
              left: 0,
              top: exit.y * cellSize,
              width: cellSize/2,
              height: cellSize,
              transform: 'translateX(-50%)'
            };
            break;
          case 'right':
            style = {
              ...style,
              left: width * cellSize,
              top: exit.y * cellSize,
              width: cellSize/2,
              height: cellSize,
              transform: 'translateX(-50%)'
            };
            break;
        }
        
        return React.createElement('div', {
          key: `exit-${index}`,
          style: style
        }, React.createElement('div', {
          className: "w-4 h-4",
          style: { backgroundColor: '#d4af37' }
        }));
      })
    ]),
    
    // Legend
    React.createElement('div', {
      key: "legend",
      className: "flex gap-4 text-sm text-amber-600"
    }, [
      React.createElement('div', {
        key: "entrance-legend",
        className: "flex items-center gap-2"
      }, [
        React.createElement('span', {
          style: { color: '#d4af37' }
        }, '↑'),
        ' Entrance'
      ]),
      React.createElement('div', {
        key: "exit-legend",
        className: "flex items-center gap-2"
      }, [
        React.createElement('div', {
          className: "w-4 h-4 inline-block",
          style: { backgroundColor: '#d4af37' }
        }),
        ' Exit'
      ])
    ])
  ]);
};

// Make the component available globally
window.RoomVisualization = RoomVisualization;