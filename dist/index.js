import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
const app = express();
const server = createServer(app);
const io = new Server(server);
const player1Namespace = io.of('/player1');
const player2Namespace = io.of('/player2');
const port = process.env.PORT || 3000;
app.use(express.static(path.resolve('view/css')));
app.use(express.static(path.resolve('view/js')));
app.use('/pics', express.static(path.resolve('view/pics')));
app.get('/', (_req, res) => {
    res.sendFile(path.resolve('view/landing.html'));
});
app.get('/game/local', (_req, res) => {
    res.sendFile(path.resolve('view/index.html'));
});
app.get('/game/player1', (_req, res) => {
    res.sendFile(path.resolve('view/player1.html'));
});
app.get('/game/player2', (_req, res) => {
    res.sendFile(path.resolve('view/player2.html'));
});
const db = {};
function can2Join(roomId) {
    if (roomId in db && !db[roomId].player2Id)
        return true;
    return false;
}
function createRoom(roomId) {
    db[roomId] = {
        id: roomId,
        player1Id: roomId,
        activePlayer: 0,
        player1Score: 0,
        player2Score: 0,
        currentScore: 0,
        player1GameState: false,
        player2GameState: false
    };
    return true;
}
function player2JoinRoomSetup(roomId, player2Id) {
    db[roomId].player2Id = player2Id;
    db[roomId].player1GameState = true;
}
player1Namespace.use((socket, next) => {
    if (createRoom(socket.id)) {
        next();
    }
    else {
        next(new Error('cannot create the room'));
    }
});
player1Namespace.use((socket, next) => {
    socket.gameRoom = socket.id;
    next();
});
player1Namespace.on('connection', (socket) => {
    console.log(`player 1 connected`);
    if (socket.gameRoom !== undefined) {
        socket.emit('roomCreated', db[socket.gameRoom]);
    }
    socket.on('rolledDice', (diceNumber) => {
        if (socket.gameRoom !== undefined) {
            db[socket.gameRoom].currentScore += diceNumber;
            player2Namespace.to(socket.gameRoom).emit('player1RolledDice', {
                diceNumber: diceNumber,
                currentScore: db[socket.gameRoom].currentScore
            });
        }
    });
    socket.on('holdedScore', () => {
        if (socket.gameRoom !== undefined) {
            db[socket.gameRoom].player1Score +=
                db[socket.gameRoom].currentScore;
            db[socket.gameRoom].currentScore = 0;
            db[socket.gameRoom].activePlayer = 1;
            db[socket.gameRoom].player1GameState = false;
            db[socket.gameRoom].player2GameState = true;
            player2Namespace.emit('player1HoldedScore', {
                player1Score: db[socket.gameRoom].player1Score,
                player2GameState: db[socket.gameRoom].player2GameState,
                activePlayer: db[socket.gameRoom].activePlayer,
                currentScore: db[socket.gameRoom].currentScore
            });
        }
    });
    socket.on('imSorryImJinkx', () => {
        if (socket.gameRoom !== undefined) {
            db[socket.gameRoom].currentScore = 0;
            db[socket.gameRoom].player1GameState = false;
            db[socket.gameRoom].player2GameState = true;
            db[socket.gameRoom].activePlayer = 1;
            player2Namespace.emit('player1OutOfLuck', {
                currentScore: db[socket.gameRoom].currentScore,
                activePlayer: db[socket.gameRoom].activePlayer,
                player2GameState: db[socket.gameRoom].player2GameState
            });
        }
    });
});
player2Namespace.use((socket, next) => {
    if (can2Join(socket.handshake.auth.roomId)) {
        socket.join(socket.handshake.auth.roomId);
        player2JoinRoomSetup(socket.handshake.auth.roomId, socket.id);
        next();
    }
    else {
        next(new Error('cannot join this room'));
    }
});
player2Namespace.use((socket, next) => {
    socket.gameRoom = socket.handshake.auth.roomId;
    next();
});
player2Namespace.on('connection', (socket) => {
    console.log(`player 2 connected`);
    if (socket.gameRoom !== undefined) {
        socket.emit('joinedRoom', db[socket.gameRoom]);
        player1Namespace.to(socket.gameRoom).emit('player2JoinedRoom', {
            player1GameState: db[socket.gameRoom].player1GameState,
            player2Id: db[socket.gameRoom].player2Id || ''
        });
    }
    socket.on('rolledDice', (diceNumber) => {
        if (socket.gameRoom !== undefined) {
            db[socket.gameRoom].currentScore += diceNumber;
            player1Namespace.to(socket.gameRoom).emit('player2RolledDice', {
                diceNumber: diceNumber,
                currentScore: db[socket.gameRoom].currentScore
            });
        }
    });
    socket.on('holdedScore', () => {
        if (socket.gameRoom !== undefined) {
            db[socket.gameRoom].player2Score +=
                db[socket.gameRoom].currentScore;
            db[socket.gameRoom].currentScore = 0;
            db[socket.gameRoom].activePlayer = 0;
            db[socket.gameRoom].player2GameState = false;
            db[socket.gameRoom].player1GameState = true;
            player1Namespace.emit('player2HoldedScore', {
                player2Score: db[socket.gameRoom].player2Score,
                player1GameState: db[socket.gameRoom].player1GameState,
                activePlayer: db[socket.gameRoom].activePlayer,
                currentScore: db[socket.gameRoom].currentScore
            });
        }
    });
    socket.on('imSorryImJinkx', () => {
        if (socket.gameRoom !== undefined) {
            db[socket.gameRoom].currentScore = 0;
            db[socket.gameRoom].player1GameState = true;
            db[socket.gameRoom].player2GameState = false;
            db[socket.gameRoom].activePlayer = 0;
            player1Namespace.emit('player2OutOfLuck', {
                currentScore: db[socket.gameRoom].currentScore,
                activePlayer: db[socket.gameRoom].activePlayer,
                player1GameState: db[socket.gameRoom].player1GameState
            });
        }
    });
});
server.listen(port, () => {
    console.log(`listen on port ${port}`);
});
