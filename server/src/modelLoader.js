// import * as faceDetection from '@tensorflow-models/face-detection';
// import '@tensorflow/tfjs-backend-cpu';
// import '@tensorflow/tfjs-backend-webgl';

// export async function loadModel() {
//   const model = await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
//     runtime: 'mediapipe'
//   });
//   console.log('Model loaded successfully');
//   return model;
// }



// import * as blazeface from '@tensorflow-models/blazeface';

// export async function loadModel() {
//   const model = await blazeface.load();
//   console.log('Model loaded successfully');
//   return model;
// }

import * as blazeface from '@tensorflow-models/blazeface';

export async function loadModel() {
  const model = await blazeface.load();
  console.log('Model loaded successfully');
  return model;
}