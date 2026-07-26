import { Game } from './Game.js';

const game = new Game();
game.init('app').catch(console.error);

const infoBtn = document.getElementById('info-btn')!;
const closeBtn = document.getElementById('close-btn')!;
const sidePanel = document.getElementById('side-panel')!;
const paylinesContainer = document.getElementById('paylines-container')!;

infoBtn.addEventListener('click', (e) => {
    sidePanel.classList.add('open');
    e.stopPropagation();
});

closeBtn.addEventListener('click', () => {
    sidePanel.classList.remove('open');
});

// Close panel on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidePanel.classList.contains('open')) {
        sidePanel.classList.remove('open');
    }
});

// Close panel when clicking outside of it
document.addEventListener('click', (e) => {
    if (sidePanel.classList.contains('open') && !sidePanel.contains(e.target as Node)) {
        sidePanel.classList.remove('open');
    }
});

// Generate paylines illustrations
const paylines = [
    [1, 1, 1, 1, 1], // Payline 1
    [0, 0, 0, 0, 0], // Payline 2
    [2, 2, 2, 2, 2], // Payline 3
    [0, 0, 1, 2, 2], // Payline 4
    [2, 2, 1, 0, 0], // Payline 5
    [0, 1, 2, 1, 0], // Payline 6
    [2, 1, 0, 1, 2]  // Payline 7
];

paylines.forEach((line, index) => {
    const item = document.createElement('div');
    item.className = 'payline-item';
    
    const title = document.createElement('div');
    title.className = 'payline-title';
    title.textContent = `Payline ${index + 1}`;
    
    const grid = document.createElement('div');
    grid.className = 'payline-grid';
    
    // Create 3 rows by 5 columns
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            if (line[col] === row) {
                cell.classList.add('active');
            }
            grid.appendChild(cell);
        }
    }
    
    item.appendChild(title);
    item.appendChild(grid);
    paylinesContainer.appendChild(item);
});
