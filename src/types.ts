export type GarmentCategory =
  | 'polera'
  | 'camisa'
  | 'pantalon'
  | 'jeans'
  | 'short_falda'
  | 'abrigo_chaqueta'
  | 'calzado'
  | 'accesorio';

export type GarmentStatus = 'clean' | 'in_use' | 'laundry';

export type Occasion = 'trabajo' | 'salir' | 'especial' | 'casual' | 'deporte';

export type WeatherCondition =
  | 'soleado_calor'
  | 'templado'
  | 'fresco_viento'
  | 'frio_invierno'
  | 'lluvioso';

export type StylePreference =
  | 'casual'
  | 'formal'
  | 'elegante'
  | 'urbano'
  | 'minimalista'
  | 'deportivo'
  | 'boho';

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  color: string;
  colorHex: string;
  status: GarmentStatus;
  timesWornThisWeek: number;
  totalWearsSinceWash: number;
  maxWearsBeforeWash: number; // Ej: 1-2 para poleras, 3-4 para pantalones, 5-7 para chaquetas
  suitableWeather: WeatherCondition[];
  styles: StylePreference[];
  lastWornDate?: string;
  material?: string;
  notes?: string;
}

export interface Outfit {
  id: string;
  title: string;
  occasion: Occasion;
  weather: WeatherCondition;
  style: StylePreference;
  topId?: string;
  bottomId?: string;
  outerwearId?: string;
  shoesId?: string;
  accessoryId?: string;
  stylistTip?: string;
  colorHarmony?: string;
  weatherAdvice?: string;
  createdAt?: string;
}

export interface DaySchedule {
  dayId: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  dayName: string;
  dateStr: string;
  weather: WeatherCondition;
  temp: number; // °C
  occasion: Occasion;
  outfit?: Outfit;
  isWorn: boolean; // Si el usuario marcó este conjunto como usado hoy
}

export interface LaundryAlert {
  garment: Garment;
  reason: 'limit_reached' | 'limit_approaching' | 'already_in_laundry';
  message: string;
  urgency: 'high' | 'medium' | 'info';
}
