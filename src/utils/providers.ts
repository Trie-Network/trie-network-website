export interface InfraProvider {
  id?: string;
  storage: string;
  memory: string;
  os: string;
  core: string;
  gpu: string;
  processor: string;
  region: string;
  hostingCost: number;
  platformName: string;
  providerName: string;
  platformImageUri: string;
  platformDescription: string;
  providerDid: string;
  supportedModels?: string;
  endpoints?: {
    inference?: string;
    download?: string;
    upload?: string;
    mlflow?: {
      metrics_fetch?: string;
      metrics_download?: string;
    };
    [key: string]: string | { metrics_fetch?: string; metrics_download?: string } | undefined;
  };
}

export interface GroupedInfraProvider {
  name: string;
  description: string;
  providers: InfraProvider[];
  categories: string[];
}

export const groupByPlatformName = (infraProviders: InfraProvider[]): GroupedInfraProvider[] => {
  const grouped = infraProviders.reduce((acc, provider) => {
    if (!acc[provider.platformName]) {
      // Determine categories based on hardware specifications
      const categories: string[] = [];
      
      // Add hardware type categories
      if (provider.gpu && provider.gpu !== 'N/A' && provider.gpu !== '') {
        categories.push('GPU');
      }
      if (provider.processor && provider.processor !== 'N/A' && provider.processor !== '') {
        categories.push('CPU');
      }
      if (provider.memory && provider.memory !== 'N/A' && provider.memory !== '') {
        categories.push('Memory');
      }
      if (provider.storage && provider.storage !== 'N/A' && provider.storage !== '') {
        categories.push('Storage');
      }
      
      // Add compute/infrastructure categories
      if (categories.some(cat => ['GPU', 'CPU', 'TPU'].includes(cat))) {
        categories.push('Compute');
      }
      if (categories.some(cat => ['Memory', 'Storage'].includes(cat))) {
        categories.push('Infrastructure');
      }
      
      acc[provider.platformName] = {
        name: provider.platformName,
        description: provider.platformDescription,
        providers: [],
        categories: [...new Set(categories)] // Remove duplicates
      };
    }
    acc[provider.platformName].providers.push(provider);
    return acc;
  }, {} as Record<string, GroupedInfraProvider>);

  return Object.values(grouped);
};


