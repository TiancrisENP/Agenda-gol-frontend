// Reserva Types
export interface Reserva {
    id: string;
    userId: string;
    canchaId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: EstadoReserva;
    precioTotal: number;
    notasAdicionales?: string;
    cancha?: {
      nombre: string;
      ubicacion: string;
      tipo: string;
    };
    user?: {
      nombre: string;
      apellido: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export enum EstadoReserva {
    PENDIENTE = 'PENDIENTE',
    CONFIRMADA = 'CONFIRMADA',
    CANCELADA = 'CANCELADA',
    COMPLETADA = 'COMPLETADA'
  }
  
  export interface CreateReservaData {
    canchaId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    notasAdicionales?: string;
  }
  
  export interface UpdateReservaData {
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
    estado?: EstadoReserva;
    notasAdicionales?: string;
  }
  
  export interface ReservaFilters {
    estado?: EstadoReserva;
    fechaInicio?: string;
    fechaFin?: string;
    canchaId?: string;
  }