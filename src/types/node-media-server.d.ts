declare module 'node-media-server' {
  interface NodeMediaServerConfig {
    rtmp?: {
      port?: number;
      chunk_size?: number;
      gop_cache?: boolean;
      ping?: number;
      ping_timeout?: number;
      fmsVer?: string;
      pageUrl?: string;
      swfUrl?: string;
    };
    http?: {
      port?: number;
      allow_origin?: string;
      mediaroot?: string;
      cors?: boolean;
    };
    relay?: {
      ffmpeg?: string;
      tasks?: any[];
    };
  }

  class NodeMediaServer {
    constructor(config: NodeMediaServerConfig);
    on(event: string, callback: (...args: any[]) => void): void;
    run(): void;
  }

  export default NodeMediaServer;
}
