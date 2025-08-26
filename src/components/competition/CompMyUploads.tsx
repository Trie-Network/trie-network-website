import { Assets } from '@/components/dashboard';
import { useCompTheme } from '@/contexts/compTheme';


interface CompMyUploadsProps {
   
}


export default function CompMyUploads(props: CompMyUploadsProps) {
    const { primaryColor, compId } = useCompTheme();

    return (
        <Assets 
            primaryColor={primaryColor} 
            compId={compId} 
        />
    );
}
