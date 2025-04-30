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

const towerTypes = {
    pistol: {
        type: 'pistol',
        cost: 50,
        damage: 1,
        radius: 100,
        attackSpeed: 1,
        upgradeCost: 150,
        upgradedDamage: 2,
        upgradedRadius: 150
    },
    swordsman: {
        type: 'swordsman',
        cost: 80,
        damage: 2,
        radius: 50,
        attackSpeed: 2,
        upgradeCost: 150,
        upgradedDamage: 3,
        upgradedAttackSpeed: 3
    },
    sniper: {
        type: 'sniper',
        cost: 250,
        damage: 10,
        radius: 1000,
        attackSpeed: 0.2,
        upgradeCost: 1000,
        upgradedAttackSpeed: 0.4
    },
    toxic: {
        type: 'toxic',
        cost: 450,
        damage: 10,
        radius: 20,
        attackSpeed: 0.33,
        upgradeCost: 900,
        upgradedRadius: 70,
        upgradedAttackSpeed: 0.58
    },
    knight: {
        type: 'knight',
        cost: 1000,
        damage1: 2,
        radius1: 50,
        attackSpeed1: 2,
        damage2: 5,
        radius2: 150,
        attackSpeed2: 0.67,
        upgradeCost: 2500
    }
};

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

    path.forEach((pos, index) => {
        const tile = document.createElement('div');
        tile.className = `tile ${index === 0 ? 'start' : index === path.length-1 ? 'end' : 'path'}`;
        tile.style.left = pos.x * tileSize + 'px';
        tile.style.top = pos.y * tileSize + 'px';
        board.appendChild(tile);
    });
}

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
        const tower = {...towerTypes[placingTower], x, y};
        towers.push(tower);
        placeTower(tower);
        placingTower = false;
    }
});

function placeTower(tower) {
    const elem = document.createElement('div');
    elem.className = `tower ${tower.type}`;
    elem.style.left = tower.x + 'px';
    elem.style.top = tower.y + 'px';
    
    elem.onclick = (e) => {
        e.stopPropagation();
        showUpgradeMenu(tower);
    };
    
    const radius = document.createElement('div');
    radius.className = 'radius';
    radius.style.width = tower.radius*2 + 'px';
    radius.style.height = tower.radius*2 + 'px';
    radius.style.left = tower.x + 'px';
    radius.style.top = tower.y + 'px';
    
    board.appendChild(elem);
    board.appendChild(radius);
    tower.elem = elem;
    tower.radiusElem = radius;
}

function spawnEnemy(type) {
    const enemyTypes = {
        basic: { hp: 2, speed: 2, color: 'red' },
        purple: { hp: 5, speed: 2, color: 'purple' },
        gold: { hp: 15, speed: 4, color: 'gold' },
        green: { hp: 100, speed: 1, color: 'green' },
        boss: { hp: 250, speed: 2, color: 'boss' },
        black: { hp: 200, speed: 0.7, color: 'black' },
        pink: { hp: 50, speed: 6, color: 'pink' }
    };
    
    const enemy = {...enemyTypes[type], x: 0, y: 4*tileSize+10, pathIndex: 0};
    
    const elem = document.createElement('div');
    elem.className = `enemy ${enemy.color}`;
    elem.style.left = enemy.x + 'px';
    elem.style.top = enemy.y + 'px';
    
    const health = document.createElement('div');
    health.className = 'health-bar';
    health.textContent = enemy.hp;
    elem.appendChild(health);
    
    board.appendChild(elem);
    enemy.elem = elem;
    enemy.health = health;
    enemies.push(enemy);
}

function gameLoop() {
    if(!gameActive) return;
    
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
        enemy.health.style.transform = `translate(${enemy.x}px, ${enemy.y-20}px)`;
    });
    
    attackLogic();
    requestAnimationFrame(gameLoop);
}

function attackLogic() {
    towers.forEach(tower => {
        if(tower.type === 'knight') {
            attackWithRadius(tower, tower.radius1, tower.damage1, tower.attackSpeed1);
            attackWithRadius(tower, tower.radius2, tower.damage2, tower.attackSpeed2);
        } else {
            attackWithRadius(tower, tower.radius, tower.damage, tower.attackSpeed);
        }
    });
}

function attackWithRadius(tower, radius, damage, speed) {
    const now = Date.now();
    if(now - tower.lastAttack < 1000/speed) return;
    
    const target = enemies.find(enemy => 
        Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < radius
    );
    
    if(target) {
        target.hp -= damage;
        target.health.textContent = target.hp;
        tower.lastAttack = now;
        
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
            const type = currentWave >= 5 ? 'purple' : 'basic';
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

function updateMoney() {
    document.getElementById('money').textContent = money;
}

function endGame() {
    gameActive = false;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    board.innerHTML = '';
    enemies = [];
    towers = [];
    money = 100;
    currentWave = 1;
    gameActive = true;
    document.getElementById('gameOver').style.display = 'none';
    initGame();
}

function initGame() {
    createBoard();
    updateMoney();
    startWave();
    gameLoop();
}

window.addEventListener('load', initGame);
function gameLoop() {
    if(!gameActive) return;
    
    enemies.forEach((enemy, index) => {
        // ... существующий код движения врагов ...
    });
    
    attackLogic();
    checkWaveCompletion(); // Добавить эту строку
    requestAnimationFrame(gameLoop);
}

// Исправить функцию startWave
function startWave() {
    waveInProgress = true;
    document.getElementById('wave').textContent = currentWave;
    
    let count = currentWave * 2;
    scheduledEnemies = count;
    
    // Использовать let вместо var для правильной работы замыкания
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

// Исправить создание башен (добавить lastAttack)
function placeTower(tower) {
    const elem = document.createElement('div');
    elem.className = `tower ${tower.type}`;
    elem.style.left = tower.x + 'px';
    elem.style.top = tower.y + 'px';
    
    // Инициализировать lastAttack
    tower.lastAttack = 0;
    
    // ... остальной код создания башни ...
}

// Исправить функцию attackWithRadius
function attackWithRadius(tower, radius, damage, speed) {
    const now = Date.now();
    if(now - tower.lastAttack < 1000/speed) return;
    
    // Найти всех врагов в радиусе
    const targets = enemies.filter(enemy => 
        Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < radius
    );
    
    if(targets.length > 0) {
        const target = targets[0]; // Атаковать первого врага
        target.hp -= damage;
        target.health.textContent = target.hp;
        tower.lastAttack = now;
        
        if(target.hp <= 0) {
            target.elem.remove();
            enemies = enemies.filter(e => e !== target);
            money += 10;
            updateMoney();
        }
    }
}
function startWave() {
    // ... предыдущий код ...
    
    // Для первых волн гарантированно добавляем базовых врагов
    if(currentWave < 5) {
        for(let i = 0; i < 3; i++) {
            setTimeout(() => {
                spawnEnemy('basic');
                scheduledEnemies--;
            }, i * 1500);
        }
    }
    // ... остальной код ...
}
// Добавить в gameLoop
function checkWaveCompletion() {
    if(enemies.length === 0 && scheduledEnemies === 0 && waveInProgress) {
        showWaveStart();
        // ... остальной код ...
    }
}

function showWaveStart() {
    const indicator = document.createElement('div');
    indicator.className = 'wave-indicator';
    indicator.textContent = `Волна ${currentWave + 1} начинается!`;
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 2000);
}
