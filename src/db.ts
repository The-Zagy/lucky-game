import { DbRow } from './events';
//mock db
//gameState false means not playing
//active player for now boolean true => player1 false => player2
// TODO change active player type to enum or any shit
const db: {
    [name: string]: DbRow;
} = {};
export default db;
