
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { useCompTheme } from '@/contexts/compTheme';
import { useParams } from 'react-router-dom';
import { getCompetitionTheme } from '@/config/competitions';
import { useColors } from '@/hooks';
import { componentStyles } from '@/utils';

const competition = {
    id: 'dallas-ai',
    title: 'Dallas AI Summer Program 2025',
    subtitle: 'Applications Open!',
    description: 'The world\'s first AI Summer Camp where models, data and infra are all hosted on blockchain network, where future builders learn, collaborate, and innovate at the edge of AI and Web3. Learn to build verifiable models, tokenized datasets, and intelligent agents with global mentors, hands-on projects, and a collaborative community redefining the future of AI.',
    dates: 'June 7 - August 9, 2025',
    location: 'Dallas, TX (In-person + Zoom)',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    schedule: [
        { event: 'Kickoff', date: 'June 7th, 2025', format: 'In-person' },
        { event: 'Sessions', date: 'June 14th – August 2nd', format: 'In-person + Zoom' },
        { event: 'Showcase', date: 'August 9th, 2025', format: 'In-person' }
    ],
    incentives: 'Earn TRIE tokens by participating in the Dallas AI Summer Program 2025 — these tokens not only reward your contributions to decentralized AI but also give you future access to premium datasets, tools and fair monetization opportunities on the Trie network.',
    themes: [],
    prizes: []
}

export default function CompetitionHome() {
    const { primaryColor } = useCompTheme();
    const { compid = 'default' } = useParams();

    const currentCompId = compid;
    const displayedCompetition = currentCompId === 'dallas-ai' ? competition : {
        ...competition,
        id: currentCompId,
        title: getCompetitionTheme(currentCompId)?.name || 'Competition',
    };

    return (
        <motion.div
            key={displayedCompetition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
            <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto relative">
                    <img
                        src={displayedCompetition.image}
                        alt={displayedCompetition.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-6 md:w-2/3">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{displayedCompetition.title}</h2>
                        <p style={{ color: primaryColor }} className="font-medium">{displayedCompetition.subtitle}</p>
                    </div>

                    <p className="text-gray-600 mb-4">{displayedCompetition.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">{displayedCompetition.dates}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{displayedCompetition.location}</span>
                        </div>
                    </div>

                    {displayedCompetition.id === 'trie-open-2025' && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Themes</h3>
                            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                                {displayedCompetition?.themes?.map((theme, index) => (
                                    <li key={index}>{theme}</li>
                                ))}
                            </ul>

                            <div className="mt-4 p-4 rounded-lg" style={{
                                background: `linear-gradient(to right, ${primaryColor}10, transparent)`,
                                borderLeft: `4px solid ${primaryColor}`
                            }}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                    <Trophy className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
                                    Rewards
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                                    {displayedCompetition?.prizes?.map((prize, index) => (
                                        <li key={index}>{prize}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {displayedCompetition.id === 'dallas-ai' && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Program Schedule</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {displayedCompetition?.schedule?.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="font-medium mr-2">{item.event}:</span>
                                        <span>{item.date} ({item.format})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {displayedCompetition.id === 'dallas-ai' && (
                        <div className="mt-4 p-4 rounded-lg" style={{
                            background: `linear-gradient(to right, ${primaryColor}10, transparent)`,
                            borderLeft: `4px solid ${primaryColor}`
                        }}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <Trophy className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
                                Rewards
                            </h3>
                            <p className="text-sm text-gray-700">{displayedCompetition.incentives}</p>
                        </div>
                    )}

                </div>
            </div>
        </motion.div>
    )
}
