import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

const MODEL_FILE = '/assets/model/model.json';

@Injectable({
  providedIn: 'root',
})
export class CaptionService {
  private _selectedFile: File | null = null;
  private _model: tf.LayersModel | null = null;

  constructor() {}

  public async loadModel(): Promise<void> {
    this._model = await tf.loadLayersModel(MODEL_FILE);
  }

  public async generateCaption(): Promise<string> {
    if (!this._selectedFile || !this._model) {
      return '';
    }

    const imgElement = await this._fileToImageElement(this._selectedFile);
    const preprocessedImage = this._preProcessImage(imgElement);
    const predictions = this._model.predict(preprocessedImage) as tf.Tensor;
    const captionTokens = await predictions.array();

    return this._tokensToCaption(captionTokens);
  }

  private _fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  private _preProcessImage(imgElement: HTMLImageElement): tf.Tensor {
    const tensor = tf.browser
      .fromPixels(imgElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(127.5)
      .sub(1)
      .expandDims();
    return tensor;
  }

  private _tokensToCaption(
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
}
