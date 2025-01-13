/// <reference lib="webworker" />

import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

async function loadModel(file: string): Promise<void> {
  model = await tf.loadLayersModel(file);
}

function preProcessImage(imgData: ImageData): tf.Tensor {
  return tf.browser
    .fromPixels(imgData)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(127.5)
    .sub(1)
    .expandDims();
}

async function generateCaption(imgData: ImageData): Promise<string> {
  if (!model) {
    throw new Error('Model is not loaded');
  }

  const preprocessedImage = preProcessImage(imgData);
  const predictions = model.predict(preprocessedImage) as tf.Tensor;
  const captionTokens = await predictions.array();

  return tokensToCaption(captionTokens);
}

function tokensToCaption(
  tokens:
    | number
    | number[]
    | number[][]
    | number[][][]
    | number[][][][]
    | number[][][][][]
    | number[][][][][][]
): string {
  const vocabulary = ['<start>', 'a', 'cat', 'on', 'the', 'mat', '<end>'];
  const flattenTokens = (data: any): number[] => {
    if (Array.isArray(data)) {
      return data.flatMap(flattenTokens);
    }
    return [data];
  };
  const flatTokens = flattenTokens(tokens);
  const caption = flatTokens
    .map((token) => vocabulary[token] || '')
    .filter((word) => word && word !== '<start>' && word !== '<end>')
    .join(' ');

  return caption;
}

addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'LOAD_MODEL':
      loadModel(payload)
        .then(() => {
          postMessage({
            type: 'MODEL_LOADED',
            message: 'Modelo carregado com sucesso!',
          });
        })
        .catch((error) => {
          postMessage({ type: 'MODEL_LOADED_ERROR', error: error.message });
        });
      break;
    case 'GENERATE_CAPTION':
      generateCaption(payload)
        .then((caption) => {
          postMessage({ type: 'CAPTION_GENERATED', caption });
        })
        .catch((error) => {
          postMessage({ type: 'CAPTION_GENERATED_ERROR', error: error.message });
        });
      break;
  }
});
