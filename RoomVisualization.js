// RoomVisualization.js
// Handles the canvas-based rendering of dungeon rooms

/**
 * Creates and manages a room visualization using Canvas
 * @param {Object} diceResults - The results from dice rolls
 * @param {string} containerId - The ID of the container element for the canvas
 */
const RoomVisualization = {
    // Configuration
    config: {
        cellSize: 32,
        padding: 40,
        legendPadding: 40,
        colors: {
            background: '#111111',
            grid: '#4a5568',
            accent: '#d4af37',  // The gold color used throughout the project
            border: '#d4af37'
        }
    },

    /**
     * Initialize the visualization
     * @param {Object} diceResults - Results from dice rolls
     * @param {HTMLElement} container - Container element for the canvas
     */
    initialize(diceResults, container) {
        // Create canvas if it doesn't exist
        const canvas = document.createElement('canvas');
        canvas.className = 'room-visualization-canvas';
        container.innerHTML = ''; // Clear container
        container.appendChild(canvas);

        // Draw the room
        this.drawRoom(diceResults, canvas);

        // Handle window resize
        const handleResize = () => this.drawRoom(diceResults, canvas);
        window.addEventListener('resize', handleResize);

        // Return cleanup function
        return () => window.removeEventListener('resize', handleResize);
    },

    /**
     * Draw the room visualization
     * @param {Object} diceResults - The dice roll results
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     */
    drawRoom(diceResults, canvas) {
        const ctx = canvas.getContext('2d');
        const { cellSize, padding, legendPadding, colors } = this.config;
        
        // Calculate room dimensions
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);
        const exits = Math.ceil((diceResults?.D6 || 0) / 2);
        
        // Set up canvas size
        canvas.width = (width * cellSize) + (padding * 2);
        canvas.height = (length * cellSize) + (padding * 2) + legendPadding;
        
        // Clear canvas
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title
        this.drawTitle(ctx, width, length);
        
        // Draw grid
        this.drawGrid(ctx, width, length);
        
        // Draw entrance
        this.drawEntrance(ctx, width, length);
        
        // Draw exits
        this.drawExits(ctx, width, length, exits);
        
        // Draw legend
        this.drawLegend(ctx, canvas.height);
    },

    /**
     * Draw the room title showing dimensions
     */
    drawTitle(ctx, width, length) {
        const { padding, colors } = this.config;
        ctx.fillStyle = colors.accent;
        ctx.font = '16px Arial';
        ctx.fillText(`Room Size: ${width * 5}ft x ${length * 5}ft`, padding, 25);
    },

    /**
     * Draw the room grid
     */
    drawGrid(ctx, width, length) {
        const { cellSize, padding, colors } = this.config;
        
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(padding + (x * cellSize), padding);
            ctx.lineTo(padding + (x * cellSize), padding + (length * cellSize));
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= length; y++) {
            ctx.beginPath();
            ctx.moveTo(padding, padding + (y * cellSize));
            ctx.lineTo(padding + (width * cellSize), padding + (y * cellSize));
            ctx.stroke();
        }
    },

    /**
     * Draw the entrance arrow
     */
    drawEntrance(ctx, width, length) {
        const { cellSize, padding, colors } = this.config;
        const entranceX = padding + (Math.floor(width/2) * cellSize);
        const entranceY = padding + ((length - 1) * cellSize);
        
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(entranceX + (cellSize/2), entranceY + 5); // Top point
        ctx.lineTo(entranceX + 5, entranceY + cellSize - 5); // Bottom-left
        ctx.lineTo(entranceX + cellSize - 5, entranceY + cellSize - 5); // Bottom-right
        ctx.closePath();
        ctx.fill();
    },

    /**
     * Draw the exit squares
     */
    drawExits(ctx, width, length, exits) {
        const { cellSize, padding, colors } = this.config;
        const walls = ['top', 'left', 'right'];
        
        ctx.fillStyle = colors.accent;
        for (let i = 0; i < exits; i++) {
            const wall = walls[i % walls.length];
            let exitX, exitY;
            
            switch(wall) {
                case 'top':
                    exitX = padding + (Math.floor(width/2) * cellSize);
                    exitY = padding;
                    ctx.fillRect(exitX + 4, exitY - 12, cellSize - 8, 12);
                    break;
                case 'left':
                    exitX = padding;
                    exitY = padding + (Math.floor(length/2) * cellSize);
                    ctx.fillRect(exitX - 12, exitY + 4, 12, cellSize - 8);
                    break;
                case 'right':
                    exitX = padding + (width * cellSize);
                    exitY = padding + (Math.floor(length/2) * cellSize);
                    ctx.fillRect(exitX, exitY + 4, 12, cellSize - 8);
                    break;
            }
        }
    },

    /**
     * Draw the legend
     */
    drawLegend(ctx, canvasHeight) {
        const { padding, legendPadding, colors } = this.config;
        const legendY = canvasHeight - (legendPadding/2);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = colors.accent;
        
        // Entrance legend
        ctx.fillText('↑ Entrance', padding, legendY);
        
        // Exit legend
        ctx.fillRect(padding + 100, legendY - 10, 12, 12);
        ctx.fillText('Exit', padding + 120, legendY);
    }
};

// Make the visualization tool available globally
window.RoomVisualization = RoomVisualization;