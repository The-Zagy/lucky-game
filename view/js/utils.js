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
