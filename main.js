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
    let kingSquares = [];
    let kingPlaced = false;

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
            incomeInterval: 5000,
            radius: 0,
            upgraded: false,
            upgradeCost: 5000,
            upgradedIncome: 250,
            upgradedIncomeInterval: 5000
        },
        king: {
            type: 'king',
            name: 'Король',
            cost: 5000,
            spawnInterval: 15000,
            squareHp: 5,
            damage: 0.25,
            radius: 0,
            upgraded: false,
            upgradeCost: 20000,
            upgradedSpawnInterval: 7500
        },
        binoculars: {
            type: 'binoculars',
            name: 'Бинокль',
            cost: 1000,
            radiusBonus: 50,
            radius: 0,
            upgraded: false,
            upgradeCost: 2250,
            upgradedRadiusBonus: 70
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
            <button id="showRadiusBtn">Показать радиусы</button>
        `;
        shop.appendChild(infoDiv);
        
        document.getElementById('showRadiusBtn').addEventListener('click', toggleRadius);
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
            if (tower.radiusElem) {
                tower.radiusElem.style.display = showRadius ? 'block' : 'none';
            }
        });
    }

    function selectTower(type, cost) {
        if (!gameActive) return;
        if (type === 'king' && kingPlaced) return;
        if (money >= cost && !placingTower) {
            placingTower = type;
        }
    }

    board.addEventListener('click', (e) => {
        if (!gameActive || !placingTower) return;
        
        const rect = board.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
        
        // Проверяем, можно ли поставить башню
        const isPath = PATH.some(pos => pos.x === x && pos.y === y);
        const isOccupied = towers.some(tower => 
            Math.floor(tower.x / TILE_SIZE) === x && 
            Math.floor(tower.y / TILE_SIZE) === y
        );
        
        if (!isPath && !isOccupied) {
            const tower = {
                ...towerTypes[placingTower],
                id: towerIdCounter++,
                x: x * TILE_SIZE + TILE_SIZE/2,
                y: y * TILE_SIZE + TILE_SIZE/2,
                lastAttack: 0
            };
            
            placeTower(tower);
            money -= towerTypes[placingTower].cost;
            updateMoney();
            
            if (placingTower === 'king') {
                kingPlaced = true;
                document.querySelectorAll('.shop-item').forEach(item => {
                    if (item.textContent.includes('Король')) {
                        item.style.opacity = '0.5';
                        item.style.pointerEvents = 'none';
                    }
                });
            }
            
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
        
        // Для бизнесмена запускаем генерацию денег
        if (tower.type === 'businessman') {
            tower.incomeTimer = setInterval(() => {
                money += tower.upgraded ? tower.upgradedIncome : tower.income;
                updateMoney();
            }, tower.upgraded ? tower.upgradedIncomeInterval : tower.incomeInterval);
        }
        
        // Для короля запускаем спавн квадратов
        if (tower.type === 'king') {
            tower.spawnTimer = setInterval(() => {
                spawnKingSquare(tower);
            }, tower.upgraded ? tower.upgradedSpawnInterval : tower.spawnInterval);
        }
        
        // Для бинокля добавляем бонус к радиусу
        if (tower.type === 'binoculars') {
            applyBinocularsBonus(tower);
        }
        
        if (tower.radius > 0) {
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

    function spawnKingSquare(kingTower) {
        const square = {
            x: kingTower.x,
            y: kingTower.y,
            hp: kingTower.squareHp,
            targetX: PATH[PATH.length-1].x * TILE_SIZE + TILE_SIZE/2,
            targetY: PATH[PATH.length-1].y * TILE_SIZE + TILE_SIZE/2,
            speed: 2
        };
        
        const elem = document.createElement('div');
        elem.className = 'king-square';
        elem.style.left = square.x + 'px';
        elem.style.top = square.y + 'px';
        board.appendChild(elem);
        
        square.elem = elem;
        kingSquares.push(square);
    }

    function applyBinocularsBonus(binocularsTower) {
        const bonus = binocularsTower.upgraded ? binocularsTower.upgradedRadiusBonus : binocularsTower.radiusBonus;
        
        towers.forEach(tower => {
            if (tower !== binocularsTower && tower.type !== 'businessman' && tower.type !== 'king' && tower.radiusElem) {
                // Проверяем расстояние до бинокля
                const dx = tower.x - binocularsTower.x;
                const dy = tower.y - binocularsTower.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 200) { // Радиус действия бинокля
                    tower.radiusElem.style.width = (tower.radius + bonus) * 2 + 'px';
                    tower.radiusElem.style.height = (tower.radius + bonus) * 2 + 'px';
                }
            }
        });
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
            default:
                hp = 2 * hpMultiplier;
                speed = 2;
                color = 'red';
        }
        
        const enemy = {
            x: PATH[0].x * TILE_SIZE + TILE_SIZE/2,
            y: PATH[0].y * TILE_SIZE + TILE_SIZE/2,
            hp: hp,
            maxHp: hp,
            pathIndex: 0,
            speed: speed,
            type: type,
            color: color
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
        enemies.push(enemy);
    }

    function gameLoop() {
        if (!gameActive) return;
        
        // Движение квадратов короля
        kingSquares.forEach((square, index) => {
            const dx = square.targetX - square.x;
            const dy = square.targetY - square.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < 2) {
                // Квадрат достиг цели
                square.elem.remove();
                kingSquares.splice(index, 1);
                
                // Наносим урон врагам в конце пути
                enemies.forEach(enemy => {
                    const enemyX = enemy.x;
                    const enemyY = enemy.y;
                    const endX = PATH[PATH.length-1].x * TILE_SIZE + TILE_SIZE/2;
                    const endY = PATH[PATH.length-1].y * TILE_SIZE + TILE_SIZE/2;
                    const distToEnd = Math.sqrt(Math.pow(enemyX - endX, 2) + Math.pow(enemyY - endY, 2));
                    
                    if (distToEnd < 30) {
                        enemy.hp -= enemy.maxHp * 0.25;
                        
                        if (enemy.hp <= 0) {
                            killEnemy(enemy);
                        }
                    }
                });
            } else {
                square.x += (dx / distance) * square.speed;
                square.y += (dy / distance) * square.speed;
                square.elem.style.left = square.x + 'px';
                square.elem.style.top = square.y + 'px';
            }
        });
        
        // Движение врагов
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
            }
            
            enemy.elem.style.left = enemy.x + 'px';
            enemy.elem.style.top = enemy.y + 'px';
            
            if (enemy.hpText) {
                enemy.hpText.textContent = Math.max(0, Math.floor(enemy.hp));
            }
        });
        
        // Атака башен
        towers.forEach(tower => {
            if (tower.type === 'businessman' || tower.type === 'king' || tower.type === 'binoculars') return;
            
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
                tower.lastAttack = Date.now();
                
                if (closestEnemy.hp <= 0) {
                    killEnemy(closestEnemy);
                }
            }
        });
        
        checkWaveCompletion();
        requestAnimationFrame(gameLoop);
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

    function getEnemyReward(type) {
        switch(type) {
            case 'red': return 10;
            case 'purple': return 25;
            case 'gold': return 50;
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
        } else {
            for (let i = 0; i < currentWave * 2; i++) {
                if (i % 5 === 4) {
                    setTimeout(() => spawnEnemy('purple', hpMultiplier), i * 1000);
                } else {
                    setTimeout(() => spawnEnemy('red', hpMultiplier), i * 1000);
                }
            }
        }
    }

    function showUpgradeMenu(tower) {
        if (!gameActive) return;
        
        closeUpgradeMenu();
        selectedTower = tower;
        upgradeMenu.style.display = 'block';
        
        let upgradeButton = upgradeMenu.querySelector('button');
        upgradeButton.textContent = `Улучшить (${tower.upgradeCost})`;
        
        let statsHTML = `<strong>${tower.name || getTowerName(tower.type)}</strong><br>`;
        
        if (tower.type === 'businessman') {
            statsHTML += `
                Доход: ${tower.upgraded ? tower.upgradedIncome : tower.income} монет<br>
                Интервал: ${(tower.upgraded ? tower.upgradedIncomeInterval : tower.incomeInterval)/1000} сек<br>
                ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
            `;
        } else if (tower.type === 'king') {
            statsHTML += `
                Интервал спавна: ${(tower.upgraded ? tower.upgradedSpawnInterval : tower.spawnInterval)/1000} сек<br>
                Урон квадратов: ${tower.damage*100}% HP врага<br>
                ${tower.upgraded ? '<span style="color:green">УЛУЧШЕНО</span>' : ''}
            `;
        } else if (tower.type === 'binoculars') {
            statsHTML += `
                Бонус к радиусу: +${tower.upgraded ? tower.upgradedRadiusBonus/10 : tower.radiusBonus/10}st<br>
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
        
        upgradeMenu.querySelector('#towerStats').innerHTML = statsHTML;
    }

    function getTowerName(type) {
        switch(type) {
            case 'pistol': return 'Пистолет';
            case 'swordsman': return 'Мечник';
            case 'businessman': return 'Бизнесмен';
            case 'king': return 'Король';
            case 'binoculars': return 'Бинокль';
            default: return 'Башня';
        }
    }

    function closeUpgradeMenu() {
        upgradeMenu.style.display = 'none';
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
            case 'businessman':
                selectedTower.income = selectedTower.upgradedIncome;
                clearInterval(selectedTower.incomeTimer);
                selectedTower.incomeTimer = setInterval(() => {
                    money += selectedTower.income;
                    updateMoney();
                }, selectedTower.upgradedIncomeInterval);
                break;
            case 'king':
                selectedTower.spawnInterval = selectedTower.upgradedSpawnInterval;
                clearInterval(selectedTower.spawnTimer);
                selectedTower.spawnTimer = setInterval(() => {
                    spawnKingSquare(selectedTower);
                }, selectedTower.upgradedSpawnInterval);
                break;
            case 'binoculars':
                selectedTower.radiusBonus = selectedTower.upgradedRadiusBonus;
                applyBinocularsBonus(selectedTower);
                break;
        }
        
        if (selectedTower.radiusElem) {
            selectedTower.radiusElem.style.width = selectedTower.radius * 2 + 'px';
            selectedTower.radiusElem.style.height = selectedTower.radius * 2 + 'px';
        }
        
        showUpgradeMenu(selectedTower);
    }

    function endGame() {
        gameActive = false;
        gameOverScreen.style.display = 'block';
    }

    function restartGame() {
        board.innerHTML = '';
        enemies = [];
        towers = [];
        kingSquares = [];
        
        money = 300;
        currentWave = 1;
        gameActive = true;
        towerIdCounter = 0;
        kingPlaced = false;
        
        updateMoney();
        updateWave();
        gameOverScreen.style.display = 'none';
        closeUpgradeMenu();
        
        // Разблокируем кнопку короля
        document.querySelectorAll('.shop-item').forEach(item => {
            if (item.textContent.includes('Король')) {
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
            }
        });
        
        createBoard();
        startWave();
    }

    // Start the game
    initGame();
});

// Helper functions outside DOMContentLoaded
function toggleRadius() {
    // Реализация переключения видимости радиусов
    // (уже реализована внутри DOMContentLoaded)
}

function restartGame() {
    // Реализация перезапуска игры
    // (уже реализована внутри DOMContentLoaded)
}

