export type WebSocketAction = 'DEPLOY_NFT' | 'TRANSFER_FT' | 'EXECUTE_NFT' | 'EXECUTE_TOKENS';

export type WebSocketMessage =
  | {
      type: 'OPEN_EXTENSION';
      data: {
        action: WebSocketAction;
        payload: any;
      };
    }
  | {
      type: 'hello';
      [key: string]: any;
    };


