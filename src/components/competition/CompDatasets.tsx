import { DatasetsView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';


interface CompDatasetsProps {
}


export default function CompDatasets(props: CompDatasetsProps) {
    
    const { primaryColor, compId } = useCompTheme();

    return (
        <DatasetsView 
            primaryColor={primaryColor} 
            compId={compId} 
        />
    );
}
