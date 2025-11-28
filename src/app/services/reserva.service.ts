import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

export interface TipoInstalacion {
  id_tipo: number;
  nome_tipo: string;
}

export interface Instalacion {
  id_instalacion: number;
  nome: string;
  capacidade: number;
  estado: string;
  tipo: { id_tipo: number; nome_tipo: string };
  disponible: boolean;
}

export interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://reservas.test:8000/api';

  tipos = signal<TipoInstalacion[]>([]);
  instalacions = signal<Instalacion[]>([]);
  horarios = signal<Horario[]>([]);
  loading = signal(false);

  // CONSTRUCTOR: carga automática ao iniciar a app
  constructor() { 
    // Só cargamos se o usuario está logueado
    effect(() => {
      if (this.authService.estaLogueado()) {
        this.cargarDatos();
      }
    });
  }

  async cargarDatos() {
    if (this.loading()) return; // Evita doble carga

    this.loading.set(true);
    this.authService.loading.set(true);

    try {
      const [tipos, instalacions] = await Promise.all([
        this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`).toPromise(),
        this.http.get<Instalacion[]>(`${this.apiUrl}/instalacions`).toPromise()
      ]);

      this.tipos.set(tipos || []);
      this.instalacions.set(instalacions || []);
    } catch (err) {
      Swal.fire('Erro', 'Non se puideron cargar as instalacións', 'error');
    } finally {
      this.loading.set(false);
      this.authService.loading.set(false);
    }
  }

  async reservar(datos: { id_instalacion: number; id_horario: number; data_reserva: string }) {
    this.loading.set(true);
    this.authService.loading.set(true);

    try {
      await this.http.post(`${this.apiUrl}/reservas`, datos, { withCredentials: true }).toPromise();
      Swal.fire('Perfecto!', 'Reserva confirmada', 'success');
      await this.cargarDatos(); // actualiza dispoñibilidad
    } catch (err: any) {
      const msg = err.error?.message || 'Erro ao reservar';
      Swal.fire('Erro', msg, 'error');
      throw  err;
    } finally {
      this.loading.set(false);
      this.authService.loading.set(false);
    }
  }
}
