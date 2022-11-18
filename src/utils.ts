import db from './db.js';
//function to check if player 2 can join the room
export function can2Join(roomId: string): boolean {
    if (roomId in db && !db[roomId].player2Id) return true;
    return false;
}
export function createRoom(roomId: string): boolean {
    //our logic for now is the room created by the player1 id so roomId is the same as player1 id
    //not storing player2, player2 will asign theirselves
    db[roomId] = {
        id: roomId,
        player1Id: roomId,
        activePlayer: 0,
        player1Score: 0,
        player2Score: 0,
        currentScore: 0,
        player1GameState: false,
        player2GameState: false
    };
    return true;
}
export function player2JoinRoomSetup(roomId: string, player2Id: string): void {
    db[roomId].player2Id = player2Id;
    db[roomId].player1GameState = true;
}
