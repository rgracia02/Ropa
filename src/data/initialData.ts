import { Garment, DaySchedule } from '../types';

// El armario inicia completamente vacío para que el usuario ingrese sus prendas reales
export const INITIAL_GARMENTS: Garment[] = [];

// Calendario semanal inicial listo y limpio sin asignaciones previas
export const INITIAL_WEEK_SCHEDULE: DaySchedule[] = [
  {
    dayId: 'lunes',
    dayName: 'Lunes',
    dateStr: 'Hoy',
    weather: 'soleado_calor',
    temp: 24,
    occasion: 'trabajo',
    isWorn: false,
  },
  {
    dayId: 'martes',
    dayName: 'Martes',
    dateStr: 'Mañana',
    weather: 'templado',
    temp: 21,
    occasion: 'trabajo',
    isWorn: false,
  },
  {
    dayId: 'miercoles',
    dayName: 'Miércoles',
    dateStr: 'Miércoles',
    weather: 'fresco_viento',
    temp: 18,
    occasion: 'trabajo',
    isWorn: false,
  },
  {
    dayId: 'jueves',
    dayName: 'Jueves',
    dateStr: 'Jueves',
    weather: 'templado',
    temp: 22,
    occasion: 'casual',
    isWorn: false,
  },
  {
    dayId: 'viernes',
    dayName: 'Viernes',
    dateStr: 'Viernes',
    weather: 'templado',
    temp: 23,
    occasion: 'salir',
    isWorn: false,
  },
  {
    dayId: 'sabado',
    dayName: 'Sábado',
    dateStr: 'Sábado',
    weather: 'soleado_calor',
    temp: 26,
    occasion: 'especial',
    isWorn: false,
  },
  {
    dayId: 'domingo',
    dayName: 'Domingo',
    dateStr: 'Domingo',
    weather: 'soleado_calor',
    temp: 25,
    occasion: 'casual',
    isWorn: false,
  },
];
