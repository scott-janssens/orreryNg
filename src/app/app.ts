import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ControlPanel } from "./control-panel/control-panel";
import { Display } from "./display/display";
import { juliandays, Earth } from 'aa-js';

@Component({
  selector: 'app-root',
  imports: [ControlPanel, Display],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild("controlPanel") controlPanel!: ControlPanel;
  @ViewChild("display") display!: Display;

  private _lastFrameTime = Date.now();
  private _lastFrameJD: number = juliandays.getJulianDay();
  private _timer = setInterval(() => this.calculateNextFrame(), 1000 / 60);
  protected readonly title = signal('orreryNg');

  calculateNextFrame() {
    if (!this.controlPanel.isActive) {
      this._lastFrameTime = Date.now();
      this._lastFrameJD = juliandays.getJulianDay(); // 1:1
      return;
    }

    const now = Date.now();
    let deltaTime = (now - this._lastFrameTime) / 1000; // in seconds
    let jd: number;

    switch (this.controlPanel.timeScale) {
      default:
      case 0:
        jd = juliandays.getJulianDay(); // 1:1
        break;
      case 1:
        jd = this._lastFrameJD + deltaTime * 0.0416666666666667; // 3600 / 86400; // 1s = 1h
        break;
      case 2:
        jd = this._lastFrameJD + deltaTime; // 86400 / 86400; // 1s = 1d
        break;
      case 3:
        jd = this._lastFrameJD + deltaTime * 7; // 604800 / 86400; // 1s = 1w
        break;
      case 4:
        jd = this._lastFrameJD + deltaTime * 30.4375; // 2629800 / 86400; // 1s = 1m
        break;
    }


    this.controlPanel.date = new Date((jd - 2440587.5) * 86400000);

    this._lastFrameTime = now;
    this._lastFrameJD = jd;

    // TODO: Implement frame calculation logic using deltaTime
  }
}
