export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled?.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateThumbnail = (title) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const color = colors[title.length % colors.length];
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="${color}"/>
      <text x="128" y="140" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${title.slice(0, 2).toUpperCase()}</text>
    </svg>
  `)}`;
};

// Sample data
export const SAMPLE_GAMES = [
  { id: 1, title: 'Space Adventure', description: 'Epic space exploration game with stunning graphics', url: 'https://example.com/game1', thumbnail: generateThumbnail('Space Adventure') },
  { id: 2, title: 'Racing Thunder', description: 'High-speed racing game with realistic physics', url: 'https://example.com/game2', thumbnail: generateThumbnail('Racing Thunder') },
  { id: 3, title: 'Puzzle Master', description: 'Mind-bending puzzles that challenge your logic', url: 'https://example.com/game3', thumbnail: generateThumbnail('Puzzle Master') },
  { id: 4, title: 'Fantasy Quest', description: 'Embark on a magical journey through mystical lands', url: 'https://example.com/game4', thumbnail: generateThumbnail('Fantasy Quest') },
  { id: 5, title: 'City Builder', description: 'Build and manage your dream city', url: 'https://example.com/game5', thumbnail: generateThumbnail('City Builder') },
  { id: 6, title: 'War Strategy', description: 'Command armies in epic battlefield scenarios', url: 'https://example.com/game6', thumbnail: generateThumbnail('War Strategy') },
  { id: 7, title: 'Ocean Explorer', description: 'Dive deep into underwater adventures', url: 'https://example.com/game7', thumbnail: generateThumbnail('Ocean Explorer') },
  { id: 8, title: 'Ninja Shadow', description: 'Stealth action game with martial arts combat', url: 'https://example.com/game8', thumbnail: generateThumbnail('Ninja Shadow') },
  { id: 9, title: 'Magic Realms', description: 'Spellbinding adventure in enchanted worlds', url: 'https://example.com/game9', thumbnail: generateThumbnail('Magic Realms') },
  { id: 10, title: 'Robot Wars', description: 'Futuristic combat with customizable mechs', url: 'https://example.com/game10', thumbnail: generateThumbnail('Robot Wars') }
];
