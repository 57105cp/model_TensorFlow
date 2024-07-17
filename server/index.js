import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { loadModel } from './src/modelLoader.js';
import { processFrame } from './src/frameProcessor.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
const port = 5000;

app.use(cors());
app.use(express.static('public'));

let model;

io.on('connection', async (socket) => {
  console.log('Client connected');
  model = model || await loadModel(); // Load model if not already loaded

  socket.on('frame', async (data) => {
    // console.log("Video stream data: ", data.length);
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    // console.log("Buffer : ", buffer);
    const processedFrame = await processFrame(buffer, model);
    // console.log("processedFrame : ", processedFrame);
    const frameDataUrl = processedFrame.toDataURL('image/png');
    // console.log("frameDataUrl : ", frameDataUrl.length);
    socket.emit('processedFrame', frameDataUrl);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
