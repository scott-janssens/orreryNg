import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ControlPanel } from "./control-panel/control-panel";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ControlPanel],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('orreryNg');
}
