import React, { useEffect, useState } from 'react';
import { Square, ArrowRight } from 'lucide-react';

const RoomVisualization = ({ 
  diceResults = {},
  theme = {
    gridColor: '#d4af37',
    backgroundColor: '#1a1a1a',
    doorColor: '#ffffff'
  }
}) => {
  const [cellSize, setCellSize] = useState(32);
  
  // Calculate dimensions
  const width = diceResults.D10 || 5;
  const length = Math.ceil((diceResults.D100 || 50) / 10);
  const exits = Math.ceil((diceResults.D6 || 0) / 2);
  
  const BORDER_WIDTH = 2;

  // Add responsive cell size calculation
  useEffect(() => {
    const calculateCellSize = () => {
      const container = document.querySelector('.room-visualization');
      if (container) {
        const containerWidth = container.clientWidth - 40; // Account for padding
        const maxWidth = Math.min(800, containerWidth); // Max width from CSS
        const potentialCellSize = Math.floor(maxWidth / (width + 1)); // +1 for padding
        setCellSize(Math.min(32, potentialCellSize)); // Cap at 32px
      }
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [width]);
  
  // Rest of the component remains the same, but using cellSize state instead of CELL_SIZE constant
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            className="absolute border border-amber-600"
            style={{
              width: cellSize,
              height: cellSize,
              left: x * cellSize,
              top: y * cellSize,
            }}
          />
        );
      }
    }
    return cells;
  };

  // Update entrance door position calculation
  const entranceDoor = {
    x: Math.floor(width / 2) * cellSize,
    y: length * cellSize
  };

  // Update exit generation with new cellSize
  const generateExits = () => {
    const positions = [];
    const walls = ['top', 'left', 'right'];
    
    for (let i = 0; i < exits; i++) {
      const wall = walls[i % walls.length];
      let x = 0, y = 0;
      
      switch(wall) {
        case 'top':
          x = Math.floor(width / 2) * cellSize;
          y = 0;
          break;
        case 'left':
          x = 0;
          y = Math.floor(length / 2) * cellSize;
          break;
        case 'right':
          x = width * cellSize;
          y = Math.floor(length / 2) * cellSize;
          break;
      }
      
      positions.push({ x, y, wall });
    }
    
    return positions;
  };

  const exitPositions = generateExits();

  return (
    <div className="flex flex-col items-center gap-2 p-2 sm:gap-4 sm:p-4 bg-black rounded-lg">
      <div className="text-amber-600 text-sm sm:text-lg font-bold text-center">
        Room Size: {width * 5}ft x {length * 5}ft
      </div>
      
      <div className="relative bg-gray-900 rounded border-2 border-amber-600"
           style={{ 
             width: width * cellSize + BORDER_WIDTH * 2, 
             height: length * cellSize + BORDER_WIDTH * 2 
           }}>
        {renderGrid()}
        
        {/* Entrance Door */}
        <div className="absolute w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white"
             style={{ 
               left: entranceDoor.x,
               top: entranceDoor.y - cellSize/2
             }}>
          <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 -rotate-90" />
        </div>
        
        {/* Additional Exits */}
        {exitPositions.map((exit, index) => (
          <div key={index} 
               className="absolute w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
               style={{ 
                 left: exit.wall === 'right' ? exit.x - cellSize/2 :
                       exit.wall === 'left' ? exit.x - cellSize/2 : 
                       exit.x,
                 top: exit.wall === 'top' ? exit.y - cellSize/2 :
                      exit.wall === 'bottom' ? exit.y - cellSize/2 :
                      exit.y
               }}>
            <Square className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm text-amber-600">
        <div className="flex items-center gap-1 sm:gap-2">
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 -rotate-90" /> Entrance
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Square className="w-3 h-3 sm:w-4 sm:h-4" /> Exit
        </div>
      </div>
    </div>
  );
};

export default RoomVisualization;