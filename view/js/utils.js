import config from './config.js';
/// this function make the switch  between the two players
export const change = function (
    player1,
    player2,
    currentscore1,
    currentscore2
) {
    config.currScore = 0;
    config.activePlayer = config.activePlayer === 0 ? 1 : 0;
    player1.classList.toggle('player--active');
    player2.classList.toggle('player--active');
    currentscore2.innerHTML = 0;
    currentscore1.innerHTML = 0;
};

export function displayAnotherPlayerData(
    diceNumber,
    current,
    diceHtml,
    activeCurrentSocreHtml
) {
    activeCurrentSocreHtml.innerHTML = current;
    diceHtml.classList.remove('hidden');
    diceHtml.src = `/pics/dice-${diceNumber}.png`;
}
export function showRealScore(realScore, realScoreHtml) {
    realScoreHtml.innerHTML = realScore;
}
export function rollEventHandler(
    player1,
    player2,
    dice,
    currentScore1,
    currentScore2,
    socket
) {
    // start rolling
    if (config.playing) {
        const random = Math.trunc(Math.random() * 6) + 1; //creating the random num
        //exposing the dices images to the user
        dice.classList.remove('hidden');
        dice.src = `/pics/dice-${random}.png`;
        //emit to the server "rolledDice" even with the dice number
        socket.emit('rolledDice', random);
        if (random === 1) {
            currentScore1.innerHTML = 0;
            currentScore2.innerHTML = 0;
            //TODO make those config changes as server response MAKE SERVER CONTROL
            socket.emit('imSorryImJinkx');
            config.playing = false;
            change(player1, player2, currentScore1, currentScore2); //change the currnt statue of the player because an 1 has occuored
        } else if (config.activePlayer === 0) {
            config.currScore += random;
            currentScore1.innerHTML = config.currScore;
        } else if (config.activePlayer === 1) {
            config.currScore += random;
            currentScore2.innerHTML = config.currScore;
        }
    }
}
export function playerWon(playerNumber) {
    document
        .querySelector(`.player--${playerNumber}`)
        .classList.remove('player--active');
    document
        .querySelector(`.player--${playerNumber}`)
        .classList.add('player--winner');
}
export function holdEventHandler(
    player1,
    player2,
    score1,
    score2,
    currentScore1,
    currentScore2,
    socket
) {
    if (config.playing) {
        if (config.activePlayer === 0) {
            config.realScore[0] += Number(config.currScore);
            score1.innerHTML = config.realScore[0];
        } else if (config.activePlayer === 1) {
            config.realScore[1] += Number(config.currScore);
            score2.innerHTML = config.realScore[1];
        }
        config.playing = false;
        //emit to the sever player holded score
        socket.emit('holdedScore');
        //* who got 100 first wins logic
        if (config.realScore[config.activePlayer] >= 100) {
            socket.emit('IWON');
            playerWon(config.activePlayer);
        }
        change(player1, player2, currentScore1, currentScore2); //change the current statue of the player becuase on of the players pressed hold
    }
}
export const initUi = (score1, score2, dice) => {
    config.playing = false;
    // set real score in html elements;
    score1.textContent = 0;
    score2.textContent = 0;
    dice.classList.add('hidden'); // hide the dice images
};
