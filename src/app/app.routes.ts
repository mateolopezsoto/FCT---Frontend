import { Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  // Ruta raíz → Login
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  // Registro
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  { path: '**', redirectTo: ''}, 

  // Reservas
  {
    path: 'reservas',
    loadComponent: () => import('./reservas/reservas.component').then(c => c.ReservasComponent),
    canActivate: [() => inject(AuthService).estaLogueado()]
  }
];