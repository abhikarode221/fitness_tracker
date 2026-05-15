import { useState, useEffect } from 'react';

export const useKinetic = () => {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('kinetic_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('kinetic_profile');
    return saved ? JSON.parse(saved) : { weight: 80, height: 180, target: 75 };
  });

  useEffect(() => {
    localStorage.setItem('kinetic_logs', JSON.stringify(workouts));
    localStorage.setItem('kinetic_profile', JSON.stringify(profile));
  }, [workouts, profile]);

  const addWorkout = (newWorkout) => {
    setWorkouts([newWorkout, ...workouts]);
  };

  return { workouts, addWorkout, profile, setProfile };
};