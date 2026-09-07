import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WardrobeView } from './components/WardrobeView';
import { OutfitCombiner } from './components/OutfitCombiner';
import { WeeklyCalendarView } from './components/WeeklyCalendarView';
import { LaundryView } from './components/LaundryView';
import { GarmentModal } from './components/GarmentModal';
import { IPhoneShell } from './components/IPhoneShell';
import { GitHubModal } from './components/GitHubModal';
import { Garment, DaySchedule, Outfit, GarmentStatus } from './types';
import { INITIAL_GARMENTS, INITIAL_WEEK_SCHEDULE } from './data/initialData';

const GARMENTS_STORAGE_KEY = 'armario_outfits_garments_v1';
const SCHEDULE_STORAGE_KEY = 'armario_outfits_schedule_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'armario' | 'combinador' | 'calendario' | 'lavanderia'>('armario');

  // Load garments from localStorage or fallback to initial realistic garments
  const [garments, setGarments] = useState<Garment[]>(() => {
    try {
      const saved = localStorage.getItem(GARMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading garments from localStorage', e);
    }
    return INITIAL_GARMENTS;
  });

  // Load week schedule from localStorage or fallback
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading schedule from localStorage', e);
    }
    return INITIAL_WEEK_SCHEDULE;
  });

  // Garment Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);

  // GitHub Modal
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GARMENTS_STORAGE_KEY, JSON.stringify(garments));
    } catch (e) {
      console.error('Error saving garments to localStorage', e);
    }
  }, [garments]);

  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(weekSchedule));
    } catch (e) {
      console.error('Error saving schedule to localStorage', e);
    }
  }, [weekSchedule]);

  // Garment Management Actions
  const handleSaveGarment = (garment: Garment) => {
    setGarments((prev) => {
      const exists = prev.some((g) => g.id === garment.id);
      if (exists) {
        return prev.map((g) => (g.id === garment.id ? garment : g));
      }
      return [garment, ...prev];
    });
  };

  const handleDeleteGarment = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta prenda del armario?')) {
      setGarments((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: GarmentStatus) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return { ...g, status: newStatus };
        }
        return g;
      })
    );
  };

  const handleWearToday = (id: string) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newWearsWeek = g.timesWornThisWeek + 1;
          const newWearsSinceWash = g.totalWearsSinceWash + 1;
          // If it reached limit, recommend wash
          const newStatus: GarmentStatus =
            newWearsSinceWash >= g.maxWearsBeforeWash ? 'in_use' : 'in_use';

          return {
            ...g,
            timesWornThisWeek: newWearsWeek,
            totalWearsSinceWash: newWearsSinceWash,
            status: newStatus,
            lastWornDate: new Date().toISOString().split('T')[0],
          };
        }
        return g;
      })
    );
  };

  const handleWashGarment = (id: string) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status: 'clean',
            totalWearsSinceWash: 0,
          };
        }
        return g;
      })
    );
  };

  const handleQuickWashAll = () => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.status === 'laundry' || g.totalWearsSinceWash >= g.maxWearsBeforeWash) {
          return {
            ...g,
            status: 'clean',
            totalWearsSinceWash: 0,
          };
        }
        return g;
      })
    );
  };

  const handleWearOutfitToday = (outfit: Outfit) => {
    const idsToWear = [outfit.topId, outfit.bottomId, outfit.outerwearId, outfit.shoesId].filter(
      Boolean
    ) as string[];

    setGarments((prev) =>
      prev.map((g) => {
        if (idsToWear.includes(g.id)) {
          return {
            ...g,
            timesWornThisWeek: g.timesWornThisWeek + 1,
            totalWearsSinceWash: g.totalWearsSinceWash + 1,
            status: 'in_use',
            lastWornDate: new Date().toISOString().split('T')[0],
          };
        }
        return g;
      })
    );
  };

  const handleAssignToCalendar = (dayId: string, outfit: Outfit) => {
    setWeekSchedule((prev) =>
      prev.map((d) => {
        if (d.dayId === dayId) {
          return {
            ...d,
            outfit,
          };
        }
        return d;
      })
    );
  };

  const handleMarkDayAsWorn = (dayId: string) => {
    setWeekSchedule((prev) => {
      const day = prev.find((d) => d.dayId === dayId);
      if (!day) return prev;

      const isNowWorn = !day.isWorn;

      // If marking as worn, update garments
      if (isNowWorn && day.outfit) {
        handleWearOutfitToday(day.outfit);
      }

      return prev.map((d) => (d.dayId === dayId ? { ...d, isWorn: isNowWorn } : d));
    });
  };

  const handleOpenCombinerForDay = (_dayId: string) => {
    setActiveTab('combinador');
  };

  const handleAdjustWears = (id: string, delta: number) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newWearsWeek = Math.max(0, g.timesWornThisWeek + delta);
          const newWearsSinceWash = Math.max(0, g.totalWearsSinceWash + delta);
          return {
            ...g,
            timesWornThisWeek: newWearsWeek,
            totalWearsSinceWash: newWearsSinceWash,
          };
        }
        return g;
      })
    );
  };

  const handleResetWeeklyWears = () => {
    if (window.confirm('¿Reiniciar a 0 los usos semanales de todas las prendas para una nueva semana?')) {
      setGarments((prev) =>
        prev.map((g) => ({
          ...g,
          timesWornThisWeek: 0,
        }))
      );
      setWeekSchedule((prev) =>
        prev.map((d) => ({
          ...d,
          isWorn: false,
        }))
      );
    }
  };

  return (
    <div className="min-h-screen text-slate-800 antialiased selection:bg-sky-500/20">
      <IPhoneShell
        garments={garments}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingGarment(null);
          setIsModalOpen(true);
        }}
        onNavigateToLaundry={() => setActiveTab('lavanderia')}
        onNavigateToStylist={() => setActiveTab('combinador')}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      >
        {/* App Header & Action bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          garments={garments}
          onQuickWashAll={handleQuickWashAll}
        />

        {/* Main Content View */}
        <div className="mt-2 pb-6">
          {activeTab === 'armario' && (
            <WardrobeView
              garments={garments}
              onAddGarment={() => {
                setEditingGarment(null);
                setIsModalOpen(true);
              }}
              onEditGarment={(garment) => {
                setEditingGarment(garment);
                setIsModalOpen(true);
              }}
              onDeleteGarment={handleDeleteGarment}
              onUpdateStatus={handleUpdateStatus}
              onWearToday={handleWearToday}
              onWashGarment={handleWashGarment}
            />
          )}

          {activeTab === 'combinador' && (
            <OutfitCombiner
              garments={garments}
              onAssignToCalendar={handleAssignToCalendar}
              onWearOutfitToday={handleWearOutfitToday}
              weekSchedule={weekSchedule}
            />
          )}

          {activeTab === 'calendario' && (
            <WeeklyCalendarView
              weekSchedule={weekSchedule}
              garments={garments}
              onUpdateDaySchedule={setWeekSchedule}
              onMarkDayAsWorn={handleMarkDayAsWorn}
              onOpenCombinerForDay={handleOpenCombinerForDay}
            />
          )}

          {activeTab === 'lavanderia' && (
            <LaundryView
              garments={garments}
              onWashGarment={handleWashGarment}
              onWashAllLaundry={handleQuickWashAll}
              onMoveToLaundry={(id) => handleUpdateStatus(id, 'laundry')}
              onAdjustWears={handleAdjustWears}
              onResetWeeklyWears={handleResetWeeklyWears}
            />
          )}
        </div>
      </IPhoneShell>

      {/* Add / Edit Garment Modal */}
      <GarmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGarment}
        initialGarment={editingGarment}
      />

      {/* GitHub Deployment Instructions Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </div>
  );
}
