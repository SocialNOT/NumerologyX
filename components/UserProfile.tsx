
import React from 'react';
import { UserIcon } from './icons/UserIcon';
import { Card } from './ui/Card';
import type { NumerologyReport, UserData, UserProfileData } from '../types';
import { ColorPaletteIcon } from './icons/ColorPaletteIcon';
import { CompassIcon } from './icons/CompassIcon';
import { HashtagIcon } from './icons/HashtagIcon';

interface UserProfileProps {
    report: NumerologyReport | null;
    userData: UserData | null;
    profileTraits: UserProfileData | null;
    isLoading: boolean;
}

const TraitCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; colorSwatch?: string }> = ({ icon, title, value, colorSwatch }) => (
    <div className="flex items-center p-3 bg-black/20 rounded-lg">
        {icon}
        <div className="ml-3">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="font-semibold text-white">{value}</p>
        </div>
        {colorSwatch && (
            <div className="ml-auto w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: colorSwatch }}></div>
        )}
    </div>
);


const UserProfile: React.FC<UserProfileProps> = ({ report, userData, profileTraits, isLoading }) => {
  if (!report || !userData) {
    return (
      <Card className="text-center opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
        <div className="flex justify-center items-center mb-4">
          <UserIcon className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
          Your Profile
        </h2>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          Generate a report to unlock your personalized cosmic dashboard.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="opacity-0 animate-fade-in-up" style={{animationFillMode: 'forwards'}}>
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-white"/>
            </div>
            <h2 className="text-2xl font-bold">{userData.fullName}</h2>
            <p className="text-gray-400">{new Date(userData.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
        </div>
      </Card>
      
      {/* Pythagorean Core Numbers Card */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
        <h3 className="text-xl font-bold text-center mb-4 text-cyan-300">Core Numbers (Pythagorean)</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div>
                <p className="text-sm text-gray-400">Life Path</p>
                <p className="text-2xl font-bold">{report.pythagorean.calculations.lifePath.number}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Destiny</p>
                <p className="text-2xl font-bold">{report.pythagorean.calculations.destiny.number}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">Soul Urge</p>
                <p className="text-2xl font-bold">{report.pythagorean.calculations.soulUrge.number}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">Personality</p>
                <p className="text-2xl font-bold">{report.pythagorean.calculations.personality.number}</p>
            </div>
        </div>
      </Card>
      
      {/* Chaldean Core Numbers Card */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '225ms', animationFillMode: 'forwards' }}>
        <h3 className="text-xl font-bold text-center mb-4 text-purple-300">Core Numbers (Chaldean)</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div>
                <p className="text-sm text-gray-400">Life Path</p>
                <p className="text-2xl font-bold">{report.chaldean.calculations.lifePath.number}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Destiny</p>
                <p className="text-2xl font-bold">{report.chaldean.calculations.destiny.number}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">Soul Urge</p>
                <p className="text-2xl font-bold">{report.chaldean.calculations.soulUrge.number}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">Personality</p>
                <p className="text-2xl font-bold">{report.chaldean.calculations.personality.number}</p>
            </div>
        </div>
      </Card>

      {/* Cosmic Traits Card */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '375ms', animationFillMode: 'forwards' }}>
         <h3 className="text-xl font-bold text-center mb-4 text-purple-300">Cosmic Traits</h3>
         {isLoading ? (
            <div className="flex justify-center items-center py-4">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
         ) : profileTraits ? (
            <div className="space-y-3">
                <TraitCard icon={<ColorPaletteIcon className="w-5 h-5 text-pink-400"/>} title="Lucky Color" value={profileTraits.luckyColor.name} colorSwatch={profileTraits.luckyColor.hex} />
                <TraitCard icon={<HashtagIcon className="w-5 h-5 text-green-400"/>} title="Lucky Number" value={profileTraits.luckyNumber} />
                <TraitCard icon={<CompassIcon className="w-5 h-5 text-blue-400"/>} title="Cardinal Direction" value={profileTraits.cardinalDirection} />
            </div>
         ) : (
            <p className="text-center text-gray-500">Could not load cosmic traits.</p>
         )}
      </Card>
    </div>
  );
};

export default UserProfile;
