import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  caption: string | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Gerar a pré-visualização da imagem
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  generateCaption(): void {
    if (this.selectedFile) {
      // Simular geração de legenda (substituir com a lógica real do modelo)
      setTimeout(() => {
        this.caption = 'Uma legenda gerada para a imagem carregada.';
      }, 2000); // Simula tempo de processamento
    }
  }
}
