// Access React from window object
const { useState, useEffect } = window.React;

/**
 * RoomVisualization Component
 * Renders a grid-based visualization of a dungeon room with entrance and exits
 */
const RoomVisualization = ({ diceResults }) => {
    const [cellSize, setCellSize] = useState(32);

    useEffect(() => {
        calculateCellSize();
        window.addEventListener('resize', calculateCellSize);
        return () => window.removeEventListener('resize', calculateCellSize);
    }, []);

    const calculateCellSize = () => {
        const container = document.querySelector('.room-visualization');
        if (container) {
            const containerWidth = container.clientWidth - 40;
            const maxWidth = Math.min(800, containerWidth);
            const potentialCellSize = Math.floor(maxWidth / (diceResults?.D10 || 5));
            setCellSize(Math.min(32, potentialCellSize));
        }
    };

    const renderGrid = () => {
        const cells = [];
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);

        for (let y = 0; y < length; y++) {
            for (let x = 0; x < width; x++) {
                cells.push(
                    window.React.createElement('div', {
                        key: `${x}-${y}`,
                        className: "absolute border border-amber-600",
                        style: { 
                            width: cellSize, 
                            height: cellSize, 
                            left: x * cellSize, 
                            top: y * cellSize 
                        }
                    })
                );
            }
        }
        return cells;
    };

    const generateExits = () => {
        const positions = [];
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);
        const exits = Math.ceil((diceResults?.D6 || 0) / 2);
        const walls = ['top', 'left', 'right'];

        for (let i = 0; i < exits; i++) {
            const wall = walls[i % walls.length];
            let x = 0, y = 0;

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
            }

            positions.push({ x, y, wall });
        }

        return positions;
    };

    const width = diceResults?.D10 || 5;
    const length = Math.ceil((diceResults?.D100 || 50) / 10);
    const entranceDoor = { 
        x: Math.floor(width / 2) * cellSize, 
        y: length * cellSize 
    };
    const exitPositions = generateExits();

    return window.React.createElement(
        'div',
        { className: "flex flex-col items-center gap-2 p-2 sm:gap-4 sm:p-4 bg-black rounded-lg" },
        [
            // Room size display
            window.React.createElement(
                'div',
                { 
                    key: "size",
                    className: "text-amber-600 text-sm sm:text-lg font-bold text-center" 
                },
                `Room Size: ${width * 5}ft x ${length * 5}ft`
            ),
            // Room grid
            window.React.createElement(
                'div',
                {
                    key: "grid",
                    className: "relative bg-gray-900 rounded border-2 border-amber-600",
                    style: { 
                        width: width * cellSize + 4, 
                        height: length * cellSize + 4 
                    }
                },
                [
                    ...renderGrid(),
                    // Entrance door
                    window.React.createElement(
                        'div',
                        {
                            key: "entrance",
                            className: "absolute flex items-center justify-center text-white",
                            style: { 
                                left: entranceDoor.x, 
                                top: entranceDoor.y - cellSize / 2,
                                width: cellSize,
                                height: cellSize
                            }
                        },
                        window.React.createElement('span', { 
                            className: "w-4 h-4 sm:w-6 sm:h-6 text-amber-600 rotate-180" 
                        }, '↑')
                    ),
                    // Additional exits
                    ...exitPositions.map((exit, index) => 
                        window.React.createElement(
                            'div',
                            {
                                key: `exit-${index}`,
                                className: "absolute flex items-center justify-center",
                                style: {
                                    left: exit.wall === 'right' ? exit.x - cellSize / 2 :
                                          exit.wall === 'left' ? exit.x - cellSize / 2 :
                                          exit.x,
                                    top: exit.wall === 'top' ? exit.y - cellSize / 2 :
                                         exit.wall === 'bottom' ? exit.y - cellSize / 2 :
                                         exit.y,
                                    width: cellSize,
                                    height: cellSize
                                }
                            },
                            window.React.createElement('span', { 
                                className: "w-4 h-4 sm:w-6 sm:h-6 text-amber-600" 
                            }, '□')
                        )
                    )
                ]
            ),
            // Legend
            window.React.createElement(
                'div',
                {
                    key: "legend",
                    className: "flex gap-2 sm:gap-4 text-xs sm:text-sm text-amber-600"
                },
                [
                    window.React.createElement(
                        'div',
                        { key: "entrance-legend", className: "flex items-center gap-1 sm:gap-2" },
                        ['↑', ' Entrance']
                    ),
                    window.React.createElement(
                        'div',
                        { key: "exit-legend", className: "flex items-center gap-1 sm:gap-2" },
                        ['□', ' Exit']
                    )
                ]
            )
        ]
    );
};

// Export the component
window.RoomVisualization = RoomVisualization;