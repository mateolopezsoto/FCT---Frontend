// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],        // ← solo esto
  template: '<router-outlet></router-outlet>',
  styles: []                      // ← sin estilos
})
export class AppComponent { }