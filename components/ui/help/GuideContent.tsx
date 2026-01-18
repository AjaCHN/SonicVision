
import React from 'react';

interface GuideContentProps {
  h: any; 
  guideSteps: string[];
}

export const GuideContent: React.FC<GuideContentProps> = ({ h, guideSteps }) => (
    <div className="space-y-8">
        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
            <p className="text-sm text-blue-100/70 leading-relaxed italic">
                {h.intro || "Experience high-fidelity generative art driven by your music."}
            </p>
        </div>
        <div>
            <h4 className="text-sm font-black text-purple-400 uppercase tracking-[0.2em] mb-5 px-1">{h?.howItWorksTitle || "How to Use"}</h4>
            <div className="flex flex-col gap-3">
                {guideSteps.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                     <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                        {idx + 1}
                     </span>
                     <p className="text-sm text-white/80 leading-relaxed font-medium">
                        {step.startsWith(`${idx + 1}. `) ? step.substring(3) : step}
                     </p>
                  </div>
                ))}
             </div>
        </div>
    </div>
);
