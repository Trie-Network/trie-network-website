import { DatasetUploadView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';

export default function CompUploadDS() {

    const { primaryColor, compId } = useCompTheme();

    return (
        <DatasetUploadView primaryColor={primaryColor} compId={compId} />
    )
}
