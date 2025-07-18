import { ModelUploadView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';

export default function CompUploadAI() {

    const { primaryColor, compId } = useCompTheme();

    return (
        <ModelUploadView primaryColor={primaryColor} compId={compId} />
    )
}
