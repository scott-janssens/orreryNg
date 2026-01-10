import { Component } from '@angular/core';
import { Planet } from '../planet';
import { DisplayOptions } from '../display-options';

@Component({
  selector: 'ory-display',
  imports: [],
  templateUrl: './display.html',
  styleUrl: './display.css',
})
export class Display {
  private _canvasCtx!: CanvasRenderingContext2D;
  private _canvas!: HTMLCanvasElement;

  public planets: Record<string, Planet> = {}

  ngAfterViewInit() {
    this._canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._canvasCtx = this._canvas.getContext("2d")!;

    this.render(new DisplayOptions());
  }

  public render(options: DisplayOptions) {
    this._canvasCtx = this._canvas.getContext("2d")!;

    let cx = this._canvasCtx.canvas.width / 2;
    let cy = this._canvasCtx.canvas.height / 2;
    this._canvasCtx.clearRect(0, 0, this._canvasCtx.canvas.width, this._canvasCtx.canvas.height);

    this._canvasCtx.lineWidth = 1;
    this._canvasCtx.strokeStyle = "orange";
    this._canvasCtx.fillStyle = "yellow";

    this._canvasCtx.beginPath();
    const solarRadius = 7 / options.zoom;
    this._canvasCtx.ellipse(cx, cy, solarRadius, solarRadius, 0, 0, 2 * Math.PI);
    this._canvasCtx.fill();
    this._canvasCtx.stroke();

    Object.values(this.planets).forEach(planet => {
      if (options.showOrbits) {
        this._canvasCtx.strokeStyle = "#2f2f2f";
        this._canvasCtx.beginPath();
        this._canvasCtx.ellipse(cx, cy,
          planet.orbit.semiMajorAxis * 50 / options.zoom, planet.orbit.semiMinorAxis * 50 / options.zoom,
          0, 0, 2 * Math.PI);
        this._canvasCtx.stroke();
      }

      this._canvasCtx.fillStyle = planet.color
      this._canvasCtx.beginPath();
      planet.frameInfo.radius = options.scaledSizes ? Math.max(planet.size / 10000 / options.zoom, 1) : 2.5;
      planet.frameInfo.jx = cx + planet.orbit.semiMajorAxis * 50 / options.zoom * Math.cos(planet.longitude * Math.PI / 180);
      planet.frameInfo.jy = cy - planet.orbit.semiMinorAxis * 50 / options.zoom * Math.sin(planet.longitude * Math.PI / 180);;
      this._canvasCtx.ellipse(planet.frameInfo.jx, planet.frameInfo.jy, planet.frameInfo.radius, planet.frameInfo.radius, 0, 0, 2 * Math.PI);
      this._canvasCtx.fill();
    });

    if (options.showLabels) {
      Object.values(this.planets).forEach(planet => {
        this._canvasCtx.fillStyle = "Darkgray";
        this._canvasCtx.font = `${Math.min(16, Math.max(10, 12 / options.zoom))}px Arial`;
        this._canvasCtx.fillText(planet.name, planet.frameInfo.jx + planet.frameInfo.radius, planet.frameInfo.jy - planet.frameInfo.radius);
      });
    }
  }
}
