
import React, { useState, useEffect } from 'react';
import type { VastuReport, UserData } from '../types';
import { Card } from './ui/Card';
import { HomeIcon } from './icons/HomeIcon';
import { ReportActions } from './ReportActions';
import { translateContent } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface VastuDisplayProps {
    report: VastuReport;
    userData: UserData | null;
}

export const VastuDisplay: React.FC<VastuDisplayProps> = ({ report, userData }) => {
    const [displayedReport, setDisplayedReport] = useState<VastuReport>(report);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        setDisplayedReport(report);
        setCurrentLanguage('en');
    }, [report]);

    const handleTranslate = async (lang: string) => {
        if (lang === 'en') {
            setDisplayedReport(report);
            setCurrentLanguage('en');
            return;
        }
        setIsTranslating(true);
        try {
            const translated = await translateContent(report, lang === 'hi' ? 'Hindi' : 'Bengali', 'Vastu Report');
            setDisplayedReport(translated);
            setCurrentLanguage(lang);
            soundService.playSuccess();
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setIsTranslating(false);
        }
    };

    const formatText = (r: VastuReport) => `
VASTU SHASTRA REPORT for ${userData?.fullName || 'User'}
----------------------------------------

FAVORABLE DIRECTIONS:
${r.favorableDirections.join(', ')}

HOME HARMONY TIPS:
${r.homeHarmony.map(h => `- ${h.room}: ${h.tip}`).join('\n')}

ENERGY BLOCKERS TO AVOID:
${r.avoid.join('\n- ')}

----------------------------------------
Powered by NumerologyX
`;

    const textContent = formatText(displayedReport);
    const speechContent = `Here are your Vastu tips. Your favorable directions are ${displayedReport.favorableDirections.join(', ')}. To enhance home harmony, ${displayedReport.homeHarmony[0].tip}. Please avoid ${displayedReport.avoid[0]}.`;
    const filename = `${userData?.fullName.replace(/\s+/g, '_')}_Vastu_Report.txt`;

    return (
        <div className="space-y-6">
            <ReportActions
                onTranslate={handleTranslate}
                currentLanguage={currentLanguage}
                isTranslating={isTranslating}
                textToCopy={textContent}
                textToDownload={textContent}
                textToSpeak={speechContent}
                filename={filename}
            />

            <Card className="opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                    <HomeIcon className="w-8 h-8 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
                        Spatial Harmony
                    </h2>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-purple-300 mb-2 uppercase tracking-wide text-sm">Favorable Directions</h3>
                    <div className="flex flex-wrap gap-2">
                        {displayedReport.favorableDirections.map((dir, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-cyan-900/50 border border-cyan-500/30 text-cyan-200 text-sm">
                                {dir}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="font-semibold text-purple-300 uppercase tracking-wide text-sm">Home Harmony</h3>
                     {displayedReport.homeHarmony.map((item, idx) => (
                         <div key={idx} className="p-4 rounded-lg bg-black/20 border border-white/5">
                             <h4 className="font-bold text-white mb-1">{item.room}</h4>
                             <p className="text-gray-400 text-sm leading-relaxed">{item.tip}</p>
                         </div>
                     ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="font-semibold text-red-300 mb-3 uppercase tracking-wide text-sm">Avoid</h3>
                    <ul className="space-y-2">
                        {displayedReport.avoid.map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-400">
                                <span className="mr-2 text-red-400">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
        </div>
    );
};
