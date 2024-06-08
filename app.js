const express = require("express");
const socket = require("socket.io"); //sockettio
const http = require("http");
const { Chess } = require("chess.js"); //{ Chess } for only chess class individually
const path = require("path");
const { title } = require("process");
const { log } = require("console");
const app = express();

//if you use socket with express you need to pass the express server instatnce to socket {documentation part} 
const server =http.createServer(app);//initialising server
const io = socket(server);


//create chess instance
const chess = new Chess();
let players = {};//blank object
let currentPlayer = "w";//first player=white


// appset view engine and all
app.set("view engine", "ejs");//can use ejs similaar to html
app.use(express.static(path.join(__dirname, "public")));//can use css fonts images

//first route
app.get("/", (req, res) =>{
    res.render("index.ejs", { title: "Chess Game"});
});

//socket functionality
//socket io needs to be set up on frontend and backend for fully functional working
//fronend and backend socket part interaction
//Broadcasting of the message is decide by this function
io.on("connection", function (uniquesocket) {
    console.log("connected");
//players blank(white) object will store unique id  1 player by default white 
    if (!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }else if (uniquesocket.id === players.black){
            delete players.black;
        }
    });
    uniquesocket.on("move", (move)=>{
        try{
            //making sure that player uses valid move
            if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;
            //update gamestate
            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move", move);//backend sends to fronend, move send to all the players
                io.emit("boardState", chess.fen());
            }
            else{
                console.log("Invalid move :", move);
                uniquesocket.emit("invalid move",move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket("Invalid move :", move);
        }
    });

});

server.listen(3000, function(){
    console.log("listening on port 3000");
});


