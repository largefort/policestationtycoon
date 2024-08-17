let cash = 1000;
let gems = 50;
let employees = [];
let structures = [];
let criminals = [];
let totalCriminals = 0;
let totalCasesSolved = 0;
const cashHistory = [];
const employeeHistory = [];

const wageRates = {
    officer: 10,
    receptionist: 5,
    detective: 20,
    intern: 3
};

const structureCosts = {
    cell: { cash: 500, gems: 10 },
    isolation: { cash: 800, gems: 15 },
    interrogation: { cash: 1000, gems: 20 },
    armory: { cash: 1500, gems: 30 }
};

const structureCapacity = {
    cell: 5,
    isolation: 1,
    interrogation: 2,
    armory: 3
};

const caseDifficulty = {
    easy: { time: 60, reward: 100 },
    medium: { time: 120, reward: 200 },
    hard: { time: 240, reward: 500 }
};

const missions = [
    { description: 'Arrest 5 criminals', check: () => totalCriminals >= 5, reward: 500 },
    { description: 'Solve 3 cases', check: () => totalCasesSolved >= 3, reward: 300 },
    { description: 'Build 3 cells', check: () => structures.filter(s => s.type === 'cell').length >= 3, reward: 700 }
];

document.getElementById('background-music').play();

function updateUI() {
    document.getElementById('cash').textContent = cash;
    document.getElementById('gems').textContent = gems;
    updateEmployeeList();
    updateStructureList();
    updateCriminalList();
}

function hireEmployee(type) {
    if (cash >= wageRates[type]) {
        cash -= wageRates[type];
        employees.push({ type, wage: wageRates[type] });
        playSound('cash-sound');
        updateUI();
    } else {
        alert('Not enough cash to hire ' + type);
    }
}

function hireDetective() {
    if (cash >= wageRates.detective) {
        cash -= wageRates.detective;
        employees.push({ type: 'detective', wage: wageRates.detective, solvingCase: false });
        updateUI();
    } else {
        alert('Not enough cash to hire a detective');
    }
}

function buildStructure(type) {
    if (cash >= structureCosts[type].cash && gems >= structureCosts[type].gems) {
        cash -= structureCosts[type].cash;
        gems -= structureCosts[type].gems;
        structures.push({ type, capacity: structureCapacity[type], criminals: [] });
        playSound('cash-sound');
        updateUI();
    } else {
        alert('Not enough resources to build ' + type);
    }
}

function startCase(difficulty) {
    const availableDetective = employees.find(employee => employee.type === 'detective' && !employee.solvingCase);
    if (availableDetective) {
        availableDetective.solvingCase = true;
        setTimeout(() => {
            availableDetective.solvingCase = false;
            cash += caseDifficulty[difficulty].reward;
            totalCasesSolved += 1;
            alert(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} case solved! Reward: ${caseDifficulty[difficulty].reward} cash`);
            updateGraphs();
            updateUI();
        }, caseDifficulty[difficulty].time * 1000); // Time in seconds
    } else {
        alert('No available detective to solve this case');
    }
}

function updateEmployeeList() {
    const employeeList = document.getElementById('employee-list');
    employeeList.innerHTML = '';
    employees.forEach((employee, index) => {
        const li = document.createElement('li');
        li.textContent = `${employee.type} - Wage: ${employee.wage}`;
        employeeList.appendChild(li);
    });
}

function updateStructureList() {
    const structureList = document.getElementById('structure-list');
    structureList.innerHTML = '';
    structures.forEach((structure, index) => {
        const li = document.createElement('li');
        li.textContent = `${structure.type} - Capacity: ${structure.capacity - structure.criminals.length}/${structure.capacity}`;
        structureList.appendChild(li);
    });
}

function updateCriminalList() {
    const criminalList = document.getElementById('criminal-list');
    criminalList.innerHTML = '';
    structures.forEach((structure, index) => {
        structure.criminals.forEach((criminal, i) => {
            const li = document.createElement('li');
            li.textContent = `Criminal ${i + 1} - ${structure.type}`;
            criminalList.appendChild(li);
        });
    });
}

function saveGame() {
    const gameState = {
        cash,
        gems,
        employees,
        structures,
        criminals,
        totalCriminals,
        totalCasesSolved
    };
    localStorage.setItem('policeTycoonSave', JSON.stringify(gameState));
    alert('Game Saved!');
}

function loadGame() {
    const savedState = JSON.parse(localStorage.getItem('policeTycoonSave'));
    if (savedState) {
        cash = savedState.cash;
        gems = savedState.gems;
        employees = savedState.employees;
        structures = savedState.structures;
        criminals = savedState.criminals;
        totalCriminals = savedState.totalCriminals;
        totalCasesSolved = savedState.totalCasesSolved;
        updateUI();
        alert('Game Loaded!');
    } else {
        alert('No saved game found!');
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        cash = 1000;
        gems = 50;
        employees = [];
        structures = [];
        criminals = [];
        totalCriminals = 0;
        totalCasesSolved = 0;
        updateUI();
        localStorage.removeItem('policeTycoonSave');
    }
}

function simulateCrimeReport() {
    const availableStructure = structures.find(structure => structure.criminals.length < structure.capacity);
    if (availableStructure) {
        availableStructure.criminals.push({ name: 'Criminal ' + (criminals.length + 1) });
        criminals.push({ name: 'Criminal ' + (criminals.length + 1), structure: availableStructure.type });
        cash += 100; // Earn cash per criminal
        totalCriminals += 1;
        updateGraphs();
        playSound('cash-sound');
        updateUI();
    } else {
        alert('No available space for criminals!');
        playSound('alert-sound');
    }
}

function triggerEvent() {
    const events = [
        { name: 'High-Profile Crime', effect: () => { startCase('hard'); }, message: 'A high-profile crime needs solving immediately!' },
        { name: 'Emergency', effect: () => { cash -= 200; alert('Emergency! Funds have been deducted.'); }, message: 'An emergency occurred. Immediate funds needed!' },
        { name: 'Budget Cut', effect: () => { gems -= 10; alert('Budget cut! Gems have been deducted.'); }, message: 'Government budget cuts. Gems reduced!' }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    alert(randomEvent.message);
    randomEvent.effect();
    updateUI();
}

// Trigger an event every 5 minutes
setInterval(triggerEvent, 300000); // 5 minutes = 300000 ms

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
}

function updateGraphs() {
    cashHistory.push(cash);
    employeeHistory.push(employees.length);

    const cashCtx = document.getElementById('cashGraph').getContext('2d');
    const employeeCtx = document.getElementById('employeeGraph').getContext('2d');

    new Chart(cashCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: cashHistory.length }, (_, i) => i + 1),
            datasets: [{ label: 'Cash Over Time', data: cashHistory, borderColor: 'green', fill: false }]
        },
        options: { responsive: true }
    });

    new Chart(employeeCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: employeeHistory.length }, (_, i) => i + 1),
            datasets: [{ label: 'Employees Over Time', data: employeeHistory, borderColor: 'blue', fill: false }]
        },
        options: { responsive: true }
    });

    document.getElementById('total-criminals').textContent = totalCriminals;
    document.getElementById('total-cases').textContent = totalCasesSolved;
}

function checkMissions() {
    missions.forEach((mission, index) => {
        if (mission.check()) {
            cash += mission.reward;
            alert(`Mission Complete: ${mission.description}. Reward: ${mission.reward} cash.`);
            missions.splice(index, 1);
        }
    });
    updateUI();
}

// Simulate a crime report every 2 minutes
setInterval(simulateCrimeReport, 120000); // 2 minutes = 120000 ms

// Update graphs at regular intervals
setInterval(updateGraphs, 60000); // Every minute

// Check missions periodically
setInterval(checkMissions, 10000); // Every 10 seconds

// Example to simulate the passage of time
setInterval(() => {
    cash += 50; // Increase cash per minute
    employees.forEach(employee => {
        cash -= employee.wage;
    });

    updateUI();
}, 60000); // 1 minute = 60000 ms

// Load game on startup
window.onload = loadGame;

updateUI();
