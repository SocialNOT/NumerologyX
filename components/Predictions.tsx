
import React, { useState } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Card } from './ui/Card';
import type { PredictionsReport, UserData } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { soundService } from '../services/soundService';

interface PredictionsProps {
    userData: UserData | null;
    predictions: PredictionsReport | null;
    isLoading: boolean;
    error: string | null;
    onGenerate: (year: number) => void;
}

const Predictions: React.FC<PredictionsProps> = ({ userData, predictions, isLoading, error, onGenerate }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    soundService.playProcessing();
    onGenerate(year);
  };

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
    <div className="space-y-6">
        {!predictions && (
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
      
      {predictions && (
        <>
            <Card className="opacity-0 animate-fade-in-up text-center" style={{ animationFillMode: 'forwards', animationDelay: '150ms' }}>
                 <p className="font-semibold text-purple-300">Personal Year for {year}</p>
                 <p className="text-6xl font-extrabold my-4 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-white to-purple-300 drop-shadow-lg">{predictions.personalYear.number}</p>
                 
                 <div className="flex items-center justify-center gap-2 mb-4">
                    <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200">
                        {predictions.personalYear.theme}
                    </h2>
                    <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                 </div>

                 <p className="text-gray-300 mt-4 leading-relaxed max-w-lg mx-auto">{predictions.personalYear.overview}</p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictions.monthlyForecast.map((month, index) => (
                    <Card key={month.month} className="opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDelay: `${300 + index * 50}ms` }}>
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
            <div className="text-center pt-4 opacity-0 animate-fade-in-up" style={{animationDelay: `${300 + predictions.monthlyForecast.length * 50}ms`, animationFillMode: 'forwards'}}>
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
        </>
      )}

    </div>
  );
};

export default Predictions;
