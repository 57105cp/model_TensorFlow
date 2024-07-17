import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (streaming) {
      startVideoStream();
    } else {
      stopVideoStream();
    }
  }, [streaming]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      streamRef.current = stream;
      console.log("STREAM: ", stream);

      const videoTrack = stream.getVideoTracks()[0];
      // console.log("videoTrack: ", videoTrack);
      const imageCapture = new ImageCapture(videoTrack);
      // console.log("imageCapture: ", imageCapture);

      const captureFrame = async () => {
        if (streaming && stream.active) {
          const bitmap = await imageCapture.grabFrame();
          // console.log("bitmap: ", bitmap);
          canvasRef.current.width = bitmap.width;
          canvasRef.current.height = bitmap.height;
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(bitmap, 0, 0);
          const frameData = canvasRef.current.toDataURL('image/png');
          // console.log("frameData : ", frameData.length);
          socket.emit('frame', frameData);
          requestAnimationFrame(captureFrame);
        }
      };

      captureFrame();
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopVideoStream = () => {
    // const stream = videoRef.current.srcObject;
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;
    streamRef.current = null;
  };

  useEffect(() => {
    socket.on('processedFrame', (frameDataUrl) => {
      console.log("frameDataUrl_front : ", frameDataUrl.length);
      const img = new Image();
      img.src = frameDataUrl;
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
    });

    return () => {
      socket.off('processedFrame');
    };
  }, []);

  return (
    <div className="App">
      <h1>Face Detection: Live Video</h1>
      <button onClick={() => setStreaming(!streaming)}>
        {streaming ? 'Stop Video' : 'Start Video'}
      </button>
      <video ref={videoRef} width="600" style={{ display: streaming ? 'block' : 'none' }} />
      <canvas ref={canvasRef} />
    </div>
  );
}

export default App;
