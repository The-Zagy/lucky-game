const btnlocal = document.querySelector('.btnlocal');
const btnjoin = document.querySelector('.btnjoin');
const btnsubmit = document.querySelector('.btnsubmit');
const roomid = document.querySelector('.roomid');
const btncreate = document.querySelector('.btncreate');
///////////////////////////////////////////////////
function play_local() {
    location.href = '/game/local';
}
btnlocal.addEventListener('click', () => {
    play_local();
});
///////////////////////////////////////////////////
btnjoin.addEventListener('click', function () {
    roomid.classList.remove('hidden');
    btnsubmit.classList.remove('hidden');
});
btnsubmit.addEventListener('click', () => {
    location.href = '/game/player2/' + roomid.value;
    // window.location.replace('/game/player2/' + roomid.value);
});
btncreate.addEventListener('click', function () {
    location.href = '/game/player1';
});
