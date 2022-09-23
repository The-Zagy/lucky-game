
let player=document.querySelector('player')


let player1= document.querySelector('.player--0 ')
let score1=document.querySelector('#score--0')
let currentscore1=document.getElementById('current--0')


let player2= document.querySelector('.player--1')
let score2=document.querySelector('#score--1')
let currentscore2=document.getElementById('current--1')


let dice=document.querySelector('.dice')


let roll=document.querySelector('.btn--roll')
let newbutton=document.querySelector('.btn--new')
let hold=document.querySelector('.btn--hold')

let currscore=0

let activeplayer=0
let RealScore=[0,0]

score1.textContent= 0;
score2.textContent= 0;
let playing=true

let change=function(){
    currscore=0
    activeplayer=activeplayer ===0?1:0  
    player1.classList.toggle('player--active')
player2.classList.toggle('player--active')
    currentscore2.innerHTML=0
  
    currentscore1.innerHTML=0
}



dice.classList.add('hidden')


roll.addEventListener('click',function(){
    if(playing){
let random=Math.trunc(Math.random()*6)+1
dice.classList.remove('hidden')
dice.src=`pics/dice-${random}.png`




if(random===1)
{
   change()
}
else
if(activeplayer===0)
{
    currscore+=random
  
    currentscore1.innerHTML=currscore
}
else if (activeplayer===1)
{

    currscore+=random
    currentscore2.innerHTML=currscore

}
}
})

hold.addEventListener('click',function(){
if(playing){



    if(activeplayer===0)
{
RealScore[0]+=Number(currscore)
score1.innerHTML=RealScore[0]

}
else if(activeplayer===1)
{
RealScore[1]+=Number(currscore)
score2.innerHTML=RealScore[1]
}

if(RealScore[activeplayer]>=100)
{playing=false;
    document.querySelector(`.player--${activeplayer}`).classList.remove('player--active')
document.querySelector(`.player--${activeplayer}`).classList.add('player--winner')

}
change()
}
}
)

newbutton.addEventListener('click',function(){
playing=true;
    currscore=0
    
    currentscore2.innerHTML=0
  
    currentscore1.innerHTML=0

    RealScore[0]=0
score1.innerHTML=RealScore[0]
RealScore[1]=0
score2.innerHTML=RealScore[1]

dice.classList.add('hidden')
document.querySelector(`.player--1`).classList.remove('player--winner')
document.querySelector(`.player--0`).classList.remove('player--winner')
document.querySelector(`.player--0`).classList.add('player--active')
document.querySelector(`.player--1`).classList.remove('player--active')
})