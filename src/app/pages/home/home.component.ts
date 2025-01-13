import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CaptionService } from '../../services/caption/caption.service';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  caption: string | null = null;

  constructor(private captionService: CaptionService) {}

  public ngOnInit(): void {
    this.captionService.loadModel();
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();

      reader.onload = (e) => (this.imagePreview = e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  public generateCaption(): void {
    if (this.selectedFile) {
      this.captionService.generateCaption().subscribe({
        next: (caption) => (this.caption = caption),
        error: (err) => console.error(err),
      });
    }
  }
}
