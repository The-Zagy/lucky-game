import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
app.use(express.static(path.resolve('view/css')));
app.use(express.static(path.resolve('view/js')));
app.get('/', (_req, res) => {
    res.sendFile(path.resolve('view/landing.html'));
});
app.get('/local', (_req, res) => {
    res.sendFile(path.resolve('view/index.html'));
});
io.on('connection', (socket) => {
    console.log('user connected');
});
server.listen(port, () => {
    console.log(`listen on port ${port}`);
});
