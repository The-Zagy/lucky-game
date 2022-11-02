///getting the esential values from the html
//eslint-disable-next-line
const player = document.querySelector('player');

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

// need to know what each global var do to give them the right control with socket.io
let currscore = 0;
//keep track which player is active [0 => player1, 1 => player2];
let activeplayer = 0;
const RealScore = [0, 0]; //to store the real scores of the players
// set real score in html elements;
score1.textContent = 0;
score2.textContent = 0;
let playing = true; //to know the current status of the game
dice.classList.add('hidden'); // hide the dice images

/// this function make the switch  between the two players
const change = function () {
    currscore = 0;
    activeplayer = activeplayer === 0 ? 1 : 0;
    player1.classList.toggle('player--active');
    player2.classList.toggle('player--active');
    currentscore2.innerHTML = 0;
    currentscore1.innerHTML = 0;
};

/*
    TODO change the event handler to function so i can reuse it with socket events, for example player-1 got (one which equal to zero in dexymore land) i need to send event for player-2 with what happens and the new score
*/
roll.addEventListener('click', function () {
    // start rolling
    if (playing) {
        const random = Math.trunc(Math.random() * 6) + 1; //creating the random num
        //exposing the dices images to the user
        dice.classList.remove('hidden');
        dice.src = `pics/dice-${random}.png`;
        //! this funny as fuck but the number 1 expose photo with 0 dice points so actully random == 1 here means 0 in the user eyes, i hate you my friend <3
        if (random === 1) {
            change(); //change the currnt statue of the player because an 1 has occuored, DONT FORGET ONE IS ZERO HHH
        } else if (activeplayer === 0) {
            currscore += random;
            currentscore1.innerHTML = currscore;
        } else if (activeplayer === 1) {
            currscore += random;
            currentscore2.innerHTML = currscore;
        }
    }
});

hold.addEventListener('click', function () {
    if (playing) {
        if (activeplayer === 0) {
            RealScore[0] += Number(currscore);
            score1.innerHTML = RealScore[0];
        } else if (activeplayer === 1) {
            RealScore[1] += Number(currscore);
            score2.innerHTML = RealScore[1];
        }
        //* who got 100 first wins logic
        if (RealScore[activeplayer] >= 100) {
            playing = false;
            document
                .querySelector(`.player--${activeplayer}`)
                .classList.remove('player--active');
            document
                .querySelector(`.player--${activeplayer}`)
                .classList.add('player--winner');
        }
        change(); //change the current statue of the player becuase on of the players pressed hold
    }
});
/**
 * TODO new game handler be seprated function so socket.io can call it when one player decide to start all over again
 */
newbutton.addEventListener('click', function () {
    // this function is so simple its just reset all the values to its origin initial value
    playing = true;
    currscore = 0;
    currentscore2.innerHTML = 0;
    currentscore1.innerHTML = 0;

    RealScore[0] = 0;
    score1.innerHTML = RealScore[0];
    RealScore[1] = 0;
    score2.innerHTML = RealScore[1];

    dice.classList.add('hidden');
    document.querySelector(`.player--1`).classList.remove('player--winner');
    document.querySelector(`.player--0`).classList.remove('player--winner');
    document.querySelector(`.player--0`).classList.add('player--active');
    document.querySelector(`.player--1`).classList.remove('player--active');
});
