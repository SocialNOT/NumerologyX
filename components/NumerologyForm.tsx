
import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { UserIcon } from './icons/UserIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { Card } from './ui/Card';
import { soundService } from '../services/soundService';

interface NumerologyFormProps {
  onCalculate: (userData: UserData) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const HOOKS = [
  "Why do you keep seeing 11:11?",
  "Is your name holding you back?",
  "What does your birth date whisper?",
  "Discover your hidden talents.",
  "Decode your destiny today.",
  "Are you on the right path?"
];

export const NumerologyForm: React.FC<NumerologyFormProps> = ({ onCalculate, isLoading, error, onClearError }) => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [validationError, setValidationError] = useState('');
  const [currentHookIndex, setCurrentHookIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHookIndex((prev) => (prev + 1) % HOOKS.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    onClearError();
    if (!fullName.trim() || !dob) {
      setValidationError('Please fill out both your full name and date of birth.');
      soundService.playClick(); // Play click even on error to acknowledge interaction
      return;
    }
    setValidationError('');
    soundService.playProcessing();
    onCalculate({ fullName, dob });
  };

  return (
    <Card className="opacity-0 animate-fade-in-up" style={{animationFillMode: 'forwards'}}>
      <div className="text-center mb-6">
        
        {/* Dynamic Hook Carousel */}
        <div className="h-6 mb-3 relative overflow-hidden">
            {HOOKS.map((hook, index) => (
                <p
                    key={index}
                    className={`absolute w-full text-sm font-medium text-theme-600 dark:text-cyan-200 tracking-wider transition-all duration-1000 transform ${
                        index === currentHookIndex 
                        ? 'opacity-100 translate-y-0 blur-0' 
                        : 'opacity-0 translate-y-4 blur-sm'
                    }`}
                >
                    ✨ {hook} ✨
                </p>
            ))}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-300 dark:to-cyan-300">
          Unlock Your Cosmic Blueprint
        </h2>
        <p className="text-txt-muted mt-2">Enter your details to reveal your core numbers.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-txt-muted mb-1">
            Full Name (as on birth certificate)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className="h-5 w-5 text-txt-muted" />
            </div>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., John Michael Doe"
              className="w-full bg-bg-hover/50 border border-subtle text-txt-main rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-theme-500 focus:border-theme-500 transition duration-300 placeholder-txt-muted/50"
              disabled={isLoading}
            />
          </div>
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-txt-muted mb-1">
            Date of Birth
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-txt-muted" />
            </div>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-bg-hover/50 border border-subtle text-txt-main rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-theme-500 focus:border-theme-500 transition duration-300 appearance-none"
              style={{ colorScheme: 'dark' }} // Keep date picker dark as it's often better supported
              disabled={isLoading}
            />
          </div>
        </div>

        {validationError && <p className="text-yellow-600 dark:text-yellow-400 text-sm text-center">{validationError}</p>}
        {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
            </>
          ) : (
            'Reveal My Numbers'
          )}
        </button>
      </form>
    </Card>
  );
};
