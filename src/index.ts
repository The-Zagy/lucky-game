import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { emitWarning } from 'process';
//init constatns for server and port
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
//express middlewares
app.use(express.static(path.resolve('view/css')));
app.use(express.static(path.resolve('view/js')));
// express handlers
app.get('/', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/landing.html'));
});
app.get('/local', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve('view/index.html'));
});
//socket.io events tree
io.on('connection', (socket) => {
    console.log('user connected');
});
server.listen(port, () => {
    console.log(`listen on port ${port}`);
});
