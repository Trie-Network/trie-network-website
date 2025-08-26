declare global {
  interface Window {
    xell?: {
      signIn: () => Promise<{ status: boolean; data: { username: string; did: string } }>;
      request: (data: any) => Promise<{ status: boolean; data: any }>;
      executeContract: (data: any) => Promise<{ status: boolean; data: any }>;
      deployNFT: (data: any) => Promise<{ status: boolean; data: any }>;
      transferFT: (data: any) => Promise<{ status: boolean; data: any }>;
      createFT: (data: any) => Promise<{ status: boolean; data: any }>;
      executeNFT: (data: any) => Promise<{ status: boolean; data: any }>;
      trigger: (data: any) => void; 
      connect: () => Promise<{ address: string }>;
      disconnect: () => Promise<void>;
      isConnected: () => Promise<boolean>;
    };
  }
}

export type WalletType = 'xell';

export class WalletService {
  static async isExtensionInstalled(): Promise<boolean> {
    return window.xell !== undefined;
  }

  static async connect(type: WalletType = 'xell'): Promise<{ address: string; type: WalletType; username?: string } | null> {
    try {
      return await WalletService.connectXell();
    } catch (error) {
     
      if (error && typeof error === 'object' && 'code' in error && error.code !== 4001) {
       
      }
      return null;
    }
  }

  private static async connectXell(): Promise<{ address: string; type: WalletType; username?: string } | null> {
    if (!window.xell) {
      return null;
    }
    
    try {
      const result = await window.xell.signIn();
      
      if (result.status && result.data) {
        return { 
          address: result.data.did, 
          type: 'xell',
          username: result.data.username 
        };
      }
      
      return null;
    } catch (error) {
     
      return null;
    }
  }

  static async disconnect(type: WalletType = 'xell'): Promise<void> {
    try {
      if (!window.xell) {
       
        return;
      }
      await window.xell.disconnect();
    } catch (error) {
     
      if (error && typeof error === 'object' && 'code' in error && error.code !== 4001) {
       
      }
    }
  }

  static async isConnected(type: WalletType = 'xell'): Promise<boolean> {
    try {
      if (!window.xell) {
        return false; 
      }
      return await window.xell.isConnected();
    } catch (error) {
      
      if (error && typeof error === 'object' && 'code' in error && error.code !== 4001) {
       
      }
      return false;
    }
  }

  static async request(data: any): Promise<{ status: boolean; data: any } | null> {
    if (!window.xell) {
      return null;
    }
    try {
      const result = await window.xell.request(data);
      return result;
    } catch (error) {
    
      return null;
    }
  }
}