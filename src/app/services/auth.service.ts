// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface Usuario {
  id_usuario: number;
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
}

interface RegisterData {
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
  contrasinal: string;
}

interface LoginData {
  correo: string;
  contrasinal: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://reservas.test/api';

  // ESTADO GLOBAL REACTIVO
  usuario = signal<Usuario | null>(null);
  estaLogueado = signal(false);
  loading = signal(false);  // ← AQUÍ LO PONEMOS, al mismo nivel que los otros signals

  constructor(private http: HttpClient, private router: Router) {
    this.comprobarSesion();
  }

  async register(datos: RegisterData) {
    this.loading.set(true);  // ← empieza el loading
    try {

      // Primeiro hai que obter a cookie CSRF
      await this.http.get(`${this.apiUrl}/sanctum/csrf-cookie`, {withCredentials: true}).toPromise()

      // Agora si facer o rexistro
      await this.http.post(`${this.apiUrl}/register`, datos, {withCredentials: true}).toPromise();

      await Swal.fire({
        icon: 'success',
        title: 'Rexistro correcto!',
        text: 'Xa podes iniciar sesión co teu novo usuario',
        timer: 3000,
        showConfirmButton: false
      });

      this.router.navigate(['/']);
    } catch (err: any) {
      const errors = err.error?.errors || {};
      let msg = 'Erro no rexistro';
      if (errors.correo?.[0]) msg = errors.correo[0];
      else if (errors.telefono?.[0]) msg = errors.telefono[0];
      else if (errors.contrasinal?.[0]) msg = errors.contrasinal[0];
      else if (err.error?.message) msg = err.error.message;

      await Swal.fire('Erro', msg, 'error');
    } finally {
      this.loading.set(false);  // ← siempre se apaga
    }
  }

  async login(credenciais: LoginData) {
    this.loading.set(true);  // ← empieza
    try {
      await this.http.get(`${this.apiUrl}/sanctum/csrf-cookie`, { withCredentials: true }).toPromise();
      const res: any = await this.http.post(`${this.apiUrl}/login`, credenciais, { withCredentials: true }).toPromise();

      this.usuario.set(res.usuario);
      this.estaLogueado.set(true);

      await Swal.fire('Benvido!', `Ola ${res.usuario.nome}!`, 'success');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      await Swal.fire('Erro', err.error?.message || 'Credenciais incorrectas', 'error');
    } finally {
      this.loading.set(false);  // ← siempre se apaga
    }
  }

  async comprobarSesion() {
    this.loading.set(true);
    try {
      const res: any = await this.http.get(`${this.apiUrl}/user`, { withCredentials: true }).toPromise();
      this.usuario.set(res.usuario);
      this.estaLogueado.set(true);
    } catch {
      this.usuario.set(null);
      this.estaLogueado.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    this.loading.set(true);
    try {
      await this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).toPromise();
    } catch {}
    this.usuario.set(null);
    this.estaLogueado.set(false);
    await Swal.fire('Sesión pechada', 'Volve pronto!', 'info');
    this.router.navigate(['/']);
    this.loading.set(false);
  }
}