const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { Jimp } = require('jimp');

let modelPromise = null;

// Ensure TensorFlow backend is ready before loading model
const getModel = async () => {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
        await tf.ready();
        console.log("🤖 Pre-loading TensorFlow COCO-SSD AI Model...");
        const loadedModel = await cocoSsd.load();
        console.log("✅ AI Model Loaded & Ready!");
        return loadedModel;
      } catch (err) {
        console.error("❌ Failed to load AI Model:", err.message);
        modelPromise = null;
        throw err;
      }
    })();
  }
  return modelPromise;
};

// Start preloading immediately on module import
getModel().catch(() => {});

const analyzeImage = async (imageUrl) => {
  try {
    const loadedModel = await getModel();

    let inputData = imageUrl;
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
      const base64Content = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      inputData = Buffer.from(base64Content, 'base64');
    }

    const image = await Jimp.read(inputData);
    image.resize({ w: 224, h: 224 });

    const { data } = image.bitmap;
    const numPixels = 224 * 224;
    const values = new Int32Array(numPixels * 3);

    for (let i = 0; i < numPixels; i++) {
      values[i * 3] = data[i * 4];
      values[i * 3 + 1] = data[i * 4 + 1];
      values[i * 3 + 2] = data[i * 4 + 2];
    }

    const imageTensor = tf.tensor3d(values, [224, 224, 3], 'int32');
    let predictions = [];
    try {
      predictions = await loadedModel.detect(imageTensor);
    } finally {
      imageTensor.dispose();
    }

    const tags = predictions.map(p => p.class.toLowerCase());
    console.log("✅ AI Detected Tags:", tags);

    const hazardKeywords = ['fire', 'smoke', 'cell phone', 'remote', 'mouse', 'laptop', 'person', 'bottle', 'scissors', 'knife', 'tv'];
    const isHazard = tags.some(tag => hazardKeywords.includes(tag));

    return { urgency: isHazard ? "High" : "Low", tags };
  } catch (error) {
    console.log("❌ AI ERROR:", error.message);
    return { urgency: "Low", tags: ["analysis-failed"] };
  }
};

module.exports = { analyzeImage, getModel };