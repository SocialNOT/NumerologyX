import React, { useState } from 'react';
import type { UserData } from '../types';
import { UserIcon } from './icons/UserIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { Card } from './ui/Card';

interface NumerologyFormProps {
  onCalculate: (userData: UserData) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const NumerologyForm: React.FC<NumerologyFormProps> = ({ onCalculate, isLoading, error, onClearError }) => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    onClearError();
    if (!fullName.trim() || !dob) {
      setValidationError('Please fill out both your full name and date of birth.');
      return;
    }
    setValidationError('');
    onCalculate({ fullName, dob });
  };

  return (
    <Card className="opacity-0 animate-fade-in-up" style={{animationFillMode: 'forwards'}}>
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
          Unlock Your Cosmic Blueprint
        </h2>
        <p className="text-gray-400 mt-2">Enter your details to reveal your core numbers.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name (as on birth certificate)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., John Michael Doe"
              className="w-full bg-black/20 border border-white/30 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300"
              disabled={isLoading}
            />
          </div>
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-300 mb-1">
            Date of Birth
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-black/20 border border-white/30 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 appearance-none"
              style={{ colorScheme: 'dark' }}
              disabled={isLoading}
            />
          </div>
        </div>

        {validationError && <p className="text-yellow-400 text-sm text-center">{validationError}</p>}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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