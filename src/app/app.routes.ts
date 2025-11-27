import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: ''}
];