import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  registroForm = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    apelidos: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    telefono: ['', [Validators.pattern(/^[6-9][0-9]{8}$/)]],
    contrasinal: ['', [Validators.required, Validators.minLength(8)]],
    confirmar_contrasinal: ['', [Validators.required]]
    
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: any) {
    const pass = form.get('contrasinal')?.value;
    const confirm = form.get('confirmar_contrasinal')?.value;
    return pass == confirm ? null : { mismatch: true };
  }

  async onRegister() {
    if (this.registroForm.invalid) return;

    try {
      await this.http.post('http://reservas.test/api/register', this.registroForm.value).toPromise();

      Swal.fire({
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

      if (errors.correo) msg = errors.correo[0];
      else if (errors.telefono) msg = errors.telefono[0];
      else if (errors.contrasinal) msg = errors.contrasinal[0];
      else if (err.error?.message) msg = err.error.message;

      Swal.fire('Erro', msg, 'error');
    }
  }
}
