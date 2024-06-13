# Custom Chess Game
Welcome to the Custom Chess Game repository!
This project implements a real-time multiplayer chess game using Socket.io for WebSocket communication, and the chess.js library for game logic. The game allows two players to play chess against each other and also supports spectators.

## Frontend Setup
### 1] Socket.io Initialization
Establish a WebSocket connection to the server using Socket.io:

```javascript
const socket = io();
```
### 2] Chess Game Initialization
Create an instance of the Chess class from the chess.js library to manage the game logic:

```javascript
const chess = new Chess();
```
### 3] Drag and Drop
Implement drag and drop functionality for moving chess pieces on the board:

Pieces are draggable only if it's the player's turn.
Event listeners for drag start, drag end, drag over, and drop events are attached to handle drag and drop interactions.
### 4] Rendering the Board
Generate the HTML representation of the chessboard based on the current game state:

Iterate over the board array and create square elements for each cell.
Create piece elements for occupied squares and append them to square elements.
Flip the board for the black player's view.
### 5] Handling Moves
Handle player moves when dragging and dropping pieces:

Construct a move object containing the source and target squares in algebraic notation.
Emit a "move" event to the server via Socket.io.
Unicode Chess Pieces
Return Unicode characters representing chess pieces based on their type.
### 6] Socket.io Event Handlers
Listen for various events from the server such as player role assignment, spectator role assignment, board state updates, and opponent moves:

Update the local game state and render the board accordingly when receiving events.
Initial Rendering
Call the renderBoard function initially to render the initial state of the chessboard.

## Backend Setup
### 1] Import Required Modules
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Chess = require('chess.js').Chess;
```
### 2] Create and Configure Express App
```javascript
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const chess = new Chess();
```
### 3] Initialize Players and CurrentPlayer
```javascript
const players = {};
let currentPlayer = 'w';
```
### 4] Configure Express App
```javascript
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.render('index', { title: 'Custom Chess Game' });
});
```
### 5] Socket.io Connection Handling
Handle client connections and assign roles based on availability:

```javascript
io.on('connection', (socket) => {
  if (!players.white) {
    players.white = socket.id;
    socket.emit('playerRole', 'white');
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit('playerRole', 'black');
  } else {
    socket.emit('spectatorRole');
  }

  socket.emit('boardState', chess.fen());

  socket.on('disconnect', () => {
    if (socket.id === players.white) {
      delete players.white;
    } else if (socket.id === players.black) {
      delete players.black;
    }
  });

  socket.on('move', (move) => {
    if ((currentPlayer === 'w' && socket.id === players.white) ||
        (currentPlayer === 'b' && socket.id === players.black)) {
      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit('move', move);
        io.emit('boardState', chess.fen());
      } else {
        console.log('Invalid move:', move);
      }
    }
  });
});
```
### 6] Starting the Server
Start the server to listen on a specified port:

```javascript
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
# Running the Project
## 1] Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/khageshpatil/custom-chess-game.git
cd <your-repository-name>
```
## 2] Install Dependencies
```bash
npm install
```
## 3] Start the Server
```bash
node server.js
```
## 4] Open Your Browser
Navigate to:
```
http://localhost:3000
```
Enjoy playing chess with your friends!

# Contributing
Feel free to fork this repository and submit pull requests. Any contributions are welcome!
