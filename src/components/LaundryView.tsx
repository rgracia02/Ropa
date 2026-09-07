import React from 'react';
import { WashingMachine, AlertTriangle, CheckCircle2, Shirt, TrendingUp, Info, Plus, Minus, ArrowRight } from 'lucide-react';
import { Garment } from '../types';
import { calculateWardrobeStats, CATEGORY_LABELS, getGarmentLaundryStatus } from '../utils/clothingUtils';
import { useIPhoneMode } from '../context/IPhoneContext';

interface LaundryViewProps {
  garments: Garment[];
  onWashGarment: (id: string) => void;
  onWashAllLaundry: () => void;
  onMoveToLaundry: (id: string) => void;
  onAdjustWears: (id: string, delta: number) => void;
  onResetWeeklyWears: () => void;
}

export const LaundryView: React.FC<LaundryViewProps> = ({
  garments,
  onWashGarment,
  onWashAllLaundry,
  onMoveToLaundry,
  onAdjustWears,
  onResetWeeklyWears,
}) => {
  const { isIPhoneFrame } = useIPhoneMode();
  const stats = calculateWardrobeStats(garments);

  // Garments in the laundry basket
  const laundryItems = garments.filter((g) => g.status === 'laundry');

  // Garments needing wash (reached or exceeded max wears but not yet marked as laundry)
  const needingWashItems = garments.filter(
    (g) => g.status !== 'laundry' && g.totalWearsSinceWash >= g.maxWearsBeforeWash
  );

  // Garments approaching limit (1 wear remaining)
  const approachingWashItems = garments.filter(
    (g) =>
      g.status !== 'laundry' &&
      g.totalWearsSinceWash === g.maxWearsBeforeWash - 1 &&
      g.totalWearsSinceWash > 0
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top 4 Metrics Summary Cards - iOS Health Widget Style */}
      <div className={isIPhoneFrame ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"}>
        {/* Metric 1: Poleras Worn This Week */}
        <div className="liquid-glass-card rounded-[1.8rem] border border-white/80 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Poleras
            </span>
            <div className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-700 flex items-center justify-center shrink-0">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {stats.polerasWornThisWeek} <span className="text-xs font-normal text-slate-500">usos</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Esta semana</p>
          </div>
        </div>

        {/* Metric 2: Pantalones Worn This Week */}
        <div className="liquid-glass-card rounded-[1.8rem] border border-white/80 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pantalones
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {stats.pantalonesWornThisWeek} <span className="text-xs font-normal text-slate-500">usos</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Esta semana</p>
          </div>
        </div>

        {/* Metric 3: Laundry Basket */}
        <div className="liquid-glass-card rounded-[1.8rem] border border-white/80 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              En Lavado
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                laundryItems.length > 0
                  ? 'bg-rose-500/15 text-rose-700'
                  : 'bg-slate-500/10 text-slate-500'
              }`}
            >
              <WashingMachine className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {laundryItems.length} <span className="text-xs font-normal text-slate-500">prendas</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">En el cesto</p>
          </div>
        </div>

        {/* Metric 4: Urgent Laundry Alert */}
        <div className="liquid-glass-card rounded-[1.8rem] border border-white/80 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Alerta Lavado
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                needingWashItems.length > 0
                  ? 'bg-amber-500/20 text-amber-700'
                  : 'bg-emerald-500/15 text-emerald-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {needingWashItems.length} <span className="text-xs font-normal text-slate-500">prendas</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Límite de usos</p>
          </div>
        </div>
      </div>

      {/* Section 1: In Laundry Basket (Prendas tiradas al lavado) */}
      <div className="liquid-glass-card rounded-[2rem] border border-white/80 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-700 flex items-center justify-center">
              <WashingMachine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cesto de Lavado ({laundryItems.length} prendas)
              </h3>
              <p className="text-[11px] text-slate-500">
                Prendas retiradas del armario pendientes de colada.
              </p>
            </div>
          </div>

          {laundryItems.length > 0 && (
            <button
              id="btn-lavar-toda-la-colada"
              onClick={onWashAllLaundry}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hacer Colada (Lavar todas)</span>
            </button>
          )}
        </div>

        {laundryItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            ¡El cesto de lavado está vacío! Toda tu ropa está limpia en el armario o en uso.
          </div>
        ) : (
          <div className={isIPhoneFrame ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
            {laundryItems.map((item) => (
              <div
                key={item.id}
                id={`laundry-item-${item.id}`}
                className="p-3 rounded-2xl border border-rose-200/80 bg-rose-50/40 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: item.colorHex || '#94a3b8' }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {CATEGORY_LABELS[item.category].singular} • {item.color}
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-lavar-prenda-${item.id}`}
                  onClick={() => onWashGarment(item.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-95 shadow-2xs whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lavada</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Alerts - Prendas que necesitan limpieza pronto */}
      {(needingWashItems.length > 0 || approachingWashItems.length > 0) && (
        <div className="liquid-glass-card rounded-[2rem] border border-amber-300/80 bg-amber-50/50 p-3.5 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 border-b border-amber-200/80 pb-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-amber-950 truncate">
                Aviso: Prendas que necesitan limpieza pronto
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-800 leading-tight">
                Superaron o están a punto de agotar los usos recomendados de higiene antes de lavarse.
              </p>
            </div>
          </div>

          {/* Clean Vertical Stack: Prevents squishing and overlapping cards */}
          <div className="flex flex-col gap-2">
            {needingWashItems.map((item) => (
              <div
                key={item.id}
                id={`alert-needing-wash-${item.id}`}
                className="p-2.5 sm:p-3 rounded-2xl border border-rose-200/90 bg-white/95 shadow-2xs flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: item.colorHex || '#94a3b8' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </span>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200/60 whitespace-nowrap">
                        {item.totalWearsSinceWash}/{item.maxWearsBeforeWash} usos
                      </span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                      ⚠️ Límite de higiene alcanzado
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-tirar-a-lavar-alerta-${item.id}`}
                  onClick={() => onMoveToLaundry(item.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition cursor-pointer shrink-0 flex items-center gap-1 shadow-xs active:scale-95 whitespace-nowrap"
                >
                  <WashingMachine className="w-3.5 h-3.5" />
                  <span>Tirar al lavado</span>
                </button>
              </div>
            ))}

            {approachingWashItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 sm:p-3 rounded-2xl border border-amber-200/90 bg-white/95 shadow-2xs flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: item.colorHex || '#94a3b8' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </span>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200/60 whitespace-nowrap">
                        {item.totalWearsSinceWash}/{item.maxWearsBeforeWash} usos
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                      🔔 Queda 1 uso restante
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onMoveToLaundry(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition cursor-pointer shrink-0 active:scale-95 shadow-xs whitespace-nowrap"
                >
                  Al lavado
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Full Wardrobe Weekly Wear Breakdown Table */}
      <div className="liquid-glass-card rounded-[2rem] border border-white/80 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Control Detallado de Usos Semanales
            </h3>
            <p className="text-[11px] text-slate-500">
              Registra cuántas veces te pusiste cada polera, pantalón o abrigo en la semana.
            </p>
          </div>

          <button
            id="btn-reiniciar-semana"
            onClick={onResetWeeklyWears}
            title="Poner a 0 el contador de usos semanales al iniciar una nueva semana"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer self-start sm:self-auto"
          >
            Reiniciar contador semanal
          </button>
        </div>

        {/* View Mode: In iPhone shell, always render iOS List View */}
        {isIPhoneFrame ? (
          <div className="divide-y divide-slate-100/80">
            {garments.map((garment) => (
              <div key={garment.id} className="py-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-2xs"
                      style={{ backgroundColor: garment.colorHex || '#94a3b8' }}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-xs block truncate">{garment.name}</span>
                      <span className="text-[10px] text-slate-500">{CATEGORY_LABELS[garment.category].singular}</span>
                    </div>
                  </div>

                  <div>
                    {garment.status === 'laundry' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
                        En lavado
                      </span>
                    )}
                    {garment.status === 'in_use' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                        En uso
                      </span>
                    )}
                    {garment.status === 'clean' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Limpia
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-white/70 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[10px]">Semana:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                      {garment.timesWornThisWeek} {garment.timesWornThisWeek === 1 ? 'uso' : 'usos'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold ${
                      garment.totalWearsSinceWash >= garment.maxWearsBeforeWash ? 'text-rose-600 font-bold' : 'text-slate-600'
                    }`}>
                      {garment.totalWearsSinceWash}/{garment.maxWearsBeforeWash} puestas
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onAdjustWears(garment.id, -1)}
                        title="Restar un uso"
                        className="w-5.5 h-5.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onAdjustWears(garment.id, 1)}
                        title="Sumar un uso"
                        className="w-5.5 h-5.5 rounded-md bg-slate-900 text-white flex items-center justify-center cursor-pointer active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5 px-3">Prenda</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-center">Usos esta semana</th>
                <th className="py-2.5 px-3 text-center">Desde último lavado</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Ajuste rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {garments.map((garment) => {
                const laundryAlert = getGarmentLaundryStatus(garment);
                return (
                  <tr key={garment.id} className="hover:bg-slate-50/80 transition">
                    {/* Prenda & Color */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: garment.colorHex || '#94a3b8' }}
                        />
                        <span className="font-semibold text-slate-900">{garment.name}</span>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-3 text-slate-600">
                      {CATEGORY_LABELS[garment.category].singular}
                    </td>

                    {/* Usos esta semana */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {garment.timesWornThisWeek} {garment.timesWornThisWeek === 1 ? 'vez' : 'veces'}
                      </span>
                    </td>

                    {/* Desde último lavado */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-semibold ${
                          garment.totalWearsSinceWash >= garment.maxWearsBeforeWash
                            ? 'text-rose-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {garment.totalWearsSinceWash} / {garment.maxWearsBeforeWash}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3">
                      {garment.status === 'laundry' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          En lavado
                        </span>
                      )}
                      {garment.status === 'in_use' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          En uso
                        </span>
                      )}
                      {garment.status === 'clean' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Limpia
                        </span>
                      )}
                    </td>

                    {/* Ajuste rápido */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onAdjustWears(garment.id, -1)}
                          title="Restar un uso"
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onAdjustWears(garment.id, 1)}
                          title="Sumar un uso"
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>

      {/* Section 4: Care Guide */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-sm text-white">
            Guía de Cuidado Textil y Frecuencia de Lavado Recomendada
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Lavar la ropa solo cuando es necesario alarga hasta 3 veces la vida útil de las fibras y ahorra agua y energía:
          </p>
          <div className={isIPhoneFrame ? "grid grid-cols-1 gap-2 pt-1 text-slate-300" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-slate-300"}>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-amber-300 block">Poleras & Camisetas</span>
              1 a 2 usos (contacto directo con transpiración).
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-amber-300 block">Camisas & Blusas</span>
              1 a 2 usos (si se usa camiseta interior, hasta 3).
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-amber-300 block">Pantalones Chinos</span>
              3 a 4 usos antes de necesitar colada.
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-amber-300 block">Jeans & Chaquetas</span>
              4 a 8 usos (el denim no requiere lavados frecuentes).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
