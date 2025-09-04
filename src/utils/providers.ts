export interface InfraProvider {
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
  endpoints?: {
    inference?: string;
    download?: string;
    [key: string]: string | undefined;
  };
}

export interface GroupedInfraProvider {
  name: string;
  description: string;
  providers: InfraProvider[];
}

export const groupByPlatformName = (infraProviders: InfraProvider[]): GroupedInfraProvider[] => {
  const grouped = infraProviders.reduce((acc, provider) => {
    if (!acc[provider.platformName]) {
      acc[provider.platformName] = {
        name: provider.platformName,
        description: provider.platformDescription,
        providers: []
      };
    }
    acc[provider.platformName].providers.push(provider);
    return acc;
  }, {} as Record<string, GroupedInfraProvider>);

  return Object.values(grouped);
};


