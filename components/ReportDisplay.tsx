import React, { useState } from 'react';
import type { NumerologyReport, SystemReport, Interpretation, CalculationDetail, Remedy } from '../types';
import { useCountUp } from '../hooks/useCountUp';
import { Card } from './ui/Card';
import { GemstoneIcon } from './icons/GemstoneIcon';
import { MantraIcon } from './icons/MantraIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { ReflectionIcon } from './icons/ReflectionIcon';

interface ReportDisplayProps {
  report: NumerologyReport;
  onReset: () => void;
}

type System = 'pythagorean' | 'chaldean';

const NumberCard: React.FC<{ title: string; detail: CalculationDetail }> = ({ title, detail }) => {
    const animatedNumber = useCountUp(detail.number);
    return (
        <Card className="flex flex-col items-center text-center p-4 h-full">
            <h3 className="text-lg font-semibold text-purple-300">{title}</h3>
            <div className="flex-grow flex items-center justify-center">
                <p className="text-5xl font-bold my-2 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-300">{animatedNumber}</p>
            </div>
            <p className="text-xs text-gray-400 leading-normal whitespace-pre-wrap">{detail.steps}</p>
        </Card>
    );
};

const InterpretationCard: React.FC<{ title: string; interpretation: Interpretation; delay: number }> = ({ title, interpretation, delay }) => (
    <Card className="opacity-0 animate-fade-in-up bg-gradient-to-br from-purple-950/20 via-transparent to-transparent" style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
        <h3 className="text-xl font-bold mb-2 text-cyan-300">{title}: {interpretation.title}</h3>
        <p className="text-sm italic text-purple-300 mb-4">{interpretation.keywords}</p>
        <p className="text-gray-300 text-base leading-relaxed">{interpretation.interpretation}</p>
    </Card>
);

const RemedyCard: React.FC<{ remedy: Remedy }> = ({ remedy }) => {
    const remedyIcons: Record<Remedy['type'], React.ReactNode> = {
        Gemstone: <GemstoneIcon className="w-6 h-6 mr-3 text-pink-400 flex-shrink-0" />,
        Mantra: <MantraIcon className="w-6 h-6 mr-3 text-yellow-400 flex-shrink-0" />,
        Activity: <ActivityIcon className="w-6 h-6 mr-3 text-green-400 flex-shrink-0" />,
        Reflection: <ReflectionIcon className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0" />,
    };

    return (
      <div className={`flex items-start p-4 rounded-lg bg-black/20`}>
        {remedyIcons[remedy.type]}
        <div>
            <h4 className="font-semibold">{remedy.title}</h4>
            <p className="text-sm text-gray-400 mt-1">{remedy.description}</p>
        </div>
      </div>
    )
};

const SystemToggle: React.FC<{ activeSystem: System; onSystemChange: (system: System) => void }> = ({ activeSystem, onSystemChange }) => (
    <div className="flex justify-center p-1 bg-black/20 rounded-full border border-white/20 mb-4">
        <button
            onClick={() => onSystemChange('pythagorean')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeSystem === 'pythagorean' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
            Pythagorean
        </button>
        <button
            onClick={() => onSystemChange('chaldean')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeSystem === 'chaldean' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
            Chaldean
        </button>
    </div>
);


export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onReset }) => {
  const [activeSystem, setActiveSystem] = useState<System>('pythagorean');
  
  const activeReport: SystemReport = report[activeSystem];

  return (
    <div className="space-y-6">
        
        {/* System Toggle and Numbers Grid */}
        <Card className="opacity-0 animate-fade-in-up" style={{animationDelay: '150ms', animationFillMode: 'forwards'}}>
             <SystemToggle activeSystem={activeSystem} onSystemChange={setActiveSystem} />
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <NumberCard title="Life Path" detail={activeReport.calculations.lifePath} />
                <NumberCard title="Destiny" detail={activeReport.calculations.destiny} />
                <NumberCard title="Soul Urge" detail={activeReport.calculations.soulUrge} />
                <NumberCard title="Personality" detail={activeReport.calculations.personality} />
            </div>
        </Card>
       
        {/* Summary */}
        <Card className="opacity-0 animate-fade-in-up bg-gradient-to-br from-purple-950/20 via-transparent to-transparent" style={{animationDelay: '300ms', animationFillMode: 'forwards'}}>
            <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Cosmic Summary</h2>
            <p className="text-gray-300 leading-relaxed text-center">{report.summary}</p>
        </Card>

        {/* Interpretations */}
        <div className="space-y-6">
            <InterpretationCard title={`Life Path (${activeSystem})`} interpretation={activeReport.interpretations.lifePath} delay={450} />
            <InterpretationCard title={`Destiny (${activeSystem})`} interpretation={activeReport.interpretations.destiny} delay={550} />
            <InterpretationCard title={`Soul Urge (${activeSystem})`} interpretation={activeReport.interpretations.soulUrge} delay={650} />
            <InterpretationCard title={`Personality (${activeSystem})`} interpretation={activeReport.interpretations.personality} delay={750} />
        </div>

        {/* Remedies */}
        <Card className="opacity-0 animate-fade-in-up bg-gradient-to-br from-purple-950/20 via-transparent to-transparent" style={{animationDelay: '900ms', animationFillMode: 'forwards'}}>
            <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Personalized Remedies</h2>
            <div className="space-y-4">
                {report.quickRemedies.map((remedy, index) => <RemedyCard key={index} remedy={remedy} />)}
            </div>
        </Card>

        <div className="text-center pt-4 opacity-0 animate-fade-in-up" style={{animationDelay: '1050ms', animationFillMode: 'forwards'}}>
            <button
                onClick={onReset}
                className="font-semibold py-2 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
                Calculate New Report
            </button>
        </div>
    </div>
  );
};