
import React, { useState, useEffect } from 'react';
import type { DetailedRemediesReport, UserData } from '../types';
import { Card } from './ui/Card';
import { LotusIcon } from './icons/LotusIcon';
import { GemstoneIcon } from './icons/GemstoneIcon';
import { MantraIcon } from './icons/MantraIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { ReportActions } from './ReportActions';
import { translateContent } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface RemediesDisplayProps {
    report: DetailedRemediesReport;
    userData: UserData | null;
}

export const RemediesDisplay: React.FC<RemediesDisplayProps> = ({ report, userData }) => {
    const [displayedReport, setDisplayedReport] = useState<DetailedRemediesReport>(report);
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
            const translated = await translateContent(report, lang === 'hi' ? 'Hindi' : 'Bengali', 'Remedies Report');
            setDisplayedReport(translated);
            setCurrentLanguage(lang);
            soundService.playSuccess();
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setIsTranslating(false);
        }
    };

     const formatText = (r: DetailedRemediesReport) => `
VEDIC REMEDIES REPORT for ${userData?.fullName || 'User'}
----------------------------------------

GEMSTONES:
${r.gemstones.map(g => `- ${g.name}: ${g.wearing_instructions}`).join('\n')}

MANTRAS:
${r.mantras.map(m => `- ${m.sanskrit} (${m.transliteration}): ${m.benefit}`).join('\n')}

RUDRAKSHA:
${r.rudraksha.mukhi}: ${r.rudraksha.benefit}

ACTIONS:
${r.actions.map(a => `- ${a.title}: ${a.description}`).join('\n')}

----------------------------------------
Powered by NumerologyX
`;
    const textContent = formatText(displayedReport);
    const speechContent = `Here are your remedies. Recommended gemstone is ${displayedReport.gemstones[0].name}. Wearing instruction: ${displayedReport.gemstones[0].wearing_instructions}. A powerful mantra for you is ${displayedReport.mantras[0].sanskrit}.`;
    const filename = `${userData?.fullName.replace(/\s+/g, '_')}_Remedies_Report.txt`;

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
                 <div className="flex items-center gap-3 mb-6">
                    <LotusIcon className="w-8 h-8 text-pink-400" />
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                        Holistic Healing
                    </h2>
                </div>

                {/* Gemstones */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <GemstoneIcon className="w-5 h-5 text-pink-400" />
                        <h3 className="font-semibold text-pink-300 uppercase tracking-wide text-sm">Gemstones</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {displayedReport.gemstones.map((gem, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-pink-900/10 border border-pink-500/20">
                                <h4 className="font-bold text-white mb-2">{gem.name}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{gem.wearing_instructions}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mantras */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <MantraIcon className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold text-yellow-300 uppercase tracking-wide text-sm">Sacred Mantras</h3>
                    </div>
                    <div className="space-y-4">
                        {displayedReport.mantras.map((mantra, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-yellow-900/10 border border-yellow-500/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-xl font-serif text-yellow-100 mb-1">{mantra.sanskrit}</p>
                                    <p className="text-xs text-yellow-500 mb-2 italic">{mantra.transliteration}</p>
                                    <p className="text-sm text-gray-400">{mantra.benefit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Rudraksha */}
                 <div className="mb-8 p-4 rounded-lg bg-orange-900/10 border border-orange-500/20">
                    <h3 className="font-semibold text-orange-300 uppercase tracking-wide text-sm mb-2">Rudraksha Recommendation</h3>
                    <p className="font-bold text-white text-lg">{displayedReport.rudraksha.mukhi}</p>
                    <p className="text-sm text-gray-400 mt-1">{displayedReport.rudraksha.benefit}</p>
                </div>

                {/* Actions */}
                <div>
                     <div className="flex items-center gap-2 mb-3">
                        <ActivityIcon className="w-5 h-5 text-green-400" />
                        <h3 className="font-semibold text-green-300 uppercase tracking-wide text-sm">Karmic Actions</h3>
                    </div>
                    <ul className="space-y-3">
                         {displayedReport.actions.map((action, idx) => (
                            <li key={idx} className="p-3 rounded-lg bg-green-900/10 border border-green-500/20">
                                <span className="font-semibold text-green-200 block mb-1">{action.title}</span>
                                <span className="text-sm text-gray-400">{action.description}</span>
                            </li>
                         ))}
                    </ul>
                </div>

            </Card>
        </div>
    );
};
