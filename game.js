const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

let teamScores = [];

if (innerWidth >= 1400){
    canvas.width = 1400;
    canvas.height = 800;
}else{
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

const backgroundImage = new Image;
backgroundImage.src = "assets/bc.png";

const playerImg = new Image;
playerImg.src = "assets/pixel_ship_yellow.png";
const playerLaser = new Image;
playerLaser.src = "assets/pixel_laser_yellow.png";

const blueShip = new Image;
const blueLaser = new Image;
const redShip = new Image;
const redLaser = new Image;
const greenShip = new Image;
const greenlaser = new Image;

blueShip.src = "assets/pixel_ship_blue_small.png";
blueLaser.src = "assets/pixel_laser_blue.png";
redShip.src = "assets/pixel_ship_red_small.png";
redLaser.src ="assets/pixel_laser_red.png";
greenShip.src = "assets/pixel_ship_green_small.png";
greenlaser.src = "assets/pixel_laser_green.png";

const enemyShips = [blueShip, redShip, greenShip];
const enemyLasers = [blueLaser, redLaser, greenlaser];

class Player{
    constructor(x,y,img){
        this.position = {
            x : x,
            y : y,
        }
        this.img = img
        this.velocity = {
            x : 0,
            y : 0
        }
        this.laserImg = playerLaser
        this.laserList = []
        this.laserLimit = 3
        this.health = 100; 
    };

    draw(){
        c.drawImage(this.img, this.position.x, this.position.y);
    };

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    };
}

class Enemy{
    constructor(){
        this.position = {
            x : Math.floor(Math.random()* (canvas.width - 100) + 50),
            y : -(Math.floor(Math.random()*canvas.height))
        }
        this.img = enemyShips[(Math.floor(Math.random()* enemyShips.length))]
        this.laserImg = enemyLasers[(Math.floor(Math.random()* enemyLasers.length))]
        this.laserList = []
        this.velocity = 0.5
    }

    draw(){
        c.drawImage(this.img, this.position.x, this.position.y);
    }

    update(){
        this.draw();
        this.position.y += this.velocity
    }
}

class Laser{
    constructor(x,y,img,velocity){
        this.position = {
            x : x,
            y : y
        }
        this.img = img
        this.velocity = velocity
    }

    draw(){
        c.drawImage(this.img, this.position.x, this.position.y);
    }

    update(){
        this.draw();
        this.position.y += this.velocity;
    }
}

const keys = {
    space : {pressed: false},
    N0 : {pressed: false}
}
const playerWidth = 100;
const playerHeight = 100;
const playerVelocity = 3;

var teamName;
var score = 0;
var lives = 5;
var level = 1;
var enemyCount = 10;
var gameLost = false;
c.font = "30px serif";
c.fillStyle = "white";
let run;


let players = []
players.push(new Player(500,500,playerImg));

let enemies = []
for(let i = 0; i < 10; i++){
    enemies.push(new Enemy);
}

function collision(player, enemy){
    return(
        player.position.x + playerWidth >= enemy.position.x &&
        enemy.position.x + 50 >= player.position.x &&
        player.position.y + playerHeight >= enemy.position.y &&
        enemy.position.y + 100 > player.position.y
    ); 
};

function laserCollision(player, enemy){
    return(
        player.position.x + 40 >= enemy.position.x &&
        enemy.position.x + 40 >= player.position.x &&
        player.position.y + 10 >= enemy.position.y &&
        enemy.position.y + 50 > player.position.y
    ); 
};

function animate(){
    run = window.requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width, canvas.height);
    c.drawImage(backgroundImage, 0,0, canvas.width, canvas.height);    
    
    for(let i = 0; i < enemies.length; i++){
        enemies[i].update();
        if(enemies[i].position.y > canvas.height){
            enemies.splice(i, 1);
            lives -= 1;
            console.log(lives);
        }
        for(let j = 0; j < players.length; j++){
            if(collision(players[j], enemies[i])){
                enemies.splice(i, 1);
                players[j].health -= 10;
                console.log("collision");
            }
        }
    }

    for(let i = 0; i < players.length; i++){
        players[i].update();
        for(let j = 0; j < players[i].laserList.length; j++){
            players[i].laserList[j].update();
            if(players[i].laserList[j].position.y + playerHeight < 0){
                players[i].laserList.splice(j,1);
            }
            for (let k = 0; k < enemies.length; k++){
                if(laserCollision(players[i].laserList[j], enemies[k])){
                    enemies.splice(k, 1);
                    players[i].laserList.splice(j, 1);
                    score += 10;
                }
            }
        }
        c.fillStyle ="red";
        c.fillRect(players[i].position.x, (players[i].position.y + playerHeight + 10), playerWidth, 10);
        c.fillStyle ="green";
        c.fillRect(players[i].position.x, (players[i].position.y + playerHeight + 10), (playerWidth* (players[i].health / 100)), 10);
        if(players[i].position.x <= 0 || players[i].position.x >= canvas.width - playerWidth){
            players[i].velocity.x = 0;
        }
        if(players[i].position.y <= 0 || players[i].position.y >= canvas.height - playerHeight){
            players[i].velocity.y = 0;
        }
    } 

    c.fillStyle = "white";
    c.fillText(`Lives left: ${lives}`, 20, 50);
    c.fillText(`Score: ${score}`, 20, 90);
    c.fillText(`Level: ${level}`, 20, 130);

    if (enemies.length === 0 && lives > 0){
        level += 1;
        enemyCount += 5;
        for(let i = 0; i < enemyCount; i++){
            enemies.push(new Enemy);
        }
    }

    if(lives <= 0 || players.length <= 0){
        gameLost = true;
        enemies = [];
        window.cancelAnimationFrame(run);
        document.getElementById("peli").classList.add("hide");
        document.getElementById("scoreFill").innerHTML = `${score}`; 
        document.getElementById("newGame").removeAttribute("disabled");
        document.getElementById("endScreen").classList.remove("hide");
    }
    
}

window.addEventListener("keypress", ({code})=>{
    switch(code){
        case "KeyA":
            players[0].velocity.x = -playerVelocity;
            break;
        case "KeyD":
            players[0].velocity.x = playerVelocity;
            break;
        case "KeyW":
            players[0].velocity.y = -playerVelocity;
            break;
        case "KeyS":
            players[0].velocity.y = playerVelocity;
            break;
    }
});

window.addEventListener("keypress", ({code})=>{
    switch(code){
        case "Space":
            if(players[0] && players[0].laserList.length < players[0].laserLimit){
                players[0].laserList.push(new Laser(players[0].position.x, players[0].position.y, playerLaser, -4));
                console.log("done");
            }
            break;
        case "Numpad0":
            console.log("Tässä");
            break;
    }
});

window.addEventListener("keyup", ({code})=>{
    switch(code){
        case "KeyA":
            players[0].velocity.x = 0;
            break;
        case "KeyD":
            players[0].velocity.x = 0;
            break;
        case "KeyW":
            players[0].velocity.y = 0;
            break;
        case "KeyS":
            players[0].velocity.y = 0;
            break;
    }
});

document.getElementById("newGame").addEventListener("click", function(){
    if(document.getElementById("peli").classList.contains("hide")){
        document.getElementById("peli").classList.remove("hide");
    }
    document.getElementById("playerSelection").classList.add("hide");
    if(document.getElementById("endScreen").classList.contains("hide") === false){
        document.getElementById("endScreen").classList.add("hide");
    }
    if(lives < 5){
        lives = 5;
    }
    for(let i = 0; i < players.length; i++){
        if(players[i].health < 100){
            players[i].health = 100;
        }
    }
    score = 0;
    enemyCount = 10;
    level = 1;
    if(enemies.length === 0){
        for(let i = 0; i < enemyCount; i++){
            enemies.push(new Enemy);
        }
    }
    document.getElementById("newGame").setAttribute("disabled","");
    teamName = document.getElementById("teamName").value;
    animate();
    
})

    
