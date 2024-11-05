//object with default values
//define water co-ords

//write startgame()
  //declare playergrid,botgrid
  //assign the vals of placeshipsongrid func

//place ships on grid which takes ships,co-ords and playertype as args
    
    // within func should determine gridsize as horsize,vertsize
    //create a matrix using horsize,vertsize Array.from({},()=>Array(y).fill())
    //logic for allowing ship placement(row,col,lenght,direction) - shouldn't allow if grid size is smaller than ship size, if block is not water then it should return false
    //logic for placing ship(row,col,lenght,direction,playerType)- setting status ship & playerType
        //declare playerGridShipCoords as an empty arr

 
      const WaterBlockStatus = Object.freeze({
        WATER: 'WATER',
        SHIP : 'SHIP',
        WATER_HIT: 'WATER_HIT',
        SHIP_HIT: 'SHIP_HIT'
      })

      const x_axis =["a","b","c","d","e"];
      const y_axis = ["1","2","3","4","5"];

      const gameStateIdentifier = Object.freeze({
        YET_TO_START: 'yet_to_start',
        PLAYING : 'playing',
        OVER: 'over'
      });

      const playerIdentifier = Object.freeze({
        PLAYER_ONE: 'player_one',
        PLAYER_TWO: 'player_two',
        NONE:'none'
      })

      let gameTurn = playerIdentifier.NONE;
      let gameState = gameStateIdentifier.YET_TO_START;

      let player1GridShipCoords = [];
      let player2GridShipCoords = [];
      let player1Grid,player2Grid;

      const coordinate_mapping = x_axis.flatMap((x) =>
        y_axis.map((y) => `${x}${y - 1}`)
      );      
      const player2Coordinate_mapping =[...coordinate_mapping]
      const convertAlphabetIndexToNumericIndex = (letter) =>
        parseInt(letter.charCodeAt(0) - "a".charCodeAt(0));
      
      const convertNumericIndexToAlphabetIndex = (number) =>
        String.fromCharCode(parseInt(number) + "a".charCodeAt(0));
      
      function parseCoordinate(coord) {
        return {
          row: convertAlphabetIndexToNumericIndex(coord[0]), // Convert 'a' to 0, 'b' to 1, etc.
          col: parseInt(coord[1], 10) - 1, // Convert '1' to 0, '2' to 1, etc.
        };
      }
      function placeShipsOnGrid(ships,coordinates, playerType){
        const grid = Array.from({length: x_axis.length,},()=>Array(y_axis.length).fill(WaterBlockStatus.WATER));
        console.log(grid);
        function canPlaceShip(row,col,shipLength,direction){
          if(direction==="horizontal"){
            if(col+shipLength>x_axis.length) return false; //col will take the starting col of the placed ship lenth is total length of the ship grid[0][1],grid[1][2] it will like 1+4=5 > x_axis so return false
            for(let i=0;i<shipLength;i++){
              if (grid[row] && grid[row][col+i]!==WaterBlockStatus.WATER) return false;
            }
          }else if(direction==="vertical"){
            if(row+shipLength>y_axis.length) return false;
            for(let i=0; i<shipLength;i++){
              if(grid[row + i] && grid[row+i][col]!==WaterBlockStatus.WATER)return false;
            }
          }
          return true;
        }
        function placeShip(row, col, length, direction, playerType) {
          if (direction === "horizontal") {
            for (let i = 0; i < length; i++) {
              grid[row][col + i] = WaterBlockStatus.SHIP;
              // shipName
              playerType === "player_one"
                ? player1GridShipCoords.push(
                    `${convertNumericIndexToAlphabetIndex(row)}${col + i}`
                  )
                : player2GridShipCoords.push(
                    `${convertNumericIndexToAlphabetIndex(row)}${col + i}`
                  );
            }
          } else if (direction === "vertical") {
            for (let i = 0; i < length; i++) {
              grid[row + i][col] = WaterBlockStatus.SHIP;
              // shipName
              playerType === "player_one"
                ? player1GridShipCoords.push(
                    `${convertNumericIndexToAlphabetIndex(row + i)}${col}`
                  )
                : player2GridShipCoords.push(
                    `${convertNumericIndexToAlphabetIndex(row + i)}${col}`
                  );
            }
          }
        }

        ships.forEach((shipLength,index) => {
          const shipName = `ship${index+1}`;
          let placed = false;
          while(!placed){
          const randomIndex= Math.floor(Math.random()*coordinates.length);
          const {row,col} = parseCoordinate(coordinates[randomIndex]);
          const direction = Math.random() > 0.5? 'horizontal' :'vertical';
          if(canPlaceShip(row,col,shipLength,direction)){
            placeShip(row,col,shipLength,direction);
            placed = true;
          }
          }
        })

      }
      function startGame(){
        player1Grid = placeShipsOnGrid([4,3,2],coordinate_mapping,playerIdentifier.PLAYER_ONE);
        player2Grid = placeShipsOnGrid([4,3,2], player2Coordinate_mapping, playerIdentifier.PLAYER_TWO);

        console.log("Player1 ship cords:", player1GridShipCoords);
        console.log("player2 ship cords:", player2GridShipCoords);

        const player1Container=document.getElementById('player1-container');

        const player2Container=document.getElementById('player2-container');

        document.getElementById("start-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "flex";

        decideWhoStarts();
      }

      function createGameGrid(grid, playerType) {
        const table = document.createElement("table");
        table.classList.add("water-table");
        table.id = `${playerType}-table`;
        x_axis.forEach((x, xIndex) => {
          const row = document.createElement("tr");
          row.classList.add(`row-${xIndex + 1}`);
          y_axis.forEach((y, yIndex) => {
            const cell = document.createElement("td");
            cell.setAttribute("data-coord", `${x}${y}`);
            cell.setAttribute("data-x", `${x}`);
            cell.setAttribute("data-y", `${y}`);
            cell.setAttribute("value", grid[xIndex][yIndex]);
            cell.classList.add(grid[xIndex][yIndex]);
            cell.classList.add(`col-${yIndex + 1}`);
            if (playerType === "player_two")
              cell.addEventListener("click", () => playerShootListner(cell));
            row.appendChild(cell);
          });
          table.appendChild(row);
        });
        return table;
      }

      function decideWhoStarts() {
        gameTurn = Math.random()>0.5? playerIdentifier.PLAYER_ONE : playerIdentifier.PLAYER_TWO;
        gameState = gameStateIdentifier.PLAYING;
        gameTurn === playerIdentifier.PLAYER_ONE?
        setMessage("Player 1's turn") :
        setMessage("Player 2's turn");
      }
      function playerShootListner(cell) {
        if (
          gameState === gameStateIdentifier.OVER ||
          gameTurn !== playerIdentifier.PLAYER_ONE
        )
          return;
        const coord = cell.getAttribute("data-coord");
        const x = cell.getAttribute("data-x");
        const y = cell.getAttribute("data-y");
        const value = cell.getAttribute("value");
      
        if (value === WaterBlockStatus.WATER) {
          setCellToWaterHit(cell);
          player2Grid[convertAlphabetIndexToNumericIndex(x)][y - 1] =
            WaterBlockStatus.WATER_HIT;
      
          gameTurn = playerIdentifier.PLAYER_TWO;
          setTimeout(()=>{
            askPlayer2ToShoot();
          })

        } else if (value === WaterBlockStatus.SHIP) {
          setCellToShipHit(cell);
          player2Grid[convertAlphabetIndexToNumericIndex(x)][y - 1] =
            WaterBlockStatus.SHIP_HIT;
          removeShipCoord(`${x}${y - 1}`, "player_one");
      
          if (!checkWinCondition(playerIdentifier.PLAYER_ONE)) {
            setMessage("You hit a ship, fire next round");
          }
        } else {
          setMessage("Already hit at, try with new block");
        }
      }

      function askPlayer2ToShoot(cell) {
        setMessage("Player 2's turn");
        if(
          gameState === gameStateIdentifier.OVER ||
          gameTurn!== playerIdentifier.PLAYER_TWO
        )return;
        const coord = cell.getAttribute("data-coord");
        const x = cell.getAttribute("data-x");
        const y = cell.getAttribute("data-y");
        const value = cell.getAttribute("value");
      
        if (value === WaterBlockStatus.WATER) {
          setCellToWaterHit(cell);
          player1Grid[convertAlphabetIndexToNumericIndex(x)][y - 1] =
            WaterBlockStatus.WATER_HIT;
      
          gameTurn = playerIdentifier.player1;
          setTimeout(()=>{
            playerShootListner();
          })

        } else if (value === WaterBlockStatus.SHIP) {
          setCellToShipHit(cell);
          player1Grid[convertAlphabetIndexToNumericIndex(x)][y - 1] =
            WaterBlockStatus.SHIP_HIT;
          removeShipCoord(`${x}${y - 1}`, "player_two");
      
          if (!checkWinCondition(playerIdentifier.PLAYER_TWO)) {
            setMessage("You hit a ship, fire next round");
          }
        } else {
          setMessage("Already hit at, try with new block");
        }

      }
      
      function removeShipCoord(coord, playerType) {
        playerType === "player_one"?
        (player2GridShipCoords = player2GridShipCoords.filter((c)=>c!==coord)):
        (player1GridShipCoords = player1GridShipCoords.filter((c)=>c!==coord));
      }

      function checkWinCondition(playerType){
        if(playerType==="player_one"){
          if(player2GridShipCoords.length===0){
            setMessage("player 1 won!")
            //break the game loop
            gameState = gameStateIdentifier.OVER;
            setTimeout(()=>{
              location.reload();
            },2000);
            return true;
          }
          return false;
        } if(playerType==="player_two"){
          if(player1GridShipCoords.length===0){
            setMessage("player 2 won!")
            gameState = gameStateIdentifier.OVER;
            setTimeout(()=>{
              location.reload();
            },2000);
            return true;
          }
        }
      }
      function setCellToWaterHit(cell) {
        cell.classList.remove(WaterBlockStatus.WATER);
        cell.classList.add(WaterBlockStatus.WATER_HIT);
        cell.setAttribute("value", WaterBlockStatus.WATER_HIT);
      }
      
      function setCellToShipHit(cell) {
        cell.classList.remove(WaterBlockStatus.SHIP);
        cell.classList.add(WaterBlockStatus.SHIP_HIT);
        cell.setAttribute("value", WaterBlockStatus.SHIP_HIT);
      }
      
      function setMessage(message) {
        document.getElementById("message-container").textContent = message;
      }