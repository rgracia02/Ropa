import React, { useState } from 'react';
import { Sparkles, Sun, CloudSun, Wind, Snowflake, CloudRain, Briefcase, Crown, Coffee, RefreshCw, Calendar, Check, Shirt, AlertTriangle, Lightbulb } from 'lucide-react';
import { Garment, Occasion, WeatherCondition, StylePreference, Outfit, DaySchedule } from '../types';
import { OCCASION_LABELS, WEATHER_LABELS, STYLE_LABELS, CATEGORY_LABELS } from '../utils/clothingUtils';
import { useIPhoneMode } from '../context/IPhoneContext';

interface OutfitCombinerProps {
  garments: Garment[];
  onAssignToCalendar: (dayId: string, outfit: Outfit) => void;
  onWearOutfitToday: (outfit: Outfit) => void;
  weekSchedule: DaySchedule[];
}

export const OutfitCombiner: React.FC<OutfitCombinerProps> = ({
  garments,
  onAssignToCalendar,
  onWearOutfitToday,
  weekSchedule,
}) => {
  const { isIPhoneFrame } = useIPhoneMode();
  const [occasion, setOccasion] = useState<Occasion>('trabajo');
  const [weather, setWeather] = useState<WeatherCondition>('templado');
  const [temperature, setTemperature] = useState<number>(21);
  const [style, setStyle] = useState<StylePreference>('formal');
  const [userNote, setUserNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<Outfit | null>(null);
  const [stylistSource, setStylistSource] = useState<string>('');
  const [selectedDayToAssign, setSelectedDayToAssign] = useState<string>('lunes');
  const [assignedMessage, setAssignedMessage] = useState<string>('');
  const [wornMessage, setWornMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Available garments (exclude laundry items)
  const availableGarments = garments.filter((g) => g.status !== 'laundry');
  const laundryCount = garments.filter((g) => g.status === 'laundry').length;

  const handleGenerateOutfit = async () => {
    if (availableGarments.length === 0) {
      setErrorMessage(
        garments.length === 0
          ? 'Tu armario está vacío. Ve a la pestaña "Armario" y añade algunas prendas para que el estilista pueda combinarlas.'
          : 'No tienes prendas limpias disponibles. Revisa tu cesto de lavandería para lavarlas.'
      );
      setTimeout(() => setErrorMessage(''), 6000);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAssignedMessage('');
    setWornMessage('');

    try {
      const response = await fetch('/api/stylist/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableGarments,
          occasion,
          weather,
          temp: temperature,
          style,
          userNote: userNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al consultar el servicio de estilista');
      }

      const data = await response.json();
      if (data.outfit) {
        const fullOutfit: Outfit = {
          id: `outfit-${Date.now()}`,
          title: data.outfit.title || 'Combinación Recomendada',
          occasion,
          weather,
          style,
          topId: data.outfit.topId,
          bottomId: data.outfit.bottomId,
          outerwearId: data.outfit.outerwearId,
          shoesId: data.outfit.shoesId,
          accessoryId: data.outfit.accessoryId,
          stylistTip: data.outfit.stylistTip,
          colorHarmony: data.outfit.colorHarmony,
          weatherAdvice: data.outfit.weatherAdvice,
          createdAt: new Date().toISOString(),
        };
        setGeneratedOutfit(fullOutfit);
        setStylistSource(data.source === 'gemini' ? (data.modelUsed ? `Gemini AI (${data.modelUsed})` : 'Gemini AI') : 'Motor Estilista Inteligente');
      }
    } catch (err) {
      console.warn('Using local fallback outfit generator:', err);
      // Fallback local selection
      const tops = availableGarments.filter((g) => ['polera', 'camisa'].includes(g.category));
      const bottoms = availableGarments.filter((g) => ['pantalon', 'jeans', 'short_falda'].includes(g.category));
      const outers = availableGarments.filter((g) => g.category === 'abrigo_chaqueta');
      const shoes = availableGarments.filter((g) => g.category === 'calzado');

      const fallbackTop = tops[0] || availableGarments[0];
      const fallbackBottom = bottoms[0] || availableGarments[1 % availableGarments.length];
      const needsOuter = ['frio_invierno', 'fresco_viento', 'lluvioso'].includes(weather) || temperature < 18;

      setGeneratedOutfit({
        id: `outfit-${Date.now()}`,
        title: `Look ${OCCASION_LABELS[occasion].label}`,
        occasion,
        weather,
        style,
        topId: fallbackTop?.id,
        bottomId: fallbackBottom?.id,
        outerwearId: needsOuter && outers.length > 0 ? outers[0]?.id : undefined,
        shoesId: shoes.length > 0 ? shoes[0]?.id : undefined,
        stylistTip: `Excelente conjunto para ${occasion}. Combina la frescura de ${fallbackTop?.name} con la versatilidad de ${fallbackBottom?.name}.`,
      });
      setStylistSource('Motor de Estilo Local');
    } finally {
      setIsLoading(false);
    }
  };

  const findGarment = (id?: string) => garments.find((g) => g.id === id);

  const handleAssign = () => {
    if (!generatedOutfit) return;
    onAssignToCalendar(selectedDayToAssign, generatedOutfit);
    const dayObj = weekSchedule.find((d) => d.dayId === selectedDayToAssign);
    setAssignedMessage(`¡Outfit asignado con éxito para el ${dayObj?.dayName || selectedDayToAssign}!`);
    setTimeout(() => setAssignedMessage(''), 4000);
  };

  const handleWearNow = () => {
    if (!generatedOutfit) return;
    onWearOutfitToday(generatedOutfit);
    setWornMessage('¡Marcado como usado hoy! Se actualizaron los usos semanales de estas prendas.');
    setTimeout(() => setWornMessage(''), 4000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Intro Liquid Glass Card */}
      <div className="liquid-glass-card rounded-[2rem] p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-800 text-[11px] font-bold mb-1.5 border border-amber-300/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Asesor de Imagen Inteligente</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            Combina tu ropa para salir, trabajar o eventos
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Selecciona la ocasión, clima y estilo. Gemini AI y el motor de estilismo elegirán la mejor combinación de tu ropa limpia disponible.
          </p>
        </div>

        {laundryCount > 0 && (
          <div className="bg-rose-50/80 border border-rose-200/80 p-2.5 rounded-2xl text-xs text-rose-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span><strong>{laundryCount}</strong> prenda(s) en lavado excluidas automáticamente.</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-amber-50 border border-amber-300/80 p-3 rounded-2xl text-xs text-amber-900 flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
      </div>

      <div className={isIPhoneFrame ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"}>
        {/* Left Column: Form Controls */}
        <div className={isIPhoneFrame ? "w-full liquid-glass-card rounded-[2rem] border border-white/80 p-4 shadow-xs space-y-4" : "lg:col-span-5 liquid-glass-card rounded-[2rem] border border-white/80 p-4 sm:p-5 shadow-xs space-y-4"}>
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200/60 pb-2.5 flex items-center gap-2">
            <span>Parámetros del Atuendo</span>
          </h3>

          {/* 1. Ocasión */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Ocasión
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(OCCASION_LABELS) as Occasion[]).map((occ) => {
                const info = OCCASION_LABELS[occ];
                const isSelected = occasion === occ;
                return (
                  <button
                    key={occ}
                    id={`btn-ocasion-${occ}`}
                    type="button"
                    onClick={() => setOccasion(occ)}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-semibold'
                        : 'border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-medium">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Clima y Temperatura */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                2. Clima previsto
              </label>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                {temperature}°C
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {(Object.keys(WEATHER_LABELS) as WeatherCondition[]).map((wKey) => {
                const wInfo = WEATHER_LABELS[wKey];
                const isSelected = weather === wKey;
                return (
                  <button
                    key={wKey}
                    id={`btn-clima-${wKey}`}
                    type="button"
                    onClick={() => {
                      setWeather(wKey);
                      setTemperature(wInfo.defaultTemp);
                    }}
                    className={`p-2 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold ring-1 ring-sky-500'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{wInfo.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Slider de temperatura */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Frío (5°C)</span>
                <span>Templado (20°C)</span>
                <span>Calor (35°C)</span>
              </div>
              <input
                id="slider-temperatura"
                type="range"
                min="5"
                max="35"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Preferencias de Estilo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              3. Preferencia de estilo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(STYLE_LABELS) as StylePreference[]).map((st) => {
                const sInfo = STYLE_LABELS[st];
                const isSelected = style === st;
                return (
                  <button
                    key={st}
                    id={`btn-estilo-${st}`}
                    type="button"
                    onClick={() => setStyle(st)}
                    className={`p-2 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sInfo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Nota opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detalle o petición especial (Opcional)
            </label>
            <input
              id="input-nota-estilo"
              type="text"
              placeholder="Ej: Tengo una cena al aire libre / Quiero algo formal pero fresco..."
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Botón generar */}
          <button
            id="btn-generar-combinacion"
            onClick={handleGenerateOutfit}
            disabled={isLoading || availableGarments.length === 0}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Analizando armario y combinando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generar Combinación Perfecta</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Visual Result Card */}
        <div className={isIPhoneFrame ? "w-full space-y-4" : "lg:col-span-7 space-y-4"}>
          {!generatedOutfit ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Tu outfit personalizado aparecerá aquí
              </h3>
              <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
                Configura la ocasión ({OCCASION_LABELS[occasion].label}), el clima actual ({temperature}°C) y presiona el botón para recibir la recomendación experta de vestuario.
              </p>
              <button
                onClick={handleGenerateOutfit}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Generar ahora
              </button>
            </div>
          ) : (
            <div className="liquid-glass-card rounded-[2rem] border border-white/80 p-4 sm:p-6 shadow-sm space-y-4">
              {/* Header of the Outfit Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-slate-800 uppercase tracking-wide border border-white/70">
                      {OCCASION_LABELS[generatedOutfit.occasion].label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                      {WEATHER_LABELS[generatedOutfit.weather].label} • {temperature}°C
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {generatedOutfit.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-regenerar-outfit"
                    onClick={handleGenerateOutfit}
                    disabled={isLoading}
                    title="Generar otra alternativa"
                    className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs border border-white/70"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Otra opción</span>
                  </button>
                </div>
              </div>

              {/* Garments Visual Showcase */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Prendas del conjunto
                </h4>
                <div className={isIPhoneFrame ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                  {/* Prenda Superior */}
                  {(() => {
                    const top = findGarment(generatedOutfit.topId);
                    if (!top) return null;
                    return (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-xl shrink-0 border border-black/10 shadow-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: top.colorHex || '#1e293b' }}
                        >
                          <Shirt className="w-4 h-4 opacity-80" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Parte Superior ({CATEGORY_LABELS[top.category].singular})
                          </span>
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {top.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Color: {top.color} • {top.timesWornThisWeek} usos esta semana
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Prenda Inferior */}
                  {(() => {
                    const bottom = findGarment(generatedOutfit.bottomId);
                    if (!bottom) return null;
                    return (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-xl shrink-0 border border-black/10 shadow-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: bottom.colorHex || '#1e293b' }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Parte Inferior ({CATEGORY_LABELS[bottom.category].singular})
                          </span>
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {bottom.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Color: {bottom.color} • {bottom.timesWornThisWeek} usos esta semana
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Abrigo / Chaqueta (si aplica) */}
                  {(() => {
                    const outer = findGarment(generatedOutfit.outerwearId);
                    if (!outer) return null;
                    return (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-xl shrink-0 border border-black/10 shadow-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: outer.colorHex || '#1e293b' }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Capa Exterior / Abrigo
                          </span>
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {outer.name}
                          </p>
                          <p className="text-[11px] text-slate-500">Color: {outer.color}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Calzado */}
                  {(() => {
                    const shoe = findGarment(generatedOutfit.shoesId);
                    if (!shoe) return null;
                    return (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-xl shrink-0 border border-black/10 shadow-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: shoe.colorHex || '#1e293b' }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Calzado
                          </span>
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {shoe.name}
                          </p>
                          <p className="text-[11px] text-slate-500">Color: {shoe.color}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Stylist Expert Advice */}
              {generatedOutfit.stylistTip && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Consejo de Estilista {stylistSource ? `(${stylistSource})` : ''}</span>
                  </div>
                  <p className="leading-relaxed">{generatedOutfit.stylistTip}</p>
                  {generatedOutfit.colorHarmony && (
                    <p className="text-[11px] text-amber-800/90 font-medium">
                      🎨 <strong>Armonía de color:</strong> {generatedOutfit.colorHarmony}
                    </p>
                  )}
                  {generatedOutfit.weatherAdvice && (
                    <p className="text-[11px] text-amber-800/90 font-medium">
                      🌦️ <strong>Adecuación climática:</strong> {generatedOutfit.weatherAdvice}
                    </p>
                  )}
                </div>
              )}

              {/* Success banners for actions */}
              {assignedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{assignedMessage}</span>
                </div>
              )}

              {wornMessage && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-600" />
                  <span>{wornMessage}</span>
                </div>
              )}

              {/* Bottom Actions: Wear today or Assign to Calendar */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Wear today button */}
                <button
                  id="btn-usar-outfit-hoy"
                  onClick={handleWearNow}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shirt className="w-4 h-4 text-amber-400" />
                  <span>Marcar como usado hoy</span>
                </button>

                {/* Assign to Day in Calendar */}
                <div className="flex items-center gap-2">
                  <select
                    id="select-dia-calendario"
                    value={selectedDayToAssign}
                    onChange={(e) => setSelectedDayToAssign(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium cursor-pointer"
                  >
                    {weekSchedule.map((d) => (
                      <option key={d.dayId} value={d.dayId}>
                        {d.dayName} ({d.dateStr})
                      </option>
                    ))}
                  </select>

                  <button
                    id="btn-asignar-calendario"
                    onClick={handleAssign}
                    className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Asignar a día</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
