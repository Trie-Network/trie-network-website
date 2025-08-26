
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { useCompTheme } from '@/contexts/compTheme';
import { useParams } from 'react-router-dom';
import { getCompetitionTheme } from '@/config/competitions';


interface ScheduleItem {
    event: string;
    date: string;
    format: string;
}

interface CompetitionData {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    dates: string;
    location: string;
    image: string;
    schedule: ScheduleItem[];
    incentives: string;
}

interface CompetitionHomeProps {
}


const DALLAS_AI_COMPETITION: CompetitionData = {
    id: 'dallas-ai',
    title: 'Dallas AI Summer Program 2025',
    subtitle: 'Applications Open!',
    description: 'The world\'s first AI Summer Camp where models, data and infra are all hosted on blockchain network, where future builders learn, collaborate, and innovate at the edge of AI and Web3. Learn to build verifiable models, tokenized datasets, and intelligent agents with global mentors, hands-on projects, and a collaborative community redefining the future of AI.',
    dates: 'June 7 - August 9, 2025',
    location: 'Dallas, TX (In-person + Zoom)',
    image: '/competition-hero.jpg',
    schedule: [
        { event: 'Kickoff', date: 'June 7th, 2025', format: 'In-person' },
        { event: 'Sessions', date: 'June 14th – August 2nd', format: 'In-person + Zoom' },
        { event: 'Showcase', date: 'August 9th, 2025', format: 'In-person' }
    ],
    incentives: 'Earn TRIE tokens by participating in the Dallas AI Summer Program 2025 — these tokens not only reward your contributions to decentralized AI but also give you future access to premium datasets, tools and fair monetization opportunities on the Trie network.'
};

const ANIMATION_CONFIG = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
} as const;


const getDisplayedCompetition = (compId: string): CompetitionData => {
    if (compId === 'dallas-ai') {
        return DALLAS_AI_COMPETITION;
    }
    
    return {
        ...DALLAS_AI_COMPETITION,
        id: compId,
        title: getCompetitionTheme(compId)?.name || 'Competition',
    };
};

const getRewardBoxStyle = (primaryColor: string) => ({
    background: `linear-gradient(to right, ${primaryColor}10, transparent)`,
    borderLeft: `4px solid ${primaryColor}`
});


const CompetitionImage = ({ image, title }: { image: string; title: string }) => (
    <div className="md:w-1/3 h-48 md:h-auto relative">
        <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
        />
    </div>
);

const CompetitionHeader = ({ title, subtitle, primaryColor }: { title: string; subtitle: string; primaryColor: string }) => (
    <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p style={{ color: primaryColor }} className="font-medium">{subtitle}</p>
    </div>
);

const CompetitionDetails = ({ dates, location }: { dates: string; location: string }) => (
    <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{dates}</span>
        </div>
        <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{location}</span>
        </div>
    </div>
);



const RewardsBox = ({ title, children, primaryColor }: { title: string; children: React.ReactNode; primaryColor: string }) => (
    <div className="mt-4 p-4 rounded-lg" style={getRewardBoxStyle(primaryColor)}>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Trophy className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
            {title}
        </h3>
        {children}
    </div>
);

const ScheduleSection = ({ schedule }: { schedule: ScheduleItem[] }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Program Schedule</h3>
        <ul className="text-sm text-gray-600 space-y-1">
            {schedule.map((item, index) => (
                <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{item.event}:</span>
                    <span>{item.date} ({item.format})</span>
                </li>
            ))}
        </ul>
    </div>
);


export default function CompetitionHome(props: CompetitionHomeProps) {
    const { primaryColor } = useCompTheme();
    const { compid = 'default' } = useParams();

    const displayedCompetition = getDisplayedCompetition(compid);

    return (
        <motion.div
            key={displayedCompetition.id}
            {...ANIMATION_CONFIG}
            className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden"
        >
            <div className="md:flex">
                <CompetitionImage 
                    image={displayedCompetition.image} 
                    title={displayedCompetition.title} 
                />
                
                <div className="p-6 md:w-2/3">
                    <CompetitionHeader 
                        title={displayedCompetition.title}
                        subtitle={displayedCompetition.subtitle}
                        primaryColor={primaryColor}
                    />

                    <p className="text-gray-600 mb-4">{displayedCompetition.description}</p>

                    <CompetitionDetails 
                        dates={displayedCompetition.dates}
                        location={displayedCompetition.location}
                    />




                    
                    {displayedCompetition.id === 'dallas-ai' && (
                        <>
                            <ScheduleSection schedule={displayedCompetition.schedule} />
                            <RewardsBox title="Rewards" primaryColor={primaryColor}>
                                <p className="text-sm text-gray-700">{displayedCompetition.incentives}</p>
                            </RewardsBox>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
