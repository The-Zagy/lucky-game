const btnlocal = document.querySelector('.btnlocal');
const btnjoin = document.querySelector('.btnjoin');
const btnsubmit = document.querySelector('.btnsubmit');
const roomid = document.querySelector('.roomid');
const btncreate = document.querySelector('.btncreate');
///////////////////////////////////////////////////
function play_local(){
    location.href='/local';
}
///////////////////////////////////////////////////
btnjoin.addEventListener('click',function(){
    roomid.classList.remove("hidden")
    btnsubmit.classList.remove("hidden")
    // location.href = '/player2';
})
btnsubmit.addEventListener('click', () => {
    console.log(roomid.value);
    window.location.replace('/player2/'+roomid.value);
})
btncreate.addEventListener('click',function(){
    location.href = '/player1';
})