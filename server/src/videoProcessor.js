import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { fileURLToPath } from 'url';
import { processFrame } from './frameProcessor.js';

ffmpeg.setFfmpegPath(ffmpegStatic);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process a video by extracting frames, processing each frame, and reassembling the video
 * @param {string} videoPath - Path to the input video
 * @param {string} outputPath - Path to the output processed video
 * @param {Object} model - The face detection model
 * @returns {Promise<string>} The path to the processed video
 */

export async function processVideo(videoPath, outputPath, model) {
  return new Promise((resolve, reject) => {
    const framesDir = path.join(__dirname, 'frames');
    const processedFramesDir = path.join(__dirname, 'processed_frames');

    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);
    if (!fs.existsSync(processedFramesDir)) fs.mkdirSync(processedFramesDir);

    // Extract frames from video
    ffmpeg(videoPath)
      .outputOptions('-vf', 'fps=25')
      .on('end', async () => {
        console.log('Frames extracted');

        const frameFiles = fs.readdirSync(framesDir);
        for (const frameFile of frameFiles) {
          const framePath = path.join(framesDir, frameFile);
          const canvas = await processFrame(framePath, model);
          const out = fs.createWriteStream(path.join(processedFramesDir, frameFile));
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          await new Promise((resolve) => out.on('finish', resolve));
        }

        // Reassemble video from processed frames
        ffmpeg()
          .addInput(`${processedFramesDir}/%d.png`)
          .inputFPS(25)
          .on('end', () => {
            console.log('Video reassembled');
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('Error reassembling video:', err);
            reject(err);
          })
          .save(outputPath);
      })
      .on('error', (err) => {
        console.error('Error extracting frames:', err);
        reject(err);
      })
      .save(`${framesDir}/%d.png`);
  });
}



// =============== Removed framesDir and processedFramesDir after completing task ==============
// import fs from 'fs';
// import path from 'path';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegStatic from 'ffmpeg-static';
// import { fileURLToPath } from 'url';
// import { processFrame } from './frameProcessor.js';

// ffmpeg.setFfmpegPath(ffmpegStatic);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export async function processVideo(videoPath, outputPath, model) {
//   const framesDir = path.join(__dirname, 'frames');
//   const processedFramesDir = path.join(__dirname, 'processed_frames');

//   try {
//     if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);
//     if (!fs.existsSync(processedFramesDir)) fs.mkdirSync(processedFramesDir);

//     // Extract frames from video
//     await new Promise((resolve, reject) => {
//       ffmpeg(videoPath)
//         .outputOptions('-vf', 'fps=25')
//         .on('end', resolve)
//         .on('error', reject)
//         .save(`${framesDir}/%d.png`);
//     });

//     console.log('Frames extracted');

//     // Process frames
//     const frameFiles = fs.readdirSync(framesDir);
//     for (const frameFile of frameFiles) {
//       const framePath = path.join(framesDir, frameFile);
//       const canvas = await processFrame(framePath, model);
//       const out = fs.createWriteStream(path.join(processedFramesDir, frameFile));
//       const stream = canvas.createPNGStream();
//       stream.pipe(out);
//       await new Promise((resolve) => out.on('finish', resolve));
//     }

//     console.log('Frames processed');

//     // Reassemble video from processed frames
//     await new Promise((resolve, reject) => {
//       ffmpeg()
//         .addInput(`${processedFramesDir}/%d.png`)
//         .inputFPS(25)
//         .on('end', resolve)
//         .on('error', reject)
//         .save(outputPath);
//     });

//     console.log('Video reassembled');

//     // Cleanup: Remove temporary directories
//     fs.rmSync(framesDir, { recursive: true, force: true });
//     fs.rmSync(processedFramesDir, { recursive: true, force: true });

//     return outputPath;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error; // Re-throw the error for the caller to handle
//   }
// }
