import React, { useState, useEffect } from 'react';

/**
 * RoomVisualization Component
 * Renders a grid-based visualization of a dungeon room with entrance and exits
 */
const RoomVisualization = ({ diceResults = { D10: 5, D100: 50, D6: 2 } }) => {
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
          <span className="text-amber-400 text-3xl font-bold">↑</span>
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
              <div className="w-4 h-4 bg-amber-400"></div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 text-sm text-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">↑</span> Entrance
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-400 inline-block"></div> Exit
        </div>
      </div>
    </div>
  );
};

export default RoomVisualization;