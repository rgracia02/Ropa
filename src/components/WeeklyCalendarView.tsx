import React, { useState } from 'react';
import { Calendar, Sparkles, RefreshCw, CheckCircle, Shirt, Sun, CloudSun, Wind, Snowflake, CloudRain, Briefcase, Crown, Coffee, AlertTriangle } from 'lucide-react';
import { DaySchedule, Garment, Outfit, Occasion, WeatherCondition } from '../types';
import { WEATHER_LABELS, OCCASION_LABELS, CATEGORY_LABELS } from '../utils/clothingUtils';
import { useIPhoneMode } from '../context/IPhoneContext';

interface WeeklyCalendarViewProps {
  weekSchedule: DaySchedule[];
  garments: Garment[];
  onUpdateDaySchedule: (updatedSchedule: DaySchedule[]) => void;
  onMarkDayAsWorn: (dayId: string) => void;
  onOpenCombinerForDay: (dayId: string) => void;
}

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  weekSchedule,
  garments,
  onUpdateDaySchedule,
  onMarkDayAsWorn,
  onOpenCombinerForDay,
}) => {
  const { isIPhoneFrame } = useIPhoneMode();
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [activeDayModal, setActiveDayModal] = useState<DaySchedule | null>(null);
  const [calendarNotice, setCalendarNotice] = useState<string>('');

  const findGarment = (id?: string) => garments.find((g) => g.id === id);

  const handleAutoGenerateWeek = async () => {
    if (garments.length === 0) {
      setCalendarNotice('Tu armario está vacío. Añade algunas prendas en la pestaña "Armario" antes de autogenerar la semana.');
      setTimeout(() => setCalendarNotice(''), 5000);
      return;
    }

    setCalendarNotice('');
    setIsAutoGenerating(true);
    try {
      const availableGarments = garments.filter((g) => g.status !== 'laundry');
      const response = await fetch('/api/stylist/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableGarments,
          daysPlan: weekSchedule.map((d) => ({
            dayId: d.dayId,
            dayName: d.dayName,
            weather: d.weather,
            temp: d.temp,
            occasion: d.occasion,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al generar la semana');
      }

      const data = await response.json();
      if (data.weekSuggestions && Array.isArray(data.weekSuggestions)) {
        const newSchedule = weekSchedule.map((day) => {
          const suggestion = data.weekSuggestions.find((s: any) => s.dayId === day.dayId);
          if (suggestion) {
            const outfit: Outfit = {
              id: `outfit-${day.dayId}-${Date.now()}`,
              title: suggestion.title || `Look de ${day.dayName}`,
              occasion: day.occasion,
              weather: day.weather,
              style: 'casual',
              topId: suggestion.topId,
              bottomId: suggestion.bottomId,
              outerwearId: suggestion.outerwearId,
              shoesId: suggestion.shoesId,
              stylistTip: suggestion.stylistTip,
            };
            return {
              ...day,
              outfit,
            };
          }
          return day;
        });

        onUpdateDaySchedule(newSchedule);
      }
    } catch (err) {
      console.warn('Auto-generating week using local rotation engine:', err);
      // Local fallback rotation
      const tops = garments.filter((g) => ['polera', 'camisa'].includes(g.category) && g.status !== 'laundry');
      const bottoms = garments.filter((g) => ['pantalon', 'jeans', 'short_falda'].includes(g.category) && g.status !== 'laundry');
      const outers = garments.filter((g) => g.category === 'abrigo_chaqueta');
      const shoes = garments.filter((g) => g.category === 'calzado');

      const newSchedule = weekSchedule.map((day, idx) => {
        const top = tops[idx % tops.length] || garments[0];
        const bottom = bottoms[idx % bottoms.length] || garments[1 % garments.length];
        const needsOuter = ['frio_invierno', 'fresco_viento', 'lluvioso'].includes(day.weather) || day.temp < 18;
        const outer = needsOuter && outers.length > 0 ? outers[idx % outers.length] : undefined;
        const shoe = shoes.length > 0 ? shoes[idx % shoes.length] : undefined;

        return {
          ...day,
          outfit: {
            id: `outfit-${day.dayId}-${Date.now()}`,
            title: `Estilo ${OCCASION_LABELS[day.occasion].label} (${day.dayName})`,
            occasion: day.occasion,
            weather: day.weather,
            style: 'casual' as const,
            topId: top?.id,
            bottomId: bottom?.id,
            outerwearId: outer?.id,
            shoesId: shoe?.id,
            stylistTip: `Combinación rotativa para el ${day.dayName}, manteniendo frescura y estilo.`,
          },
        };
      });

      onUpdateDaySchedule(newSchedule);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleDayOccasionChange = (dayId: string, newOccasion: Occasion) => {
    const updated = weekSchedule.map((d) => (d.dayId === dayId ? { ...d, occasion: newOccasion } : d));
    onUpdateDaySchedule(updated);
  };

  const handleDayWeatherChange = (dayId: string, newWeather: WeatherCondition) => {
    const defaultTemp = WEATHER_LABELS[newWeather].defaultTemp;
    const updated = weekSchedule.map((d) =>
      d.dayId === dayId ? { ...d, weather: newWeather, temp: defaultTemp } : d
    );
    onUpdateDaySchedule(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Planner button */}
      <div className="liquid-glass-card rounded-[2rem] border border-white/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Calendario Visual Semanal
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
              Lun - Dom
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Sugerencias diarias adaptadas a la ocasión y pronóstico del clima. Marca el conjunto cuando te lo pongas para registrar tus usos semanales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-planificar-semana-ia"
            onClick={handleAutoGenerateWeek}
            disabled={isAutoGenerating}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            {isAutoGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Generando sugerencias con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Planificar semana con Stylist IA</span>
              </>
            )}
          </button>
        </div>

        {calendarNotice && (
          <div className="bg-amber-50 border border-amber-300/80 p-3 rounded-2xl text-xs text-amber-900 flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{calendarNotice}</span>
          </div>
        )}
      </div>

      {/* Visual Weekly Grid */}
      <div className={isIPhoneFrame ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3"}>
        {weekSchedule.map((day) => {
          const outfit = day.outfit;
          const topGarment = findGarment(outfit?.topId);
          const bottomGarment = findGarment(outfit?.bottomId);
          const outerGarment = findGarment(outfit?.outerwearId);
          const shoesGarment = findGarment(outfit?.shoesId);

          // Check if any of the assigned garments is in laundry
          const hasItemInLaundry = [topGarment, bottomGarment, outerGarment, shoesGarment].some(
            (g) => g && g.status === 'laundry'
          );

          return (
            <div
              key={day.dayId}
              id={`day-card-${day.dayId}`}
              className={`liquid-glass-card rounded-[1.8rem] border p-3.5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                day.isWorn
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : hasItemInLaundry
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-white/80'
              }`}
            >
              <div>
                {/* Day Header: Name, date & worn status badge */}
                <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-none">
                      {day.dayName}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {day.dateStr}
                    </span>
                  </div>

                  {day.isWorn ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Usado
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Planificado
                    </span>
                  )}
                </div>

                {/* Day Weather & Occasion configuration pills */}
                <div className="py-2.5 space-y-1.5 text-xs">
                  {/* Weather selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                      <span>{WEATHER_LABELS[day.weather].label.split('/')[0]}</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">
                        {day.temp}°C
                      </span>
                    </div>
                  </div>

                  {/* Occasion badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Ocasión:
                    </span>
                    <select
                      id={`select-ocasion-${day.dayId}`}
                      value={day.occasion}
                      onChange={(e) => handleDayOccasionChange(day.dayId, e.target.value as Occasion)}
                      className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none"
                    >
                      {(Object.keys(OCCASION_LABELS) as Occasion[]).map((o) => (
                        <option key={o} value={o}>
                          {OCCASION_LABELS[o].label.split('/')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Warning if garment in laundry */}
                {hasItemInLaundry && (
                  <div className="mb-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-800 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>¡Prenda en el lavado! Cámbiala o lávala.</span>
                  </div>
                )}

                {/* Assigned Outfit Visual Showcase */}
                {outfit ? (
                  <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {outfit.title}
                    </p>

                    <div className="space-y-1.5 text-[11px]">
                      {/* Top */}
                      {topGarment && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: topGarment.colorHex || '#1e293b' }}
                          />
                          <span className="text-slate-700 font-medium truncate">
                            {topGarment.name}
                          </span>
                        </div>
                      )}

                      {/* Bottom */}
                      {bottomGarment && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: bottomGarment.colorHex || '#1e293b' }}
                          />
                          <span className="text-slate-700 font-medium truncate">
                            {bottomGarment.name}
                          </span>
                        </div>
                      )}

                      {/* Outer */}
                      {outerGarment && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: outerGarment.colorHex || '#1e293b' }}
                          />
                          <span className="text-slate-700 font-medium truncate">
                            {outerGarment.name}
                          </span>
                        </div>
                      )}

                      {/* Shoes */}
                      {shoesGarment && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: shoesGarment.colorHex || '#1e293b' }}
                          />
                          <span className="text-slate-700 font-medium truncate">
                            {shoesGarment.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {outfit.stylistTip && (
                      <p className="text-[10px] text-slate-500 italic line-clamp-2 pt-1 border-t border-slate-200/60">
                        "{outfit.stylistTip}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400">Sin outfit asignado</p>
                    <button
                      onClick={() => onOpenCombinerForDay(day.dayId)}
                      className="mt-2 text-[11px] font-semibold text-slate-700 underline hover:text-slate-900 cursor-pointer"
                    >
                      Elegir combinación
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Actions for Day Card */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                {outfit && (
                  <button
                    id={`btn-marcar-usado-${day.dayId}`}
                    onClick={() => onMarkDayAsWorn(day.dayId)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                      day.isWorn
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Shirt className="w-3 h-3" />
                    <span>{day.isWorn ? 'Desmarcar' : 'Usar hoy'}</span>
                  </button>
                )}

                <button
                  id={`btn-combinar-dia-${day.dayId}`}
                  onClick={() => onOpenCombinerForDay(day.dayId)}
                  className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                >
                  {outfit ? 'Cambiar' : '+ Asignar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
