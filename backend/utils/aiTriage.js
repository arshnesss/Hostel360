const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { Jimp } = require('jimp');

let model = null;

const analyzeImage = async (imageUrl) => {
  // 1. Set memory limit for TFJS specifically
  tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0); 

  try {
    if (!model) {
      console.log("🤖 Loading AI Model (Memory Optimized)...");
      model = await cocoSsd.load();
    }

    const image = await Jimp.read(imageUrl);
    image.resize({ w: 224, h: 224 }); // Keep it small to save memory

    const { data } = image.bitmap;
    const numPixels = 224 * 224;
    const values = new Int32Array(numPixels * 3);

    for (let i = 0; i < numPixels; i++) {
      values[i * 3] = data[i * 4];
      values[i * 3 + 1] = data[i * 4 + 1];
      values[i * 3 + 2] = data[i * 4 + 2];
    }

    // Wrap the detection in tf.tidy to automatically clear memory
    const tags = await tf.tidy(async () => {
      const imageTensor = tf.tensor3d(values, [224, 224, 3], 'int32');
      const predictions = await model.detect(imageTensor);
      return predictions.map(p => p.class.toLowerCase());
    });

    console.log("✅ AI Tags:", tags);

    const hazardKeywords = ['fire', 'smoke', 'cell phone', 'remote', 'mouse', 'laptop', 'person'];
    const isHazard = tags.some(tag => hazardKeywords.includes(tag));

    return { urgency: isHazard ? "High" : "Low", tags: tags };
  } catch (error) {
    console.log("❌ AI ERROR:", error.message);
    return { urgency: "Low", tags: ["analysis-failed"] };
  }
};

module.exports = { analyzeImage };