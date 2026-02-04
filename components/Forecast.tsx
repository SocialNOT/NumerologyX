
import React, { useState } from 'react';
import type { UserData, PredictionsReport } from '../types';
import DailyReport from './DailyReport';
import Predictions from './Predictions';
import { soundService } from '../services/soundService';

interface ForecastProps {
    userData: UserData | null;
    predictions: PredictionsReport | null;
    isLoadingPredictions: boolean;
    predictionsError: string | null;
    onGeneratePredictions: (year: number) => void;
}

type Tab = 'daily' | 'yearly';

export const Forecast: React.FC<ForecastProps> = ({
    userData,
    predictions,
    isLoadingPredictions,
    predictionsError,
    onGeneratePredictions
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('daily');

    const handleTabChange = (tab: Tab) => {
        if (tab !== activeTab) {
            soundService.playSelect();
            setActiveTab(tab);
        }
    };

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex justify-center p-1 bg-black/20 rounded-full border border-white/20 mb-8 max-w-xs mx-auto animate-fade-in-up">
                <button
                    onClick={() => handleTabChange('daily')}
                    className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'daily' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Daily Pulse
                </button>
                <button
                    onClick={() => handleTabChange('yearly')}
                    className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'yearly' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Yearly Timeline
                </button>
            </div>

            {/* Content Area with Animation Key */}
            <div key={activeTab} className="animate-fade-in">
                {activeTab === 'daily' ? (
                    <DailyReport />
                ) : (
                    <Predictions 
                        userData={userData}
                        predictions={predictions}
                        isLoading={isLoadingPredictions}
                        error={predictionsError}
                        onGenerate={onGeneratePredictions}
                    />
                )}
            </div>
        </div>
    );
};
