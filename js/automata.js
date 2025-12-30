// Cellular Automata - Conway's Game of Life
(function() {
    const canvas = document.getElementById('automata-canvas');
    const hintText = document.getElementById('hint-text');
    const whatIsThis = document.getElementById('what-is-this');
    if (!canvas || !hintText) return;

    const ctx = canvas.getContext('2d');
    let isActive = false;
    let animationFrameId = null;
    let clickCount = 0;
    const MAX_CLICKS_FOR_HINT = 10;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid configuration
    const cellSize = 8;
    let cols, rows;
    
    function updateGridSize() {
        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);
    }
    updateGridSize();
    window.addEventListener('resize', () => {
        resizeCanvas();
        updateGridSize();
        if (isActive) {
            initGrid();
        }
    });

    let grid = [];
    let nextGrid = [];

    // Initialize grid
    function initGrid() {
        grid = [];
        nextGrid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            nextGrid[i] = [];
            for (let j = 0; j < cols; j++) {
                grid[i][j] = 0;
                nextGrid[i][j] = 0;
            }
        }
    }

    // Count neighbors (with wrapping)
    function countNeighbors(grid, x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const row = (x + i + rows) % rows;
                const col = (y + j + cols) % cols;
                count += grid[row][col];
            }
        }
        return count;
    }

    // Update grid based on Game of Life rules
    function updateGrid() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const neighbors = countNeighbors(grid, i, j);
                const current = grid[i][j];

                // Game of Life rules
                if (current === 1 && (neighbors < 2 || neighbors > 3)) {
                    nextGrid[i][j] = 0; // Dies
                } else if (current === 0 && neighbors === 3) {
                    nextGrid[i][j] = 1; // Becomes alive
                } else {
                    nextGrid[i][j] = current; // Stays the same
                }
            }
        }

        // Swap grids
        const temp = grid;
        grid = nextGrid;
        nextGrid = temp;
    }

    // Draw grid
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j] === 1) {
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    // Animation loop
    let lastTime = 0;
    const fps = 10;
    const frameInterval = 1000 / fps;

    function animate(currentTime) {
        if (currentTime - lastTime >= frameInterval) {
            updateGrid();
            drawGrid();
            lastTime = currentTime;
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    // Initialize with seed pattern on click
    function seedAtPoint(x, y) {
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        
        // Create a small pattern (glider or block)
        const patterns = [
            // Glider
            [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
            // Small block
            [[0, 0], [0, 1], [1, 0], [1, 1]],
            // Toad
            [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]]
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        pattern.forEach(([dx, dy]) => {
            const r = (row + dx + rows) % rows;
            const c = (col + dy + cols) % cols;
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                grid[r][c] = 1;
            }
        });
    }

    // Activate automata
    function activateAutomata(event) {
        clickCount++;
        
        if (!isActive) {
            isActive = true;
            canvas.classList.add('active');
            initGrid();
            
            // Seed at click position
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            seedAtPoint(x, y);
            
            // Seed a few more random patterns
            for (let i = 0; i < 5; i++) {
                const randomX = Math.random() * canvas.width;
                const randomY = Math.random() * canvas.height;
                seedAtPoint(randomX, randomY);
            }
            
            drawGrid();
            lastTime = performance.now();
            animate(lastTime);
            updateHintsVisibility(); // Update hints visibility after activation
        } else {
            // If already active, add more patterns on click
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            seedAtPoint(x, y);
        }
        
        // Update hints visibility after each click
        updateHintsVisibility();
    }

    // Listen for clicks anywhere on the page
    document.addEventListener('click', activateAutomata, { once: false });
    
    // Also listen for mouse move to add patterns while active
    document.addEventListener('mousemove', (event) => {
        if (isActive && Math.random() < 0.1) { // 10% chance on mousemove
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            seedAtPoint(x, y);
        }
    });

    // Hide hints when scrolling away from home section
    function updateHintsVisibility() {
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        const rect = homeSection.getBoundingClientRect();
        // Show only if we're primarily in the home section (middle of viewport is within home section)
        const viewportMiddle = window.innerHeight / 2;
        const isInHomeSection = rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;
        
        if (isInHomeSection) {
            // Show "click around" only if click count is less than MAX_CLICKS_FOR_HINT
            if (clickCount < MAX_CLICKS_FOR_HINT) {
                hintText.classList.remove('hidden');
            } else {
                hintText.classList.add('hidden');
            }
            // Show "what is this?" only if automata is active
            if (whatIsThis && isActive) {
                whatIsThis.classList.remove('hidden');
            }
        } else {
            // Hide both when not in home section
            hintText.classList.add('hidden');
            if (whatIsThis) {
                whatIsThis.classList.add('hidden');
            }
        }
    }

    window.addEventListener('scroll', updateHintsVisibility);
    
    // Also check on initial load
    setTimeout(updateHintsVisibility, 100);
})();
