# Lucky Game
***WE REACHED FIRST WORKING DEMO BABEEE!!!!!!!!!!!!***

## How to start the demo 
- Clone  ``git clone git@github.com:The-Zagy/lucky-game.git``
- `cd lucky-game`
- `npm install`
- You can run `npm run build:start` to build application then start  **or**

```
npm run build
npm run start
```
- Default URL `http://localhost:3000`, unless you set another `PORT` in `.env` file
- **FOCUS** our demo still a demo after all so `Join Room` button in main page does not **WORK**, whatever create new room click `F12` copy Room ID go to [view/js/player2.js](./view/js/player2.js) edit ***auth.roomId*** with the new roomId **in line 25 for now hhhhh**,
***Example***
```
const socket = io('/player2', {
    auth: {
        roomId: '***YOUR PLAYER1 ROOM ID***'
    }
});
```
- Tell Us What You Think

## game rules

the first player start and dice the rolls and keep adding points to the current score   ,if the first player get 1 point on the dice roll then the current score set to 0 and nothing get added to the player score  , and then its player two turn   ,if the first player press the hold button then the current score got added to the player score and then its player two turn     ,  the first player reach score of 100 win the game   you can press the new game button to reset the game

## Events Table
***i'm lazy you can find all the events handled by server and client in [events.d.ts](./src/events.d.ts), THIS TABLE IS NOT RIGHT AT ALL AND I DON'T CARE***

| Event Name     | data sent with | when                                                                              | To      | From     |
|----------------|----------------|-----------------------------------------------------------------------------------|---------|----------|
| msg            | string         | on user connection/disconnection                                                  | server  | any user |
| newUser        | string         | proadcast to every one expect the user connected                                  | server  | any user |
| createRoom     | void           | player 1 wants to create new room                                                 | player1 | server   |
| roomCreated    | {roomId: id}   | respond to player1 with the room created id[must redirect this user to play room] | server  | player1  |
| player1:play   | TBD            | when player1 hold on score                                                        | player1 | server   |
| player1:played | TBD            | server send it to player2 with player1 play info                                  | server  | player2  |
| askJoinRoom    | {roomId: id}   | player2 asks to join room already created by player1                              | player2 | server   |
| joinedRoom     | {roomId: id}   | server responds to player2 on join room request                                   | server  | player2  |
| player2:play   | TBD            | player2 hold on score                                                             | player2 | server   |
| player2:played | TBD            | server send it to player1 with player2 play info                                  | server  | player1  |
