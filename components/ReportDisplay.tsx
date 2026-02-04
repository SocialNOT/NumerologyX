
import React, { useState, useEffect } from 'react';
import type { NumerologyReport, SystemReport, Interpretation, CalculationDetail, Remedy, UserData } from '../types';
import { useCountUp } from '../hooks/useCountUp';
import { useOnScreen } from '../hooks/useOnScreen';
import { Card } from './ui/Card';
import { GemstoneIcon } from './icons/GemstoneIcon';
import { MantraIcon } from './icons/MantraIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { ReflectionIcon } from './icons/ReflectionIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { soundService } from '../services/soundService';
import { ReportActions } from './ReportActions';
import { translateContent } from '../services/geminiService';

interface ReportDisplayProps {
  report: NumerologyReport;
  userData: UserData | null;
  onReset: () => void;
}

type System = 'pythagorean' | 'chaldean';

const NumberCard: React.FC<{ title: string; detail: CalculationDetail; keywords: string }> = ({ title, detail, keywords }) => {
    const [ref, isVisible] = useOnScreen(0.2);
    const animatedNumber = useCountUp(isVisible ? detail.number : 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const cardId = `calculation-${title.replace(/\s+/g, '-')}`;

    return (
        <Card 
            ref={ref} 
            className={`flex flex-col p-0 overflow-hidden transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} group hover:ring-1 hover:ring-theme-500/30`}
        >
            <button
                onClick={() => {
                    setIsExpanded(!isExpanded);
                    soundService.playExpand();
                }}
                className="w-full flex flex-col items-center text-center p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 rounded-xl transition-colors duration-300 hover:bg-bg-hover/50"
                aria-expanded={isExpanded}
                aria-controls={cardId}
            >
                <div className="w-full relative">
                    <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 transition-colors">{title}</h3>
                    <p className="text-7xl font-bold my-4 text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-purple-600 dark:from-cyan-300 dark:to-purple-300 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-lg">{animatedNumber}</p>
                    <p className="text-sm text-txt-muted capitalize min-h-[40px] px-2">{keywords.toLowerCase()}</p>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-txt-muted group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                     <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        {isExpanded ? 'Hide Steps' : 'View Steps'}
                     </span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div
                id={cardId}
                className={`w-full overflow-hidden transition-all duration-500 ease-in-out px-4 ${isExpanded ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-left text-xs text-txt-muted w-full border-t border-subtle pt-3 mt-2">
                    <h4 className="font-semibold text-txt-main mb-2">Calculation Breakdown:</h4>
                    {detail.steps.split('\n').filter(s => s.trim() !== '').map((step, index) => (
                        <div key={index} className="flex gap-2 mb-1">
                            <span className="text-purple-500/50">•</span>
                            <p className="whitespace-pre-wrap leading-relaxed font-mono text-txt-muted">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};


const InterpretationCard: React.FC<{ title: string; interpretation: Interpretation }> = ({ title, interpretation }) => {
    const [ref, isVisible] = useOnScreen(0.15);
    
    return (
        <Card 
            ref={ref} 
            className={`bg-gradient-to-br from-purple-500/5 via-transparent to-transparent transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
            <h3 className="text-xl font-bold mb-2 text-cyan-700 dark:text-cyan-300">{title}: {interpretation.title}</h3>
            <p className="text-sm italic text-purple-600 dark:text-purple-300 mb-4">{interpretation.keywords}</p>
            
            <div className="space-y-4">
                <p className="text-txt-main text-base leading-relaxed">{interpretation.interpretation}</p>
                
                {/* Expanded Sections */}
                {(interpretation.strengths || interpretation.challenges) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-subtle">
                        {interpretation.strengths && (
                            <div className="bg-green-100/50 dark:bg-green-900/10 p-3 rounded-lg border border-green-500/20">
                                <h4 className="text-xs font-bold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Strengths
                                </h4>
                                <p className="text-sm text-txt-main leading-relaxed">{interpretation.strengths}</p>
                            </div>
                        )}
                        {interpretation.challenges && (
                            <div className="bg-red-100/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-500/20">
                                <h4 className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Challenges
                                </h4>
                                <p className="text-sm text-txt-main leading-relaxed">{interpretation.challenges}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {interpretation.advice && (
                    <div className="bg-blue-100/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-500/20 mt-2">
                         <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Cosmic Advice
                         </h4>
                         <p className="text-sm text-txt-main italic leading-relaxed">"{interpretation.advice}"</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const RemedyCard: React.FC<{ remedy: Remedy; isApplied: boolean; onClick: () => void }> = ({ remedy, isApplied, onClick }) => {
    const remedyIcons: Record<Remedy['type'], React.ReactNode> = {
        Gemstone: <GemstoneIcon className="w-6 h-6 mr-3 text-pink-500 dark:text-pink-400 flex-shrink-0" />,
        Mantra: <MantraIcon className="w-6 h-6 mr-3 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />,
        Activity: <ActivityIcon className="w-6 h-6 mr-3 text-green-500 dark:text-green-400 flex-shrink-0" />,
        Reflection: <ReflectionIcon className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />,
    };

    return (
      <button 
        onClick={() => {
            onClick();
            soundService.playSelect();
        }}
        className={`w-full flex items-start p-4 rounded-lg bg-bg-hover/30 text-left transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 relative overflow-hidden ${isApplied ? 'ring-2 ring-cyan-500/50' : 'hover:bg-bg-hover/50'}`}
        aria-pressed={isApplied}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent transition-transform duration-500 ease-out ${isApplied ? 'translate-x-0' : '-translate-x-full'}`}></div>
        <div className="relative z-10 flex items-start w-full">
            {remedyIcons[remedy.type]}
            <div className="flex-grow">
                <h4 className="font-semibold text-txt-main">{remedy.title}</h4>
                <p className="text-sm text-txt-muted mt-1">{remedy.description}</p>
            </div>
            <div className="w-6 h-6 ml-2 flex-shrink-0">
                <div className={`transition-all duration-300 ${isApplied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <CheckCircleIcon className="w-6 h-6 text-cyan-500" />
                </div>
            </div>
        </div>
      </button>
    )
};

const SystemToggle: React.FC<{ activeSystem: System; onSystemChange: (system: System) => void }> = ({ activeSystem, onSystemChange }) => (
    <div className="flex justify-center p-1 bg-bg-hover/50 rounded-full border border-subtle mb-4">
        <button
            onClick={() => {
                onSystemChange('pythagorean');
                soundService.playSelect();
            }}
            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeSystem === 'pythagorean' ? 'bg-purple-600 text-white' : 'text-txt-muted hover:text-txt-main'}`}
        >
            Pythagorean
        </button>
        <button
            onClick={() => {
                onSystemChange('chaldean');
                soundService.playSelect();
            }}
            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeSystem === 'chaldean' ? 'bg-cyan-600 text-white' : 'text-txt-muted hover:text-txt-main'}`}
        >
            Chaldean
        </button>
    </div>
);


export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, userData, onReset }) => {
  const [activeSystem, setActiveSystem] = useState<System>('pythagorean');
  const [appliedRemedies, setAppliedRemedies] = useState<boolean[]>(() => report.quickRemedies.map(() => false));
  
  // Translation state
  const [displayedReport, setDisplayedReport] = useState<NumerologyReport>(report);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Sync displayed report if the base report prop changes (new calculation)
  useEffect(() => {
    setDisplayedReport(report);
    setCurrentLanguage('en');
    setAppliedRemedies(report.quickRemedies.map(() => false));
  }, [report]);

  const handleRemedyClick = (index: number) => {
    setAppliedRemedies(prev => {
        const newApplied = [...prev];
        newApplied[index] = !newApplied[index];
        return newApplied;
    });
  };

  const handleTranslate = async (lang: string) => {
    // Immediate return if same language or reverting to English
    if (lang === 'en') {
        setDisplayedReport(report);
        setCurrentLanguage('en');
        return;
    }
    
    // Optimistic UI update: Set language immediately to update Dropdown/UI
    const previousLang = currentLanguage;
    setCurrentLanguage(lang);
    setIsTranslating(true);
    
    try {
        const targetLangName = lang === 'hi' ? 'Hindi' : 'Bengali';
        // Always translate from source 'report' to avoid drift
        const translated = await translateContent(report, targetLangName, 'Numerology Report');
        setDisplayedReport(translated);
        soundService.playSuccess();
    } catch (error) {
        console.error("Translation failed", error);
        setCurrentLanguage(previousLang); // Revert on failure
        // Here you might trigger a toast notification
    } finally {
        setIsTranslating(false);
    }
  };

  const formatInterpretationText = (title: string, data: Interpretation) => {
    return `${title.toUpperCase()}:
Overview: ${data.interpretation}
Strengths: ${data.strengths || 'N/A'}
Challenges: ${data.challenges || 'N/A'}
Advice: ${data.advice || 'N/A'}
`;
  }

  const formatReportText = (r: NumerologyReport, user: UserData | null) => {
    const date = new Date().toLocaleDateString();
    const userName = user ? user.fullName : 'Valued User';
    
    return `
NUMEROLOGY REPORT for ${userName}
Generated on: ${date}
----------------------------------------

SUMMARY:
${r.summary}

----------------------------------------
PYTHAGOREAN SYSTEM
----------------------------------------
Life Path: ${r.pythagorean.calculations.lifePath.number}
${formatInterpretationText('Life Path', r.pythagorean.interpretations.lifePath)}

Destiny: ${r.pythagorean.calculations.destiny.number}
${formatInterpretationText('Destiny', r.pythagorean.interpretations.destiny)}

Soul Urge: ${r.pythagorean.calculations.soulUrge.number}
${formatInterpretationText('Soul Urge', r.pythagorean.interpretations.soulUrge)}

Personality: ${r.pythagorean.calculations.personality.number}
${formatInterpretationText('Personality', r.pythagorean.interpretations.personality)}

----------------------------------------
CHALDEAN SYSTEM
----------------------------------------
Life Path: ${r.chaldean.calculations.lifePath.number}
${formatInterpretationText('Life Path', r.chaldean.interpretations.lifePath)}

Destiny: ${r.chaldean.calculations.destiny.number}
${formatInterpretationText('Destiny', r.chaldean.interpretations.destiny)}

Soul Urge: ${r.chaldean.calculations.soulUrge.number}
${formatInterpretationText('Soul Urge', r.chaldean.interpretations.soulUrge)}

Personality: ${r.chaldean.calculations.personality.number}
${formatInterpretationText('Personality', r.chaldean.interpretations.personality)}

----------------------------------------
QUICK REMEDIES
----------------------------------------
${r.quickRemedies.map(rem => `- ${rem.title} (${rem.type}): ${rem.description}`).join('\n')}

----------------------------------------
Powered by NumerologyX
`;
  };

  const textContent = formatReportText(displayedReport, userData);
  const speechContent = `Here is your summary. ${displayedReport.summary}. Your Life Path number is ${displayedReport.pythagorean.calculations.lifePath.number}. ${displayedReport.pythagorean.interpretations.lifePath.advice || ''}`;
  const filename = `${userData?.fullName.replace(/\s+/g, '_')}_NumerologyReport.txt`;

  const activeReport: SystemReport = displayedReport[activeSystem];

  return (
    <div className="space-y-6 relative min-h-[500px]">
        
        {/* Actions Toolbar */}
        <ReportActions 
            onTranslate={handleTranslate}
            currentLanguage={currentLanguage}
            isTranslating={isTranslating}
            textToCopy={textContent}
            textToDownload={textContent}
            textToSpeak={speechContent}
            filename={filename}
        />

        {/* Translation Loading Overlay */}
        {isTranslating && (
            <div className="absolute inset-0 top-20 z-20 flex items-start justify-center pt-20">
                 <div className="bg-gray-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center gap-3 animate-fade-in">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-cyan-300 font-medium tracking-wide text-sm">Translating content...</span>
                </div>
            </div>
        )}

        {/* System Toggle and Numbers Grid */}
        <div className={`space-y-6 transition-all duration-500 ease-in-out ${isTranslating ? 'opacity-40 grayscale blur-[2px] pointer-events-none' : 'opacity-100 grayscale-0 blur-0'}`}>
            <Card className="opacity-0 animate-fade-in-up" style={{animationDelay: '150ms', animationFillMode: 'forwards'}}>
                 <SystemToggle activeSystem={activeSystem} onSystemChange={setActiveSystem} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <NumberCard key={`lp-${activeSystem}`} title="Life Path" detail={activeReport.calculations.lifePath} keywords={activeReport.interpretations.lifePath.keywords} />
                    <NumberCard key={`dest-${activeSystem}`} title="Destiny" detail={activeReport.calculations.destiny} keywords={activeReport.interpretations.destiny.keywords} />
                    <NumberCard key={`soul-${activeSystem}`} title="Soul Urge" detail={activeReport.calculations.soulUrge} keywords={activeReport.interpretations.soulUrge.keywords} />
                    <NumberCard key={`pers-${activeSystem}`} title="Personality" detail={activeReport.calculations.personality} keywords={activeReport.interpretations.personality.keywords} />
                </div>
            </Card>
           
            {/* Summary */}
            <Card className="opacity-0 animate-fade-in-up bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" style={{animationDelay: '300ms', animationFillMode: 'forwards'}}>
                <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">Cosmic Summary</h2>
                <p className="text-txt-main leading-relaxed text-center">{displayedReport.summary}</p>
            </Card>

            {/* Interpretations */}
            <div className="space-y-6">
                <InterpretationCard key={`interp-lp-${activeSystem}`} title={`Life Path (${activeSystem})`} interpretation={activeReport.interpretations.lifePath} />
                <InterpretationCard key={`interp-dest-${activeSystem}`} title={`Destiny (${activeSystem})`} interpretation={activeReport.interpretations.destiny} />
                <InterpretationCard key={`interp-soul-${activeSystem}`} title={`Soul Urge (${activeSystem})`} interpretation={activeReport.interpretations.soulUrge} />
                <InterpretationCard key={`interp-pers-${activeSystem}`} title={`Personality (${activeSystem})`} interpretation={activeReport.interpretations.personality} />
            </div>

            {/* Remedies */}
            <Card className="opacity-0 animate-fade-in-up bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" style={{animationDelay: '900ms', animationFillMode: 'forwards'}}>
                <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">Personalized Remedies</h2>
                <div className="space-y-4">
                    {displayedReport.quickRemedies.map((remedy, index) => (
                        <RemedyCard 
                            key={index} 
                            remedy={remedy} 
                            isApplied={appliedRemedies[index]}
                            onClick={() => handleRemedyClick(index)} 
                        />
                    ))}
                </div>
            </Card>

            <div className="text-center pt-4 opacity-0 animate-fade-in-up" style={{animationDelay: '1050ms', animationFillMode: 'forwards'}}>
                <button
                    onClick={onReset}
                    className="font-semibold py-2 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    Calculate New Report
                </button>
            </div>
        </div>
    </div>
  );
};
