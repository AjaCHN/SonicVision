
import React from 'react';

interface FeatureCardProps { 
  icon: React.ReactNode; 
  title: string; 
  desc: string;
}

export const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => (
  <div className="flex items-start gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
     <div className="p-2 bg-white/5 rounded-lg shrink-0">{icon}</div>
     <div><h3 className="text-white font-bold text-sm mb-1">{title}</h3><p className="text-white/50 text-xs leading-relaxed">{desc}</p></div>
  </div>
);
