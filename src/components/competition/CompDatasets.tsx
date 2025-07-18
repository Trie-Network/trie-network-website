import { DatasetsView } from '../dashboard';
import { useCompTheme } from '@/contexts/compTheme';

export default function CompDatasets() {

    const { compId } = useCompTheme();

    return (
        <DatasetsView compId={compId} />
    )
}
