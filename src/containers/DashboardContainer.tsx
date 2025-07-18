import { DashboardLayout, HomeView, ModelsView, DatasetsView, InfraProvidersView, SettingsView, BecomePartnerView, ModelUploadView, DatasetUploadView, Assets, CompetitionsView } from '@/components/dashboard';
import { useParams } from 'react-router-dom';

const VIEWS = {
  'all': HomeView,
  'models': ModelsView,
  'datasets': DatasetsView,
  'assets': Assets,
  'infra-providers': InfraProvidersView,
  'upload-model': ModelUploadView,
  'upload-dataset': DatasetUploadView,
  'settings': SettingsView,
  'become-partner': BecomePartnerView,
  'competitions': CompetitionsView
};

export function DashboardContainer() {
  const { view = 'all' } = useParams();
  const View = VIEWS[view as keyof typeof VIEWS] || HomeView;

  return (
    <DashboardLayout>
      <View />
    </DashboardLayout>
  );
}