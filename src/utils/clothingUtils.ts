import { Garment, GarmentCategory, Occasion, WeatherCondition, StylePreference, LaundryAlert } from '../types';

export const CATEGORY_LABELS: Record<GarmentCategory, { label: string; singular: string }> = {
  polera: { label: 'Poleras & Camisetas', singular: 'Polera' },
  camisa: { label: 'Camisas & Blusas', singular: 'Camisa' },
  pantalon: { label: 'Pantalones & Chinos', singular: 'Pantalón' },
  jeans: { label: 'Jeans & Denim', singular: 'Jeans' },
  short_falda: { label: 'Shorts & Bermudas', singular: 'Short' },
  abrigo_chaqueta: { label: 'Chaquetas & Abrigos', singular: 'Abrigo/Chaqueta' },
  calzado: { label: 'Zapatillas & Zapatos', singular: 'Calzado' },
  accesorio: { label: 'Accesorios & Relojes', singular: 'Accesorio' },
};

export const OCCASION_LABELS: Record<Occasion, { label: string; description: string; icon: string }> = {
  trabajo: { label: 'Trabajo / Oficina', description: 'Reuniones, oficina o jornada laboral formal/smart casual', icon: 'Briefcase' },
  salir: { label: 'Salir / Noche', description: 'Cenas, salidas con amigos, bares o citas', icon: 'Sparkles' },
  especial: { label: 'Evento Especial', description: 'Bodas, cócteles, aniversarios o galas', icon: 'Crown' },
  casual: { label: 'Casual / Diario', description: 'Día a día, paseos relajados o descanso en casa', icon: 'Coffee' },
  deporte: { label: 'Deporte & Activo', description: 'Gimnasio, running o actividades al aire libre', icon: 'Activity' },
};

export const WEATHER_LABELS: Record<WeatherCondition, { label: string; desc: string; icon: string; defaultTemp: number }> = {
  soleado_calor: { label: 'Soleado / Caluroso', desc: 'Prendas frescas, ligeras y transpirables (>24°C)', icon: 'Sun', defaultTemp: 27 },
  templado: { label: 'Templado / Agradable', desc: 'Clima ideal, capas suaves o mangas medias (19°C - 24°C)', icon: 'CloudSun', defaultTemp: 21 },
  fresco_viento: { label: 'Fresco con Viento', desc: 'Amerita una chaqueta ligera o sweater (14°C - 18°C)', icon: 'Wind', defaultTemp: 16 },
  frio_invierno: { label: 'Frío Invernal', desc: 'Capas abrigadas, suéter o abrigo grueso (<14°C)', icon: 'Snowflake', defaultTemp: 10 },
  lluvioso: { label: 'Día Lluvioso', desc: 'Parka impermeable, calzado resistente al agua', icon: 'CloudRain', defaultTemp: 15 },
};

export const STYLE_LABELS: Record<StylePreference, { label: string; desc: string }> = {
  casual: { label: 'Casual', desc: 'Cómodo, versátil y relajado' },
  formal: { label: 'Formal / Ejecutivo', desc: 'Estructurado, pulcro y profesional' },
  elegante: { label: 'Elegante', desc: 'Prendas refinadas para destacar' },
  urbano: { label: 'Urbano / Streetwear', desc: 'Tendencia moderna de ciudad' },
  minimalista: { label: 'Minimalista', desc: 'Colores neutros y líneas limpias' },
  deportivo: { label: 'Deportivo', desc: 'Prendas técnicas y flexibles' },
  boho: { label: 'Boho / Relajado', desc: 'Prendas fluidas y telas naturales' },
};

export function getGarmentLaundryStatus(garment: Garment): LaundryAlert | null {
  if (garment.status === 'laundry') {
    return {
      garment,
      reason: 'already_in_laundry',
      message: 'En el cesto de lavado pendiente de lavar.',
      urgency: 'high',
    };
  }

  const wears = garment.totalWearsSinceWash;
  const max = garment.maxWearsBeforeWash;

  if (wears >= max) {
    return {
      garment,
      reason: 'limit_reached',
      message: `Alcanzó el límite recomendado (${wears}/${max} usos). Necesita limpieza pronto.`,
      urgency: 'high',
    };
  }

  if (wears === max - 1 && wears > 0) {
    return {
      garment,
      reason: 'limit_approaching',
      message: `Casi al límite (${wears}/${max} usos). Tras el próximo uso irá al lavado.`,
      urgency: 'medium',
    };
  }

  return null;
}

export function calculateWardrobeStats(garments: Garment[]) {
  const total = garments.length;
  const clean = garments.filter((g) => g.status === 'clean').length;
  const inUse = garments.filter((g) => g.status === 'in_use').length;
  const laundry = garments.filter((g) => g.status === 'laundry').length;

  const needingWash = garments.filter((g) => {
    if (g.status === 'laundry') return true;
    return g.totalWearsSinceWash >= g.maxWearsBeforeWash;
  });

  const polerasWornThisWeek = garments
    .filter((g) => g.category === 'polera')
    .reduce((sum, g) => sum + g.timesWornThisWeek, 0);

  const pantalonesWornThisWeek = garments
    .filter((g) => g.category === 'pantalon' || g.category === 'jeans')
    .reduce((sum, g) => sum + g.timesWornThisWeek, 0);

  return {
    total,
    clean,
    inUse,
    laundry,
    needingWashCount: needingWash.length,
    polerasWornThisWeek,
    pantalonesWornThisWeek,
  };
}
