import React, { useState } from 'react';
import { Plus, Search, Filter, Shirt, Sparkles, Check, AlertCircle, Trash2, Edit3, WashingMachine, Calendar } from 'lucide-react';
import { Garment, GarmentCategory, GarmentStatus } from '../types';
import { CATEGORY_LABELS, getGarmentLaundryStatus } from '../utils/clothingUtils';
import { useIPhoneMode } from '../context/IPhoneContext';

interface WardrobeViewProps {
  garments: Garment[];
  onAddGarment: () => void;
  onEditGarment: (garment: Garment) => void;
  onDeleteGarment: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: GarmentStatus) => void;
  onWearToday: (id: string) => void;
  onWashGarment: (id: string) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  garments,
  onAddGarment,
  onEditGarment,
  onDeleteGarment,
  onUpdateStatus,
  onWearToday,
  onWashGarment,
}) => {
  const { isIPhoneFrame } = useIPhoneMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredGarments = garments.filter((garment) => {
    const matchesSearch =
      garment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garment.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (garment.material && garment.material.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || garment.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || garment.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Object.keys(CATEGORY_LABELS) as GarmentCategory[];

  return (
    <div className="space-y-3.5">
      {/* Top action bar: Search & Filters */}
      <div className="liquid-glass-card rounded-[1.8rem] p-3 sm:p-4 border border-white/80 shadow-xs flex flex-col gap-2.5">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-buscar-ropa"
            type="text"
            placeholder="Buscar por prenda, color o tela..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white/90 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status quick toggle - iOS Segmented Bar */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-full overflow-x-auto no-scrollbar text-[11px] font-medium">
          <button
            id="filtro-status-todos"
            onClick={() => setSelectedStatus('all')}
            className={`flex-1 py-1.5 px-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-center ${
              selectedStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({garments.length})
          </button>
          <button
            id="filtro-status-limpias"
            onClick={() => setSelectedStatus('clean')}
            className={`flex-1 py-1.5 px-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-center ${
              selectedStatus === 'clean'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Limpias ({garments.filter((g) => g.status === 'clean').length})
          </button>
          <button
            id="filtro-status-en-uso"
            onClick={() => setSelectedStatus('in_use')}
            className={`flex-1 py-1.5 px-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-center ${
              selectedStatus === 'in_use'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Uso ({garments.filter((g) => g.status === 'in_use').length})
          </button>
          <button
            id="filtro-status-lavado"
            onClick={() => setSelectedStatus('laundry')}
            className={`flex-1 py-1.5 px-2 rounded-full transition-all cursor-pointer whitespace-nowrap text-center ${
              selectedStatus === 'laundry'
                ? 'bg-rose-500 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lavado ({garments.filter((g) => g.status === 'laundry').length})
          </button>
        </div>
      </div>

      {/* Categories chips bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          id="cat-todas"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'liquid-glass-pill text-slate-700 hover:bg-white'
          }`}
        >
          Todas
        </button>
        {categories.map((catKey) => {
          const count = garments.filter((g) => g.category === catKey).length;
          return (
            <button
              key={catKey}
              id={`cat-${catKey}`}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === catKey
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'liquid-glass-pill text-slate-700 hover:bg-white'
              }`}
            >
              <span>{CATEGORY_LABELS[catKey].singular}</span>
              <span className="opacity-60 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Garment Cards */}
      {filteredGarments.length === 0 ? (
        <div className="text-center py-12 liquid-glass-card rounded-[2rem] border border-white/80 p-6">
          <Shirt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No se encontraron prendas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Prueba ajustando los filtros o añade una nueva prenda a tu armario.
          </p>
          <button
            onClick={onAddGarment}
            className="mt-3.5 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            Añadir prenda ahora
          </button>
        </div>
      ) : (
        <div className={isIPhoneFrame ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
          {filteredGarments.map((garment) => {
            const laundryAlert = getGarmentLaundryStatus(garment);
            const wearPercentage = Math.min(
              100,
              Math.round((garment.totalWearsSinceWash / garment.maxWearsBeforeWash) * 100)
            );

            return (
              <div
                key={garment.id}
                id={`garment-card-${garment.id}`}
                className={`liquid-glass-card rounded-[1.7rem] border p-3.5 shadow-xs transition-all flex flex-col justify-between hover:shadow-md ${
                  garment.status === 'laundry'
                    ? 'border-rose-300 bg-rose-50/30'
                    : laundryAlert?.urgency === 'high'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-white/80'
                }`}
              >
                <div>
                  {/* Card top: Color swatch & status badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: garment.colorHex || '#94a3b8' }}
                        title={garment.color}
                      />
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                        {garment.color}
                      </span>
                    </div>

                    {/* Status badge */}
                    {garment.status === 'clean' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Limpia en Armario
                      </span>
                    )}
                    {garment.status === 'in_use' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        En Uso
                      </span>
                    )}
                    {garment.status === 'laundry' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <WashingMachine className="w-3 h-3 text-rose-600" />
                        En el Lavado
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                    {garment.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">
                      {CATEGORY_LABELS[garment.category]?.singular}
                    </span>
                    {garment.material && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 truncate">{garment.material}</span>
                      </>
                    )}
                  </div>

                  {/* Wear trackers: Worn this week & wear limit meter */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    {/* Times worn this week */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Usos esta semana:</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {garment.timesWornThisWeek} {garment.timesWornThisWeek === 1 ? 'vez' : 'veces'}
                      </span>
                    </div>

                    {/* Progress to laundry */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Desde último lavado:</span>
                        <span
                          className={`font-semibold ${
                            garment.totalWearsSinceWash >= garment.maxWearsBeforeWash
                              ? 'text-rose-600'
                              : garment.totalWearsSinceWash === garment.maxWearsBeforeWash - 1
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {garment.totalWearsSinceWash} / {garment.maxWearsBeforeWash} usos
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            garment.totalWearsSinceWash >= garment.maxWearsBeforeWash
                              ? 'bg-rose-500'
                              : garment.totalWearsSinceWash === garment.maxWearsBeforeWash - 1
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${wearPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Alert note if approaching or exceeded limit */}
                    {laundryAlert && garment.status !== 'laundry' && (
                      <div
                        className={`p-2 rounded-lg text-[11px] flex items-start gap-1.5 ${
                          laundryAlert.urgency === 'high'
                            ? 'bg-rose-50 text-rose-800 border border-rose-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-100'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{laundryAlert.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {/* Use Today Button */}
                    <button
                      id={`btn-usar-hoy-${garment.id}`}
                      onClick={() => onWearToday(garment.id)}
                      title="Marcar como usada hoy (+1 uso semanal y acumulado)"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs font-medium flex items-center gap-1"
                    >
                      <Shirt className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Usar hoy</span>
                    </button>

                    {/* Toggle Laundry */}
                    {garment.status === 'laundry' ? (
                      <button
                        id={`btn-lavar-${garment.id}`}
                        onClick={() => onWashGarment(garment.id)}
                        title="Marcar como limpia (reiniciar contador de lavado)"
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Lavar</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-tirar-lavado-${garment.id}`}
                        onClick={() => onUpdateStatus(garment.id, 'laundry')}
                        title="Tirar al cesto de lavado"
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer text-xs font-medium flex items-center gap-1"
                      >
                        <WashingMachine className="w-3 h-3" />
                        <span>Al lavado</span>
                      </button>
                    )}
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-0.5">
                    <button
                      id={`btn-editar-${garment.id}`}
                      onClick={() => onEditGarment(garment)}
                      title="Editar prenda"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-eliminar-${garment.id}`}
                      onClick={() => onDeleteGarment(garment.id)}
                      title="Eliminar prenda"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
