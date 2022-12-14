import express from 'express';
import { createServer } from 'http';
import { Namespace, Server, Socket } from 'socket.io';
import path from 'path';
import {
    InternalEvents,
    Player1ClientsToServerEvents,
    Player1ServerToClientEvents,
    Player2ClientsToServerEvents,
    Player2ServerToClientEvents,
    SocketData
} from './events';
import { createRoom, can2Join, player2JoinRoomSetup } from './utils.js';
import db from './db.js';
//init constatns for server and port
const app = express();
const server = createServer(app);
const io = new Server(server);
// define namespace with the types
const player1Namespace: Namespace<
    Player1ClientsToServerEvents,
    Player1ServerToClientEvents,
    InternalEvents,
    SocketData
> = io.of('/player1');
const player2Namespace: Namespace<
    Player2ClientsToServerEvents,
    Player2ServerToClientEvents,
    InternalEvents,
    SocketData
> = io.of('/player2');
//express middlewares
app.use(express.static(path.resolve('view/css')));
app.use(express.static(path.resolve('view/js')));
app.use('/pics', express.static(path.resolve('view/pics')));
// express handlers
app.get('/', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/landing.html'));
});
app.get('/game/local', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/index.html'));
});
app.get('/game/player1', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/player1.html'));
});
app.get('/game/player2/:id', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/player2.html'));
});

//* socket.io events tree
//middleware for player1 to create room in db before connecting to the server, if the room creation failed refuse the connection
player1Namespace.use((socket, next) => {
    if (createRoom(socket.id)) {
        next();
    } else {
        next(new Error('cannot create the room'));
    }
});
//set attr room in the socket to make it easy to access what room this socket is in
type Socket1WUser = Socket<
    Player1ClientsToServerEvents,
    Player1ServerToClientEvents,
    InternalEvents,
    SocketData
> & { gameRoom?: string };
player1Namespace.use((socket: Socket1WUser, next) => {
    socket.gameRoom = socket.id;
    next();
});
player1Namespace.on('connection', (socket: Socket1WUser) => {
    console.log(`player 1 connected`);
    // no more createRoom event, now implicity we do the same logic on player1 connection
    //when player1 conenct create room with default playing to false and when player2 connect switch it to true;
    // if room created successfully with the client id emit event roomCreated
    // the creation room logic is now middleware if the server coudln't create room refuse the connection
    //* roomCreated event will be raised once player1 is conencted to the server
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
            //switch game state between players[set player 2 as active]
            db[socket.gameRoom].activePlayer = 1;
            db[socket.gameRoom].player1GameState = false;
            db[socket.gameRoom].player2GameState = true;
            player2Namespace.to(socket.gameRoom).emit('player1HoldedScore', {
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
            //switch game state between players[set player 2 as active]
            db[socket.gameRoom].player1GameState = false;
            db[socket.gameRoom].player2GameState = true;
            db[socket.gameRoom].activePlayer = 1;
            player2Namespace.to(socket.gameRoom).emit('player1OutOfLuck', {
                currentScore: db[socket.gameRoom].currentScore,
                activePlayer: db[socket.gameRoom].activePlayer,
                player2GameState: db[socket.gameRoom].player2GameState
            });
        }
    });
    socket.on('IWON', () => {
        if (socket.gameRoom !== undefined) {
            player2Namespace.to(socket.gameRoom).emit('player1Won');
        }
    });
});
// middleware that wil only run for once when the player2 conenct for the first time
// will check in it if player2 can join or not, if can join will setup db for the new player
//* roomId MUST be sent under the auth header with the name "roomId"
player2Namespace.use((socket, next) => {
    if (can2Join(socket.handshake.auth.roomId)) {
        socket.join(socket.handshake.auth.roomId);
        player2JoinRoomSetup(socket.handshake.auth.roomId, socket.id);
        next();
    } else {
        next(new Error('cannot join this room'));
    }
});
//set attr room in the socket to make it easy to access what room this socket is in
type Socket2WUser = Socket<
    Player2ClientsToServerEvents,
    Player2ServerToClientEvents,
    InternalEvents,
    SocketData
> & { gameRoom?: string };
player2Namespace.use((socket: Socket2WUser, next) => {
    socket.gameRoom = socket.handshake.auth.roomId;
    next();
});
player2Namespace.on('connection', (socket: Socket2WUser) => {
    console.log(`player 2 connected`);
    //player2 don't have to ask for room anymore because the player must supply room id in the auth header first to connect to the server without it user cannot conenct
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
            //swwitch game state between players[set player 1 as active]
            db[socket.gameRoom].activePlayer = 0;
            db[socket.gameRoom].player2GameState = false;
            db[socket.gameRoom].player1GameState = true;
            player1Namespace.to(socket.gameRoom).emit('player2HoldedScore', {
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
            //swwitch game state between players[set player 1 as active]
            db[socket.gameRoom].player1GameState = true;
            db[socket.gameRoom].player2GameState = false;
            db[socket.gameRoom].activePlayer = 0;
            player1Namespace.to(socket.gameRoom).emit('player2OutOfLuck', {
                currentScore: db[socket.gameRoom].currentScore,
                activePlayer: db[socket.gameRoom].activePlayer,
                player1GameState: db[socket.gameRoom].player1GameState
            });
        }
    });
    socket.on('IWON', () => {
        if (socket.gameRoom !== undefined) {
            player1Namespace.to(socket.gameRoom).emit('player2Won');
        }
    });
});
//listen
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`listen on port http://localhost:${port}`);
});
