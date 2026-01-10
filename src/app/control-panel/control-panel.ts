import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule, FormControlStatus } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialog } from '../about-dialog/about-dialog';
import { DisplayOptions } from '../display-options';
import { NativeDateAdapter } from '@angular/material/core';

// @Injectable()
// export class CustomDateAdapter extends NativeDateAdapter {
//   override parse(value: any): Date | null {
//     if (typeof value === 'string' && value.length === 10) {
//       const [year, month, day] = value.split('/').map(Number);
//       if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
//         return new Date(year, month - 1, day);
//       }
//     }
//     return null;
//   }

//   override format(date: Date, displayFormat: Object): string {
//     const day = ('00' + date.getDate()).slice(-2);
//     const month = ('00' + (date.getMonth() + 1)).slice(-2);
//     const year = date.getFullYear();
//     return `${year}/${month}/${day}`;
//   }
// }

@Component({
  selector: 'ory-control-panel',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, MatFormFieldModule,
    MatSliderModule, MatCheckboxModule, MatButtonModule, MatIconButton, MatButtonToggleModule, MatIconModule],
  templateUrl: './control-panel.html',
  styleUrl: './control-panel.css',
  // providers: [{ provide: NativeDateAdapter, useClass: CustomDateAdapter }]
})
export class ControlPanel {
  @Output() dateSet: EventEmitter<Date | null> = new EventEmitter();
  
  private _emitDateEvent: boolean = true;
  dateControl = new FormControl(new Date());
  get date() { return this.dateControl.value; }
  set date(d) { 
    this._emitDateEvent = false; 
    this.dateControl.setValue(d); 
    this._emitDateEvent = true; 
  }

  isActive: boolean = true;
  timeScale: number = 0;
  timeDisplay: string[] = ['Real-time', '1s = 1 hour', '1s = 1 day', '1s = 1 week', '1s = 1 month', '1s = 1 year'];
  get zoomLevel(): number { return this.displayOptions.zoom; }
  set zoomLevel(value: number) { this.displayOptions.zoom = value; this.zoomDisplay = Math.round(1 / this.displayOptions.zoom * 100) / 100; }
  zoomDisplay: number = 1;
  displayOptions: DisplayOptions = new DisplayOptions();

  constructor(private dialog: MatDialog) {
    // this.dateControl.statusChanges.subscribe((value: FormControlStatus) => {
    //   this.dateSet.emit(this.dateControl.value);
    // });
  }
  
  public onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (this._emitDateEvent) {
      this.dateSet.emit(this.dateControl.value);
    }
  }
  
  onNowClick() {
    this.dateControl.setValue(new Date());
    this.dateSet.emit(this.dateControl.value);
  }

  openAboutDialog() {
    this.dialog.open(AboutDialog, { width: '50%', panelClass: 'help-container' });
  }
}