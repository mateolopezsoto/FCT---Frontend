import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface LoginResponse {
  message: string;
  user: any;
  access_token: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = signal<boolean>(false);

  loginForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasinal: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);

    try {
      // 1. Cookie CSRF
      await this.http.get('http://reservas.test/sanctum/csrf-cookie', {
        withCredentials: true
      }).toPromise();

      // 2. Login
      const res = await this.http.post<LoginResponse>(
        'http://reservas.test/api/login',
        this.loginForm.value,
        { withCredentials: true }
      ).toPromise();

      if (res?.access_token) {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));

        Swal.fire('Benvido!', `Ola, ${res.user.nome}!`, 'success');
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      const msg = err.error?.message || 'Credenciais incorrectas';
      Swal.fire('Erro', msg, 'error');
    } finally {
      this.loading.set(false);
    }
  }

  openForgotPassword(e: Event) {
    e.preventDefault();
    Swal.fire('Esquecín o contrasinal', 'Contacta con admin@concello.gal', 'info');
  }
}
