import { v4 as uuidv4 } from 'uuid';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e'
];

const ADJECTIVES = ['Swift', 'Silent', 'Mighty', 'Brave', 'Clever', 'Neon', 'Cosmic', 'Hyper', 'Turbo', 'Shadow'];
const NOUNS = ['Ninja', 'Pixel', 'Wizard', 'Knight', 'Rider', 'Phantom', 'Dragon', 'Wolf', 'Hawk', 'Fox'];

export const generateUser = () => {
  const existing = localStorage.getItem('tileUser');
  if (existing) {
    return JSON.parse(existing);
  }

  const user = {
    id: uuidv4(),
    name: `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
  
  localStorage.setItem('tileUser', JSON.stringify(user));
  return user;
};
