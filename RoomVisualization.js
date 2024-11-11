import React, { useState, useEffect } from 'react';

// Create the component
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
          <div
            key={`cell-${x}-${y}`}
            className="border border-gray-800"
            style={{
              position: 'absolute',
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize
            }}
          />
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

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-black rounded-lg">
      {/* Room size display */}
      <div className="text-amber-600 text-lg font-bold">
        Room Size: {width * 5}ft x {length * 5}ft
      </div>
      
      {/* Room grid */}
      <div
        className="relative bg-gray-900 rounded border-2 border-amber-600"
        style={{
          width: width * cellSize + 4,
          height: length * cellSize + 4,
          padding: '2px'
        }}
      >
        {renderGrid()}
        
        {/* Entrance */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: entrancePosition.x * cellSize,
            top: (entrancePosition.y * cellSize) + (cellSize/2),
            width: cellSize,
            height: cellSize/2
          }}
        >
          <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>↑</span>
        </div>
        
        {/* Exits */}
        {exitPositions.map((exit, index) => {
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
          
          return (
            <div
              key={`exit-${index}`}
              style={style}
            >
              <div className="w-4 h-4" style={{ backgroundColor: '#d4af37' }}></div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 text-sm text-amber-600">
        <div className="flex items-center gap-2">
          <span style={{ color: '#d4af37' }}>↑</span> Entrance
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 inline-block" style={{ backgroundColor: '#d4af37' }}></div> Exit
        </div>
      </div>
    </div>
  );
};

// Make the component available globally and export it
window.RoomVisualization = RoomVisualization;

export default RoomVisualization;