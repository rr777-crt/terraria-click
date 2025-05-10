const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

// Игровые переменные
let coins = 0;
let player = { x: 100, y: 300, width: 30, height: 50, speed: 5, isHiding: false };
let rooms = [];
let currentRoom = 0;
let lightsOn = true;
let monster = { x: 700, y: 300, width: 40, height: 60, isActive: false };
let darkTimer = 5;
let timerInterval;

// Флаги движения (для зажатия кнопок)
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Генерация комнат
function generateRooms() {
    rooms = [
        { type: "loot", loot: [{ x: 200, y: 300, collected: false }] },
        { type: "closet", closets: [{ x: 400, y: 280, width: 50, height: 70 }] },
        { type: "monster" },
        { type: "double_loot", loot: [
            { x: 200, y: 300, collected: false },
            { x: 500, y: 300, collected: false }
        ]}
    ];
}

// Таймер тьмы (перезапускается при выключении света)
function startDarkTimer() {
    clearInterval(timerInterval);
    darkTimer = 5;
    document.getElementById("timer").textContent = darkTimer;
    
    timerInterval = setInterval(() => {
        darkTimer--;
        document.getElementById("timer").textContent = darkTimer;
        
        if (darkTimer <= 0 && !lightsOn && rooms[currentRoom].type === "monster") {
            monster.isActive = true;
        }
    }, 1000);
}

// Отрисовка игры
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    ctx.fillStyle = lightsOn ? "#222" : "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Игрок
    ctx.fillStyle = player.isHiding ? "blue" : "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Монстр
    if (monster.isActive) {
        ctx.fillStyle = "purple";
        ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
    }
    
    // Лут
    if (rooms[currentRoom].loot) {
        rooms[currentRoom].loot.forEach(item => {
            if (!item.collected) {
                ctx.fillStyle = "gold";
                ctx.fillRect(item.x, item.y, 20, 20);
            }
        });
    }
    
    // Шкафы
    if (rooms[currentRoom].type === "closet") {
        ctx.fillStyle = "brown";
        rooms[currentRoom].closets.forEach(closet => {
            ctx.fillRect(closet.x, closet.y, closet.width, closet.height);
        });
    }
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Обновление состояния
function update() {
    // Движение игрока (если кнопки зажаты)
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;
    if (keys.ArrowUp) player.y -= player.speed;
    if (keys.ArrowDown) player.y += player.speed;

    // Мигание света
    if (Math.random() < 0.01) {
        lightsOn = !lightsOn;
        if (!lightsOn) startDarkTimer();
        else {
            clearInterval(timerInterval);
            monster.isActive = false;
        }
    }

    // Движение монстра
    if (monster.isActive) {
        monster.x -= 2;
        if (monster.x < -50) monster.x = 700;
    }

    // Проверка столкновений
    checkCollisions();
}

// Проверка столкновений
function checkCollisions() {
    if (monster.isActive && !player.isHiding && 
        Math.abs(player.x - monster.x) < 50) {
        alert("Монстр поймал вас!");
        resetGame();
    }

    if (rooms[currentRoom].loot) {
        rooms[currentRoom].loot.forEach(item => {
            if (!item.collected && 
                Math.abs(player.x - item.x) < 30 && 
                Math.abs(player.y - item.y) < 30) {
                item.collected = true;
                coins++;
                document.getElementById("coins").textContent = coins;
            }
        });
    }
}

// Сброс игры
function resetGame() {
    player = { x: 100, y: 300, width: 30, height: 50, speed: 5, isHiding: false };
    coins = 0;
    document.getElementById("coins").textContent = coins;
    generateRooms();
}

// Управление (клавиатура)
document.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.key === "e") toggleHide();
});

document.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Управление (мобильные кнопки)
function setupMobileButtons() {
    const btns = ["left", "right", "up", "down"];
    btns.forEach(btn => {
        const el = document.getElementById(btn);
        el.addEventListener("touchstart", () => keys[`Arrow${btn.charAt(0).toUpperCase() + btn.slice(1)}`] = true);
        el.addEventListener("touchend", () => keys[`Arrow${btn.charAt(0).toUpperCase() + btn.slice(1)}`] = false);
    });
    document.getElementById("action").addEventListener("touchstart", toggleHide);
}

// Спрятаться/выйти
function toggleHide() {
    if (rooms[currentRoom].type === "closet") {
        player.isHiding = !player.isHiding;
    }
}

// Запуск игры
generateRooms();
setupMobileButtons();
gameLoop();
