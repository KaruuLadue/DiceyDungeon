// roomvisualization.js

// Importing React from window object
const { createElement, useState, useEffect } = window.React;

/**
 * RoomVisualization Component
 * Renders a grid-based visualization of a dungeon room with entrance and exits
 */
const RoomVisualization = ({ diceResults }) => {
  const [cellSize, setCellSize] = useState(32);
  
  // Calculate room dimensions
  const width = diceResults?.D10 || 5;
  const length = Math.ceil((diceResults?.D100 || 50) / 10);
  const exits = Math.ceil((diceResults?.D6 || 0) / 2);

  useEffect(() => {
    const calculateCellSize = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      const widthCellSize = Math.floor(maxWidth / width);
      const heightCellSize = Math.floor(maxHeight / length);
      setCellSize(Math.min(32, widthCellSize, heightCellSize));
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [width, length]);

  // Generate grid cells
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        cells.push(
          createElement('div', {
            key: `cell-${x}-${y}`,
            className: "border border-gray-800",
            style: {
              position: 'absolute',
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize
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

  return createElement('div', {
    className: "flex flex-col items-center gap-4 p-4 bg-black rounded-lg"
  }, [
    // Room size display
    createElement('div', {
      key: "size",
      className: "text-amber-600 text-lg font-bold"
    }, `Room Size: ${width * 5}ft x ${length * 5}ft`),
    
    // Room grid
    createElement('div', {
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
      createElement('div', {
        key: "entrance",
        className: "absolute flex items-center justify-center",
        style: {
          left: entrancePosition.x * cellSize,
          top: entrancePosition.y * cellSize,
          width: cellSize,
          height: cellSize
        }
      }, createElement('span', {
        className: "text-amber-600 text-xl"
      }, '↑')),
      
      // Exits
      ...exitPositions.map((exit, index) =>
        createElement('div', {
          key: `exit-${index}`,
          className: "absolute flex items-center justify-center",
          style: {
            left: exit.x * cellSize,
            top: exit.y * cellSize,
            width: cellSize,
            height: cellSize
          }
        }, createElement('span', {
          className: "text-amber-600 text-xl"
        }, '□'))
      )
    ]),
    
    // Legend
    createElement('div', {
      key: "legend",
      className: "flex gap-4 text-sm text-amber-600"
    }, [
      createElement('div', {
        key: "entrance-legend",
        className: "flex items-center gap-2"
      }, ['↑', ' Entrance']),
      createElement('div', {
        key: "exit-legend",
        className: "flex items-center gap-2"
      }, ['□', ' Exit'])
    ])
  ]);
};

// Make the component available globally
window.RoomVisualization = RoomVisualization;

export default RoomVisualization;