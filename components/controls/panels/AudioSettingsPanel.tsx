import React from 'react';
import { SteppedSlider } from '../ControlWidgets';
import { useAppContext } from '../../AppContext';

export const AudioSettingsPanel: React.FC = () => {
  const { 
    settings, setSettings, audioDevices, selectedDeviceId, 
    onDeviceChange, toggleMicrophone, isListening, resetAudioSettings, t 
  } = useAppContext();
  
  const hints = t?.hints || {};
  const fftOptions = [
    { value: 512, label: '512' },
    { value: 1024, label: '1024' },
    { value: 2048, label: '2048' },
    { value: 4096, label: '4096' },
  ];

  return (
    <>
      <div className="p-4 pt-6 h-full flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-white/5">
         <div className="space-y-1.5 relative transition-all duration-200 z-10">
            <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] block ml-1">{t?.audioInput || "Input Device"}</span>
            <select
                value={selectedDeviceId}
                onChange={(e) => onDeviceChange(e.target.value)}
                className="w-full bg-white/[0.04] border border-transparent hover:bg-white/[0.08] rounded-xl px-3 py-3 text-xs text-white/90 font-bold tracking-tight transition-all duration-300 appearance-none focus:outline-none focus:border-blue-500/50"
            >
                <option value="">{t?.defaultMic || "Default Microphone"}</option>
                {audioDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                ))}
            </select>
        </div>
        <button onClick={() => toggleMicrophone(selectedDeviceId)} className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 ${isListening ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
          {isListening ? (t?.stopMic || "Stop") : (t?.startMic || "Start")}
        </button>
      </div>
      <div className="p-4 pt-6 h-full flex flex-col space-y-6 border-b lg:border-b-0 lg:border-r border-white/5">
        <SteppedSlider label={t?.sensitivity || "Sensitivity"} hintText={hints?.sensitivity} options={[{value:settings.sensitivity, label:settings.sensitivity.toFixed(1)}]} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v: number) => setSettings({...settings, sensitivity: v})} />
        <SteppedSlider label={t?.smoothing || "Smoothing"} hintText={hints?.smoothing} options={[{value:settings.smoothing, label:settings.smoothing.toFixed(2)}]} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v: number) => setSettings({...settings, smoothing: v})} />
        <button onClick={resetAudioSettings} className="w-full py-2.5 mt-auto bg-white/[0.04] rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>{t?.resetAudio || "Reset Audio"}</button>
      </div>
      <div className="p-4 pt-6 h-full flex flex-col space-y-4">
          <SteppedSlider
              label={t?.fftSize || "Resolution"}
              hintText={hints?.fftSize || "FFT Size"}
              options={fftOptions}
              value={settings.fftSize}
              onChange={(val) => setSettings({...settings, fftSize: val})}
          />
      </div>
    </>
  );
};