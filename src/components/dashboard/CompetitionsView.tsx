import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EmptyState, Skeleton, Modal } from '@/components/ui';
import { Calendar, MapPin, ExternalLink, Trophy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCompTheme } from '@/contexts/compTheme';
import { getCompetitionTheme } from '@/config/competitions';
import { getNetworkColor } from '../../config/colors';
import { CURRENT_NETWORK, Network, isMainnet } from '@/config/network';


interface Competition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dates: string;
  location: string;
  discord_link: string;
  discord_img: string;
  image: string;
  schedule: Array<{
    event: string;
    date: string;
    format: string;
  }>;
  incentives: string;
  applyUrl: string;
  meetupUrl: string;
  status: 'upcoming' | 'past';
}

interface FormData {
  name: string;
  email: string;
  teamSize: string;
  projectIdea: string;
  experience: string;
}

const LOADING_DURATION = 1500;
const SUBMISSION_DURATION = 1500;
const SUCCESS_DELAY = 2000;

const TAB_TYPES = {
  UPCOMING: 'upcoming',
  PAST: 'past'
} as const;

const REGISTRATION_STATUS = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  REGISTERED: 'registered'
} as const;

const STORAGE_KEYS = {
  HACKATHON_REGISTERED: 'trie_hackathon_registered'
} as const;

const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
} as const;

const COMPETITIONS_DATA: Competition[] = [
  {
    id: 'dallas-ai',
    title: 'Dallas AI Summer Program 2025',
    subtitle: 'Applications Open!',
    description: 'The world\'s first AI Summer Camp where models, data and infra are all hosted on blockchain network, where future builders learn, collaborate, and innovate at the edge of AI and Web3. Learn to build verifiable models, tokenized datasets, and intelligent agents with global mentors, hands-on projects, and a collaborative community redefining the future of AI.',
    dates: 'June 7 - August 9, 2025',
    location: 'Dallas, TX (In-person + Zoom)',
    discord_link: 'https://discord.gg/x2XqSPu8',
    discord_img: '/discord.png',
    image: '/competition-hero.jpg',
    schedule: [
      { event: 'Kickoff', date: 'June 7th, 2025', format: 'In-person' },
      { event: 'Sessions', date: 'June 14th – August 2nd', format: 'In-person + Zoom' },
      { event: 'Showcase', date: 'August 9th, 2025', format: 'In-person' }
    ],
    incentives: 'Earn TRIE tokens by participating in the Dallas AI Summer Program 2025 — these tokens not only reward your contributions to decentralized AI but also give you future access to premium datasets, tools and fair monetization opportunities on the Trie network.',
    applyUrl: 'https://form.jotform.com/251185485610154',
    meetupUrl: 'https://www.meetup.com/dal-ai/events/307540963/',
    status: 'upcoming'
  },

];

const DEFAULT_FORM_DATA: FormData = {
  name: '',
  email: '',
  teamSize: '1',
  projectIdea: '',
  experience: ''
};

const TEAM_SIZE_OPTIONS = [
  { value: '1', label: 'Solo (1 person)' },
  { value: '2', label: '2 people' },
  { value: '3', label: '3 people' },
  { value: '4', label: '4 people' },
  { value: '5', label: '5 people' }
];

const IMPORTANT_DATES = [
  { label: 'Registration Deadline:', date: 'May 15, 2025' },
  { label: 'Kickoff Event:', date: 'May 18, 2025' },
  { label: 'Submission Deadline:', date: 'May 31, 2025' }
];


const getFilteredCompetitions = (competitions: Competition[]): Competition[] => {
  return isMainnet
    ? competitions.filter(comp => comp.id !== 'dallas-ai')
    : competitions;
};

const getCompetitionsByStatus = (competitions: Competition[], status: string): Competition[] => {
  return competitions.filter(comp => comp.status === status);
};

const getInputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = getNetworkColor();
  e.currentTarget.style.setProperty('--tw-ring-color', getNetworkColor());
};

const getInputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = '#d1d5db';
};

const getRewardsBoxStyle = (primaryColor: string): React.CSSProperties => ({
  background: `linear-gradient(to right, ${primaryColor}10, transparent)`,
  borderLeft: `4px solid ${primaryColor}`
});

const getHoverStyle = (primaryColor: string): React.CSSProperties => ({
  ':hover': { backgroundColor: `${primaryColor}10` }
} as React.CSSProperties);

export function CompetitionsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(TAB_TYPES.UPCOMING);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'submitting' | 'success' | 'registered'>('idle');
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const { primaryColor } = useCompTheme();

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const isRegistered = localStorage.getItem(STORAGE_KEYS.HACKATHON_REGISTERED) === 'true';
    if (isRegistered) {
      setRegistrationStatus(REGISTRATION_STATUS.REGISTERED);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationStatus(REGISTRATION_STATUS.SUBMITTING);

    setTimeout(() => {
      setRegistrationStatus(REGISTRATION_STATUS.SUCCESS);
      localStorage.setItem(STORAGE_KEYS.HACKATHON_REGISTERED, 'true');

      setFormData(DEFAULT_FORM_DATA);
      toast.success('Successfully registered for the hackathon!');

      setTimeout(() => {
        setShowRegistrationModal(false);
        setRegistrationStatus(REGISTRATION_STATUS.REGISTERED);
      }, SUCCESS_DELAY);
    }, SUBMISSION_DURATION);
  };

  const filteredCompetitions = getFilteredCompetitions(COMPETITIONS_DATA);
  const competitionsByStatus = getCompetitionsByStatus(filteredCompetitions, activeTab);

  return (
    <div className="min-h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide px-4 md:px-6 lg:px-8 py-6">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-xl border border-[#e1e3e5] p-6 mb-8">
          {isLoading ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Skeleton className="w-48 h-8 mb-2" />
                <Skeleton className="w-96 h-4" />
              </div>
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  AI Competitions
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">New</span>
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Participate in AI challenges, showcase your skills, and win rewards
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab(TAB_TYPES.UPCOMING)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === TAB_TYPES.UPCOMING
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  style={activeTab === TAB_TYPES.UPCOMING ? { backgroundColor: primaryColor } : {}}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab(TAB_TYPES.PAST)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === TAB_TYPES.PAST
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  style={activeTab === TAB_TYPES.PAST ? { backgroundColor: primaryColor } : {}}
                >
                  Past
                </button>
              </div>
            </div>
          )}
        </div>


        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-5">
                  <Skeleton className="w-3/4 h-6 mb-2" />
                  <Skeleton className="w-full h-4 mb-1" />
                  <Skeleton className="w-5/6 h-4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-24 h-8 rounded-lg" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {competitionsByStatus.length > 0 ? (
              competitionsByStatus.map((competition) => (
                <motion.div
                  key={competition.id}
                  {...ANIMATION_CONFIG}
                  className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img
                        src={competition.image}
                        alt={competition.title}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute top-4 right-4 px-3 py-1 text-white text-xs font-bold rounded-full" 
                        style={{ backgroundColor: primaryColor }}
                      >
                        {competition.status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </div>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{competition.title}</h2>
                        <p className="font-medium" style={{ color: primaryColor }}>{competition.subtitle}</p>
                      </div>

                      <p className="text-gray-600 mb-4">{competition.description}</p>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">{competition.dates}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{competition.location}</span>
                        </div>
                      </div>



                      {competition.id === 'dallas-ai' && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Program Schedule</h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {competition?.schedule?.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="font-medium mr-2">{item.event}:</span>
                                <span>{item.date} ({item.format})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {competition.id === 'dallas-ai' && (
                        <div className="mt-4 p-4 rounded-lg" style={getRewardsBoxStyle(primaryColor)}>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                            <Trophy className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
                            Rewards
                          </h3>
                          <p className="text-sm text-gray-700">{competition.incentives}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        

                        {competition.id === 'dallas-ai' && (
                          <>
                            <a
                              href={competition.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium flex items-center"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Apply Now
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                            <a
                              href={competition.meetupUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center"
                              style={{
                                borderColor: primaryColor,
                                color: primaryColor,
                                backgroundColor: 'transparent'
                              }}
                            >
                              View on Meetup
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>

                            <a
                              href={`/competition/${competition.id}/home`}
                              className="px-4 py-2 border text-gray-500 rounded-lg transition-colors text-sm font-medium flex items-center"
                              style={getHoverStyle(getCompetitionTheme(competition.id).primaryColor)}
                            >
                              Enter
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState
                title={activeTab === 'upcoming' ? "No Upcoming Competitions" : "No Past Competitions"}
                description={activeTab === 'upcoming'
                  ? "There are no upcoming competitions at the moment. Check back later for new challenges."
                  : "There are no past competitions to display. Future completed competitions will appear here."}
                icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                action={{
                  label: "Get Notified",
                  onClick: () => {
                    alert("You'll be notified when new competitions are available!");
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

    
      <Modal
        show={showRegistrationModal}
        onClose={() => {
          if (registrationStatus !== 'submitting') {
            setShowRegistrationModal(false);
          }
        }}
        title={registrationStatus === 'registered' ? 'Registration Status' : 'Register for Competition'}
      >
        {registrationStatus === 'success' ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for registering for the competition. We'll be in touch with more details soon.
            </p>
          </div>
        ) : registrationStatus === 'registered' ? (
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">You're Registered!</h3>
            <p className="text-gray-600 mb-6 text-center">
              You've already registered for the competition. We'll send you updates via email.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Important Dates</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {IMPORTANT_DATES.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{item.label}</span>
                    <span>{item.date}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEYS.HACKATHON_REGISTERED);
                  setRegistrationStatus('idle');
                  setShowRegistrationModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Cancel Registration
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white"
                  style={{ '--tw-ring-color': getNetworkColor() } as React.CSSProperties}
                  onFocus={getInputFocusStyle}
                  onBlur={getInputBlurStyle}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white"
                  style={{ '--tw-ring-color': getNetworkColor() } as React.CSSProperties}
                  onFocus={getInputFocusStyle}
                  onBlur={getInputBlurStyle}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <select
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white"
                  style={{ '--tw-ring-color': getNetworkColor() } as React.CSSProperties}
                  onFocus={getInputFocusStyle}
                  onBlur={getInputBlurStyle}
                >
                  {TEAM_SIZE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="projectIdea" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Idea <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="projectIdea"
                  name="projectIdea"
                  value={formData.projectIdea}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white"
                  style={{ '--tw-ring-color': getNetworkColor() } as React.CSSProperties}
                  onFocus={getInputFocusStyle}
                  onBlur={getInputBlurStyle}
                  placeholder="Briefly describe your project idea"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience with AI/Web3
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white"
                  style={{ '--tw-ring-color': getNetworkColor() } as React.CSSProperties}
                  onFocus={getInputFocusStyle}
                  onBlur={getInputBlurStyle}
                  placeholder="Share your experience with AI and Web3 technologies"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-sm text-yellow-800">
                  By registering, you agree to the hackathon rules and code of conduct. All submissions must be open source.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRegistrationModal(false)}
                disabled={registrationStatus === 'submitting'}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registrationStatus === 'submitting'}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center"
                style={{ backgroundColor: primaryColor }}
              >
                {registrationStatus === 'submitting' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}