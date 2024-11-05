const WaterBlockStatus = Object.freeze({
    WATER : "WATER",
    SHIP : "SHIP",
    WATER_HIT : "WATER_HIT",
    SHIP_HIT : "SHIP_HIT"
});

const gameStateIdentifier = Object.freeze({
    YET_TO_START: "yet_to_start",
    PLAYING: "playing",
    OVER: "over",
  });
  const playerIdentifier = Object.freeze({
    PLAYER1: "player1",
    PLAYER2: "player2",
    NONE: "none",
  });

const shipsCapacity = [4, 3, 2];

const x_axis = Array.from({length:6},(_,i)=>i); //[0,1,2,3,4]
const y_axis = Array.from({length:5},(_,i)=>i); //[0,1,2,3,4]

let player1Grid = [];
let player2Grid = [];
let player1GridShipCoordinates = [];
let player2GridShipCoordinates = [];

let gameTurn = playerIdentifier.NONE;
let gameState = gameStateIdentifier.YET_TO_START;


const coordinates = x_axis.flatMap((x) => y_axis.map((y) => ({x,y}))); // [{x: 0, y:0},{x:0, y:1}....]
const player1PickingCoordinates = JSON.parse(JSON.stringify(coordinates));
const player2PickingCoordinates = JSON.parse(JSON.stringify(coordinates));


function createWaterBody(){
    return Array.from({length: x_axis.length}, () => Array.from({length: y_axis.length}, () => WaterBlockStatus.WATER));
}

function placeShipOnWaterBody(shipsCapacity, player) {

    function canPlaceShip(x, y, length, direction, grid) {
        if (direction === "horizontal") {
          if (y + length > x_axis.length) return false;
          for (let i = 0; i < length; i++) {
            if (grid[x][i] !== WaterBlockStatus.WATER) return false;
          }
        } else if (direction === "vertical") {
          if (x + length > y_axis.length) return false;
          for (let i = 0; i < length; i++) {
            if (grid[i][y] !== WaterBlockStatus.WATER) return false;
          }
        }
        return true;
    }

    function placeShip(x, y, shipLength, direction, playerType) {
        if (direction === "horizontal") {
          for (let i = 0; i < shipLength; i++) {
            playerType === "player1"? player1Grid[x][i] = WaterBlockStatus.SHIP : player2Grid[x][i] = WaterBlockStatus.SHIP;
            // shipName
            playerType === "player1"
              ? player1GridShipCoordinates.push(
                  {x, y: i}
                )
              : player2GridShipCoordinates.push(
                    {x, y: i}
                );
          }
        } else if (direction === "vertical") {
          for (let i = 0; i < shipLength; i++) {
            playerType === "player1"? player1Grid[i][y] = WaterBlockStatus.SHIP : player2Grid[i][y] = WaterBlockStatus.SHIP;
            // shipName
            playerType === "player1"
              ? player1GridShipCoordinates.push(
                    {x: i, y}
                )
              : player2GridShipCoordinates.push(
                    {x: i, y}
                );
          }
        }
    }

    return new Promise((resolve) => {
        shipsCapacity.forEach((shipLength, index) => {
            let placed = false;
            const shipName = `ship${index + 1}`;
        
            while (!placed) {
              const randomIndex = Math.floor(Math.random() * coordinates.length);
              const { x, y } = coordinates[randomIndex];
              const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
            
              if (canPlaceShip(x, y, shipLength, direction, player === "player1"? player1Grid : player2Grid)) {
                placeShip(x, y, shipLength, direction, player, shipName);
                placed = true;
              }
            }
          });
          resolve();
    });

    
}


function startGame() {
    player1Grid = createWaterBody(shipsCapacity, coordinates, playerIdentifier.PLAYER1);
    player2Grid = createWaterBody(shipsCapacity, coordinates, playerIdentifier.PLAYER2);

    Promise.all([
        placeShipOnWaterBody(shipsCapacity, playerIdentifier.PLAYER1), 
        placeShipOnWaterBody(shipsCapacity, playerIdentifier.PLAYER2)])
        .then(() => {
            decideWhoStarts();
        });
}

function decideWhoStarts() {
    gameTurn =
      Math.random() < 0.5 ? playerIdentifier.PLAYER1 : playerIdentifier.PLAYER2;
    gameState = gameStateIdentifier.PLAYING;
  
    console.log(gameTurn, 'who starts');
    askPlayerToShoot(gameTurn);
    // if (gameTurn === playerIdentifier.BOT) {
    //   setTimeout(() => {
    //     askBotToShoot();
    //   }, 1);
    // }
}

function askPlayerToShoot(player) {
  if (gameState === gameStateIdentifier.OVER)  
    return;

  const playerGrid = player === playerIdentifier.PLAYER1? player2Grid : player1Grid;
  const pickingCoordinates = player === playerIdentifier.PLAYER1? player2PickingCoordinates : player1PickingCoordinates;
  const randomIndex = Math.floor(Math.random() * pickingCoordinates.length);

  const { x, y } = pickingCoordinates[randomIndex];
  pickingCoordinates.splice(randomIndex, 1);

  if (playerGrid[x][y] === WaterBlockStatus.WATER) {
    playerGrid[x][y] = WaterBlockStatus.WATER_HIT;
    // console.log(player, 'has hit a water');
    gameTurn = player === playerIdentifier.PLAYER1? playerIdentifier.PLAYER2 : playerIdentifier.PLAYER1;
    // setTimeout(() => {
      askPlayerToShoot(gameTurn);
   //  }, 1);
  } else if (playerGrid[x][y] === WaterBlockStatus.SHIP) {
    playerGrid[x][y] = WaterBlockStatus.SHIP_HIT;
    // console.log(player, 'has hit a ship');
    if(player === playerIdentifier.PLAYER1) {
        player2GridShipCoordinates = player2GridShipCoordinates.filter(
          (coord) => coord.x!== x || coord.y!== y
        );
      } else if(player === playerIdentifier.PLAYER2) {
        player1GridShipCoordinates = player1GridShipCoordinates.filter(
          (coord) => coord.x!== x || coord.y!== y
        );
    }
    if (checkWinCondition(player)) {
      console.log(player, 'wins');
      gameState = gameStateIdentifier.OVER;
      console.log(player1Grid, 'player 1');
      console.log(player2Grid, 'player 2');
      return;
    } else {
      // setTimeout(() => {
        askPlayerToShoot(player);
      // }, 1);
    }
  }
}

function checkWinCondition(player) {
    if(player === playerIdentifier.PLAYER1) {
        return player2GridShipCoordinates.length === 0;
    } else {
        return player1GridShipCoordinates.length === 0;
    }
}

startGame();