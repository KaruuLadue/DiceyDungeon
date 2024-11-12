// RoomVisualization.js
const RoomVisualization = {
    // Configuration
    config: {
        cellSize: 40,  // Increased cell size
        padding: 50,   // Increased padding
        legendPadding: 60,  // Increased legend padding
        minContainerWidth: 400,  // Increased minimum width
        minContainerHeight: 300, // Increased minimum height
        colors: {
            background: '#1a1a1a',     // Slightly lighter background
            grid: '#333333',           // Lighter grid lines
            accent: '#d4af37',         // Kept the same gold color
            border: '#d4af37'          // Kept the same gold color
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

        // Add download button
        this.addDownloadButton(diceResults, container, canvas);

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
        const { cellSize, padding, legendPadding, colors, minContainerWidth, minContainerHeight } = this.config;
        
        // Calculate room dimensions
        const width = diceResults?.D10 || 5;
        const length = Math.ceil((diceResults?.D100 || 50) / 10);
        const exits = Math.ceil((diceResults?.D6 || 0) / 2);
        
        // Calculate grid size
        const gridWidth = width * cellSize;
        const gridHeight = length * cellSize;
        
        // Add extra padding for title spacing
        const topPadding = padding * 1.5;  // Increased top padding
        
        // Calculate required container size
        const requiredWidth = Math.max(minContainerWidth, gridWidth + (padding * 2));
        const requiredHeight = Math.max(minContainerHeight, gridHeight + topPadding + padding + legendPadding);
        
        // Set canvas size
        canvas.width = requiredWidth;
        canvas.height = requiredHeight;
        
        // Clear canvas with background
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate grid position to center it
        const gridX = (requiredWidth - gridWidth) / 2;
        const gridY = topPadding + (requiredHeight - legendPadding - gridHeight - topPadding) / 2;
        
        // Draw title
        this.drawTitle(ctx, width, length, requiredWidth);
        
        // Draw grid
        this.drawGrid(ctx, width, length, gridX, gridY);
        
        // Draw entrance
        this.drawEntrance(ctx, width, length, gridX, gridY);
        
        // Draw exits
        this.drawExits(ctx, width, length, exits, gridX, gridY);
        
        // Draw legend
        this.drawLegend(ctx, requiredWidth, requiredHeight);
    },

    /**
     * Draw the room title showing dimensions
     */
    drawTitle(ctx, width, length, canvasWidth) {
        const { colors, padding } = this.config;
        ctx.fillStyle = colors.accent;
        ctx.font = 'bold 16px Arial';
        const text = `Room Size: ${width * 5}ft x ${length * 5}ft`;
        const textWidth = ctx.measureText(text).width;
        const x = (canvasWidth - textWidth) / 2;
        // Move title down from top edge to match bottom legend spacing
        const titleY = padding / 2;  // This will position it more evenly
        ctx.fillText(text, x, titleY);
    },

    /**
     * Draw the room grid
     */
    drawGrid(ctx, width, length, gridX, gridY) {
        const { cellSize, colors } = this.config;
        
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(gridX + (x * cellSize), gridY);
            ctx.lineTo(gridX + (x * cellSize), gridY + (length * cellSize));
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= length; y++) {
            ctx.beginPath();
            ctx.moveTo(gridX, gridY + (y * cellSize));
            ctx.lineTo(gridX + (width * cellSize), gridY + (y * cellSize));
            ctx.stroke();
        }
    },

    /**
     * Draw the entrance arrow
     */
    drawEntrance(ctx, width, length, gridX, gridY) {
        const { cellSize, colors } = this.config;
        const entranceX = gridX + (Math.floor(width/2) * cellSize);
        const entranceY = gridY + ((length - 1) * cellSize);
        
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
    drawExits(ctx, width, length, exits, gridX, gridY) {
        const { cellSize, colors } = this.config;
        const walls = ['top', 'left', 'right'];
        
        ctx.fillStyle = colors.accent;
        for (let i = 0; i < exits; i++) {
            const wall = walls[i % walls.length];
            let exitX, exitY;
            
            switch(wall) {
                case 'top':
                    exitX = gridX + (Math.floor(width/2) * cellSize);
                    exitY = gridY;
                    ctx.fillRect(exitX + 4, exitY - 12, cellSize - 8, 12);
                    break;
                case 'left':
                    exitX = gridX;
                    exitY = gridY + (Math.floor(length/2) * cellSize);
                    ctx.fillRect(exitX - 12, exitY + 4, 12, cellSize - 8);
                    break;
                case 'right':
                    exitX = gridX + (width * cellSize);
                    exitY = gridY + (Math.floor(length/2) * cellSize);
                    ctx.fillRect(exitX, exitY + 4, 12, cellSize - 8);
                    break;
            }
        }
    },

    /**
     * Download the room visualization as PNG
     * @param {Object} diceResults - The dice roll results for filename
     * @param {HTMLCanvasElement} canvas - The canvas element to download from
     */
    downloadVisualization(diceResults, canvas) {
        try {
            // Create filename from room details
            const roomType = diceResults?.D12 || 'Room';
            const width = diceResults?.D10 || 5;
            const length = Math.ceil((diceResults?.D100 || 50) / 10);
            const exits = Math.ceil((diceResults?.D6 || 0) / 2);
            
            // Format the filename
            const filename = `DiceyDungeon_${roomType}_${width*5}x${length*5}_${exits}exits.png`;
            
            // Create download link
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to download visualization:', error);
        }
    },

    // Add download button to the canvas container
    addDownloadButton(diceResults, container, canvas) {
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-button';
        downloadBtn.textContent = 'Download Room';
        downloadBtn.onclick = () => this.downloadVisualization(diceResults, canvas);
        container.appendChild(downloadBtn);
    },
    drawLegend(ctx, canvasWidth, canvasHeight) {
        const { legendPadding, colors } = this.config;
        const legendY = canvasHeight - (legendPadding/2);
        
        ctx.font = 'bold 16px Arial';  // Slightly larger, bold font
        ctx.fillStyle = colors.accent;
        
        // Calculate total width of legend items to center them
        const entranceText = '↑ Entrance';
        const exitText = 'Exit';
        const spacing = 40; // Space between legend items
        const exitSquareWidth = 12;
        const exitSquareSpacing = 8;
        
        const totalWidth = ctx.measureText(entranceText).width + 
                          ctx.measureText(exitText).width + 
                          exitSquareWidth + exitSquareSpacing + spacing;
        
        let startX = (canvasWidth - totalWidth) / 2;
        
        // Entrance legend
        ctx.fillText(entranceText, startX, legendY);
        startX += ctx.measureText(entranceText).width + spacing;
        
        // Exit legend
        ctx.fillRect(startX, legendY - 10, exitSquareWidth, exitSquareWidth);
        startX += exitSquareWidth + exitSquareSpacing;
        ctx.fillText(exitText, startX, legendY);
    }
};

// Make the visualization tool available globally
window.RoomVisualization = RoomVisualization;