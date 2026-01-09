import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AboutDialog } from '../about-dialog/about-dialog';
import { Scaling } from '../scaling';

@Component({
  selector: 'ory-control-panel',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, MatFormFieldModule,
    MatSliderModule, MatRadioModule, MatButtonModule, MatIconButton, MatButtonToggleModule, MatIconModule],
  templateUrl: './control-panel.html',
  styleUrl: './control-panel.css',
})
export class ControlPanel {
  ScalingEnum = Scaling;
  dateControl = new FormControl(new Date());
  get date() { return this.dateControl.value; }
  set date(d) { this.dateControl.setValue(d); }

  isActive = true;
  timeScale: number = 0;
  timeDisplay = ['1:1', '1s = 1h', '1s = 1d', '1s = 1w', '1s = 1m'];
  zoomLevel = 1;
  scaling = Scaling.Linear;
  ScalingKeys = Object.keys(this.ScalingEnum).filter(k => isNaN(Number(k)));

  constructor(private dialog: MatDialog) { }

  openAboutDialog() {
    this.dialog.open(AboutDialog, { width: '50%', panelClass: 'help-container' });
  }
}
