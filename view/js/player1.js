import config from './config.js';
console.log('loading');
let socket = io('/player1');
socket.on('roomCreated', (room) => {
    console.log('room id', room);
    config.RealScore[0] = room.player1Score;
    config.RealScore[1] = room.player2Score;
    config.currScore = room.currentScore;
    config.playing = room.player1GameState;
    config.activePlayer = room.activePlayer;
    config.roomId = room.id;
});
socket.on('player2JoinedRoom', (roomData) => {
    console.log(roomData);
    config.playing = roomData.player1GameState;
});
socket.on('connect_error', (err) => {
    console.log(err);
});
