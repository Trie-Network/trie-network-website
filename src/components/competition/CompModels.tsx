import { ModelsView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';


interface CompModelsProps {
   
}


export default function CompModels(props: CompModelsProps) {
    
    const { primaryColor, compId } = useCompTheme();

    return (
        <ModelsView 
            primaryColor={primaryColor} 
            compId={compId} 
        />
    );
}
