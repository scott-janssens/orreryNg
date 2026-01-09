import { Component } from '@angular/core';

@Component({
  selector: 'ory-display',
  imports: [],
  templateUrl: './display.html',
  styleUrl: './display.css',
})
export class Display {
  private _canvasCtx!: CanvasRenderingContext2D;
  private _canvas!: HTMLCanvasElement;

  ngAfterViewInit() {
    this._canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._canvasCtx = this._canvas.getContext("2d")!;

    this.render();
  }

  private render() {
    this._canvasCtx = this._canvas.getContext("2d")!;

    let cx = this._canvasCtx.canvas.width / 2;
    let cy = this._canvasCtx.canvas.height / 2;
    this._canvasCtx.clearRect(0, 0, this._canvasCtx.canvas.width, this._canvasCtx.canvas.height);

    this._canvasCtx.lineWidth = 1;
    this._canvasCtx.strokeStyle = "orange";
    this._canvasCtx.fillStyle = "yellow";

    this._canvasCtx.beginPath();
    this._canvasCtx.ellipse(cx, cy, 2, 2, 0, 0, 2 * Math.PI);
    this._canvasCtx.fill();
    this._canvasCtx.stroke();
  }
}
