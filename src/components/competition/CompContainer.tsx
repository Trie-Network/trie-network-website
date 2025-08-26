import { useParams } from 'react-router-dom';
import { CompThemeProvider } from '@/contexts/compTheme';
import { getCompetitionTheme } from '@/config/competitions';


import CompetitionLayout from './CompetitionLayout';
import CompetitionHome from './CompetitionHome';
import CompDatasets from './CompDatasets';
import CompModels from './CompModels';
import CompMyUploads from './CompMyUploads';
import CompUploadAI from './CompUploadAI';
import CompUploadDS from './CompUploadDS';


export type ViewType = 'home' | 'models' | 'datasets' | 'upload-model' | 'upload-dataset' | 'my-uploads';

export interface ViewComponent {
    [key: string]: React.ComponentType;
}


const COMPETITION_VIEWS: ViewComponent = {
    "home": CompetitionHome,
    "models": CompModels,
    "datasets": CompDatasets,
    "upload-model": CompUploadAI,
    "upload-dataset": CompUploadDS,
    "my-uploads": CompMyUploads,
} as const;

const DEFAULT_VIEW: ViewType = 'home';
const DEFAULT_COMP_ID = 'default';


const getViewComponent = (view: string): React.ComponentType => {
    return COMPETITION_VIEWS[view as ViewType] || COMPETITION_VIEWS[DEFAULT_VIEW];
};

const getCompetitionParams = (params: any) => {
    return {
        view: params.view || DEFAULT_VIEW,
        compId: params.compid || DEFAULT_COMP_ID
    };
};


export function CompContainer() {
    const params = useParams();
    const { view, compId } = getCompetitionParams(params);
    
    const compTheme = getCompetitionTheme(compId);
    
    const ViewComponent = getViewComponent(view);

    return (
        <CompThemeProvider compId={compId} primaryColor={compTheme.primaryColor}>
            <CompetitionLayout>
                <ViewComponent />
            </CompetitionLayout>
        </CompThemeProvider>
    );
}