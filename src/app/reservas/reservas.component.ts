import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ReservaService, Instalacion } from '../services/reserva.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent {
  authService = inject(AuthService);
  reservaService = inject(ReservaService);

  filtroTipo = '';
  filtroData = new Date().toISOString().split('T')[0];
  instalacionsFiltradas = signal<Instalacion[]>([]);

  constructor() {
    this.cargar();
    effect(() => {
      this.filtrar();
    });
  }

  async cargar() {
    this.authService.loading.set(true);
    await this.reservaService.cargarDatos();
    this.authService.loading.set(false);
    this.filtrar();
  }

  filtrar() {
    let lista = this.reservaService.instalacions();

    if (this.filtroTipo) {
      lista = lista.filter(i => i.tipo.id_tipo === +this.filtroTipo);
    }

    this.instalacionsFiltradas.set(lista);
  }
}
