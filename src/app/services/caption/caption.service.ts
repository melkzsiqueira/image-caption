import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const MODEL_FILE = 'model.json';

@Injectable({
  providedIn: 'root',
})
export class CaptionService {
  private _worker: Worker | null = null;

  constructor() {
    this._worker = new Worker(new URL('../../workers/caption/caption.worker', import.meta.url), {
      type: 'module',
    });
  }

  public loadModel(file: string = MODEL_FILE): void {
    if (this._worker) {
      this._worker.postMessage({ type: 'LOAD_MODEL', payload: file });
      this._worker.onmessage = (event) => {
        const { type, message, error } = event.data;

        if (type === 'MODEL_LOADED') {
          console.log(message);
        }

        if (type === 'MODEL_LOADED_ERROR') {
          console.error(error);
        }
      };
    }
  }

  public generateCaption(selectedFile: File): Observable<string> {
    if (!selectedFile || !this._worker) {
      return new Observable((observer) => {
        observer.next('');
        observer.complete();
      });
    }

    return new Observable((observer) => {
      this._fileToImageElement(selectedFile).subscribe({
        next: (imgElement) => {
          const canvas = document.createElement('canvas');

          canvas.width = imgElement.width;
          canvas.height = imgElement.height;

          const context = canvas.getContext('2d');

          context?.drawImage(imgElement, 0, 0);

          const imgData = context?.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          this._worker!.postMessage({
            type: 'GENERATE_CAPTION',
            payload: imgData,
          });
          this._worker!.onmessage = (event) => {
            const { type, caption, error } = event.data;

            if (type === 'CAPTION_GENERATED') {
              observer.next(caption);
              observer.complete();
            } else if (type === 'CAPTION_GENERATED_ERROR') {
              observer.error(error);
            }
          };
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  private _fileToImageElement(file: File): Observable<HTMLImageElement> {
    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.src = reader.result as string;
        img.onload = () => {
          observer.next(img);
          observer.complete();
        };
        img.onerror = (error) => {
          observer.error(error);
        };
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(file);
    });
  }
}
