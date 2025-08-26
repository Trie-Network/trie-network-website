import { ModelUploadView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';


interface CompUploadAIProps {
   
}


export default function CompUploadAI(props: CompUploadAIProps) {
  
    const { primaryColor, compId } = useCompTheme();

    return (
        <ModelUploadView 
            primaryColor={primaryColor} 
            compId={compId} 
        />
    );
}
