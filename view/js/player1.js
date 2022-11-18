import config from './config.js';
import {
    displayAnotherPlayerData,
    holdEventHandler,
    rollEventHandler,
    showRealScore,
    initUi,
    playerWon
} from './utils.js';
const player1 = document.querySelector('.player--0 ');
const score1 = document.querySelector('#score--0');
const currentscore1 = document.getElementById('current--0');

const player2 = document.querySelector('.player--1');
const score2 = document.querySelector('#score--1');
const currentscore2 = document.getElementById('current--1');

const dice = document.querySelector('.dice');

const roll = document.querySelector('.btn--roll');
const newbutton = document.querySelector('.btn--new');
const hold = document.querySelector('.btn--hold');
const headerRoomID = document.querySelector('.headerRoomID');
initUi(score1, score2, dice);
const socket = io('/player1');
//TODO global function to handle init the config becuase it's the same function between player1/2
socket.on('roomCreated', (room) => {
    console.log('room id', room);
    config.realScore[0] = room.player1Score;
    config.realScore[1] = room.player2Score;
    config.currScore = room.currentScore;
    config.playing = room.player1GameState;
    config.activePlayer = room.activePlayer;
    config.roomId = room.id;
    headerRoomID.innerHTML = room.id;
});
socket.on('player2JoinedRoom', (roomData) => {
    console.log(roomData);
    config.playing = roomData.player1GameState;
});
socket.on('player2RolledDice', (metaData) => {
    config.currScore = metaData.currentScore;
    displayAnotherPlayerData(
        metaData.diceNumber,
        config.currScore,
        dice,
        config.activePlayer == 0 ? currentscore1 : currentscore2
    );
});
/*
    {
        player2Score: number;
        player1GameState: boolean;
        activePlayer: number;
        currentScore: number
    }
*/
socket.on('player2HoldedScore', (metaData) => {
    config.realScore[1] = metaData.player2Score;
    config.playing = metaData.player1GameState;
    config.activePlayer = metaData.activePlayer;
    config.currScore = metaData.currentScore;
    currentscore2.innerHTML = config.currScore;
    showRealScore(metaData.player2Score, score2);
});
/**
 * {
        currentScore: number;
        activePlayer: number;
        player1GamsState: boolean;
    }
*/
socket.on('player2OutOfLuck', (metaData) => {
    console.log(metaData);
    config.currScore = metaData.currentScore;
    config.activePlayer = metaData.activePlayer;
    config.playing = metaData.player1GameState;
    currentscore2.innerHTML = config.currScore;
});
socket.on('player2Won', () => {
    config.playing = false;
    config.activePlayer = 1;
    playerWon(1);
});
socket.on('connect_error', (err) => {
    console.log(err);
});
roll.addEventListener('click', () => {
    rollEventHandler(
        player1,
        player2,
        dice,
        currentscore1,
        currentscore2,
        socket
    );
});
hold.addEventListener('click', () => {
    holdEventHandler(
        player1,
        player2,
        score1,
        score2,
        currentscore1,
        currentscore2,
        socket
    );
});
