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
    player2HoldedScore: (arg: {
        player2Score: number;
        player1GameState: boolean;
        activePlayer: number;
        currentScore: number;
    }) => void;
    player2OutOfLuck: (arg: {
        currentScore: number;
        activePlayer: number;
        player1GameState: boolean;
    }) => void;
}
export interface Player1ClientsToServerEvents {
    rolledDice: (diceNumber: number) => void;
    holdedScore: () => void;
    imSorryImJinkx: () => void;
}
export interface Player2ServerToClientEvents {
    joinedRoom: (roomMetaData: DbRow) => void;
    player1RolledDice: (arg: {
        diceNumber: number;
        currentScore: number;
    }) => void;
    player1HoldedScore: (arg: {
        player1Score: number;
        player2GameState: boolean;
        activePlayer: number;
        currentScore: number;
    }) => void;
    player1OutOfLuck: (arg: {
        currentScore: number;
        activePlayer: number;
        player2GameState: boolean;
    }) => void;
}
export interface Player2ClientsToServerEvents {
    rolledDice: (diceNumber: number) => void;
    holdedScore: () => void;
    imSorryImJinkx: () => void;
}
export interface InternalEvents {}
export interface SocketData {
    id: string;
}
