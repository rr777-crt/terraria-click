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
let darkTimer = 5; // 5 секунд до появления монстра
let timerInterval;

// Генерация комнат
function generateRooms() {
    rooms = [
        { type: "loot", loot: [{ x: 200, y: 300, collected: false }] },
        { type: "closet", closets: [{ x: 400, y: 280, width: 50, height: 70 }] },
        { type: "monster" },
        { type: "double_loot", loot: [  // Новая комната!
            { x: 200, y: 300, collected: false },
            { x: 500, y: 300, collected: false }
        ]}
    ];
}

// Таймер тьмы
function startDarkTimer() {
    clearInterval(timerInterval);
    darkTimer = 5;
    document.getElementById("timer").textContent = darkTimer;
    
    timerInterval = setInterval(() => {
        darkTimer--;
        document.getElementById("timer").textContent = darkTimer;
        
        if (darkTimer <= 0) {
            clearInterval(timerInterval);
            if (!lightsOn && rooms[currentRoom].type === "monster") {
                monster.isActive = true;
            }
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
    
    // Лут (для комнат loot и double_loot)
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
    // Рандомное мигание света
    if (Math.random() < 0.01) {
        lightsOn = !lightsOn;
        if (!lightsOn) startDarkTimer();  // Запуск таймера при тьме
        else monster.isActive = false;    // Сброс монстра при свете
    }
    
    // Движение монстра
    if (monster.isActive) {
        monster.x -= 2;
        if (monster.x < -50) monster.x = 700;  // Сброс позиции
    }
    
    // Проверка столкновений
    checkCollisions();
}

// Проверка столкновений с монстром/лутом
function checkCollisions() {
    // Монстр
    if (monster.isActive && !player.isHiding && 
        Math.abs(player.x - monster.x) < 50) {
        alert("Монстр поймал вас!");
        resetGame();
    }
    
    // Лут
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
    player.x = 100;
    player.isHiding = false;
    coins = 0;
    document.getElementById("coins").textContent = coins;
    generateRooms();
}

// Управление (клавиатура)
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
    if (e.key === "ArrowUp") player.y -= player.speed;
    if (e.key === "ArrowDown") player.y += player.speed;
    if (e.key === "e") toggleHide();
});

// Управление (кнопки на экране)
document.getElementById("left").addEventListener("touchstart", () => player.x -= player.speed);
document.getElementById("right").addEventListener("touchstart", () => player.x += player.speed);
document.getElementById("up").addEventListener("touchstart", () => player.y -= player.speed);
document.getElementById("down").addEventListener("touchstart", () => player.y += player.speed);
document.getElementById("action").addEventListener("touchstart", toggleHide);

// Спрятаться/выйти из шкафа
function toggleHide() {
    if (rooms[currentRoom].type === "closet") {
        player.isHiding = !player.isHiding;
    }
}

// Запуск игры
generateRooms();
gameLoop();
