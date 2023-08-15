var MIN_WALK_PERIOD = 1.5
var MAX_WALK_PERIOD = 15
var MIN_HEIGHT_SCALE = 0.4
var MAX_HEIGHT_SCALE = 1.8
var MIN_SPAWN_DELAY = 20
var MAX_SPAWN_DELAY = 1600

var health = 3
var score = 0
var gameRunning = false


document.addEventListener('load', addListeners())

function runGame(){
    prepareGame()
    gameRunning = true
    spawnZombies()
}

function endGame(){
    let body = document.querySelector('body')
    let gunSight = document.getElementById('gunsight')
    let restartGameButton = document.getElementById('restart-game-btn')
    let endingHud = document.getElementById('ending-hud')

    restartGameButton.removeAttribute('disabled')

    endingHud.style.display = 'flex'

    gunSight.style.display = 'none'
    body.style.cursor = 'default'
}

function prepareGame(){
    let body = document.querySelector('body')
    let gunSight = document.getElementById('gunsight')
    let startGameButton = document.getElementById('start-game-btn')
    let endingHud = document.getElementById('ending-hud')
    let restartGameButton = document.getElementById('restart-game-btn')
    let heart1 = document.getElementById('heart1')
    let heart2 = document.getElementById('heart2')
    let heart3 = document.getElementById('heart3')

    heart1.style.backgroundImage = heart2.style.backgroundImage = heart3.style.backgroundImage =
    "url(images/full_heart.png)"

    health = 3
    gameRunning = false
    score = 0
    changeScore(0)

    gunSight.style.display = 'block'
    body.style.cursor = 'none'

    startGameButton.style.display = 'none'
    startGameButton.setAttribute('disabled', 'true')

    endingHud.style.display = 'none'

    restartGameButton.setAttribute('disabled', 'true')
}

function addListeners(){
    let startGameButton = document.getElementById('start-game-btn')
    let restartGameButton = document.getElementById('restart-game-btn')
    
    document.addEventListener('mousemove', moveGunsight)
    document.addEventListener('mousedown', shotMissed)
    startGameButton.addEventListener('click', runGame)
    restartGameButton.addEventListener('click', runGame)
}

function generateAndAddRandomZombie(){
    let zombieContainer = document.getElementById('zombie-container')
    
    let lifePeriod = randomInt(MIN_WALK_PERIOD, MAX_WALK_PERIOD)
    let scale = randomFloat(MIN_HEIGHT_SCALE, MAX_HEIGHT_SCALE)
    let position = randomInt(0, zombieContainer.offsetHeight)

    addZombie(lifePeriod, scale, position)
}

function addZombie(lifePeriod, scale, position){
    let zombieContainer = document.getElementById('zombie-container')

    let newZombieWrapperMove = document.createElement('div')
    let newZombieWrapperScale = document.createElement('div')
    let newZombie = document.createElement('div')
    newZombieWrapperMove.classList.add('zombie-wrapper-move')
    newZombieWrapperScale.classList.add('zombie-wrapper-scale')
    newZombie.classList.add('zombie')
    newZombie.addEventListener('mousedown', hitZombie)

    newZombieWrapperMove.appendChild(newZombieWrapperScale)
    newZombieWrapperScale.appendChild(newZombie)
    zombieContainer.appendChild(newZombieWrapperMove)

    newZombie.style.animation = `walk ${lifePeriod / 10}s steps(10) infinite`
    newZombieWrapperMove.style.animation = `forward ${lifePeriod}s linear infinite`

    newZombieWrapperScale.style.transform = `scale(${scale})`

    let normalizedPosition = Math.ceil(position - newZombie.offsetHeight * scale)
    newZombieWrapperMove.style.top = `${normalizedPosition}px`

    const walkEndedTimeout = setTimeout(() => {
        walkEnded(newZombie)
    }, lifePeriod * 1000)
}

function spawnZombies(){
    if (gameRunning){
        generateAndAddRandomZombie()
        setTimeout(spawnZombies, randomInt(MIN_SPAWN_DELAY, MAX_SPAWN_DELAY))
    }
}

function walkEnded(zombie){
    let zombieContainer = document.getElementById('zombie-container')

    if (zombieContainer.contains(getZombieOutherWrapper(zombie))){
        removeZombie(zombie)
        health -= 1
        
        switch (health){
            case 2:
                let heart3 = document.getElementById('heart3')
                heart3.style.backgroundImage = "url(images/empty_heart.png)"
                break
            case 1:
                let heart2 = document.getElementById('heart2')
                heart2.style.backgroundImage = "url(images/empty_heart.png)"
                break
            case 0:
                let heart1 = document.getElementById('heart1')
                heart1.style.backgroundImage = "url(images/empty_heart.png)"
                gameRunning = false
                zombieContainer.innerHTML = ''
                endGame()
        }
    }
}

function hitZombie(event){
    event.stopPropagation()
    let zombie = event.currentTarget;

    removeZombie(zombie)
    changeScore(12)
}

function getZombieOutherWrapper(zombie){
    return zombie.parentElement.parentElement
}

function removeZombie(zombieToRemove){
    let zombieOutherWrapper = getZombieOutherWrapper(zombieToRemove)
    zombieOutherWrapper.parentElement.removeChild(zombieOutherWrapper);
}

function moveGunsight(event){
    let sight = document.getElementById('gunsight')
    let sightWidth = sight.offsetWidth / 2

    sight.style.top = (event.y  - sightWidth) + "px"
    sight.style.left = (event.x - sightWidth)+ "px" 
}

function shotMissed(){
    changeScore(-6)
}

function changeScore(diff){
    let scoreDiv = document.getElementById('score')

    score = Math.max(0, score + diff)
    scoreDiv.innerText = `SCORE : ${score}`
}

function randomInt(min, max){
    return Math.floor(randomFloat(min, max))
}

function randomFloat(min, max){
    return Math.random() * (max - min) + min
}
