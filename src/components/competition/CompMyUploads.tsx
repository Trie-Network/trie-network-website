import { Assets } from '@/components/dashboard';
import { useCompTheme } from '@/contexts/compTheme';

export default function CompMyUploads() {

    const { primaryColor, compId } = useCompTheme();

    return (
        <Assets primaryColor={primaryColor} compId={compId} />
    )
}
