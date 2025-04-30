const board = document.getElementById('gameBoard');
const tileSize = 40;
let placingTower = false;
let money = 100;
let currentWave = 1;
let enemies = [];
let towers = [];
let selectedTower = null;
let waveInProgress = false;
let gameActive = true;
let scheduledEnemies = 0;

const towerTypes = { /* ... (прежние настройки башен) ... */ };

function createBoard() { /* ... (прежняя реализация) ... */ }

function selectTower(type, cost) {
    if(!gameActive || money < cost || placingTower) return;
    placingTower = type;
    money -= cost;
    updateMoney();
}

board.addEventListener('click', (e) => {
    if(!gameActive || !placingTower) return;
    
    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const isPath = [...document.querySelectorAll('.tile')].some(tile => {
        const tileX = parseInt(tile.style.left);
        const tileY = parseInt(tile.style.top);
        return x >= tileX && x <= tileX + tileSize && 
               y >= tileY && y <= tileY + tileSize;
    });
    
    const isTower = towers.some(tower => 
        Math.hypot(x - tower.x, y - tower.y) < 30
    );
    
    if(!isPath && !isTower) {
        const tower = {...towerTypes[placingTower], x, y, lastAttack: 0};
        towers.push(tower);
        placeTower(tower);
        placingTower = false;
    }
});

function placeTower(tower) {
    const elem = document.createElement('div');
    elem.className = `tower ${tower.type}`;
    elem.style.left = `${tower.x}px`;
    elem.style.top = `${tower.y}px`;
    
    // Создание радиуса
    const radius = document.createElement('div');
    radius.className = 'radius';
    radius.style.width = `${tower.radius * 2}px`;
    radius.style.height = `${tower.radius * 2}px`;
    radius.style.left = `${tower.x}px`;
    radius.style.top = `${tower.y}px`;

    // Добавление элементов на доску
    board.appendChild(elem);
    board.appendChild(radius);
    
    // Сохранение ссылок
    tower.elem = elem;
    tower.radiusElem = radius;
}

// Исправленная функция startWave
function startWave() {
    waveInProgress = true;
    console.log(`Start wave ${currentWave}`);
    
    const waveSettings = {
        1: { count: 3, type: 'basic', delay: 2000 },
        2: { count: 5, type: 'basic', delay: 1500 },
        3: { count: 10, type: 'basic', delay: 1000 },
        4: { count: 15, type: 'basic', delay: 800 },
        5: { count: 5, type: 'basic', delay: 1500, boss: true }
    };

    const settings = waveSettings[currentWave] || { 
        count: currentWave * 2, 
        type: 'basic', 
        delay: 1000 
    };

    scheduledEnemies = settings.count;
    
    for(let i = 0; i < settings.count; i++) {
        setTimeout(() => {
            const type = settings.boss && i === settings.count-1 ? 'boss' : settings.type;
            spawnEnemy(type);
            scheduledEnemies--;
            console.log(`Enemy spawned: ${type}`);
        }, i * settings.delay);
    }
}

// Добавить в initGame
function initGame() {
    // ... (предыдущий код)
    
    // Запуск первой волны сразу
    setTimeout(() => startWave(), 1000);
}

// Исправленная функция spawnEnemy
function spawnEnemy(type) {
    const enemyTypes = {
        basic: { hp: 2, speed: 2, color: 'red' },
        boss: { hp: 10, speed: 1, color: 'purple' }
    };
    
    const enemy = { 
        ...enemyTypes[type], 
        x: 0, 
        y: 4 * tileSize + 10, 
        pathIndex: 0 
    };
    
    const elem = document.createElement('div');
    elem.className = `enemy ${enemy.color}`;
    elem.style.left = `${enemy.x}px`;
    elem.style.top = `${enemy.y}px`;
    
    board.appendChild(elem);
    enemy.elem = elem;
    enemies.push(enemy);
    
    console.log(`New enemy created at ${enemy.x},${enemy.y}`);
}
    const enemy = {...enemyTypes[type], x: 0, y: 4*tileSize+10, pathIndex: 0};
    
    const elem = document.createElement('div');
    elem.className = `enemy ${enemy.color}`;
    elem.style.left = enemy.x + 'px';
    elem.style.top = enemy.y + 'px';
    
    board.appendChild(elem);
    enemy.elem = elem;
    enemies.push(enemy);
}

function gameLoop() {
    if(!gameActive) return;
    
    // Движение врагов
    enemies.forEach((enemy, index) => {
        const path = document.querySelectorAll('.tile');
        if(enemy.pathIndex >= path.length-1) return endGame();
        
        const nextTile = path[enemy.pathIndex + 1];
        const targetX = parseInt(nextTile.style.left) + tileSize/2;
        const targetY = parseInt(nextTile.style.top) + tileSize/2;
        
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.hypot(dx, dy);
        
        if(distance < 2) {
            enemy.pathIndex++;
        } else {
            enemy.x += (dx/distance) * enemy.speed;
            enemy.y += (dy/distance) * enemy.speed;
        }
        
        enemy.elem.style.left = enemy.x + 'px';
        enemy.elem.style.top = enemy.y + 'px';
    });
    
    attackLogic();
    checkWaveCompletion();
    requestAnimationFrame(gameLoop);
}

function attackLogic() {
    towers.forEach(tower => {
        const now = Date.now();
        let speed, radius, damage;
        
        if(tower.type === 'knight') {
            // Атака ближнего радиуса
            if(now - tower.lastAttack > 1000/tower.attackSpeed1) {
                attackEnemy(tower, tower.radius1, tower.damage1);
                tower.lastAttack = now;
            }
            // Атака дальнего радиуса
            if(now - tower.lastAttack > 1000/tower.attackSpeed2) {
                attackEnemy(tower, tower.radius2, tower.damage2);
                tower.lastAttack = now;
            }
        } else {
            speed = tower.attackSpeed;
            radius = tower.radius;
            damage = tower.damage;
            
            if(now - tower.lastAttack > 1000/speed) {
                attackEnemy(tower, radius, damage);
                tower.lastAttack = now;
            }
        }
    });
}

function attackEnemy(tower, radius, damage) {
    const target = enemies.find(enemy => 
        Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < radius
    );
    
    if(target) {
        target.hp -= damage;
        
        if(target.hp <= 0) {
            target.elem.remove();
            enemies = enemies.filter(e => e !== target);
            money += 10;
            updateMoney();
        }
    }
}

function startWave() {
    waveInProgress = true;
    document.getElementById('wave').textContent = currentWave;
    
    let count = currentWave * 2;
    scheduledEnemies = count;
    
    for(let i = 0; i < count; i++) {
        setTimeout(() => {
            let type = 'basic';
            if(currentWave >= 5) type = 'purple';
            if(currentWave >= 10) type = 'gold';
            if(currentWave >= 15) type = 'green';
            spawnEnemy(type);
            scheduledEnemies--;
        }, i * 1000);
    }
}

function checkWaveCompletion() {
    if(enemies.length === 0 && scheduledEnemies === 0 && waveInProgress) {
        waveInProgress = false;
        currentWave++;
        setTimeout(startWave, 2000);
    }
}

/* ... (остальные функции остаются без изменений) ... */

function initGame() {
    board.innerHTML = '';
    createBoard();
    money = 100;
    currentWave = 1;
    enemies = [];
    towers = [];
    updateMoney();
    document.getElementById('wave').textContent = currentWave;
    document.getElementById('gameOver').style.display = 'none';
    gameActive = true;
    startWave();
    gameLoop();
}

window.addEventListener('load', initGame);
function createBoard() {
    const path = [
        {x:0, y:4}, {x:1, y:4}, {x:2, y:4}, {x:3, y:4}, {x:4, y:4}, {x:5, y:4},
        {x:5, y:5}, {x:5, y:6}, {x:5, y:7}, {x:5, y:8}, {x:5, y:9},
        {x:6, y:9}, {x:7, y:9}, {x:8, y:9}, {x:9, y:9}, {x:10, y:9},
        {x:10, y:8}, {x:10, y:7}, {x:10, y:6}, {x:10, y:5},
        {x:11, y:5}, {x:12, y:5}, {x:13, y:5}, {x:14, y:5}, {x:15, y:5},
        {x:15, y:6}, {x:15, y:7}, {x:15, y:8}, {x:15, y:9}, {x:15, y:10},
        {x:16, y:10}, {x:17, y:10}, {x:18, y:10}, {x:19, y:10}, {x:20, y:10},
        {x:20, y:11}
    ];

    // Очищаем доску перед созданием новых плиток
    board.innerHTML = '';
    
    path.forEach((pos, index) => {
        const tile = document.createElement('div');
        tile.className = `tile ${index === 0 ? 'start' : index === path.length-1 ? 'end' : 'path'}`;
        tile.style.left = pos.x * tileSize + 'px';
        tile.style.top = pos.y * tileSize + 'px';
        board.appendChild(tile);
    });

    // Сохраняем позицию конца пути
    endPosition = {
        x: path[path.length-1].x * tileSize,
        y: path[path.length-1].y * tileSize
    };
}

// Исправленный обработчик клика
board.addEventListener('click', (e) => {
    if(!gameActive || !placingTower) return;
    
    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Проверка нахождения на дорожке
    const isPath = [...document.querySelectorAll('.tile.path, .tile.start, .tile.end')]
        .some(tile => {
            const tileX = parseInt(tile.style.left);
            const tileY = parseInt(tile.style.top);
            return x >= tileX && x <= tileX + tileSize && 
                   y >= tileY && y <= tileY + tileSize;
        });
    
    // Проверка на другие башни
    const isTower = towers.some(tower => 
        Math.hypot(x - tower.x, y - tower.y) < 30
    );
    
    if(!isPath && !isTower) {
        const tower = {
            ...towerTypes[placingTower],
            x: x,
            y: y,
            lastAttack: 0
        };
        towers.push(tower);
        placeTower(tower);
        placingTower = false;
    }
});

// Убедитесь, что initGame вызывает createBoard
function initGame() {
    money = 100;
    currentWave = 1;
    enemies = [];
    towers = [];
    selectedTower = null;
    waveInProgress = false;
    gameActive = true;
    
    board.innerHTML = '';
    createBoard(); // Важно!
    
    updateMoney();
    document.getElementById('wave').textContent = currentWave;
    document.getElementById('gameOver').style.display = 'none';
    closeUpgradeMenu();
    
    startWave();
    gameLoop();
}
// Исправленная функция placeTower
function placeTower(tower) {
    const elem = document.createElement('div');
    elem.className = `tower ${tower.type}`;
    elem.style.left = `${tower.x}px`;
    elem.style.top = `${tower.y}px`;
    
    // Создание радиуса
    const radius = document.createElement('div');
    radius.className = 'radius';
    radius.style.width = `${tower.radius * 2}px`;
    radius.style.height = `${tower.radius * 2}px`;
    radius.style.left = `${tower.x}px`;
    radius.style.top = `${tower.y}px`;

    // Добавление элементов на доску
    board.appendChild(elem);
    board.appendChild(radius);
    
    // Сохранение ссылок
    tower.elem = elem;
    tower.radiusElem = radius;
}

// Исправленная функция startWave
function startWave() {
    waveInProgress = true;
    console.log(`Start wave ${currentWave}`);
    
    const waveSettings = {
        1: { count: 3, type: 'basic', delay: 2000 },
        2: { count: 5, type: 'basic', delay: 1500 },
        3: { count: 10, type: 'basic', delay: 1000 },
        4: { count: 15, type: 'basic', delay: 800 },
        5: { count: 5, type: 'basic', delay: 1500, boss: true }
    };

    const settings = waveSettings[currentWave] || { 
        count: currentWave * 2, 
        type: 'basic', 
        delay: 1000 
    };

    scheduledEnemies = settings.count;
    
    for(let i = 0; i < settings.count; i++) {
        setTimeout(() => {
            const type = settings.boss && i === settings.count-1 ? 'boss' : settings.type;
            spawnEnemy(type);
            scheduledEnemies--;
            console.log(`Enemy spawned: ${type}`);
        }, i * settings.delay);
    }
}

// Добавить в initGame
function initGame() {
    // ... (предыдущий код)
    
    // Запуск первой волны сразу
    setTimeout(() => startWave(), 1000);
}

// Исправленная функция spawnEnemy
function spawnEnemy(type) {
    const enemyTypes = {
        basic: { hp: 2, speed: 2, color: 'red' },
        boss: { hp: 10, speed: 1, color: 'purple' }
    };
    
    const enemy = { 
        ...enemyTypes[type], 
        x: 0, 
        y: 4 * tileSize + 10, 
        pathIndex: 0 
    };
    
    const elem = document.createElement('div');
    elem.className = `enemy ${enemy.color}`;
    elem.style.left = `${enemy.x}px`;
    elem.style.top = `${enemy.y}px`;
    
    board.appendChild(elem);
    enemy.elem = elem;
    enemies.push(enemy);
    
    console.log(`New enemy created at ${enemy.x},${enemy.y}`);
}
