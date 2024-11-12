// RoomVisualization.js
// A configurable room visualization system using Canvas

/**
 * Default theme configuration for room visualization
 * All visual aspects can be customized through this theme object
 */
const defaultTheme = {
    grid: {
        cellSize: 40,          // Size of each grid cell in pixels
        lineWidth: 1.5,        // Thickness of grid lines
        lineColor: '#333333',  // Color of grid lines
        backgroundColor: '#1f1f1f', // Background color of grid area
        borderColor: '#d4af37' // Color of grid border
    },
    container: {
        padding: 50,           // Padding around the grid
        legendPadding: 60,     // Extra padding for legend area
        minWidth: 400,         // Minimum width of container
        minHeight: 300,        // Minimum height of container
        backgroundColor: '#1a1a1a' // Background color of entire container
    },
    elements: {
        entrance: {
            color: '#d4af37',  // Color of entrance arrow
            font: {
                family: 'Arial',
                sizeRatio: 0.8  // Size relative to cell size
            }
        },
        exits: {
            color: '#d4af37',  // Color of exit squares
            width: 12,         // Width of exit markers
            padding: 4         // Padding around exit markers
        }
    },
    text: {
        title: {
            font: {
                family: 'Arial',
                size: 16,
                weight: 'bold'
            },
            color: '#d4af37',
            marginBottom: 20
        },
        legend: {
            font: {
                family: 'Arial',
                size: 14,
                weight: 'bold'
            },
            color: '#d4af37',
            spacing: 40,
            iconSize: 12
        }
    }
};

/**
 * Main RoomVisualization object
 * Handles all room visualization functionality with configurable theming
 */
const RoomVisualization = {
    // Current active theme, initialized to default
    currentTheme: { ...defaultTheme },

    /**
     * Theme management methods
     */
    theme: {
        // Get the current theme
        get() {
            return RoomVisualization.currentTheme;
        },

        // Set the entire theme
        set(newTheme) {
            RoomVisualization.currentTheme = {
                ...defaultTheme,
                ...newTheme
            };
        },

        // Reset theme to default
        reset() {
            RoomVisualization.currentTheme = { ...defaultTheme };
        },

        // Update specific theme properties
        update(path, value) {
            const parts = path.split('.');
            let current = RoomVisualization.currentTheme;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        }
    },

    /**
     * Initialize the visualization
     * @param {Object} diceResults - Results from dice rolls
     * @param {HTMLElement} container - Container element for the canvas
     */
    initialize(diceResults, container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'room-visualization-canvas';
        container.innerHTML = '';
        container.appendChild(canvas);

        this.drawRoom(diceResults, canvas);

        const handleResize = () => this.drawRoom(diceResults, canvas);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    },

    /**
     * Draw the complete room visualization
     */
    drawRoom(diceResults, canvas) {
        const ctx = canvas.getContext('2d');
        const theme = this.currentTheme;
        
        // Calculate dimensions
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);
        const exits = Math.ceil((diceResults?.D6 || 0) / 2);
        
        // Calculate sizes
        const gridWidth = width * theme.grid.cellSize;
        const gridHeight = length * theme.grid.cellSize;
        const topPadding = theme.container.padding * 1.5;
        
        // Set canvas size
        canvas.width = Math.max(theme.container.minWidth, gridWidth + (theme.container.padding * 2));
        canvas.height = Math.max(theme.container.minHeight, 
            gridHeight + topPadding + theme.container.padding + theme.container.legendPadding);
        
        // Draw background
        this.drawBackground(ctx, canvas.width, canvas.height);
        
        // Calculate grid position
        const gridX = (canvas.width - gridWidth) / 2;
        const gridY = topPadding + ((canvas.height - theme.container.legendPadding - gridHeight - topPadding) / 2);
        
        // Draw components
        this.drawTitle(ctx, width, length, canvas.width, topPadding);
        this.drawGrid(ctx, width, length, gridX, gridY);
        this.drawEntrance(ctx, width, length, gridX, gridY);
        this.drawExits(ctx, width, length, exits, gridX, gridY);
        this.drawLegend(ctx, canvas.width, canvas.height);
    },

    /**
     * Draw the background
     */
    drawBackground(ctx, width, height) {
        const { backgroundColor } = this.currentTheme.container;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    },

    /**
     * Draw the room title
     */
    drawTitle(ctx, width, length, canvasWidth, topPadding) {
        const { title } = this.currentTheme.text;
        ctx.fillStyle = title.color;
        ctx.font = `${title.font.weight} ${title.font.size}px ${title.font.family}`;
        const text = `Room Size: ${width * 5}ft x ${length * 5}ft`;
        const textWidth = ctx.measureText(text).width;
        const x = (canvasWidth - textWidth) / 2;
        ctx.fillText(text, x, topPadding / 2);
    },

    /**
     * Draw the grid
     */
    drawGrid(ctx, width, length, gridX, gridY) {
        const { grid } = this.currentTheme;
        
        // Draw grid background
        ctx.fillStyle = grid.backgroundColor;
        ctx.fillRect(gridX, gridY, width * grid.cellSize, length * grid.cellSize);
        
        // Draw grid lines
        ctx.strokeStyle = grid.lineColor;
        ctx.lineWidth = grid.lineWidth;
        
        // Draw vertical lines
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(gridX + (x * grid.cellSize), gridY);
            ctx.lineTo(gridX + (x * grid.cellSize), gridY + (length * grid.cellSize));
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= length; y++) {
            ctx.beginPath();
            ctx.moveTo(gridX, gridY + (y * grid.cellSize));
            ctx.lineTo(gridX + (width * grid.cellSize), gridY + (y * grid.cellSize));
            ctx.stroke();
        }

        // Draw border last (so it appears on top)
        ctx.strokeStyle = grid.border.color;
        ctx.lineWidth = grid.border.width;
        ctx.strokeRect(gridX, gridY, width * grid.cellSize, length * grid.cellSize);
    },

    /**
     * Draw the entrance arrow
     */
    drawEntrance(ctx, width, length, gridX, gridY) {
        const { entrance } = this.currentTheme.elements;
        const { cellSize } = this.currentTheme.grid;
        
        const entranceX = gridX + (Math.floor(width/2) * cellSize);
        const entranceY = gridY + ((length - 1) * cellSize);
        
        ctx.fillStyle = entrance.color;
        ctx.font = `${Math.floor(cellSize * entrance.font.sizeRatio)}px ${entrance.font.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw the arrow character centered in the cell
        const cellCenterX = entranceX + (cellSize / 2);
        const cellCenterY = entranceY + (cellSize / 2);
        ctx.fillText('↑', cellCenterX, cellCenterY);
    },

    /**
     * Draw the exit squares
     */
    drawExits(ctx, width, length, exits, gridX, gridY) {
        const { exits: exitTheme } = this.currentTheme.elements;
        const { cellSize } = this.currentTheme.grid;
        
        ctx.fillStyle = exitTheme.color;
        const walls = ['top', 'left', 'right'];
        
        for (let i = 0; i < exits; i++) {
            const wall = walls[i % walls.length];
            let exitX, exitY;
            
            switch(wall) {
                case 'top':
                    exitX = gridX + (Math.floor(width/2) * cellSize);
                    exitY = gridY;
                    ctx.fillRect(exitX + exitTheme.padding, 
                               exitY - exitTheme.width, 
                               cellSize - (exitTheme.padding * 2), 
                               exitTheme.width);
                    break;
                case 'left':
                    exitX = gridX;
                    exitY = gridY + (Math.floor(length/2) * cellSize);
                    ctx.fillRect(exitX - exitTheme.width, 
                               exitY + exitTheme.padding, 
                               exitTheme.width, 
                               cellSize - (exitTheme.padding * 2));
                    break;
                case 'right':
                    exitX = gridX + (width * cellSize);
                    exitY = gridY + (Math.floor(length/2) * cellSize);
                    ctx.fillRect(exitX, 
                               exitY + exitTheme.padding, 
                               exitTheme.width, 
                               cellSize - (exitTheme.padding * 2));
                    break;
            }
        }
    },

    /**
     * Draw the legend
     */
    drawLegend(ctx, canvasWidth, canvasHeight) {
        const { legend } = this.currentTheme.text;
        const legendY = canvasHeight - (this.currentTheme.container.legendPadding/2);
        
        ctx.font = `${legend.font.weight} ${legend.font.size}px ${legend.font.family}`;
        ctx.fillStyle = legend.color;
        
        // Calculate legend layout
        const entranceText = '↑ Entrance';
        const exitText = 'Exit';
        const exitSquareWidth = this.currentTheme.elements.exits.width;
        const totalWidth = ctx.measureText(entranceText).width + 
                          ctx.measureText(exitText).width + 
                          exitSquareWidth + legend.spacing;
        
        // Draw legend items
        let startX = (canvasWidth - totalWidth) / 2;
        
        // Entrance legend
        ctx.fillText(entranceText, startX, legendY);
        startX += ctx.measureText(entranceText).width + legend.spacing;
        
        // Exit legend
        ctx.fillRect(startX, legendY - 10, exitSquareWidth, exitSquareWidth);
        startX += exitSquareWidth + 8;
        ctx.fillText(exitText, startX, legendY);
    }
};

// Example usage:
// RoomVisualization.theme.update('text.title.font.size', 20);
// RoomVisualization.theme.update('text.legend.font.size', 16);
// RoomVisualization.theme.update('text.title.font.family', 'Uncial Antiqua');
// RoomVisualization.theme.update('grid.lineColor', '#444444');

// Make the visualization tool available globally
window.RoomVisualization = RoomVisualization;