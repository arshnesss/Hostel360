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

    let fieryPixels = 0;

    for (let i = 0; i < numPixels; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];

      values[i * 3] = r;
      values[i * 3 + 1] = g;
      values[i * 3 + 2] = b;

      // Fiery/Spark RGB Flame Spectrum: High Red intensity, Red > Blue*1.5, Orange/Red glow
      if (r > 150 && r > b * 1.4 && (g < r * 0.95)) {
        fieryPixels++;
      }
    }

    const imageTensor = tf.tensor3d(values, [224, 224, 3], 'int32');
    let predictions = [];
    try {
      predictions = await loadedModel.detect(imageTensor);
    } finally {
      imageTensor.dispose();
    }

    const tags = predictions.map(p => p.class.toLowerCase());
    
    // Check if image contains bright fiery/spark pixels (>4% of pixels)
    const flameRatio = fieryPixels / numPixels;
    const isFiery = flameRatio > 0.04;

    if (isFiery) {
      tags.push("fire-hazard", "flame-detected");
    }

    console.log(`✅ AI Detected Tags:`, tags, `(Flame Pixel Ratio: ${(flameRatio * 100).toFixed(1)}%)`);

    const hazardKeywords = [
      'fire', 'smoke', 'fire-hazard', 'flame-detected',
      'cell phone', 'remote', 'mouse', 'laptop', 'person', 
      'bottle', 'scissors', 'knife', 'tv', 'toaster', 'oven', 'microwave'
    ];
    
    const isHazard = isFiery || tags.some(tag => hazardKeywords.includes(tag));

    return { urgency: isHazard ? "High" : "Low", tags };
  } catch (error) {
    console.log("❌ AI ERROR:", error.message);
    return { urgency: "Low", tags: ["analysis-failed"] };
  }
};

module.exports = { analyzeImage, getModel };