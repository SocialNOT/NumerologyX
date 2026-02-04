
import React from 'react';
import type { View } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ChatIcon } from './icons/ChatIcon';
import { HomeIcon } from './icons/HomeIcon';
import { LotusIcon } from './icons/LotusIcon';
import { soundService } from '../services/soundService';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { view: 'report', label: 'Report', icon: DocumentTextIcon },
  { view: 'forecast', label: 'Forecast', icon: ChartBarIcon },
  { view: 'vastu', label: 'Vastu', icon: HomeIcon },
  { view: 'remedies', label: 'Remedies', icon: LotusIcon },
  { view: 'chat', label: 'Chat', icon: ChatIcon },
];

const NavItem: React.FC<{
    item: typeof navItems[0];
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center justify-center w-1/5 py-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 rounded-lg relative ${
                isActive ? 'text-cyan-300' : 'text-gray-400 hover:text-white'
            }`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                {item.label}
            </span>
            <div className="relative">
                <item.icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                    <>
                    <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-gray-900"></span>
                    <span className="absolute inset-0 rounded-full bg-cyan-400/20 -z-10 animate-ping"></span>
                    </>
                )}
            </div>
            <span className={`text-[10px] sm:text-xs mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100 font-semibold' : 'opacity-70'}`}>
                {item.label}
            </span>
        </button>
    );
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-xl border-t border-white/10 z-20 pb-safe">
      <div className="flex justify-around items-center h-full max-w-2xl mx-auto px-1">
        {navItems.map((item) => (
          <NavItem
            key={item.view}
            item={item}
            isActive={activeView === item.view}
            onClick={() => {
                if (activeView !== item.view) {
                    soundService.playTransition();
                    setActiveView(item.view);
                }
            }}
          />
        ))}
      </div>
    </nav>
  );
};
