
import React from 'react';
import { VisualizerMode, VisualizerSettings } from '../../../types';
import { VISUALIZER_PRESETS, COLOR_THEMES } from '../../../constants';
import { SettingsToggle, Slider } from '../ControlWidgets';

interface VisualSettingsPanelProps {
  currentMode: VisualizerMode;
  setMode: (mode: VisualizerMode) => void;
  colorTheme: string[];
  setColorTheme: (theme: string[]) => void;
  settings: VisualizerSettings;
  setSettings: (settings: VisualizerSettings) => void;
  resetVisualSettings: () => void;
  t: any;
}

export const VisualSettingsPanel: React.FC<VisualSettingsPanelProps> = ({
  currentMode, setMode, colorTheme, setColorTheme, settings, setSettings, resetVisualSettings, t
}) => {
  return (
    <>
      {/* Container 1: Modes */}
      <div id="container-visual-modes" className="flex flex-col p-3 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        <span className="text-[11px] font-black uppercase text-white/60 tracking-[0.25em] block ml-1 mb-2 flex-shrink-0">{t.visualizerMode}</span>
        {/* Changed to 2 columns as requested */}
        <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto custom-scrollbar p-0 pr-1 content-start">
           {Object.keys(VISUALIZER_PRESETS).map(m => (
             <button 
               key={m} 
               onClick={() => setMode(m as VisualizerMode)} 
               title={t.modes[m as VisualizerMode]}
               className={`px-2 py-3 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate border transition-all duration-200 ${currentMode === m ? 'bg-white/20 border-white/40 text-white shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]' : 'bg-white/5 border-transparent text-white/50 hover:text-white hover:bg-white/10'}`}
             >
               {t.modes[m as VisualizerMode]}
             </button>
           ))}
        </div>
      </div>
      
      {/* Container 2: Themes & Audio Response Sliders */}
      <div id="container-visual-themes-sliders" className="flex flex-col p-4 h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        
        {/* Themes Section */}
        <div className="flex-shrink-0 mb-6">
            <span className="text-[11px] font-black uppercase text-white/60 tracking-[0.25em] block ml-1 mb-3">{t.styleTheme}</span>
            <div className="flex flex-wrap gap-2.5">
            {COLOR_THEMES.map((theme, i) => (
                <button key={i} onClick={() => setColorTheme(theme)} className={`w-9 h-9 rounded-full border-2 flex-shrink-0 transition-all duration-300 hover:scale-110 overflow-hidden ${JSON.stringify(colorTheme) === JSON.stringify(theme) ? 'border-white/90 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-70 hover:opacity-100'}`} style={{background: `linear-gradient(135deg, ${theme[0]}, ${theme[1]})` }} />
            ))}
            </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-white/10 w-full mb-4" />

        {/* Sliders Section (Moved here) */}
        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <Slider label={t.speed} hintText={t.hints.speed} value={settings.speed} min={0.1} max={3.0} step={0.1} onChange={(v:any) => setSettings({...settings, speed: v})} />
          <Slider label={t.sensitivity} hintText={t.hints.sensitivity} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v:any) => setSettings({...settings, sensitivity: v})} />
        </div>
      </div>
      
      {/* Container 3: Quality, Toggles, Reset */}
      <div id="container-visual-toggles" className="flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
        
        {/* Quality Segmented Control */}
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase text-white/50 tracking-wider w-12 flex-shrink-0">Quality</span>
            <div className="flex-1 flex bg-white/10 rounded-xl p-1 border border-white/5">
            {(['low', 'med', 'high'] as const).map(q => (
                <button 
                key={q} 
                onClick={() => setSettings({...settings, quality: q})} 
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${settings.quality === q ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                >
                {q}
                </button>
            ))}
            </div>
        </div>

        {/* Unified Toggles */}
        <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
                <SettingsToggle 
                    label={t.glow} 
                    statusText={settings.glow ? 'ON' : 'OFF'} 
                    value={settings.glow} 
                    onChange={() => setSettings({...settings, glow: !settings.glow})} 
                    hintText={t.hints.glow}
                />
                <SettingsToggle 
                    label={t.trails} 
                    statusText={settings.trails ? 'ON' : 'OFF'} 
                    value={settings.trails} 
                    onChange={() => setSettings({...settings, trails: !settings.trails})} 
                    hintText={t.hints.trails}
                />
            </div>
            <SettingsToggle 
                label={t.hideCursor} 
                statusText={settings.hideCursor ? 'HIDDEN' : 'VISIBLE'} 
                value={settings.hideCursor} 
                onChange={() => setSettings({...settings, hideCursor: !settings.hideCursor})} 
                hintText={t.hints.hideCursor}
            />
            <SettingsToggle 
                label={t.autoRotate} 
                statusText={settings.autoRotate ? 'ON' : 'OFF'} 
                value={settings.autoRotate} 
                onChange={() => setSettings({...settings, autoRotate: !settings.autoRotate})}
                hintText={t.hints.autoRotate}
            >
                <Slider 
                    label={t.rotateInterval} 
                    value={settings.rotateInterval ?? 30} 
                    min={10} max={120} step={5} unit="s"
                    onChange={(v: number) => setSettings({...settings, rotateInterval: v})} 
                />
            </SettingsToggle>
            <SettingsToggle 
                label={t.cycleColors} 
                statusText={settings.cycleColors ? 'ON' : 'OFF'} 
                value={settings.cycleColors} 
                onChange={() => setSettings({...settings, cycleColors: !settings.cycleColors})}
                hintText={t.hints.cycleColors}
            >
                <Slider 
                    label={t.colorInterval} 
                    value={settings.colorInterval ?? 45} 
                    min={5} max={60} step={5} unit="s"
                    onChange={(v: number) => setSettings({...settings, colorInterval: v})} 
                />
            </SettingsToggle>
        </div>

        <button onClick={resetVisualSettings} className="w-full py-3 mt-auto bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {t.resetVisual}
        </button>
      </div>
    </>
  );
};
