import React, { useState, useEffect } from 'react';
import { X, Check, Shirt, Sparkles } from 'lucide-react';
import { Garment, GarmentCategory, GarmentStatus, WeatherCondition, StylePreference } from '../types';
import { CATEGORY_LABELS, WEATHER_LABELS, STYLE_LABELS } from '../utils/clothingUtils';

interface GarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (garment: Garment) => void;
  initialGarment?: Garment | null;
}

const COLOR_PRESETS = [
  { name: 'Negro', hex: '#18181b' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Gris Carbón', hex: '#334155' },
  { name: 'Gris Claro', hex: '#94a3b8' },
  { name: 'Azul Marino', hex: '#1e3a8a' },
  { name: 'Azul Denim', hex: '#2563eb' },
  { name: 'Celeste', hex: '#93c5fd' },
  { name: 'Beige Arena', hex: '#d6c7b2' },
  { name: 'Marrón Café', hex: '#78350f' },
  { name: 'Verde Oliva', hex: '#3f4f3c' },
  { name: 'Verde Salvia', hex: '#4ade80' },
  { name: 'Terracota', hex: '#c2410c' },
  { name: 'Rojo Vino', hex: '#991b1b' },
];

const DEFAULT_MAX_WEARS: Record<GarmentCategory, number> = {
  polera: 2,
  camisa: 2,
  pantalon: 4,
  jeans: 5,
  short_falda: 3,
  abrigo_chaqueta: 7,
  calzado: 14,
  accesorio: 99,
};

export const GarmentModal: React.FC<GarmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGarment,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('polera');
  const [color, setColor] = useState('Negro');
  const [colorHex, setColorHex] = useState('#18181b');
  const [status, setStatus] = useState<GarmentStatus>('clean');
  const [maxWears, setMaxWears] = useState<number>(2);
  const [material, setMaterial] = useState('');
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition[]>([
    'soleado_calor',
    'templado',
  ]);
  const [selectedStyles, setSelectedStyles] = useState<StylePreference[]>(['casual']);

  useEffect(() => {
    if (initialGarment) {
      setName(initialGarment.name);
      setCategory(initialGarment.category);
      setColor(initialGarment.color);
      setColorHex(initialGarment.colorHex || '#18181b');
      setStatus(initialGarment.status);
      setMaxWears(initialGarment.maxWearsBeforeWash);
      setMaterial(initialGarment.material || '');
      setSelectedWeather(initialGarment.suitableWeather || ['templado']);
      setSelectedStyles(initialGarment.styles || ['casual']);
    } else {
      setName('');
      setCategory('polera');
      setColor('Negro');
      setColorHex('#18181b');
      setStatus('clean');
      setMaxWears(2);
      setMaterial('');
      setSelectedWeather(['soleado_calor', 'templado']);
      setSelectedStyles(['casual']);
    }
  }, [initialGarment, isOpen]);

  const handleCategoryChange = (newCat: GarmentCategory) => {
    setCategory(newCat);
    if (!initialGarment) {
      setMaxWears(DEFAULT_MAX_WEARS[newCat]);
    }
  };

  const handleToggleWeather = (w: WeatherCondition) => {
    if (selectedWeather.includes(w)) {
      if (selectedWeather.length > 1) {
        setSelectedWeather(selectedWeather.filter((item) => item !== w));
      }
    } else {
      setSelectedWeather([...selectedWeather, w]);
    }
  };

  const handleToggleStyle = (s: StylePreference) => {
    if (selectedStyles.includes(s)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((item) => item !== s));
      }
    } else {
      setSelectedStyles([...selectedStyles, s]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const garmentData: Garment = {
      id: initialGarment?.id || `garment-${Date.now()}`,
      name: name.trim(),
      category,
      color,
      colorHex,
      status,
      timesWornThisWeek: initialGarment?.timesWornThisWeek || 0,
      totalWearsSinceWash: initialGarment?.totalWearsSinceWash || 0,
      maxWearsBeforeWash: Number(maxWears) || 2,
      suitableWeather: selectedWeather,
      styles: selectedStyles,
      material: material.trim() || undefined,
      lastWornDate: initialGarment?.lastWornDate,
    };

    onSave(garmentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="liquid-glass-card rounded-[2.2rem] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80 text-slate-900">
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialGarment ? 'Editar Prenda' : 'Añadir al Armario'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Detalles, categoría y límite antes de lavar
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la prenda *
            </label>
            <input
              id="input-modal-nombre"
              type="text"
              required
              placeholder="Ej: Polera Básica Cuello V, Jeans Oscuros Slim..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white/90 border border-slate-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-2xs"
            />
          </div>

          {/* 2. Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categoría
            </label>
            <select
              id="select-modal-categoria"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as GarmentCategory)}
              className="w-full px-3.5 py-2.5 text-sm bg-white/90 border border-slate-300/80 rounded-xl focus:outline-none font-medium cursor-pointer shadow-2xs"
            >
              {(Object.keys(CATEGORY_LABELS) as GarmentCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat].label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Color y Paleta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Color principal
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setColor(p.name);
                    setColorHex(p.hex);
                  }}
                  className={`w-6 h-6 rounded-full border shrink-0 transition-transform cursor-pointer relative ${
                    colorHex === p.hex ? 'scale-125 ring-2 ring-slate-900 border-white' : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Nombre del color"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-8 p-0 border border-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Estado Inicial & Límite de Usos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado inicial
              </label>
              <select
                id="select-modal-estado"
                value={status}
                onChange={(e) => setStatus(e.target.value as GarmentStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              >
                <option value="clean">Limpia en el armario</option>
                <option value="in_use">En uso</option>
                <option value="laundry">Tirada al cesto de lavado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usos antes de lavar recomendados
              </label>
              <input
                id="input-modal-max-usos"
                type="number"
                min="1"
                max="30"
                value={maxWears}
                onChange={(e) => setMaxWears(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* 5. Material */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Material o tela (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: 100% Algodón, Denim, Lino, Lana..."
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {/* 6. Climas Apto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Clima adecuado
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(WEATHER_LABELS) as WeatherCondition[]).map((w) => {
                const isSelected = selectedWeather.includes(w);
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleToggleWeather(w)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {WEATHER_LABELS[w].label.split('/')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Estilos */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Estilos afines
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(STYLE_LABELS) as StylePreference[]).map((s) => {
                const isSelected = selectedStyles.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleToggleStyle(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {STYLE_LABELS[s].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-prenda-modal"
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialGarment ? 'Guardar Cambios' : 'Añadir al Armario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
