import React, { useState, useEffect } from 'react';

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
        const containerWidth = container.clientWidth - 80; // Account for padding
        const maxWidth = Math.min(800, containerWidth);
        const potentialCellSize = Math.floor(maxWidth / Math.max(width, length));
        setCellSize(Math.min(32, potentialCellSize));
      }
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
              backgroundColor: 'transparent'
            }
          })
        );
      }
    }
    return cells;
  };

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
    className: "room-visualization-container flex flex-col items-center gap-4 p-4 bg-black rounded-lg"
  }, [
    // Room size display
    React.createElement('div', {
      key: "size",
      className: "text-amber-600 text-lg font-bold"
    }, `Room Size: ${width * 5}ft x ${length * 5}ft`),
    
    // Room grid container
    React.createElement('div', {
      key: "grid",
      className: "relative bg-gray-900 rounded border-2 border-amber-600",
      style: {
        width: width * cellSize + 4,
        height: length * cellSize + 4,
        padding: '2px',
        margin: '20px 0'
      }
    }, [
      ...renderGrid(),
      
      // Entrance marker
      React.createElement('div', {
        key: "entrance",
        className: "absolute flex items-center justify-center",
        style: {
          left: entrancePosition.x * cellSize,
          top: entrancePosition.y * cellSize + (cellSize/2),
          width: cellSize,
          height: cellSize/2
        }
      }, React.createElement('span', {
        className: "text-2xl font-bold text-amber-600"
      }, '↑')),
      
      // Exit markers
      ...exitPositions.map((exit, index) => {
        let style = {
          position: 'absolute',
          width: cellSize/2,
          height: cellSize/2,
          backgroundColor: '#d4af37'
        };
        
        switch (exit.wall) {
          case 'top':
            style = {
              ...style,
              left: exit.x * cellSize + cellSize/4,
              top: -cellSize/4,
              width: cellSize/2,
              height: cellSize/2
            };
            break;
          case 'left':
            style = {
              ...style,
              left: -cellSize/4,
              top: exit.y * cellSize + cellSize/4,
              width: cellSize/2,
              height: cellSize/2
            };
            break;
          case 'right':
            style = {
              ...style,
              left: width * cellSize - cellSize/4,
              top: exit.y * cellSize + cellSize/4,
              width: cellSize/2,
              height: cellSize/2
            };
            break;
        }
        
        return React.createElement('div', {
          key: `exit-${index}`,
          className: "bg-amber-600",
          style
        });
      })
    ]),

    // Legend
    React.createElement('div', {
      key: "legend",
      className: "flex gap-6 text-sm text-amber-600"
    }, [
      React.createElement('div', {
        key: "entrance-legend",
        className: "flex items-center gap-2"
      }, [
        React.createElement('span', {
          className: "text-amber-600 text-lg"
        }, '↑'),
        ' Entrance'
      ]),
      React.createElement('div', {
        key: "exit-legend",
        className: "flex items-center gap-2"
      }, [
        React.createElement('div', {
          className: "w-4 h-4 bg-amber-600"
        }),
        ' Exit'
      ])
    ])
  ]);
};

export default RoomVisualization;