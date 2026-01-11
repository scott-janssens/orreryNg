import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ory-about-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './about-dialog.html',
  styleUrl: './about-dialog.css',
})
export class AboutDialog {
  angularVersion = '21.0';
  githubUrl = 'https://github.com/scott-janssens/orreryNg';
  aaJsUrl = 'https://github.com/astronexus/aa-js';
  wikipediaUrl = 'https://en.wikipedia.org/wiki/Orrery';
  angularUrl = 'https://angular.dev';
  threeJsUrl = 'https://threejs.org';
  angularMaterialUrl = 'https://material.angular.io';
}
