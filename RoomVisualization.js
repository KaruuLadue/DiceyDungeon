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
        const containerWidth = container.clientWidth - 80;
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
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${length}, ${cellSize}px)`,
      gap: '1px',
      padding: '1px',
      backgroundColor: '#4a5568'
    };

    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        cells.push(
          React.createElement('div', {
            key: `cell-${x}-${y}`,
            style: {
              width: cellSize,
              height: cellSize,
              backgroundColor: '#1a202c',
              border: '1px solid #4a5568'
            }
          })
        );
      }
    }

    return React.createElement('div', { style: gridStyle }, cells);
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

  // Main container styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '5px',
    margin: '20px auto',
    gap: '20px'
  };

  // Grid container styles
  const gridContainerStyle = {
    border: '2px solid #d4af37',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#1a202c'
  };

  return React.createElement('div', { style: containerStyle }, [
    // Title
    React.createElement('div', {
      key: 'title',
      style: {
        color: '#d4af37',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '10px'
      }
    }, `Room Size: ${width * 5}ft x ${length * 5}ft`),

    // Grid and markers container
    React.createElement('div', { 
      key: 'grid-container',
      style: gridContainerStyle
    }, [
      renderGrid(),
      
      // Entrance marker
      React.createElement('div', {
        key: 'entrance-marker',
        style: {
          position: 'absolute',
          bottom: '0',
          left: `${entrancePosition.x * cellSize}px`,
          color: '#d4af37',
          fontSize: '24px',
          transform: 'translateX(-50%)'
        }
      }, '↑'),

      // Exit markers
      ...exitPositions.map((exit, index) => 
        React.createElement('div', {
          key: `exit-${index}`,
          style: {
            position: 'absolute',
            width: '12px',
            height: '12px',
            backgroundColor: '#d4af37',
            borderRadius: '50%',
            ...(exit.wall === 'top' ? {
              top: '-6px',
              left: `${(exit.x + 0.5) * cellSize}px`,
              transform: 'translateX(-50%)'
            } : exit.wall === 'left' ? {
              left: '-6px',
              top: `${(exit.y + 0.5) * cellSize}px`,
              transform: 'translateY(-50%)'
            } : {
              right: '-6px',
              top: `${(exit.y + 0.5) * cellSize}px`,
              transform: 'translateY(-50%)'
            })
          }
        })
      )
    ]),

    // Legend
    React.createElement('div', {
      key: 'legend',
      style: {
        display: 'flex',
        gap: '20px',
        color: '#d4af37',
        fontSize: '0.9rem',
        marginTop: '10px'
      }
    }, [
      React.createElement('div', {
        key: 'entrance-legend',
        style: { display: 'flex', alignItems: 'center', gap: '5px' }
      }, [
        React.createElement('span', { style: { fontSize: '1.2rem' } }, '↑'),
        'Entrance'
      ]),
      React.createElement('div', {
        key: 'exit-legend',
        style: { display: 'flex', alignItems: 'center', gap: '5px' }
      }, [
        React.createElement('div', {
          style: {
            width: '12px',
            height: '12px',
            backgroundColor: '#d4af37',
            borderRadius: '50%'
          }
        }),
        'Exit'
      ])
    ])
  ]);
};

export default RoomVisualization;