
import React, { useState, useEffect } from 'react';
import { BentoCard, BentoTheme } from './ui/BentoCard';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { MoonIcon } from './icons/MoonIcon';
import { FingerPrintIcon } from './icons/FingerPrintIcon';
import { getDailyReport } from '../services/geminiService';
import type { DailyReportData } from '../types';

interface DashboardProps {
    onUnlock: () => void;
    isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onUnlock, isDarkMode }) => {
    const [visualStyle] = useState<BentoTheme>('sentinel'); 
    const [time, setTime] = useState(new Date());
    const [dailyReport, setDailyReport] = useState<DailyReportData | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDaily = async () => {
             const date = new Date();
             const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
             const cached = localStorage.getItem('dailyReport');
             if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.date === dateStr) {
                    setDailyReport(parsed.data);
                    return;
                }
             }
             try {
                 const data = await getDailyReport(dateStr);
                 setDailyReport(data);
                 localStorage.setItem('dailyReport', JSON.stringify({ date: dateStr, data }));
             } catch (e) { console.error(e); }
        };
        fetchDaily();
    }, []);

    // Get lunar phase approx for visual flavor (not astronomically perfect)
    const getLunarPhase = () => {
        const days = Math.floor(new Date().getTime() / (1000*60*60*24));
        const phase = (days + 2) % 29.5;
        const percent = Math.round((phase / 29.5) * 100);
        if (phase < 1.8) return { name: "New Moon", illum: percent };
        if (phase < 9.2) return { name: "Waxing Crescent", illum: percent };
        if (phase < 12.9) return { name: "First Quarter", illum: percent };
        if (phase < 16.6) return { name: "Waxing Gibbous", illum: percent };
        if (phase < 20.3) return { name: "Full Moon", illum: percent };
        if (phase < 24) return { name: "Waning Gibbous", illum: percent };
        if (phase < 27.7) return { name: "Last Quarter", illum: percent };
        return { name: "Waning Crescent", illum: percent };
    };
    const moon = getLunarPhase();

    // --- SUB-RENDERERS ---

    const renderClock = () => (
        <div className="flex flex-col h-full justify-between p-4 relative overflow-hidden group">
             {/* Running Line Animation */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-theme-500 to-transparent -translate-x-full animate-shimmer opacity-50"></div>
             
             <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-theme-500 font-bold font-tech">
                    TEMPORAL
                </span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-theme-400 animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-theme-600 animate-pulse delay-75"></div>
                </div>
             </div>
             <div>
                <div className="text-4xl font-bold tracking-tighter text-txt-main font-mono tabular-nums leading-none">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex justify-between items-end mt-2">
                    <div className="text-[10px] text-txt-muted uppercase font-mono tracking-wider">
                        {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-theme-500 font-bold animate-pulse">
                        :{time.getSeconds().toString().padStart(2, '0')}
                    </div>
                </div>
             </div>
        </div>
    );

    const renderDailyPulse = () => (
        <div className="flex flex-col h-full justify-between p-4 relative overflow-hidden">
             {/* Pulse Glow Effect */}
             <div className="absolute inset-0 bg-theme-500/5 animate-pulse"></div>
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-theme-500/20 blur-3xl rounded-full pointer-events-none animate-breathing-glow"></div>
             
             <div className="flex items-center justify-between z-10">
                 <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-3 h-3 text-theme-400" />
                    <span className="text-[10px] uppercase tracking-widest text-theme-300 font-bold">
                        COSMIC IDX
                    </span>
                 </div>
                 <span className="text-[9px] px-1.5 py-0.5 rounded bg-theme-500/20 text-theme-300 border border-theme-500/30">
                    LIVE
                 </span>
             </div>

             <div className="my-2 z-10 flex flex-row items-baseline gap-3">
                {dailyReport ? (
                    <>
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-theme-400 drop-shadow-sm font-display">
                            {dailyReport.number_of_day.number}
                        </span>
                        <div className="flex flex-col">
                             <span className="text-xs font-bold uppercase tracking-widest text-txt-main line-clamp-1">
                                {dailyReport.number_of_day.keywords.split(',')[0]}
                            </span>
                            <span className="text-[9px] text-txt-muted">Vibration</span>
                        </div>
                    </>
                ) : (
                    <div className="h-10 w-10 bg-theme-500/20 rounded animate-pulse" />
                )}
             </div>

             <div className="z-10 pt-2 border-t border-theme-500/10">
                <p className="text-[10px] leading-tight text-txt-muted font-tech line-clamp-2">
                    {dailyReport?.cosmic_influence.title || "CALCULATING ALIGNMENT..."}
                </p>
             </div>
        </div>
    );

    const renderMainAction = () => (
        <div className="relative h-full w-full flex flex-col items-center justify-center text-center p-6 overflow-hidden group">
             {/* Holographic Scanlines */}
             <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-theme-900/40 via-transparent to-transparent"></div>
             
             {/* Animated Border */}
             <div className="absolute inset-0 border border-theme-500/30 group-hover:border-theme-400/60 transition-colors duration-500 rounded-2xl"></div>
             <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-theme-400 to-transparent animate-scanline opacity-50"></div>

             <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-theme-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
                    <div className={`
                        w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
                        bg-black/40 border border-theme-500/50 text-theme-400
                        group-hover:scale-110 group-hover:border-theme-400 group-hover:text-white
                    `}>
                        <FingerPrintIcon className="w-8 h-8" />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold uppercase tracking-widest text-white font-display">
                        Unlock Destiny
                    </h3>
                    <p className="text-[10px] text-theme-300/80 uppercase tracking-widest mt-1">
                        Fingerprint ID: Unknown
                    </p>
                </div>
             </div>
             
             {/* Tech Corners */}
             <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-theme-500"></div>
             <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-theme-500"></div>
             <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-theme-500"></div>
             <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-theme-500"></div>
        </div>
    );

    const renderMoonPhase = () => (
        <div className="flex flex-col h-full justify-center items-center p-4 relative overflow-hidden bg-gradient-to-b from-bg-card to-black/40">
            <div className="absolute top-0 right-0 p-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
            </div>
            <MoonIcon className="w-8 h-8 text-gray-200 mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            <div className="text-center">
                <div className="text-xs font-bold text-gray-200">{moon.name}</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Illumination {moon.illum}%</div>
            </div>
        </div>
    );

    const renderSyncRate = () => (
        <div className="flex flex-col h-full justify-between p-4 bg-bg-card relative">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-bold uppercase text-theme-500">SYS.SYNC</span>
                <span className="text-[9px] font-mono text-txt-muted">V.2.0</span>
             </div>
             <div className="space-y-1.5">
                {[80, 45, 90, 60].map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                         <div className="h-1 flex-1 bg-theme-500/10 rounded-full overflow-hidden">
                             <div className="h-full bg-theme-500 rounded-full animate-pulse" style={{ width: `${val}%`, animationDelay: `${i * 0.1}s` }}></div>
                         </div>
                    </div>
                ))}
             </div>
             <div className="mt-2 text-right">
                 <span className="text-xs font-mono text-txt-main">98.4%</span>
             </div>
        </div>
    );

    const renderMarquee = () => (
        <div className="relative flex items-center h-full px-2 overflow-hidden w-full bg-theme-900/20 border-t border-theme-500/10">
             <div className="flex whitespace-nowrap animate-marquee">
                {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-6 mx-4 font-mono text-[10px] text-theme-300/70">
                        <span className="flex items-center gap-1"><SparklesIcon className="w-3 h-3" /> COSMIC GATEWAY DETECTED</span>
                        <span>///</span>
                        <span>ALIGNMENT: {dailyReport?.cosmic_influence.title || "CALCULATING"}</span>
                        <span>///</span>
                        <span>VOID INDEX: STABLE</span>
                        <span>///</span>
                    </div>
                ))}
             </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col p-2 md:p-4 overflow-hidden">
            
            {/* Minimal Header */}
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold uppercase tracking-tighter text-txt-main font-display">
                        Cosmic Deck
                    </h2>
                    <span className="text-[10px] text-theme-500 tracking-[0.2em] uppercase">
                         {new Date().toLocaleDateString(undefined, { weekday: 'long' })} Protocol
                    </span>
                </div>
                <div className="flex gap-1">
                    <div className="w-8 h-1 bg-theme-500/20 rounded-full"></div>
                    <div className="w-4 h-1 bg-theme-500 rounded-full"></div>
                </div>
            </div>

            {/* Dense Bento Grid - The "Random Stack" Look */}
            <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-[auto_auto_auto_auto] gap-3 pb-20 md:pb-0 grid-flow-dense">
                
                {/* 1. Clock: Top Left, Compact */}
                <BentoCard theme="terminal" className="col-span-1 row-span-1 h-32">
                    {renderClock()}
                </BentoCard>

                {/* 2. Unlock: Big Feature, Top Right-ish */}
                <BentoCard 
                    theme="sentinel" 
                    className="col-span-1 md:col-span-2 row-span-2 min-h-[16rem] cursor-pointer" 
                    isInteractive 
                    onClick={onUnlock}
                >
                    {renderMainAction()}
                </BentoCard>

                {/* 3. Daily Pulse: Tall, Left Side */}
                <BentoCard theme="zenith" className="col-span-1 row-span-2 h-full min-h-[16rem]">
                    {renderDailyPulse()}
                </BentoCard>

                {/* 4. Moon Phase: Small Filler */}
                <BentoCard theme="sentinel" className="col-span-1 row-span-1 h-32">
                    {renderMoonPhase()}
                </BentoCard>

                {/* 5. Sync Rate: Small Filler */}
                <BentoCard theme="terminal" className="col-span-1 row-span-1 h-32">
                    {renderSyncRate()}
                </BentoCard>

                {/* 6. Marquee: Bottom Wide */}
                <BentoCard theme="sentinel" className="col-span-2 md:col-span-4 row-span-1 h-10 min-h-0 p-0 flex items-center">
                    {renderMarquee()}
                </BentoCard>

            </div>
        </div>
    );
};
