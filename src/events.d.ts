export interface DbRow {
    id: string;
    player1Id: string;
    player2Id?: string;
    activePlayer: number;
    player1Score: number;
    player2Score: number;
    currentScore: number;
    player1GameState: boolean;
    player2GameState: boolean;
}
export interface Player1ServerToClientEvents {
    roomCreated: (roomMetaData: DbRow) => void;
    player2JoinedRoom: (arg: {
        player1GameState: boolean;
        player2Id: string;
    }) => void;
    player2RolledDice: (arg: {
        diceNumber: number;
        currentScore: number;
    }) => void;
}
export interface Player1ClientsToServerEvents {
    rolledDice: (diceNumber: number) => void;
}
export interface Player2ServerToClientEvents {
    joinedRoom: (roomMetaData: DbRow) => void;
    player1RolledDice: (arg: {
        diceNumber: number;
        currentScore: number;
    }) => void;
}
export interface Player2ClientsToServerEvents {
    rolledDice: (diceNumber: number) => void;
}
export interface InternalEvents {}
export interface SocketData {
    id: string;
}
