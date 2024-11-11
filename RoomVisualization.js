// Import necessary components if not already available globally
const { React, ReactDOM } = window;
const { ArrowRight, Square } = window.lucideReact || {};

// Define the RoomVisualization component
class RoomVisualization extends React.Component {
    constructor(props) {
        super(props);
        this.state = { cellSize: 32 };
    }

    componentDidMount() {
        this.calculateCellSize();
        window.addEventListener('resize', this.calculateCellSize.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.calculateCellSize.bind(this));
    }

    calculateCellSize() {
        const container = document.querySelector('.room-visualization');
        if (container) {
            const containerWidth = container.clientWidth - 40; // Account for padding
            const maxWidth = Math.min(800, containerWidth); // Max width from CSS
            const potentialCellSize = Math.floor(maxWidth / (this.props.diceResults.D10 || 5));
            this.setState({ cellSize: Math.min(32, potentialCellSize) });
        }
    }

    renderGrid() {
        const cells = [];
        const { cellSize } = this.state;
        const width = this.props.diceResults.D10 || 5;
        const length = Math.ceil((this.props.diceResults.D100 || 50) / 10);

        for (let y = 0; y < length; y++) {
            for (let x = 0; x < width; x++) {
                cells.push(
                    <div
                        key={`${x}-${y}`}
                        className="absolute border border-amber-600"
                        style={{ width: cellSize, height: cellSize, left: x * cellSize, top: y * cellSize }}
                    />
                );
            }
        }
        return cells;
    }

    generateExits() {
        const positions = [];
        const { cellSize } = this.state;
        const width = this.props.diceResults.D10 || 5;
        const length = Math.ceil((this.props.diceResults.D100 || 50) / 10);
        const exits = Math.ceil((this.props.diceResults.D6 || 0) / 2);
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
    }

    render() {
        const { cellSize } = this.state;
        const width = this.props.diceResults.D10 || 5;
        const length = Math.ceil((this.props.diceResults.D100 || 50) / 10);

        const entranceDoor = { x: Math.floor(width / 2) * cellSize, y: length * cellSize };
        const exitPositions = this.generateExits();

        return (
            <div className="flex flex-col items-center gap-2 p-2 sm:gap-4 sm:p-4 bg-black rounded-lg">
                <div className="text-amber-600 text-sm sm:text-lg font-bold text-center">
                    Room Size: {width * 5}ft x {length * 5}ft
                </div>

                <div className="relative bg-gray-900 rounded border-2 border-amber-600"
                    style={{ width: width * cellSize + 2 * 2, height: length * cellSize + 2 * 2 }}>
                    {this.renderGrid()}

                    {/* Entrance Door */}
                    <div className="absolute w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white"
                        style={{ left: entranceDoor.x, top: entranceDoor.y - cellSize / 2 }}>
                        <ArrowRight className="w-4 h-4 sm:w-6 h-6 text-amber-600 -rotate-90" />
                    </div>

                    {/* Additional Exits */}
                    {exitPositions.map((exit, index) => (
                        <div key={index}
                            className="absolute w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                            style={{
                                left: exit.wall === 'right' ? exit.x - cellSize / 2 :
                                    exit.wall === 'left' ? exit.x - cellSize / 2 :
                                        exit.x,
                                top: exit.wall === 'top' ? exit.y - cellSize / 2 :
                                    exit.wall === 'bottom' ? exit.y - cellSize / 2 :
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
    }
}

// Attach RoomVisualization to the window object for global accessibility
window.RoomVisualization = RoomVisualization;