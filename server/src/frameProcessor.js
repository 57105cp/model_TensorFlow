import { createCanvas, loadImage } from 'canvas';
import * as tf from '@tensorflow/tfjs-node';

export async function processFrame(buffer, model) {
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const input = tf.browser.fromPixels(canvas);
  const faces = await model.estimateFaces(input, false);
  input.dispose();

  faces.forEach(face => {
    const { topLeft, bottomRight } = face;
    const [x1, y1] = topLeft;
    const [x2, y2] = bottomRight;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  });

  return canvas;
}
