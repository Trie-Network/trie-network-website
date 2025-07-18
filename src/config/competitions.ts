
export interface CompetitionTheme {
  id: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  name?: string;
  description?: string;
  dates?: string;
  location?: string;
}

export const COMPETITION_THEMES: Record<string, CompetitionTheme> = {
  'default': {
    id: 'default',
    primaryColor: '#0284a5',
    secondaryColor: '#e6f7fc',
    accentColor: '#004e66',
    textColor: '#333333',
    name: 'Default Competition'
  },
  'dallas-ai': {
    id: 'dallas-ai',
    primaryColor: '#ff6b00',
    secondaryColor: '#fff0e6',
    accentColor: '#cc5500',
    textColor: '#333333',
    name: 'Dallas AI Summer Program 2025',
    description: 'The world\'s first AI Summer Camp where models, data and infra are all hosted on blockchain network',
    dates: 'June 7 - August 9, 2025',
    location: 'Dallas, TX (In-person + Zoom)'
  },
  'trie-open-2025': {
    id: 'trie-open-2025',
    primaryColor: '#8a2be2',
    secondaryColor: '#f5ebff',
    accentColor: '#6a1cb1',
    textColor: '#333333',
    name: 'Trie Open Hackathon 2025',
    description: 'Build the future of AI with Trie Network',
    dates: 'May 18 - May 31, 2025',
    location: 'Online (Virtual Event)'
  }
};

export function getCompetitionTheme(compId: string): CompetitionTheme {
  return COMPETITION_THEMES[compId] || COMPETITION_THEMES.default;
}
