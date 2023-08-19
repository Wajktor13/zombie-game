const MIN_WALK_PERIOD = 1.5;
const MAX_WALK_PERIOD = 15;
const MIN_HEIGHT_SCALE = 0.35;
const MAX_HEIGHT_SCALE = 1.8;
const MIN_SPAWN_DELAY = 50;
const MAX_SPAWN_DELAY = 1500;
const ZOMBIE_IMG_PATH = "images/walkingdead.png";
let ZOMBIE_IMG_HEIGHT;
const zombieContainer = document.getElementById("zombie-container");

let health = 3;
let score = 0;
let gameRunning = false;


class Zombie {
    walkPeriod;
    scale;
    position;
    zombieMoveWrapperDiv = document.createElement("div");
    zombieScaleWrapperDiv = document.createElement("div");
    zombieDiv = document.createElement("div");

    constructor(walkPeriod, scale, position) {
        this.walkPeriod = walkPeriod == null ? randomInt(MIN_WALK_PERIOD, MAX_WALK_PERIOD) : walkPeriod;
        this.scale = scale == null ? randomFloat(MIN_HEIGHT_SCALE, MAX_HEIGHT_SCALE) : scale;
        this.position = position == null ? randomInt(0, zombieContainer.offsetHeight) : position;

        this.zombieMoveWrapperDiv.classList.add("zombie-move-wrapper");
        this.zombieScaleWrapperDiv.classList.add("zombie-scale-wrapper");
        this.zombieDiv.classList.add("zombie");

        this.zombieDiv.addEventListener("mousedown", hitZombie);

        this.zombieMoveWrapperDiv.appendChild(this.zombieScaleWrapperDiv);
        this.zombieScaleWrapperDiv.appendChild(this.zombieDiv);

        this.zombieDiv.style.animation = `walk ${this.walkPeriod / 10}s steps(10) infinite`;
        this.zombieMoveWrapperDiv.style.animation = `forward ${this.walkPeriod}s linear infinite`;

        this.zombieScaleWrapperDiv.style.transform = `scale(${this.scale})`;

        let normalizedPosition = Math.ceil(this.position - ZOMBIE_IMG_HEIGHT * this.scale);
        this.zombieMoveWrapperDiv.style.top = `${normalizedPosition}px`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let startGameButton = document.getElementById('start-game-btn')
    let restartGameButton = document.getElementById('restart-game-btn')
    
    document.addEventListener('mousemove', moveGunsight)
    document.addEventListener('mousedown', shotMissed)
    startGameButton.addEventListener('click', runGame)
    restartGameButton.addEventListener('click', runGame)
    }
);

async function runGame() {
    await prepareGame();
    gameRunning = true;
    spawnZombie();
}

async function prepareGame() {
    let body = document.querySelector("body");
    let gunSight = document.getElementById("gunsight");
    let startGameButton = document.getElementById("start-game-btn");
    let endingHud = document.getElementById("ending-hud");
    let restartGameButton = document.getElementById("restart-game-btn");
    let heart1 = document.getElementById("heart1");
    let heart2 = document.getElementById("heart2");
    let heart3 = document.getElementById("heart3");

    [heart1, heart2, heart3].forEach((heart) => {heart.style.backgroundImage = "url(images/full_heart.png)"});
  
    health = 3;
    gameRunning = false;
    score = 0;
    changeScore(0);
  
    gunSight.style.display = "block";
    body.style.cursor = "none";
  
    startGameButton.style.display = "none";
    startGameButton.setAttribute("disabled", "true");
  
    endingHud.style.display = "none";
  
    restartGameButton.setAttribute("disabled", "true");

    const zombieImg = new Image();
    zombieImg.src = ZOMBIE_IMG_PATH;

    await new Promise((resolve) => {
        zombieImg.addEventListener("load", () => {
            ZOMBIE_IMG_HEIGHT = zombieImg.naturalHeight;
            resolve();
        });
    });
}

function spawnZombie() {
    if (gameRunning) {
        let zombie = new Zombie(null, null, null);
        addZombieToContainer(zombie);
        setTimeout(spawnZombie, randomInt(MIN_SPAWN_DELAY, MAX_SPAWN_DELAY));
    }
}

function addZombieToContainer(zombie) {
    zombieContainer.appendChild(zombie.zombieMoveWrapperDiv);

    setTimeout(() => {
        walkEnded(zombie);
    }, zombie.walkPeriod * 1000);
}

function walkEnded(zombie) {
    if (zombieContainer.contains(getOutherZombieWrapper(zombie.zombieDiv))) {
        removeZombie(zombie.zombieDiv);
        health -= 1;
        healthChanged();
    }
}

function healthChanged() {
    switch (health) {
        case 2:
            let heart3 = document.getElementById("heart3");
            heart3.style.backgroundImage = "url(images/empty_heart.png)";
            break;
        case 1:
            let heart2 = document.getElementById("heart2");
            heart2.style.backgroundImage = "url(images/empty_heart.png)";
            break;
        case 0:
            let heart1 = document.getElementById("heart1");
            heart1.style.backgroundImage = "url(images/empty_heart.png)";
            gameRunning = false;
            zombieContainer.innerHTML = "";
            endGame();
        }
}

function hitZombie(event) {
    event.stopPropagation();
    removeZombie(event.currentTarget);
    changeScore(10);
}

function removeZombie(zombieDivToRemove) {
    let zombieOutherWrapper = getOutherZombieWrapper(zombieDivToRemove);
    zombieOutherWrapper.parentElement.removeChild(zombieOutherWrapper);
}

function moveGunsight(event) {
    let sight = document.getElementById("gunsight");
    let sightWidth = sight.offsetWidth / 2;

    sight.style.top = event.y - sightWidth + "px";
    sight.style.left = event.x - sightWidth + "px";
}

function shotMissed() {
    changeScore(-5);
}

function changeScore(diff) {
    let scoreDiv = document.getElementById("score");

    score = Math.max(0, score + diff);
    scoreDiv.innerText = `SCORE : ${score}`;
}

function endGame() {
    let body = document.querySelector("body");
    let gunSight = document.getElementById("gunsight");
    let restartGameButton = document.getElementById("restart-game-btn");
    let endingHud = document.getElementById("ending-hud");
  
    restartGameButton.removeAttribute("disabled");
  
    endingHud.style.display = "flex";
  
    gunSight.style.display = "none";
    body.style.cursor = "default";
  }

function randomInt(min, max) {
    return Math.floor(randomFloat(min, max));
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getOutherZombieWrapper(zombieDiv) {
    return zombieDiv.parentElement.parentElement;
}