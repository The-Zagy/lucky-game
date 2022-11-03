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
    SocketData,
    DbRow
} from './events';
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
const port = process.env.PORT || 3000;
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
app.get('/game/player2', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/player2.html'));
});
//mock db
//gameState false means not playing
//active player for now boolean true => player1 false => player2
// TODO change active player type to enum or any shit
const db: {
    [name: string]: DbRow;
} = {};
//function to check if player 2 can join the room
function can2Join(roomId: string): boolean {
    if (roomId in db && !db[roomId].player2Id) return true;
    return false;
}
function createRoom(roomId: string): boolean {
    //our logic for now is the room created by the player1 id so roomId is the same as player1 id
    //not storing player2, player2 will asign theirselves
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
function player2JoinRoomSetup(roomId: string, player2Id: string): void {
    db[roomId].player2Id = player2Id;
    db[roomId].player1GameState = true;
}
//* socket.io events tree
// io.on('connection', (socket) => {
//     console.log('user connected');
// });
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
//listen
server.listen(port, () => {
    console.log(`listen on port ${port}`);
});
