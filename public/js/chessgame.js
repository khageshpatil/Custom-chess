// const { Chess } = require("chess.js");

//frontend is connected with backend at realtime due to this line which gets executed at start
const socket = io();

//everything is sent from fronend to backend through uniquesocket
//  socket.emit("churan");
//  socket.on("land rover", function(){
//     console.log("land rover recieved");
//  });

//Create an instance of the Chess class
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    //board pieces are in the form of array can be iterated 
    board.forEach((row, rowindex) =>{
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", 
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
                pieceElement.addEventListener("dragstart", (e) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);


            }
            squareElement.addEventListener("dragover", function (e){
                e.preventDefault();
            });
            squareElement.addEventListener("drop", function (e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
        
    });
    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }

};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion: "q",
    };

    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
      p: '\u2659', // White pawn
      r: '\u2656', // White rook
      n: '\u2658', // White knight
      b: '\u2657', // White bishop
      q: '\u2655', // White queen
      k: '\u2654', // White king
      P: '\u265F', // Black pawn
      R: '\u265C', // Black rook
      N: '\u265E', // Black knight
      B: '\u265D', // Black bishop
      Q: '\u265B', // Black queen
      K: '\u265A', // Black king
    };
  return unicodePieces[piece.type] || "";
  };


  //movement of the pieces respect to  roles  
socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(role){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});
renderBoard();
