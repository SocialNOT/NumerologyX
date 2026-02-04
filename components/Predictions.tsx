
import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Card } from './ui/Card';
import type { PredictionsReport, UserData } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { soundService } from '../services/soundService';
import { ReportActions } from './ReportActions';
import { translateContent } from '../services/geminiService';

interface PredictionsProps {
    userData: UserData | null;
    predictions: PredictionsReport | null;
    isLoading: boolean;
    error: string | null;
    onGenerate: (year: number) => void;
}

const Predictions: React.FC<PredictionsProps> = ({ userData, predictions, isLoading, error, onGenerate }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [displayedPredictions, setDisplayedPredictions] = useState<PredictionsReport | null>(predictions);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    setDisplayedPredictions(predictions);
    setCurrentLanguage('en');
  }, [predictions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    soundService.playProcessing();
    onGenerate(year);
  };

  const handleTranslate = async (lang: string) => {
    if (!predictions) return;
    
    // Immediate return if same language or reverting to English
    if (lang === 'en') {
        setDisplayedPredictions(predictions);
        setCurrentLanguage('en');
        return;
    }
    
    // Optimistic UI update
    const previousLang = currentLanguage;
    setCurrentLanguage(lang);
    setIsTranslating(true);

    try {
        const targetLangName = lang === 'hi' ? 'Hindi' : 'Bengali';
        const translated = await translateContent(predictions, targetLangName, 'Predictions Report');
        setDisplayedPredictions(translated);
        soundService.playSuccess();
    } catch (error) {
        console.error("Translation failed", error);
        setCurrentLanguage(previousLang); // Revert
    } finally {
        setIsTranslating(false);
    }
  };

  const formatPredictionText = (p: PredictionsReport, user: UserData | null) => {
      if (!p) return '';
      return `
FORECAST FOR YEAR ${p.personalYear.number}
Name: ${user ? user.fullName : 'User'}
Theme: ${p.personalYear.theme}

OVERVIEW:
${p.personalYear.overview}

MONTHLY FORECASTS:
${p.monthlyForecast.map(m => `${m.month} (Personal Month ${m.number}): ${m.forecast}`).join('\n\n')}

Powered by NumerologyX
      `;
  };

  const speechContent = displayedPredictions ? 
    `Your personal year number is ${displayedPredictions.personalYear.number}. The theme is ${displayedPredictions.personalYear.theme}. ${displayedPredictions.personalYear.overview}` : '';
  
  const downloadText = displayedPredictions ? formatPredictionText(displayedPredictions, userData) : '';
  const filename = `${userData?.fullName.replace(/\s+/g, '_')}_Forecast_${year}.txt`;

  if (!userData) {
    return (
      <Card className="text-center opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
        <div className="flex justify-center items-center mb-4">
          <ChartBarIcon className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
          Yearly Forecast
        </h2>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          Generate a report first to unlock your personalized yearly predictions.
        </p>
      </Card>
    );
  }
  
  if (isLoading) {
      return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 relative min-h-[400px]">
        {!displayedPredictions && (
             <Card className="text-center opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
                <div className="flex justify-center items-center mb-4">
                    <ChartBarIcon className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
                    Generate Your Forecast
                </h2>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                    Select a year to reveal your Personal Year theme and monthly guidance.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <input 
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full sm:w-auto bg-black/20 border border-white/30 rounded-lg py-2 px-4 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300"
                        min="1900"
                        max="2100"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto font-semibold py-2 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:opacity-50"
                    >
                        Generate
                    </button>
                </form>
                {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
             </Card>
        )}
      
      {displayedPredictions && (
        <>
            <ReportActions 
                onTranslate={handleTranslate}
                currentLanguage={currentLanguage}
                isTranslating={isTranslating}
                textToCopy={downloadText}
                textToDownload={downloadText}
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

            <div className={`space-y-6 transition-all duration-500 ease-in-out ${isTranslating ? 'opacity-40 grayscale blur-[2px] pointer-events-none scale-[0.99]' : 'opacity-100 grayscale-0 blur-0 scale-100'}`}>
                <Card className="opacity-0 animate-fade-in-up text-center" style={{ animationFillMode: 'forwards', animationDelay: '150ms' }}>
                     <p className="font-semibold text-purple-300">Personal Year for {year}</p>
                     <p className="text-6xl font-extrabold my-4 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-white to-purple-300 drop-shadow-lg">{displayedPredictions.personalYear.number}</p>
                     
                     <div className="flex items-center justify-center gap-2 mb-4">
                        <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200">
                            {displayedPredictions.personalYear.theme}
                        </h2>
                        <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                     </div>

                     <p className="text-gray-300 mt-4 leading-relaxed max-w-lg mx-auto">{displayedPredictions.personalYear.overview}</p>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedPredictions.monthlyForecast.map((month, index) => (
                        <Card 
                            key={month.month} 
                            className="opacity-0 animate-fade-in-up hover:scale-[1.02] transition-all duration-300" 
                            style={{ animationFillMode: 'forwards', animationDelay: `${200 + index * 100}ms` }}
                        >
                            <div className="flex justify-between items-baseline border-b border-white/10 pb-2 mb-3">
                                 <h3 className="font-bold text-lg text-cyan-300">{month.month}</h3>
                                 <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Month</span>
                                    <span className="text-xl font-bold text-white">{month.number}</span>
                                 </div>
                            </div>
                            <p className="text-xs text-purple-300 mb-3 font-medium uppercase tracking-wide">{month.keywords}</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{month.forecast}</p>
                        </Card>
                    ))}
                </div>
                <div className="text-center pt-4 opacity-0 animate-fade-in-up" style={{animationDelay: `${300 + displayedPredictions.monthlyForecast.length * 100}ms`, animationFillMode: 'forwards'}}>
                  <button
                      onClick={() => {
                        soundService.playProcessing();
                        onGenerate(year);
                      }}
                      className="font-semibold py-2 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                  >
                      Regenerate for {year}
                  </button>
                </div>
            </div>
        </>
      )}

    </div>
  );
};

export default Predictions;
