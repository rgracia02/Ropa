import React, { useState, useEffect } from 'react';
import { Shirt, Sparkles, WashingMachine, Sun, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Garment } from '../types';

interface DynamicIslandProps {
  garments: Garment[];
  onNavigateToLaundry: () => void;
  onNavigateToStylist: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  garments,
  onNavigateToLaundry,
  onNavigateToStylist,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    update();
    const interval = setInterval(update, 15000);
    return () => clearInterval(interval);
  }, []);

  const laundryCount = garments.filter((g) => g.status === 'laundry').length;
  const needingWashCount = garments.filter(
    (g) => g.status !== 'laundry' && g.totalWearsSinceWash >= g.maxWearsBeforeWash
  ).length;

  return (
    <div className="w-full flex justify-center py-2 relative z-30 select-none">
      <div
        id="dynamic-island"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-black text-white rounded-full transition-all duration-300 ease-out shadow-lg flex items-center justify-between cursor-pointer border border-white/10 ${
          isExpanded
            ? 'w-[94%] max-w-sm px-4 py-2.5 rounded-[1.75rem]'
            : 'w-32 h-7 px-2.5'
        }`}
      >
        {!isExpanded ? (
          // Compact Dynamic Island
          <div className="w-full flex items-center justify-between text-[11px] font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-sky-400" />
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">Armario</span>
            </div>

            {/* Camera dot & sensor simulation */}
            <div className="flex items-center gap-1">
              {laundryCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            </div>
          </div>
        ) : (
          // Expanded Dynamic Island
          <div className="w-full flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-tight truncate">
                  Asistente de Armario
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {laundryCount > 0
                    ? `${laundryCount} prenda(s) en lavadora`
                    : `${garments.length} prendas listas`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {laundryCount > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToLaundry();
                  }}
                  className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition"
                >
                  Ver colada
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToStylist();
                  }}
                  className="px-2.5 py-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition flex items-center gap-1"
                >
                  <Shirt className="w-3 h-3" />
                  <span>Outfits</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
