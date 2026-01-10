import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ControlPanel } from "./control-panel/control-panel";
import { Display } from "./display/display";
import * as AA from 'aa-js';

@Component({
  selector: 'app-root',
  imports: [ControlPanel, Display],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild("controlPanel") controlPanel!: ControlPanel;
  @ViewChild("display") display!: Display;

  private _lastFrameTime: Date = new Date();
  private _lastFrameJD: number = AA.juliandays.getJulianDay();
  private _ = setInterval(() => {
    this.calculateNextFrame()
  }, 1000 / 60);
  protected readonly title = signal('orreryNg');

  ngAfterViewInit() {
    const e = AA.Earth.getEccentricity(this._lastFrameJD);
    let b = Math.sqrt(1 - e * e);

    this.display.planets["Earth"] = {
      name: "Earth",
      color: "lightgreen",
      size: 6371,
      orbit: {
        semiMajorAxis: 1,
        semiMinorAxis: b,
        eccentricity: e
      },
      frameInfo: {
        radius: 0,
        jx: 0,
        jy: 0
      },
      longitude: AA.Earth.getEclipticLongitude(this._lastFrameJD)
    };

    this.setupPlanet("Mercury", "DarkGray", 0.39, AA.Mercury);
    this.setupPlanet("Venus", "GoldenRod", 0.72, AA.Venus);
    this.setupPlanet("Mars", "DarkRed", 1.52, AA.Mars);
    this.setupPlanet("Jupiter", "wheat", 5.2, AA.Jupiter);
    this.setupPlanet("Saturn", "yellow", 9.58, AA.Saturn);
    this.setupPlanet("Uranus", "lightblue", 19.2, AA.Uranus);
    this.setupPlanet("Neptune", "blue", 30.05, AA.Neptune);
  }

  private setupPlanet(name: string, color: string, semiMajorAxis: number, planet: AA.Planet) {
    const e = planet.getEccentricity(this._lastFrameJD);
    let b = semiMajorAxis * Math.sqrt(1 - e * e);

    this.display.planets[name] = {
      name: name,
      color: color,
      size: planet.constants.meanRadius,
      orbit: {
        semiMajorAxis: semiMajorAxis,
        semiMinorAxis: b,
        eccentricity: e
      },
      frameInfo: {
        radius: 0,
        jx: 0,
        jy: 0
      },
      longitude: planet.getEclipticLongitude(this._lastFrameJD)
    };
  }

  calculateNextFrame() {
    const now = new Date();

    if (!this.controlPanel.isActive) {
      this._lastFrameTime = now;
    }

    let deltaTime = (now.getTime() - this._lastFrameTime.getTime()) / 1000; // in seconds
    let jd: number;

    switch (this.controlPanel.timeScale) {
      default:
      case 0:
        jd = this._lastFrameJD + deltaTime / 86400; // 1:1
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
      case 5:
        jd = this._lastFrameJD + deltaTime * 365.25; // 31557600 / 86400; // 1s = 1y
        break;
    }

    if (this.controlPanel.isActive) {
      this.controlPanel.date = new Date((jd - 2440587.5) * 86400000);
    }

    this._lastFrameTime = now;
    this._lastFrameJD = jd;

    this.display.planets["Mercury"].longitude = AA.Mercury.getEclipticLongitude(jd);
    this.display.planets["Venus"].longitude = AA.Venus.getEclipticLongitude(jd);
    this.display.planets["Earth"].longitude = AA.Earth.getEclipticLongitude(jd);
    this.display.planets["Mars"].longitude = AA.Mars.getEclipticLongitude(jd);
    this.display.planets["Jupiter"].longitude = AA.Jupiter.getEclipticLongitude(jd);
    this.display.planets["Saturn"].longitude = AA.Saturn.getEclipticLongitude(jd);
    this.display.planets["Uranus"].longitude = AA.Uranus.getEclipticLongitude(jd);
    this.display.planets["Neptune"].longitude = AA.Neptune.getEclipticLongitude(jd);

    this.display.render(this.controlPanel.displayOptions);
  }

  onDateSet(date: Date | null) {
    if (date) {
      this._lastFrameTime = date;
      this._lastFrameJD = AA.juliandays.getJulianDay(date);
      this.calculateNextFrame()
    }
  }
}
