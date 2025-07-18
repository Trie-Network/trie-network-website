import { ModelsView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';

export default function CompModels() {

    const { compId } = useCompTheme();

    return (
        <ModelsView compId={compId} />
    )
}
