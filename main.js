// Инициализация игры
// В начале файла main.js (после объявления констант)
const COLS = 40; // Ширина поля в тайлах (увеличено)
const ROWS = 15; // Высота поля в тайлах (увеличено)
const TILE_SIZE = 40;

// Обновленный путь (длинный и извилистый)
const PATH = [
    {x:0, y:7}, {x:1, y:7}, {x:2, y:7}, {x:3, y:7}, {x:4, y:7}, {x:5, y:7},
    {x:5, y:6}, {x:5, y:5}, {x:6, y:5}, {x:7, y:5}, {x:8, y:5}, {x:9, y:5},
    {x:9, y:6}, {x:9, y:7}, {x:10, y:7}, {x:11, y:7}, {x:12, y:7}, {x:13, y:7},
    {x:13, y:6}, {x:13, y:5}, {x:14, y:5}, {x:15, y:5}, {x:16, y:5}, {x:17, y:5},
    {x:17, y:6}, {x:17, y:7}, {x:18, y:7}, {x:19, y:7}, {x:20, y:7}, {x:21, y:7},
    {x:21, y:6}, {x:21, y:5}, {x:22, y:5}, {x:23, y:5}, {x:24, y:5}, {x:25, y:5},
    {x:25, y:6}, {x:25, y:7}, {x:26, y:7}, {x:27, y:7}, {x:28, y:7}, {x:29, y:7},
    {x:29, y:6}, {x:29, y:5}, {x:30, y:5}, {x:31, y:5}, {x:32, y:5}, {x:33, y:5},
    {x:33, y:6}, {x:33, y:7}, {x:34, y:7}, {x:35, y:7}, {x:36, y:7}, {x:37, y:7},
    {x:37, y:6}, {x:37, y:5}, {x:38, y:5}, {x:39, y:5}
];

// Обновленная функция createBoard
function createBoard() {
    board.innerHTML = '';
    pathTiles = [];
    
    // Устанавливаем размер игрового поля
    board.style.width = COLS * TILE_SIZE + 'px';
    board.style.height = ROWS * TILE_SIZE + 'px';
    
    // Создаем траву (фон)
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = document.createElement('div');
            tile.className = 'tile grass';
            tile.style.left = x * TILE_SIZE + 'px';
            tile.style.top = y * TILE_SIZE + 'px';
            board.appendChild(tile);
        }
    }
    
    // Создаем путь
    PATH.forEach((pos, index) => {
        const tile = document.createElement('div');
        tile.className = `tile ${index === 0 ? 'start' : index === PATH.length-1 ? 'end' : 'path'}`;
        tile.style.left = pos.x * TILE_SIZE + 'px';
        tile.style.top = pos.y * TILE_SIZE + 'px';
        board.appendChild(tile);
        pathTiles.push({x: pos.x, y: pos.y});
    });
}

// В towerTypes добавляем новые башни (в самом начале, где объявляются все типы)
const towerTypes = {
    // ... другие башни ...
    businessman: {
        type: 'businessman',
        name: 'Бизнесмен',
        cost: 600,
        income: 100,
        interval: 5000,
        radius: 0,
        upgraded: false,
        upgradeCost: 5000,
        upgradedIncome: 250
    },
    king: {
        type: 'king',
        name: 'Король',
        cost: 5000,
        limit: 1, // Можно поставить только один раз
        spawnInterval: 15000,
        squareHp: 5,
        radius: 0,
        upgraded: false,
        upgradeCost: 20000,
        upgradedInterval: 7500
    },
    binoculars: {
        type: 'binoculars',
        name: 'Бинокль',
        cost: 1000,
        radius: 50,
        rangeBonus: 50,
        upgraded: false,
        upgradeCost: 2250,
        upgradedRadius: 70,
        upgradedRangeBonus: 70
    }
};

// Обновляем HTML для магазина
<div id="shop">
    <!-- ... другие башни ... -->
    <div class="shop-item" onclick="selectTower('businessman', 600)">
        Бизнесмен (600)<br>
        Доход: 100/5сек<br>
        Не атакует
    </div>
    <div class="shop-item" onclick="selectTower('king', 5000)">
        Король (5000)<br>
        Создает квадраты<br>
        Только 1 на карте
    </div>
    <div class="shop-item" onclick="selectTower('binoculars', 1000)">
        Бинокль (1000)<br>
        +5st к радиусу башен<br>
        Радиус: 5st
    </div>
    <!-- ... остальное ... -->
</div>
const board = document.getElementById('gameBoard');
const moneyDisplay = document.getElementById('moneyDisplay');
const waveDisplay = document.getElementById('waveDisplay');
const tileSize = 40;
let placingTower = false;
let money = 100;
let currentWave = 1;
let enemies = [];
let towers = [];
let selectedTower = null;
let showRadius = false;
let pathTiles = [];
let waveInProgress = false;
let gameActive = true;
let bossRadiusElem = null;
let towerIdCounter = 0;

const towerTypes = {
    pistol: {
        type: 'pistol',
        cost: 50,
        damage: 1,
        radius: 100,
        attackSpeed: 1,
        upgraded: false,
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
        upgraded: false,
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
        upgraded: false,
        upgradeCost: 1000,
        upgradedAttackSpeed: 0.4
    },
    knight: {
        type: 'knight',
        cost: 1000,
        innerRadius: 50,
        innerDamage: 2,
        innerAttackSpeed: 2,
        outerRadius: 150,
        outerDamage: 5,
        outerAttackSpeed: 0.666,
        upgraded: false,
        upgradeCost: 2500,
        upgradedInnerRadius: 70,
        upgradedInnerAttackSpeed: 4,
        upgradedOuterRadius: 250,
        upgradedOuterAttackSpeed: 1
    },
    freezer: {
        type: 'freezer',
        cost: 500,
        radius: 100,
        slowFactor: 0.5,
        upgraded: false,
        upgradeCost: 1000,
        upgradedRadius: 150,
        upgradedSlowFactor: 0.3
    },
    chance: {
        type: 'chance',
        cost: 777,
        minDamage: 1,
        maxDamage: 7,
        radius: 170,
        attackSpeed: 1,
        upgraded: false,
        upgradeCost: 7777,
        upgradedMinDamage: 7,
        upgradedMaxDamage: 17
    },
    turret: {
        type: 'turret',
        cost: 1250,
        damage: 1,
        radius: 150,
        attackSpeed: 10,
        upgraded: false,
        upgradeCost: 2000,
        upgradedDamage: 2,
        upgradedAttackSpeed: 14
    },
    omega: {
        type: 'omega',
        cost: 10000,
        innerRadius: 100,
        innerDamage: 10,
        innerAttackSpeed: 10,
        outerRadius: 250,
        outerDamage: 15,
        outerAttackSpeed: 1,
        upgraded: false,
        upgradeCost: 25000,
        upgradedInnerRadius: 150,
        upgradedInnerAttackSpeed: 20,
        upgradedOuterRadius: 350,
        upgradedOuterAttackSpeed: 1.5
    }
};

function createBoard() {
    board.innerHTML = '';
    pathTiles = [];
    
    // Расширенный путь с более сложной траекторией
    const path = [
        {x:0, y:5}, {x:1, y:5}, {x:2, y:5}, {x:3, y:5}, {x:4, y:5}, {x:5, y:5},
        {x:5, y:6}, {x:5, y:7}, {x:6, y:7}, {x:7, y:7}, {x:8, y:7}, {x:9, y:7},
        {x:9, y:6}, {x:9, y:5}, {x:10, y:5}, {x:11, y:5}, {x:12, y:5}, {x:13, y:5},
        {x:13, y:6}, {x:13, y:7}, {x:14, y:7}, {x:15, y:7}, {x:16, y:7}, {x:17, y:7},
        {x:17, y:6}, {x:17, y:5}, {x:18, y:5}, {x:19, y:5}, {x:20, y:5}, {x:20, y:6},
        {x:20, y:7}, {x:21, y:7}, {x:22, y:7}, {x:23, y:7}, {x:24, y:7}, {x:25, y:7},
        {x:25, y:6}, {x:25, y:5}, {x:25, y:4}, {x:25, y:3}, {x:26, y:3}, {x:27, y:3},
        {x:28, y:3}, {x:29, y:3}
    ];
    
    // Создаем траву
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 30; x++) {
            const tile = document.createElement('div');
            tile.className = 'tile grass';
            tile.style.left = x * tileSize + 'px';
            tile.style.top = y * tileSize + 'px';
            board.appendChild(tile);
        }
    }
    
    // Создаем путь
    path.forEach((pos, index) => {
        const tile = document.createElement('div');
        tile.className = `tile ${index === 0 ? 'start' : index === path.length-1 ? 'end' : 'path'}`;
        tile.style.left = pos.x * tileSize + 'px';
        tile.style.top = pos.y * tileSize + 'px';
        board.appendChild(tile);
        pathTiles.push({x: pos.x, y: pos.y});
    });
}

function updateMoney() {
    moneyDisplay.textContent = `Деньги: ${money}`;
}

function updateWave() {
    waveDisplay.textContent = `Волна: ${currentWave}`;
}

function toggleRadius() {
    showRadius = !showRadius;
    document.getElementById('showRadiusBtn').textContent = showRadius ? 'Скрыть радиусы' : 'Показать радиусы';
    
    towers.forEach(tower => {
        if (tower.type === 'knight' || tower.type === 'omega') {
            if (tower.innerRadiusElem) tower.innerRadiusElem.style.display = showRadius ? 'block' : 'none';
            if (tower.outerRadiusElem) tower.outerRadiusElem.style.display = showRadius ? 'block' : 'none';
        } else if (tower.radiusElem) {
            tower.radiusElem.style.display = showRadius ? 'block' : 'none';
        }
    });
}

function selectTower(type, cost) {
    if (!gameActive) return;
    if (money >= cost && !placingTower) {
        placingTower = type;
    }
}

board.addEventListener('click', (e) => {
    if (!gameActive || !placingTower) return;
    
    const rect = board.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    
    // Проверяем, можно ли поставить башню
    const isPath = pathTiles.some(tile => tile.x === x && tile.y === y);
    const isOccupied = towers.some(tower => 
        Math.floor(tower.x / tileSize) === x && 
        Math.floor(tower.y / tileSize) === y
    );
    
    if (!isPath && !isOccupied) {
        const tower = {
            ...towerTypes[placingTower],
            id: towerIdCounter++,
            x: x * tileSize + tileSize/2,
            y: y * tileSize + tileSize/2,
            totalDamage: 0,
            lastAttack: 0,
            lastInnerAttack: 0,
            lastOuterAttack: 0
        };
        
        placeTower(tower);
        money -= towerTypes[placingTower].cost;
        updateMoney();
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
    board.appendChild(elem);
    
    if (tower.type === 'knight' || tower.type === 'omega') {
        const innerRadius = document.createElement('div');
        innerRadius.className = 'radius inner';
        innerRadius.style.width = tower.innerRadius * 2 + 'px';
        innerRadius.style.height = tower.innerRadius * 2 + 'px';
        innerRadius.style.left = tower.x + 'px';
        innerRadius.style.top = tower.y + 'px';
        innerRadius.style.display = showRadius ? 'block' : 'none';
        board.appendChild(innerRadius);
        
        const outerRadius = document.createElement('div');
        outerRadius.className = 'radius';
        outerRadius.style.width = tower.outerRadius * 2 + 'px';
        outerRadius.style.height = tower.outerRadius * 2 + 'px';
        outerRadius.style.left = tower.x + 'px';
        outerRadius.style.top = tower.y + 'px';
        outerRadius.style.display = showRadius ? 'block' : 'none';
        board.appendChild(outerRadius);
        
        tower.innerRadiusElem = innerRadius;
        tower.outerRadiusElem = outerRadius;
    } else {
        const radius = document.createElement('div');
        radius.className = 'radius';
        radius.style.width = tower.radius * 2 + 'px';
        radius.style.height = tower.radius * 2 + 'px';
        radius.style.left = tower.x + 'px';
        radius.style.top = tower.y + 'px';
        radius.style.display = showRadius ? 'block' : 'none';
        board.appendChild(radius);
        tower.radiusElem = radius;
    }
    
    tower.elem = elem;
    towers.push(tower);
}

function spawnEnemy(type, hpMultiplier = 1) {
    let hp, speed, color;
    
    switch(type) {
        case 'red':
            hp = 2 * hpMultiplier;
            speed = 2;
            color = 'red';
            break;
        case 'purple':
            hp = 5 * hpMultiplier;
            speed = 2;
            color = 'purple';
            break;
        case 'gold':
            hp = 15 * hpMultiplier;
            speed = 4;
            color = 'gold';
            break;
        case 'green':
            hp = 100 * hpMultiplier;
            speed = 1;
            color = 'green';
            break;
        case 'black':
            hp = 200 * hpMultiplier;
            speed = 0.666;
            color = 'black';
            break;
        case 'pink':
            hp = 50 * hpMultiplier;
            speed = 6;
            color = 'pink';
            break;
        case 'boss':
            hp = 250 * hpMultiplier;
            speed = 1.5;
            color = 'boss';
            break;
        default:
            hp = 2 * hpMultiplier;
            speed = 2;
            color = 'red';
    }
    
    const enemy = {
        x: 0,
        y: 5 * tileSize + tileSize/2,
        hp: hp,
        maxHp: hp,
        pathIndex: 0,
        speed: speed,
        baseSpeed: speed,
        type: type,
        color: color,
        slowedBy: null
    };
    
    const elem = document.createElement('div');
    elem.className = `enemy ${color}`;
    elem.style.left = enemy.x + 'px';
    elem.style.top = enemy.y + 'px';
    
    const hpText = document.createElement('div');
    hpText.className = 'enemy-hp';
    hpText.textContent = enemy.hp;
    elem.appendChild(hpText);
    
    board.appendChild(elem);
    
    enemy.elem = elem;
    enemy.hpText = hpText;
    
    if (type === 'boss') {
        const radius = document.createElement('div');
        radius.className = 'boss-radius';
        radius.style.width = '100px';
        radius.style.height = '100px';
        radius.style.left = enemy.x + 'px';
        radius.style.top = enemy.y + 'px';
        board.appendChild(radius);
        enemy.radiusElem = radius;
        bossRadiusElem = radius;
    }
    
    enemies.push(enemy);
}

function gameLoop() {
    if (!gameActive) return;
    
    // Движение врагов
    const path = [
        {x:0, y:5}, {x:1, y:5}, {x:2, y:5}, {x:3, y:5}, {x:4, y:5}, {x:5, y:5},
        {x:5, y:6}, {x:5, y:7}, {x:6, y:7}, {x:7, y:7}, {x:8, y:7}, {x:9, y:7},
        {x:9, y:6}, {x:9, y:5}, {x:10, y:5}, {x:11, y:5}, {x:12, y:5}, {x:13, y:5},
        {x:13, y:6}, {x:13, y:7}, {x:14, y:7}, {x:15, y:7}, {x:16, y:7}, {x:17, y:7},
        {x:17, y:6}, {x:17, y:5}, {x:18, y:5}, {x:19, y:5}, {x:20, y:5}, {x:20, y:6},
        {x:20, y:7}, {x:21, y:7}, {x:22, y:7}, {x:23, y:7}, {x:24, y:7}, {x:25, y:7},
        {x:25, y:6}, {x:25, y:5}, {x:25, y:4}, {x:25, y:3}, {x:26, y:3}, {x:27, y:3},
        {x:28, y:3}, {x:29, y:3}
    ];
    
    enemies.forEach((enemy, index) => {
        if (enemy.pathIndex >= path.length) {
            // Враг дошел до конца
            enemy.elem.remove();
            if (enemy.radiusElem) enemy.radiusElem.remove();
            enemies.splice(index, 1);
            endGame();
            return;
        }
        
        const target = path[enemy.pathIndex];
        const targetX = target.x * tileSize + tileSize/2;
        const targetY = target.y * tileSize + tileSize/2;
        
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 2) {
            enemy.pathIndex++;
        } else {
            // Применяем замедление от морозилок
            let speed = enemy.baseSpeed;
            if (enemy.slowedBy) {
                const freezer = towers.find(t => t.id === enemy.slowedBy);
                if (freezer) {
                    speed *= freezer.slowFactor;
                } else {
                    enemy.slowedBy = null;
                    enemy.elem.classList.remove('slowed');
                }
            }
            
            enemy.x += (dx / distance) * speed;
            enemy.y += (dy / distance) * speed;
        }
        
        enemy.elem.style.left = enemy.x + 'px';
        enemy.elem.style.top = enemy.y + 'px';
        if (enemy.radiusElem) {
            enemy.radiusElem.style.left = enemy.x + 'px';
            enemy.radiusElem.style.top = enemy.y + 'px';
        }
        
        if (enemy.hpText) {
            enemy.hpText.textContent = Math.max(0, Math.floor(enemy.hp));
            enemy.hpText.style.left = (enemy.elem.offsetWidth/2 - enemy.hpText.offsetWidth/2) + 'px';
        }
        
        // Проверка радиуса босса
        if (enemy.type === 'boss') {
            towers.forEach((tower, towerIndex) => {
                const dx = tower.x - enemy.x;
                const dy = tower.y - enemy.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 50) {
                    tower.elem.remove();
                    if (tower.radiusElem) tower.radiusElem.remove();
                    if (tower.innerRadiusElem) tower.innerRadiusElem.remove();
                    if (tower.outerRadiusElem) tower.outerRadiusElem.remove();
                    towers.splice(towerIndex, 1);
                }
            });
        }
    });
    
    // Атака башен
    towers.forEach(tower => {
        if (tower.type === 'knight' || tower.type === 'omega') {
            // Логика для башен с двумя радиусами
            let closestEnemyInner = null;
            let closestEnemyOuter = null;
            let minDistanceInner = Infinity;
            let minDistanceOuter = Infinity;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < tower.innerRadius && distance < minDistanceInner) {
                    closestEnemyInner = enemy;
                    minDistanceInner = distance;
                } else if (distance < tower.outerRadius && distance < minDistanceOuter) {
                    closestEnemyOuter = enemy;
                    minDistanceOuter = distance;
                }
            });
            
            if (closestEnemyInner && Date.now() - tower.lastInnerAttack > 1000/tower.innerAttackSpeed) {
                closestEnemyInner.hp -= tower.innerDamage;
                tower.totalDamage += tower.innerDamage;
                tower.lastInnerAttack = Date.now();
                
                if (closestEnemyInner.hp <= 0) {
                    closestEnemyInner.elem.remove();
                    if (closestEnemyInner.radiusElem) closestEnemyInner.radiusElem.remove();
                    enemies = enemies.filter(e => e !== closestEnemyInner);
                    money += getEnemyReward(closestEnemyInner.type);
                    updateMoney();
                }
            }
            
            if (closestEnemyOuter && Date.now() - tower.lastOuterAttack > 1000/tower.outerAttackSpeed) {
                closestEnemyOuter.hp -= tower.outerDamage;
                tower.totalDamage += tower.outerDamage;
                tower.lastOuterAttack = Date.now();
                
                if (closestEnemyOuter.hp <= 0) {
                    closestEnemyOuter.elem.remove();
                    if (closestEnemyOuter.radiusElem) closestEnemyOuter.radiusElem.remove();
                    enemies = enemies.filter(e => e !== closestEnemyOuter);
                    money += getEnemyReward(closestEnemyOuter.type);
                    updateMoney();
                }
            }
        } else if (tower.type === 'freezer') {
            // Логика для морозилки
            enemies.forEach(enemy => {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < tower.radius) {
                    if (!enemy.slowedBy) {
                        enemy.slowedBy = tower.id;
                        enemy.elem.classList.add('slowed');
                    }
                } else if (enemy.slowedBy === tower.id) {
                    enemy.slowedBy = null;
                    enemy.elem.classList.remove('slowed');
                }
            });
        } else if (tower.type === 'chance') {
            // Логика для башни с рандомным уроном
            let closestEnemy = null;
            let minDistance = Infinity;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < tower.radius && distance < minDistance) {
                    closestEnemy = enemy;
                    minDistance = distance;
                }
            });
            
            if (closestEnemy && Date.now() - tower.lastAttack > 1000/tower.attackSpeed) {
                const damage = Math.floor(Math.random() * (tower.maxDamage - tower.minDamage + 1)) + tower.minDamage;
                closestEnemy.hp -= damage;
                tower.totalDamage += damage;
                tower.lastAttack = Date.now();
                
                if (closestEnemy.hp <= 0) {
                    closestEnemy.elem.remove();
                    if (closestEnemy.radiusElem) closestEnemy.radiusElem.remove();
                    enemies = enemies.filter(e => e !== closestEnemy);
                    money += getEnemyReward(closestEnemy.type);
                    updateMoney();
                }
            }
        } else if (tower.type === 'turret') {
            // Логика для турели
            let closestEnemy = null;
            let minDistance = Infinity;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < tower.radius && distance < minDistance) {
                    closestEnemy = enemy;
                    minDistance = distance;
                }
            });
            
            if (closestEnemy && Date.now() - tower.lastAttack > 1000/tower.attackSpeed) {
                closestEnemy.hp -= tower.damage;
                tower.totalDamage += tower.damage;
                tower.lastAttack = Date.now();
                
                if (closestEnemy.hp <= 0) {
                    closestEnemy.elem.remove();
                    if (closestEnemy.radiusElem) closestEnemy.radiusElem.remove();
                    enemies = enemies.filter(e => e !== closestEnemy);
                    money += getEnemyReward(closestEnemy.type);
                    updateMoney();
                }
            }
        } else {
            // Логика для обычных башен
            let closestEnemy = null;
            let minDistance = Infinity;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < tower.radius && distance < minDistance) {
                    closestEnemy = enemy;
                    minDistance = distance;
                }
            });
            
            if (closestEnemy && Date.now() - tower.lastAttack > 1000/tower.attackSpeed) {
                closestEnemy.hp -= tower.damage;
                tower.totalDamage += tower.damage;
                tower.lastAttack = Date.now();
                
                if (closestEnemy.hp <= 0) {
                    closestEnemy.elem.remove();
                    if (closestEnemy.radiusElem) closestEnemy.radiusElem.remove();
                    enemies = enemies.filter(e => e !== closestEnemy);
                    money += getEnemyReward(closestEnemy.type);
                    updateMoney();
                }
            }
        }
    });
    
    checkWaveCompletion();
    requestAnimationFrame(gameLoop);
}

function getEnemyReward(type) {
    switch(type) {
        case 'red': return 10;
        case 'purple': return 25;
        case 'gold': return 50;
        case 'green': return 100;
        case 'black': return 150;
        case 'pink': return 75;
        case 'boss': return 500;
        default: return 10;
    }
}

function checkWaveCompletion() {
    if (enemies.length === 0 && waveInProgress) {
        waveInProgress = false;
        currentWave++;
        updateWave();
        
        // Награда за волну
        money += currentWave * 20;
        updateMoney();
        
        // Запуск следующей волны с задержкой
        setTimeout(startWave, 2000);
    }
}

function startWave() {
    if (!gameActive) return;
    
    waveInProgress = true;
    
    if (bossRadiusElem) {
        bossRadiusElem.remove();
        bossRadiusElem = null;
    }
    
    const hpMultiplier = Math.min(1 + Math.floor(currentWave / 10), 5);
    
    if (currentWave <= 4) {
        for (let i = 0; i < currentWave * 3; i++) {
            setTimeout(() => spawnEnemy('red', hpMultiplier), i * 2000);
        }
    } else if (currentWave === 5) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => spawnEnemy('red', hpMultiplier), i * 1500);
        }
        setTimeout(() => spawnEnemy('purple', hpMultiplier), 5 * 1500);
    } else if (currentWave <= 14) {
        for (let i = 0; i < currentWave * 2; i++) {
            if (i % 5 === 4) {
                setTimeout(() => spawnEnemy('purple', hpMultiplier), i * 1000);
            } else {
                setTimeout(() => spawnEnemy('red', hpMultiplier), i * 1000);
            }
        }
    } else if (currentWave === 15) {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => spawnEnemy('purple', hpMultiplier), i * 800);
        }
        setTimeout(() => spawnEnemy('gold', hpMultiplier), 10 * 800);
    } else if (currentWave <= 39) {
        const count = currentWave * 2;
        for (let i = 0; i < count; i++) {
            if (i % 10 === 9) {
                setTimeout(() => spawnEnemy('gold', hpMultiplier), i * 800);
            } else if (i % 3 === 2) {
                setTimeout(() => spawnEnemy('purple', hpMultiplier), i * 800);
            } else {
                setTimeout(() => spawnEnemy('red', hpMultiplier), i * 800);
            }
        }
    } else if (currentWave === 40) {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => spawnEnemy('red', hpMultiplier), i * 600);
        }
        setTimeout(() => spawnEnemy('green', hpMultiplier), 20 * 600);
    } else if (currentWave === 50) {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => spawnEnemy('red', hpMultiplier), i * 500);
        }
        setTimeout(() => spawnEnemy('boss', hpMultiplier), 10 * 500);
    } else if (currentWave <= 74) {
        const count = currentWave;
        for (let i = 0; i < count; i++) {
            const type = ['red', 'purple', 'gold', 'green'][Math.floor(Math.random() * 4)];
            setTimeout(() => spawnEnemy(type, hpMultiplier), i * 500);
        }
    } else if (currentWave === 75) {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => spawnEnemy('black', hpMultiplier), i * 400);
        }
    } else if (currentWave <= 99) {
        const count = currentWave;
        for (let i = 0; i < count; i++) {
            if (i % 15 === 14) {
                setTimeout(() => spawnEnemy('black', hpMultiplier), i * 300);
            } else {
                const type = ['red', 'purple', 'gold', 'green'][Math.floor(Math.random() * 4)];
                setTimeout(() => spawnEnemy(type, hpMultiplier), i * 300);
            }
        }
    } else if (currentWave === 100) {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => spawnEnemy('black', hpMultiplier), i * 200);
        }
        setTimeout(() => spawnEnemy('pink', hpMultiplier), 10 * 200);
    } else {
        const count = currentWave;
        for (let i = 0; i < count; i++) {
            if (i % 20 === 19) {
                setTimeout(() => spawnEnemy('pink', hpMultiplier), i * 200);
            } else if (i % 10 === 9) {
                setTimeout(() => spawnEnemy('black', hpMultiplier), i * 200);
            } else {
                const type = ['red', 'purple', 'gold', 'green'][Math.floor(Math.random() * 4)];
                setTimeout(() => spawnEnemy(type, hpMultiplier), i * 200);
            }
        }
    }
}

function showUpgradeMenu(tower) {
    if (!gameActive) return;
    
    closeUpgradeMenu();
    selectedTower = tower;
    const menu = document.getElementById('upgradeMenu');
    menu.style.display = 'block';
    
    let upgradeButton = menu.querySelector('button');
    upgradeButton.textContent = `Улучшить (${tower.upgradeCost})`;
    
    let statsHTML = `<strong>${getTowerName(tower.type)}</strong><br>`;
    
    if (tower.type === 'knight' || tower.type === 'omega') {
        statsHTML += `
            Внутренний радиус: ${Math.round(tower.innerRadius/10)}st (${tower.innerDamage} урон, ${(tower.innerAttackSpeed).toFixed(1)} атак/сек)<br>
            Внешний радиус: ${Math.round(tower.outerRadius/10)}st (${tower.outerDamage} урон, ${(1/tower.outerAttackSpeed).toFixed(1)} сек/атаку)<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    } else if (tower.type === 'freezer') {
        statsHTML += `
            Радиус: ${Math.round(tower.radius/10)}st<br>
            Замедление: ${Math.round((1 - tower.slowFactor) * 100)}%<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    } else if (tower.type === 'chance') {
        statsHTML += `
            Урон: ${tower.minDamage}-${tower.maxDamage}<br>
            Радиус: ${Math.round(tower.radius/10)}st<br>
            Скорость: ${(1/tower.attackSpeed).toFixed(1)} атак/сек<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    } else if (tower.type === 'turret') {
        statsHTML += `
            Урон: ${tower.damage}<br>
            Радиус: ${Math.round(tower.radius/10)}st<br>
            Скорость: ${tower.attackSpeed} атак/сек<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    } else {
        statsHTML += `
            Урон: ${tower.damage}<br>
            Радиус: ${Math.round(tower.radius/10)}st<br>
            Скорость: ${(1/tower.attackSpeed).toFixed(1)} атак/сек<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    }
    
    document.getElementById('towerStats').innerHTML = statsHTML;
}

function getTowerName(type) {
    switch(type) {
        case 'pistol': return 'Пистолет';
        case 'swordsman': return 'Мечник';
        case 'sniper': return 'Снайпер';
        case 'knight': return 'Рыцарь';
        case 'freezer': return 'Морозилка';
        case 'chance': return 'Шанс';
        case 'turret': return 'Турель';
        case 'omega': return 'ОМЕГА';
        default: return 'Башня';
    }
}

function closeUpgradeMenu() {
    document.getElementById('upgradeMenu').style.display = 'none';
    selectedTower = null;
}

function upgradeTower() {
    if (!selectedTower || !gameActive) return;
    if (selectedTower.upgraded || money < selectedTower.upgradeCost) return;
    
    money -= selectedTower.upgradeCost;
    updateMoney();
    selectedTower.upgraded = true;
    
    switch(selectedTower.type) {
        case 'pistol':
            selectedTower.damage = selectedTower.upgradedDamage;
            selectedTower.radius = selectedTower.upgradedRadius;
            break;
        case 'swordsman':
            selectedTower.damage = selectedTower.upgradedDamage;
            selectedTower.attackSpeed = selectedTower.upgradedAttackSpeed;
            break;
        case 'sniper':
            selectedTower.attackSpeed = selectedTower.upgradedAttackSpeed;
            break;
        case 'knight':
            selectedTower.innerRadius = selectedTower.upgradedInnerRadius;
            selectedTower.innerAttackSpeed = selectedTower.upgradedInnerAttackSpeed;
            selectedTower.outerRadius = selectedTower.upgradedOuterRadius;
            selectedTower.outerAttackSpeed = selectedTower.upgradedOuterAttackSpeed;
            break;
        case 'freezer':
            selectedTower.radius = selectedTower.upgradedRadius;
            selectedTower.slowFactor = selectedTower.upgradedSlowFactor;
            break;
        case 'chance':
            selectedTower.minDamage = selectedTower.upgradedMinDamage;
            selectedTower.maxDamage = selectedTower.upgradedMaxDamage;
            break;
        case 'turret':
            selectedTower.damage = selectedTower.upgradedDamage;
            selectedTower.attackSpeed = selectedTower.upgradedAttackSpeed;
            break;
        case 'omega':
            selectedTower.innerRadius = selectedTower.upgradedInnerRadius;
            selectedTower.innerAttackSpeed = selectedTower.upgradedInnerAttackSpeed;
            selectedTower.outerRadius = selectedTower.upgradedOuterRadius;
            selectedTower.outerAttackSpeed = selectedTower.upgradedOuterAttackSpeed;
            break;
    }
    
    updateTowerVisuals(selectedTower);
    showUpgradeMenu(selectedTower);
}

function updateTowerVisuals(tower) {
    if (tower.type === 'knight' || tower.type === 'omega') {
        if (tower.innerRadiusElem) {
            tower.innerRadiusElem.style.width = tower.innerRadius * 2 + 'px';
            tower.innerRadiusElem.style.height = tower.innerRadius * 2 + 'px';
        }
        if (tower.outerRadiusElem) {
            tower.outerRadiusElem.style.width = tower.outerRadius * 2 + 'px';
            tower.outerRadiusElem.style.height = tower.outerRadius * 2 + 'px';
        }
    } else if (tower.radiusElem) {
        tower.radiusElem.style
        tower.radiusElem.style.width = tower.radius * 2 + 'px';
        tower.radiusElem.style.height = tower.radius * 2 + 'px';
    }
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
    bossRadiusElem = null;
    towerIdCounter = 0;
    
    updateMoney();
    updateWave();
    document.getElementById('gameOver').style.display = 'none';
    closeUpgradeMenu();
    
    createBoard();
    startWave();
    gameLoop();
}

function initGame() {
    createBoard();
    updateMoney();
    updateWave();
    gameLoop();
    startWave();
}

window.addEventListener('load', initGame);
// Добавляем новые типы башен в towerTypes
const towerTypes = {
    // ... предыдущие типы башен ...
    businessman: {
        type: 'businessman',
        cost: 600,
        income: 100,
        incomeInterval: 5000, // 5 секунд
        radius: 0, // Не атакует
        upgraded: false,
        upgradeCost: 5000,
        upgradedIncome: 250
    },
    king: {
        type: 'king',
        cost: 5000,
        spawnInterval: 15000, // 15 секунд
        squareHp: 5,
        radius: 0, // Не атакует
        upgraded: false,
        upgradeCost: 20000,
        upgradedSpawnInterval: 7500 // 7.5 секунд
    },
    binoculars: {
        type: 'binoculars',
        cost: 1000,
        radius: 50, // 5st
        rangeBonus: 50, // +5st
        upgraded: false,
        upgradeCost: 2250,
        upgradedRadius: 70, // 7st
        upgradedRangeBonus: 70 // +7st
    }
};

// Добавляем новые стили в CSS (добавить в style.css)
.tower.businessman {
    background: #4CAF50;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
.tower.king {
    background: #FFD700;
    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
}
.tower.binoculars {
    background: #795548;
    clip-path: circle(50% at 50% 50%);
}
.king-square {
    width: 20px;
    height: 20px;
    position: absolute;
    background: #FF6347;
    transform: translate(-10px, -10px);
}

// Обновляем функцию placeTower
function placeTower(tower) {
    const elem = document.createElement('div');
    elem.className = `tower ${tower.type}`;
    elem.style.left = tower.x + 'px';
    elem.style.top = tower.y + 'px';
    elem.onclick = (e) => {
        e.stopPropagation();
        showUpgradeMenu(tower);
    };
    board.appendChild(elem);
    
    // Особые случаи для новых башен
    if (tower.type === 'binoculars') {
        const radius = document.createElement('div');
        radius.className = 'radius';
        radius.style.width = tower.radius * 2 + 'px';
        radius.style.height = tower.radius * 2 + 'px';
        radius.style.left = tower.x + 'px';
        radius.style.top = tower.y + 'px';
        radius.style.display = showRadius ? 'block' : 'none';
        board.appendChild(radius);
        tower.radiusElem = radius;
        
        // Применяем бонус к другим башням
        applyBinocularsBonus(tower);
    }
    
    if (tower.type === 'businessman') {
        // Запускаем генерацию денег
        tower.incomeIntervalId = setInterval(() => {
            money += tower.upgraded ? tower.upgradedIncome : tower.income;
            updateMoney();
        }, tower.incomeInterval);
    }
    
    if (tower.type === 'king') {
        // Проверяем, что король только один
        if (towers.some(t => t.type === 'king')) {
            alert('Может быть только один король!');
            return;
        }
        
        // Запускаем генерацию квадратов
        tower.spawnIntervalId = setInterval(() => {
            spawnKingSquare(tower);
        }, tower.upgraded ? tower.upgradedSpawnInterval : tower.spawnInterval);
    }
    
    tower.elem = elem;
    towers.push(tower);
}

// Новая функция для спавна квадратов короля
function spawnKingSquare(kingTower) {
    const square = {
        x: kingTower.x,
        y: kingTower.y,
        hp: kingTower.squareHp,
        targetX: pathTiles[pathTiles.length-1].x * tileSize + tileSize/2,
        targetY: pathTiles[pathTiles.length-1].y * tileSize + tileSize/2,
        speed: 2
    };
    
    const elem = document.createElement('div');
    elem.className = 'king-square';
    elem.style.left = square.x + 'px';
    elem.style.top = square.y + 'px';
    board.appendChild(elem);
    
    square.elem = elem;
    kingTower.squares = kingTower.squares || [];
    kingTower.squares.push(square);
    
    // Движение квадрата
    const moveInterval = setInterval(() => {
        const dx = square.targetX - square.x;
        const dy = square.targetY - square.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 2) {
            // Квадрат достиг цели
            clearInterval(moveInterval);
            elem.remove();
            kingTower.squares = kingTower.squares.filter(s => s !== square);
            return;
        }
        
        square.x += (dx / distance) * square.speed;
        square.y += (dy / distance) * square.speed;
        elem.style.left = square.x + 'px';
        elem.style.top = square.y + 'px';
        
        // Проверка столкновения с врагами
        enemies.forEach(enemy => {
            const enemyDx = enemy.x - square.x;
            const enemyDy = enemy.y - square.y;
            const enemyDistance = Math.sqrt(enemyDx*enemyDx + enemyDy*enemyDy);
            
            if (enemyDistance < 20) { // Радиус столкновения
                enemy.hp -= enemy.maxHp * 0.25; // Уменьшаем HP на 25%
                square.hp--;
                
                if (square.hp <= 0) {
                    clearInterval(moveInterval);
                    elem.remove();
                    kingTower.squares = kingTower.squares.filter(s => s !== square);
                }
                
                if (enemy.hp <= 0) {
                    // Плавное исчезновение врага
                    enemy.elem.style.transition = 'all 1s';
                    enemy.elem.style.transform = 'translate(-10px, -10px) scale(0)';
                    setTimeout(() => {
                        enemy.elem.remove();
                        if (enemy.radiusElem) enemy.radiusElem.remove();
                        enemies = enemies.filter(e => e !== enemy);
                        money += getEnemyReward(enemy.type);
                        updateMoney();
                    }, 1000);
                }
            }
        });
    }, 1000/60);
}

// Функция для применения бонуса бинокля
function applyBinocularsBonus(binocularsTower) {
    towers.forEach(tower => {
        if (tower !== binocularsTower && 
            tower.type !== 'businessman' && 
            tower.type !== 'king') {
            
            const dx = tower.x - binocularsTower.x;
            const dy = tower.y - binocularsTower.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < binocularsTower.radius) {
                // Увеличиваем радиус башни
                const bonus = binocularsTower.upgraded ? 
                    binocularsTower.upgradedRangeBonus : 
                    binocularsTower.rangeBonus;
                
                if (tower.type === 'knight' || tower.type === 'omega') {
                    tower.innerRadius += bonus;
                    tower.outerRadius += bonus;
                    if (tower.innerRadiusElem) {
                        tower.innerRadiusElem.style.width = tower.innerRadius * 2 + 'px';
                        tower.innerRadiusElem.style.height = tower.innerRadius * 2 + 'px';
                    }
                    if (tower.outerRadiusElem) {
                        tower.outerRadiusElem.style.width = tower.outerRadius * 2 + 'px';
                        tower.outerRadiusElem.style.height = tower.outerRadius * 2 + 'px';
                    }
                } else if (tower.radiusElem) {
                    tower.radius += bonus;
                    tower.radiusElem.style.width = tower.radius * 2 + 'px';
                    tower.radiusElem.style.height = tower.radius * 2 + 'px';
                }
            }
        }
    });
}

// Обновляем функцию upgradeTower для новых башен
function upgradeTower() {
    if (!selectedTower || !gameActive) return;
    if (selectedTower.upgraded || money < selectedTower.upgradeCost) return;
    
    money -= selectedTower.upgradeCost;
    updateMoney();
    selectedTower.upgraded = true;
    
    switch(selectedTower.type) {
        // ... предыдущие случаи ...
        case 'businessman':
            clearInterval(selectedTower.incomeIntervalId);
            selectedTower.incomeIntervalId = setInterval(() => {
                money += selectedTower.upgradedIncome;
                updateMoney();
            }, selectedTower.incomeInterval);
            break;
        case 'king':
            clearInterval(selectedTower.spawnIntervalId);
            selectedTower.spawnIntervalId = setInterval(() => {
                spawnKingSquare(selectedTower);
            }, selectedTower.upgradedSpawnInterval);
            break;
        case 'binoculars':
            selectedTower.radius = selectedTower.upgradedRadius;
            selectedTower.rangeBonus = selectedTower.upgradedRangeBonus;
            if (selectedTower.radiusElem) {
                selectedTower.radiusElem.style.width = selectedTower.radius * 2 + 'px';
                selectedTower.radiusElem.style.height = selectedTower.radius * 2 + 'px';
            }
            // Обновляем бонус для всех башен в радиусе
            applyBinocularsBonus(selectedTower);
            break;
    }
    
    updateTowerVisuals(selectedTower);
    showUpgradeMenu(selectedTower);
}

// Обновляем функцию showUpgradeMenu для новых башен
function showUpgradeMenu(tower) {
    // ... предыдущий код ...
    
    if (tower.type === 'businessman') {
        statsHTML += `
            Доход: ${tower.upgraded ? tower.upgradedIncome : tower.income} монет<br>
            Интервал: ${tower.incomeInterval/1000} сек<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    } else if (tower.type === 'king') {
        statsHTML += `
            Квадраты: 1 каждые ${tower.upgraded ? tower.upgradedSpawnInterval/1000 : tower.spawnInterval/1000} сек<br>
            Урон: 25% HP врага<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    } else if (tower.type === 'binoculars') {
        statsHTML += `
            Радиус: ${Math.round(tower.radius/10)}st<br>
            Бонус к радиусу: +${Math.round(tower.rangeBonus/10)}st<br>
            ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
        `;
    }
    
    // ... остальной код ...
}

// Обновляем getTowerName
function getTowerName(type) {
    switch(type) {
        // ... предыдущие случаи ...
        case 'businessman': return 'Бизнесмен';
        case 'king': return 'Король';
        case 'binoculars': return 'Бинокль';
        default: return 'Башня';
    }
}

// Обновляем функцию enemyDeath для плавного исчезновения
function enemyDeath(enemy) {
    enemy.elem.style.transition = 'all 1s';
    enemy.elem.style.transform = 'translate(-10px, -10px) scale(0)';
    setTimeout(() => {
        enemy.elem.remove();
        if (enemy.radiusElem) enemy.radiusElem.remove();
        enemies = enemies.filter(e => e !== enemy);
        money += getEnemyReward(enemy.type);
        updateMoney();
    }, 1000);
}

// Удлиняем дорожку (обновляем path в createBoard)
const path = [
    {x:0, y:5}, {x:1, y:5}, {x:2, y:5}, {x:3, y:5}, {x:4, y:5}, {x:5, y:5},
    {x:5, y:6}, {x:5, y:7}, {x:6, y:7}, {x:7, y:7}, {x:8, y:7}, {x:9, y:7},
    {x:9, y:6}, {x:9, y:5}, {x:10, y:5}, {x:11, y:5}, {x:12, y:5}, {x:13, y:5},
    {x:13, y:6}, {x:13, y:7}, {x:14, y:7}, {x:15, y:7}, {x:16, y:7}, {x:17, y:7},
    {x:17, y:6}, {x:17, y:5}, {x:18, y:5}, {x:19, y:5}, {x:20, y:5}, {x:20, y:6},
    {x:20, y:7}, {x:21, y:7}, {x:22, y:7}, {x:23, y:7}, {x:24, y:7}, {x:25, y:7},
    {x:25, y:6}, {x:25, y:5}, {x:25, y:4}, {x:25, y:3}, {x:26, y:3}, {x:27, y:3},
    {x:28, y:3}, {x:29, y:3}, {x:30, y:3}, {x:31, y:3}, {x:32, y:3}, {x:33, y:3},
    {x:33, y:4}, {x:33, y:5}, {x:34, y:5}, {x:35, y:5}, {x:36, y:5}, {x:37, y:5},
    {x:37, y:6}, {x:37, y:7}, {x:38, y:7}, {x:39, y:7}, {x:40, y:7}
];
