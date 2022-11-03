##game rules

###   , the first player start and dice the rolls and keep adding points to the current score   ,if the first player get 1 point on the dice roll then the current score set to 0 and nothing get added to the player score  , and then its player two turn   ,if the first player press the hold button then the current score got added to the player score and then its player two turn     ,  the first player reach score of 100 win the game   you can press the new game button to reset the game

## Events Table
***i'm lazy you can find all the events handled by server and client in [events.d.ts](./src/events.d.ts)***

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

TODO roomIsFull from server to player2 

JUST A REMINDER FUCCK URL SHIT