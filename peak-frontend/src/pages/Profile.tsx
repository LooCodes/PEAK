import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth() as any;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="text-center">No user data available.</div>
      </div>
    );
  }

  const heightInches = user.height ?? 0;
  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;

  return (
    <div className="min-h-screen from-blue-50 to-purple-50 p-4 pt-24">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#1a1a1a] rounded-3xl p-8 shadow-lg border-4 border-[#1a1a1a]" style={{ borderStyle: 'solid' }}>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Profile</h2>
            <p className="text-sm">Your account information</p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-white">
            <div className="p-4 bg-[#212121] rounded-xl">
              <strong>Username:</strong> <span className="ml-2">{user.username}</span>
            </div>

            <div className="p-4 bg-[#212121] rounded-xl">
              <strong>Email:</strong> <span className="ml-2">{user.email}</span>
            </div>

            <div className="p-4 bg-[#212121] rounded-xl">
              <strong>Age:</strong> <span className="ml-2">{user.age ?? '—'}</span>
            </div>

            <div className="p-4 bg-[#212121] rounded-xl">
              <strong>Height:</strong>
              <span className="ml-2">{heightInches ? `${feet} ft ${inches} in` : '—'}</span>
            </div>

            <div className="p-4 bg-[#212121] rounded-xl">
              <strong>Weight:</strong> <span className="ml-2">{user.weight ? `${user.weight} lbs` : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
