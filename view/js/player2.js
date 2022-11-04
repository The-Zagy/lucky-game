import config from './config.js';
import {
    displayAnotherPlayerData,
    showRealScore,
    rollEventHandler,
    holdEventHandler,
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
initUi(score1, score2, dice);
const socket = io('/player2', {
    auth: {
        roomId: 'i9gYt0nK28l1asHVAAAH'
    }
});
socket.on('joinedRoom', (room) => {
    console.log('room id', room);
    config.realScore[0] = room.player1Score;
    config.realScore[1] = room.player2Score;
    config.currScore = room.currentScore;
    config.playing = room.player2GameState;
    config.activePlayer = room.activePlayer;
    config.roomId = room.id;
});
socket.on('player1RolledDice', (metaData) => {
    config.currScore = metaData.currentScore;
    displayAnotherPlayerData(
        metaData.diceNumber,
        config.currScore,
        dice,
        config.activePlayer == 0 ? currentscore1 : currentscore2
    );
});
socket.on('player1HoldedScore', (metaData) => {
    config.realScore[0] = metaData.player1Score;
    config.playing = metaData.player2GameState;
    config.activePlayer = metaData.activePlayer;
    config.currScore = metaData.currentScore;
    currentscore1.innerHTML = config.currScore;
    showRealScore(metaData.player1Score, score1);
});
/**
 * {
        currentScore: number;
        activePlayer: number;
        player2GamsState: boolean;
    }
*/
socket.on('player1OutOfLuck', (metaData) => {
    console.log(metaData);
    config.currScore = metaData.currentScore;
    config.activePlayer = metaData.activePlayer;
    config.playing = metaData.player2GameState;
    currentscore1.innerHTML = config.currScore;
});
socket.on('player1Won', () => {
    config.playing = false;
    config.activePlayer = 0;
    playerWon(0);
});
socket.on('connect_error', (err) => {
    console.log(err);
});

//! overwrited the event handler for roll btn for now maybe change it later, why? i faced problems was socket and how to make it global so worked around idk
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
