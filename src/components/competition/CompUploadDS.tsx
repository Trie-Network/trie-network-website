import { DatasetUploadView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';


interface CompUploadDSProps {
  
}


export default function CompUploadDS(props: CompUploadDSProps) {
   
    const { primaryColor, compId } = useCompTheme();

    return (
        <DatasetUploadView 
            primaryColor={primaryColor} 
            compId={compId} 
        />
    );
}
