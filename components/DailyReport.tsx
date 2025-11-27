
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { Card } from './ui/Card';
import type { DailyReportData } from '../types';
import { getDailyReport } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

const DailyReport: React.FC = () => {
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      // Use local date to ensure the report matches the user's current day
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const cachedData = localStorage.getItem('dailyReport');

      if (cachedData) {
        const { date: cachedDate, data } = JSON.parse(cachedData);
        if (cachedDate === today) {
          setReport(data);
          setIsLoading(false);
          return;
        }
      }

      // If no valid cache, fetch new data
      try {
        const data = await getDailyReport(today);
        setReport(data);
        localStorage.setItem('dailyReport', JSON.stringify({ date: today, data }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch daily pulse.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
     return (
        <Card className="text-center">
            <h2 className="text-xl font-bold text-red-400">Failed to Load</h2>
            <p className="text-red-300 mt-2">{error}</p>
        </Card>
     );
  }

  if (!report) {
    return null;
  }

  return (
    <Card className="text-center opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
      <div 
        className="flex justify-center items-center mb-4 opacity-0 animate-fade-in-up" 
        style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
      >
        <SparklesIcon className="w-12 h-12 text-cyan-400" />
      </div>
      <h2 
        className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
      >
        Your Daily Cosmic Pulse
      </h2>
      <p 
        className="text-gray-400 mt-2 max-w-md mx-auto opacity-0 animate-fade-in-up"
        style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}
      >
        Today's snapshot of numerological and planetary alignment.
      </p>

      <div className="mt-8 space-y-6">
        <div 
          className="p-4 bg-black/20 rounded-lg opacity-0 animate-fade-in-up"
          style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
        >
          <h3 className="font-semibold text-purple-300">Number of the Day</h3>
          <p className="text-4xl font-bold text-white mt-1">{report.number_of_day.number}</p>
          <p className="text-xs text-gray-500">{report.number_of_day.keywords}</p>
        </div>
        <div 
          className="p-4 bg-black/20 rounded-lg opacity-0 animate-fade-in-up"
          style={{ animationDelay: '750ms', animationFillMode: 'forwards' }}
        >
          <h3 className="font-semibold text-cyan-300">Cosmic Influence</h3>
          <p className="text-lg text-white mt-1">{report.cosmic_influence.title}</p>
          <p className="text-xs text-gray-500">{report.cosmic_influence.description}</p>
        </div>
      </div>
    </Card>
  );
};

export default DailyReport;
