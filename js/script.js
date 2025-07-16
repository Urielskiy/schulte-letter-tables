document.addEventListener('DOMContentLoaded', () => {
    // Game history
    let gameHistory = [];
    // DOM elements
    const tableSizeSelect = document.getElementById('table-size');
    const alphabetSelect = document.getElementById('alphabet-select');
    const startBtn = document.getElementById('start-btn');
    const generateBtn = document.getElementById('generate-btn');
    const stopBtn = document.getElementById('stop-btn');
    const colorModeCheckbox = document.getElementById('color-mode');
    const schulteTable = document.getElementById('schulte-table');
    const targetLetterElement = document.getElementById('target-letter');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    // History elements
    const historyEmptyElement = document.getElementById('history-empty');
    const historyTableElement = document.getElementById('history-table');
    const historyBodyElement = document.getElementById('history-body');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Game state
    let gameActive = false;
    let startTime;
    let timerInterval;
    let currentTargetLetter = '';
    let foundLetters = [];
    let letters = [];
    let tableSize = 5;

    // Alphabets
    const alphabets = {
        ukrainian: 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ',
        english: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    };

    // Initialize the game
    function initGame() {
        // Reset game state
        gameActive = false;
        currentTargetLetter = '';
        foundLetters = [];
        clearInterval(timerInterval);
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        
        // Get selected options
        tableSize = parseInt(tableSizeSelect.value);
        const selectedAlphabet = alphabetSelect.value;
        
        // Generate shuffled letters
        let alphabet = alphabets[selectedAlphabet];
        console.log('Selected alphabet:', alphabet);
        
        // If table size is larger than alphabet, we'll use a subset or repeat letters
        const totalCells = tableSize * tableSize;
        console.log('Total cells needed:', totalCells);
        
        if (totalCells <= alphabet.length) {
            // Shuffle and take subset of alphabet
            letters = shuffleArray(alphabet.split('')).slice(0, totalCells);
            console.log('Using subset of alphabet, letters:', letters);
        } else {
            // Need to repeat some letters
            letters = [];
            while (letters.length < totalCells) {
                letters = letters.concat(shuffleArray(alphabet.split('')));
            }
            letters = letters.slice(0, totalCells);
            console.log('Using repeated alphabet, letters:', letters);
        }
        
        // Create the table grid
        console.log('Creating table with letters:', letters);
        createTable();
        console.log('Table created');
    }

    // Create the Schulte table
    function createTable() {
        console.log('Starting createTable function');
        console.log('Table size:', tableSize);
        console.log('Letters array length:', letters.length);
        
        schulteTable.innerHTML = '';
        schulteTable.style.gridTemplateColumns = `repeat(${tableSize}, 1fr)`;
        
        if (!letters || letters.length === 0) {
            console.error('Letters array is empty or undefined!');
            return;
        }
        
        console.log('Creating cells for letters:', letters);
        
        letters.forEach((letter, index) => {
            const cell = document.createElement('div');
            cell.className = 'schulte-cell';
            cell.textContent = letter;
            cell.dataset.index = index;
            cell.addEventListener('click', handleCellClick);
            
            // Apply color mode if enabled
            if (colorModeCheckbox.checked) {
                const hue = (index / letters.length) * 360;
                cell.style.backgroundColor = `hsl(${hue}, 80%, 90%)`;
                cell.style.color = `hsl(${hue}, 80%, 30%)`;
            }
            
            schulteTable.appendChild(cell);
            console.log(`Added cell ${index} with letter ${letter}`);
        });
        
        console.log('Finished creating table with', schulteTable.children.length, 'cells');
    }

    // Start the game
    function startGame() {
        if (gameActive) return;
        
        // Make sure we have letters in the table
        if (!letters || letters.length === 0) {
            console.log('No letters available, generating table first');
            initGame();
        }
        
        gameActive = true;
        startTime = new Date();
        foundLetters = [];
        
        // Select a random letter from the table
        selectRandomTargetLetter();
        
        // Start timer
        timerInterval = setInterval(updateTimer, 1000);
        
        // Disable settings during gameplay
        tableSizeSelect.disabled = true;
        alphabetSelect.disabled = true;
        startBtn.disabled = true;
    }
    
    // Select a random letter from the table that hasn't been found yet
    function selectRandomTargetLetter() {
        // Filter out letters that have already been found
        const availableLetters = letters.filter(letter => !foundLetters.includes(letter));
        
        // If all letters have been found, end the game
        if (availableLetters.length === 0) {
            endGame();
            return;
        }
        
        // Select a random letter from the available letters
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        currentTargetLetter = availableLetters[randomIndex];
        targetLetterElement.textContent = currentTargetLetter;
    }

    // Update the timer display
    function updateTimer() {
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }

    // Handle cell click
    function handleCellClick(event) {
        if (!gameActive) return;
        
        const clickedLetter = event.target.textContent;
        
        if (clickedLetter === currentTargetLetter) {
            // Correct letter clicked
            event.target.classList.add('correct');
            
            // Add to found letters
            foundLetters.push(currentTargetLetter);
            
            // Progress tracking
            const progress = (foundLetters.length / letters.length) * 100;
            
            // Check if game is complete
            if (foundLetters.length >= letters.length) {
                endGame();
            } else {
                // Select next random letter
                selectRandomTargetLetter();
            }
        } else {
            // Wrong letter clicked
            event.target.classList.add('wrong');
            
            // Remove the wrong class after animation
            setTimeout(() => {
                event.target.classList.remove('wrong');
            }, 500);
        }
    }

    // End the game
    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        
        // Calculate final time
        const endTime = new Date();
        const totalSeconds = Math.floor((endTime - startTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Add to history
        const historyEntry = {
            date: new Date(),
            alphabet: alphabetSelect.options[alphabetSelect.selectedIndex].text,
            size: `${tableSize}×${tableSize}`,
            time: timeString
        };
        
        gameHistory.push(historyEntry);
        updateHistoryDisplay();
        
        // Re-enable settings
        tableSizeSelect.disabled = false;
        alphabetSelect.disabled = false;
        startBtn.disabled = false;
        
        // Reset for a new game
        initGame();
    }

    // Reset the game
    function resetGame() {
        clearInterval(timerInterval);
        
        // Re-enable settings
        tableSizeSelect.disabled = false;
        alphabetSelect.disabled = false;
        startBtn.disabled = false;
        
        initGame();
    }

    // Utility function to shuffle an array
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // This function is already defined elsewhere in the code

    // Update history display
    function updateHistoryDisplay() {
        if (gameHistory.length === 0) {
            historyEmptyElement.classList.remove('hidden');
            historyTableElement.classList.add('hidden');
            return;
        }
        
        historyEmptyElement.classList.add('hidden');
        historyTableElement.classList.remove('hidden');
        
        // Clear existing rows
        historyBodyElement.innerHTML = '';
        
        // Add history entries
        gameHistory.forEach(entry => {
            const row = document.createElement('tr');
            
            // Format date
            const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = entry.date.toLocaleDateString('uk-UA', dateOptions);
            
            // Create cells
            const dateCell = document.createElement('td');
            dateCell.textContent = formattedDate;
            
            const alphabetCell = document.createElement('td');
            alphabetCell.textContent = entry.alphabet;
            
            const sizeCell = document.createElement('td');
            sizeCell.textContent = entry.size;
            
            const timeCell = document.createElement('td');
            timeCell.textContent = entry.time;
            
            // Add cells to row
            row.appendChild(dateCell);
            row.appendChild(alphabetCell);
            row.appendChild(sizeCell);
            row.appendChild(timeCell);
            
            // Add row to table
            historyBodyElement.appendChild(row);
        });
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    generateBtn.addEventListener('click', function() {
        console.log('Generate button clicked');
        console.log('Table size:', tableSizeSelect.value);
        console.log('Alphabet:', alphabetSelect.value);
        initGame();
        console.log('Letters generated:', letters);
        console.log('Table created with size:', tableSize);
    });
    stopBtn.addEventListener('click', resetGame);
    colorModeCheckbox.addEventListener('change', createTable);
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', () => {
        gameHistory = [];
        updateHistoryDisplay();
    });

    // Initialize the game on load
    initGame();
    updateHistoryDisplay();
});
