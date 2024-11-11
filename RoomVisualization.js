// Import required dependencies from React and Lucide icons
import React, { useState, useEffect } from 'react';
import { ArrowRight, Square } from 'lucide-react';

/**
 * RoomVisualization Component
 * Renders a grid-based visualization of a dungeon room with entrance and exits
 * @param {Object} diceResults - Contains the results of various dice rolls that determine room properties
 */
const RoomVisualization = ({ diceResults }) => {
    // State to manage the size of each grid cell, initialized to 32 pixels
    const [cellSize, setCellSize] = useState(32);

    // Effect hook to handle window resizing and initial cell size calculation
    useEffect(() => {
        calculateCellSize();
        // Add event listener for window resize
        window.addEventListener('resize', calculateCellSize);
        // Cleanup function to remove event listener
        return () => window.removeEventListener('resize', calculateCellSize);
    }, []);

    /**
     * Calculates the appropriate cell size based on container width
     * Ensures the visualization is responsive while maintaining proportions
     */
    const calculateCellSize = () => {
        const container = document.querySelector('.room-visualization');
        if (container) {
            // Account for padding in container width
            const containerWidth = container.clientWidth - 40;
            // Set maximum width to either 800px or container width
            const maxWidth = Math.min(800, containerWidth);
            // Calculate cell size based on room width (D10 result or default 5)
            const potentialCellSize = Math.floor(maxWidth / (diceResults?.D10 || 5));
            // Ensure cell size doesn't exceed 32px
            setCellSize(Math.min(32, potentialCellSize));
        }
    };

    /**
     * Generates the grid cells for the room layout
     * @returns {Array} Array of div elements representing grid cells
     */
    const renderGrid = () => {
        const cells = [];
        // Use D10 for width (default 5) and D100 for length (default 50)
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);

        // Create grid cells
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
                            top: y * cellSize 
                        }}
                    />
                );
            }
        }
        return cells;
    };

    /**
     * Generates positions for additional exits based on D6 roll
     * @returns {Array} Array of objects containing exit positions and wall placement
     */
    const generateExits = () => {
        const positions = [];
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);
        // Calculate number of exits from D6 result
        const exits = Math.ceil((diceResults?.D6 || 0) / 2);
        // Available walls for exit placement
        const walls = ['top', 'left', 'right'];

        // Generate exit positions
        for (let i = 0; i < exits; i++) {
            const wall = walls[i % walls.length];
            let x = 0, y = 0;

            // Calculate position based on wall placement
            switch (wall) {
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
                default:
                    break;
            }

            positions.push({ x, y, wall });
        }

        return positions;
    };

    // Calculate room dimensions and entrance position
    const width = diceResults?.D10 || 5;
    const length = Math.ceil((diceResults?.D100 || 50) / 10);
    const entranceDoor = { 
        x: Math.floor(width / 2) * cellSize, 
        y: length * cellSize 
    };
    // Generate positions for additional exits
    const exitPositions = generateExits();

    // Render the room visualization
    return (
        <div className="flex flex-col items-center gap-2 p-2 sm:gap-4 sm:p-4 bg-black rounded-lg">
            {/* Room size display */}
            <div className="text-amber-600 text-sm sm:text-lg font-bold text-center">
                Room Size: {width * 5}ft x {length * 5}ft
            </div>

            {/* Room grid container */}
            <div 
                className="relative bg-gray-900 rounded border-2 border-amber-600"
                style={{ 
                    width: width * cellSize + 4, 
                    height: length * cellSize + 4 
                }}
            >
                {/* Render grid cells */}
                {renderGrid()}

                {/* Entrance door */}
                <div 
                    className="absolute flex items-center justify-center text-white"
                    style={{ 
                        left: entranceDoor.x, 
                        top: entranceDoor.y - cellSize / 2,
                        width: cellSize,
                        height: cellSize
                    }}
                >
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 -rotate-90" />
                </div>

                {/* Additional exits */}
                {exitPositions.map((exit, index) => (
                    <div 
                        key={index}
                        className="absolute flex items-center justify-center"
                        style={{
                            left: exit.wall === 'right' ? exit.x - cellSize / 2 :
                                  exit.wall === 'left' ? exit.x - cellSize / 2 :
                                  exit.x,
                            top: exit.wall === 'top' ? exit.y - cellSize / 2 :
                                 exit.wall === 'bottom' ? exit.y - cellSize / 2 :
                                 exit.y,
                            width: cellSize,
                            height: cellSize
                        }}
                    >
                        <Square className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                ))}
            </div>

            {/* Legend for entrance and exit symbols */}
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

// Export the component for use in other parts of the application
export default RoomVisualization;