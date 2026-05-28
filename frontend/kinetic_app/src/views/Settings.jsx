import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Weight, Ruler, Target, Flame, Save, CheckCircle } from 'lucide-react';

export const Settings = () => {

  // =========================
  // STATE
  // =========================
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    targetWeight: '',
    calorieGoal: '',
    macros: {
      protein: '',
      carbs: '',
      fats: ''
    }
  });

  const [status, setStatus] = useState(null);

  // =========================
  // FETCH PROFILE
  // =========================
  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('kinetic_token');

        const res = await api.get(
          '/api/auth/me',
          {
            headers: {
              'x-auth-token': token
            }
          }
        );

        if (res.data?.profile) {
          setProfile(res.data.profile);
        }

      } catch (err) {
        console.error("PROFILE_FETCH_ERROR", err);
      }
    };

    fetchProfile();
  }, []);

  // =========================
  // UPDATE PROFILE
  // =========================
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('kinetic_token');

      await api.put(
        '/api/auth/update-profile',
        profile,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      setStatus("SUCCESS");
      setTimeout(() => setStatus(null), 3000);

    } catch (err) {
      console.error("PROFILE_UPDATE_ERROR", err);
      alert("SYNC_REJECTED");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-20 px-2 sm:px-4">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center px-1">

        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            Profile Settings
          </h1>

          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">
            Configure physical metrics for accurate tracking.
          </p>
        </div>

        {status === "SUCCESS" && (
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-widest animate-pulse self-start sm:self-auto">
            <CheckCircle size={16} /> Sync_Complete
          </div>
        )}

      </header>

      {/* CARD */}
      <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-12 rounded-3xl sm:rounded-[3rem] backdrop-blur-3xl space-y-8 sm:space-y-10">

        {/* BASIC METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">

          <SettingInput
            label="Weight (KG)"
            icon={<Weight size={14} />}
            value={profile.weight}
            onChange={(val) => setProfile({ ...profile, weight: val })}
          />

          <SettingInput
            label="Height (CM)"
            icon={<Ruler size={14} />}
            value={profile.height}
            onChange={(val) => setProfile({ ...profile, height: val })}
          />

          <SettingInput
            label="Target Weight (KG)"
            icon={<Target size={14} />}
            value={profile.targetWeight}
            onChange={(val) => setProfile({ ...profile, targetWeight: val })}
          />

          <SettingInput
            label="Daily Calorie Goal"
            icon={<Flame size={14} />}
            value={profile.calorieGoal}
            onChange={(val) => setProfile({ ...profile, calorieGoal: val })}
          />

        </div>

        {/* MACROS */}
        <div className="pt-8 sm:pt-10 border-t border-white/5">

          <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mb-6 sm:mb-8 italic">
            Macro-Nutrient Targets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

            <MacroInput
              label="Protein (G)"
              value={profile.macros?.protein}
              onChange={(val) =>
                setProfile({
                  ...profile,
                  macros: { ...profile.macros, protein: val }
                })
              }
            />

            <MacroInput
              label="Carbs (G)"
              value={profile.macros?.carbs}
              onChange={(val) =>
                setProfile({
                  ...profile,
                  macros: { ...profile.macros, carbs: val }
                })
              }
            />

            <MacroInput
              label="Fats (G)"
              value={profile.macros?.fats}
              onChange={(val) =>
                setProfile({
                  ...profile,
                  macros: { ...profile.macros, fats: val }
                })
              }
            />

          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-8 sm:pt-10 flex flex-col items-center">

          <p className="text-zinc-700 font-mono text-[9px] uppercase tracking-widest italic mb-6 text-center">
            *Bio-metric data is encrypted and synced to your secure Kinetic profile.
          </p>

          <button
            onClick={handleUpdate}
            className="w-full sm:w-auto bg-white text-black font-black px-12 py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> Authorize Update
          </button>

        </div>

      </div>
    </div>
  );
};

// =========================
// INPUT COMPONENTS
// =========================
const SettingInput = ({ label, icon, value, onChange }) => (
  <div className="space-y-2">

    <label className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">
      {icon} {label}
    </label>

    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black border border-white/10 p-4 sm:p-5 rounded-xl text-white font-bold text-lg sm:text-xl outline-none focus:border-cyan-400/40 transition-all"
    />

  </div>
);

const MacroInput = ({ label, value, onChange }) => (
  <div className="space-y-2">

    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
      {label}
    </label>

    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 sm:h-16 bg-black border border-white/10 rounded-2xl text-center text-white font-bold outline-none focus:border-cyan-400/40 transition-all"
    />

  </div>
);