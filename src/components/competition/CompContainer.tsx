import { useParams } from 'react-router-dom';
import CompetitionLayout from './CompetitionLayout';
import CompDatasets from './CompDatasets';
import CompetitionHome from './CompetitionHome';
import CompModels from './CompModels';
import CompMyUploads from './CompMyUploads';
import CompUploadAI from './CompUploadAI';
import CompUploadDS from './CompUploadDS';
import { CompThemeProvider } from '@/contexts/compTheme';
import { getCompetitionTheme } from '@/config/competitions';

const VIEWS = {
    "home": CompetitionHome,
    "models": CompModels,
    "datasets": CompDatasets,
    "upload-model": CompUploadAI,
    "upload-dataset": CompUploadDS,
    "my-uploads": CompMyUploads,
};

export function CompContainer() {
    const { view = 'all', compid = 'default' } = useParams();
    const View = VIEWS[view as keyof typeof VIEWS] || CompetitionHome;

    const compTheme = getCompetitionTheme(compid);

    return (
        <CompThemeProvider compId={compid} primaryColor={compTheme.primaryColor}>
            <CompetitionLayout>
                <View />
            </CompetitionLayout>
        </CompThemeProvider>
    );
}