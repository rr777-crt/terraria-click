document.addEventListener('DOMContentLoaded', function() {
    // Game Elements
    const board = document.getElementById('gameBoard');
    const moneyDisplay = document.getElementById('moneyDisplay');
    const waveDisplay = document.getElementById('waveDisplay');
    const shop = document.getElementById('shop');
    const upgradeMenu = document.getElementById('upgradeMenu');
    const gameOverScreen = document.getElementById('gameOver');

    // Game Constants
    const COLS = 30;
    const ROWS = 15;
    const TILE_SIZE = 40;
    
    // Game State
    let money = 300;
    let currentWave = 1;
    let enemies = [];
    let towers = [];
    let selectedTower = null;
    let showRadius = false;
    let waveInProgress = false;
    let gameActive = true;
    let towerIdCounter = 0;

    // Extended Path
    const PATH = [
        {x:0, y:7}, {x:1, y:7}, {x:2, y:7}, {x:3, y:7}, {x:4, y:7}, {x:5, y:7},
        {x:5, y:6}, {x:5, y:5}, {x:6, y:5}, {x:7, y:5}, {x:8, y:5}, {x:9, y:5},
        {x:9, y:6}, {x:9, y:7}, {x:10, y:7}, {x:11, y:7}, {x:12, y:7}, {x:13, y:7},
        {x:13, y:6}, {x:13, y:5}, {x:14, y:5}, {x:15, y:5}, {x:16, y:5}, {x:17, y:5},
        {x:17, y:6}, {x:17, y:7}, {x:18, y:7}, {x:19, y:7}, {x:20, y:7}, {x:21, y:7},
        {x:21, y:6}, {x:21, y:5}, {x:22, y:5}, {x:23, y:5}, {x:24, y:5}, {x:25, y:5},
        {x:25, y:6}, {x:25, y:7}, {x:26, y:7}, {x:27, y:7}, {x:28, y:7}, {x:29, y:7}
    ];

    // Tower Types
    const towerTypes = {
        pistol: {
            type: 'pistol',
            name: 'Пистолет',
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
            name: 'Мечник',
            cost: 80,
            damage: 2,
            radius: 50,
            attackSpeed: 2,
            upgraded: false,
            upgradeCost: 150,
            upgradedDamage: 3,
            upgradedAttackSpeed: 3
        },
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
            limit: 1,
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

    // Initialize Game
    function initGame() {
        createBoard();
        updateMoney();
        updateWave();
        setupShop();
        gameLoop();
    }

    // Create Game Board
    function createBoard() {
        board.innerHTML = '';
        board.style.width = COLS * TILE_SIZE + 'px';
        board.style.height = ROWS * TILE_SIZE + 'px';

        // Create grass tiles
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile grass';
                tile.style.left = x * TILE_SIZE + 'px';
                tile.style.top = y * TILE_SIZE + 'px';
                board.appendChild(tile);
            }
        }

        // Create path tiles
        PATH.forEach((pos, index) => {
            const tile = document.createElement('div');
            tile.className = `tile ${index === 0 ? 'start' : index === PATH.length-1 ? 'end' : 'path'}`;
            tile.style.left = pos.x * TILE_SIZE + 'px';
            tile.style.top = pos.y * TILE_SIZE + 'px';
            board.appendChild(tile);
        });
    }

    // Setup Shop
    function setupShop() {
        shop.innerHTML = '';
        
        Object.values(towerTypes).forEach(tower => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                ${tower.name} (${tower.cost})<br>
                ${getTowerDescription(tower)}
            `;
            item.onclick = () => selectTower(tower.type, tower.cost);
            shop.appendChild(item);
        });

        // Add money and wave displays
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <div id="moneyDisplay">Деньги: ${money}</div>
            <div id="waveDisplay">Волна: ${currentWave}</div>
            <button id="showRadiusBtn" onclick="toggleRadius()">Показать радиусы</button>
        `;
        shop.appendChild(infoDiv);
    }

    function getTowerDescription(tower) {
        switch(tower.type) {
            case 'pistol': return `Урон: 1/сек<br>Радиус: 10st`;
            case 'swordsman': return `Урон: 2/0.5сек<br>Радиус: 5st`;
            case 'businessman': return `Доход: 100/5сек<br>Не атакует`;
            case 'king': return `Создает квадраты<br>Только 1 на карте`;
            case 'binoculars': return `+5st к радиусу<br>Радиус: 5st`;
            default: return '';
        }
    }

    // Game Logic
    function gameLoop() {
        if (!gameActive) return;
        
        moveEnemies();
        attackEnemies();
        checkWaveCompletion();
        
        requestAnimationFrame(gameLoop);
    }

    function moveEnemies() {
        enemies.forEach((enemy, index) => {
            if (enemy.pathIndex >= PATH.length) {
                enemy.elem.remove();
                enemies.splice(index, 1);
                endGame();
                return;
            }

            const target = PATH[enemy.pathIndex];
            const targetX = target.x * TILE_SIZE + TILE_SIZE/2;
            const targetY = target.y * TILE_SIZE + TILE_SIZE/2;
            
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < 2) {
                enemy.pathIndex++;
            } else {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
                enemy.elem.style.left = enemy.x + 'px';
                enemy.elem.style.top = enemy.y + 'px';
            }
        });
    }

    function attackEnemies() {
        towers.forEach(tower => {
            if (tower.type === 'businessman' || tower.type === 'king') return;
            
            let closestEnemy = getClosestEnemyInRange(tower);
            
            if (closestEnemy && Date.now() - tower.lastAttack > 1000/tower.attackSpeed) {
                closestEnemy.hp -= tower.damage;
                tower.lastAttack = Date.now();
                
                if (closestEnemy.hp <= 0) {
                    killEnemy(closestEnemy);
                }
            }
        });
    }

    function killEnemy(enemy) {
        // Smooth shrink effect
        enemy.elem.style.transition = 'all 1s';
        enemy.elem.style.transform = 'scale(0)';
        
        setTimeout(() => {
            enemy.elem.remove();
            enemies = enemies.filter(e => e !== enemy);
            money += getEnemyReward(enemy.type);
            updateMoney();
        }, 1000);
    }

    // ... (добавьте остальные функции из предыдущих примеров)

    // Start the game
    initGame();
});

// Helper functions outside DOMContentLoaded
function toggleRadius() {
    // Реализация переключения видимости радиусов
}

function restartGame() {
    // Реализация перезапуска игры
}
