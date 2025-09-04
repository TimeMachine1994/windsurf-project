import { env } from '$env/dynamic/private';

export interface CloudflareStreamInput {
  uid: string;
  rtmps: {
    url: string;
    streamKey: string;
  };
  rtmpsPlayback: {
    url: string;
    streamKey: string;
  };
  srt: {
    url: string;
    streamKey: string;
    passphrase: string;
  };
  webRTC: {
    url: string;
  };
  status: {
    current: string;
  };
}

export interface CloudflareStreamConfig {
  whipEndpoint: string;
  streamKey: string;
  playbackUrl: string;
  rtmpUrl: string;
}

export class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;
  private customerCode: string;

  constructor() {
    this.accountId = env.CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = env.CLOUDFLARE_API_TOKEN || '';
    this.customerCode = env.CLOUDFLARE_STREAM_CUSTOMER_CODE || '';
  }

  async createLiveInput(memorialUrl: string): Promise<CloudflareStreamConfig> {
    try {
      if (!this.accountId || !this.apiToken) {
        // Fallback to demo configuration if environment variables are not set
        return this.createDemoConfig(memorialUrl);
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/live_inputs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meta: {
              name: `TributeStream - ${memorialUrl}`,
            },
            recording: {
              mode: 'automatic',
              timeoutSeconds: 10,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.status}`);
      }

      const data = await response.json();
      const input: CloudflareStreamInput = data.result;

      return {
        whipEndpoint: input.webRTC.url,
        streamKey: input.uid,
        playbackUrl: `https://customer-${this.customerCode}.cloudflarestream.com/${input.uid}/manifest/video.m3u8`,
        rtmpUrl: input.rtmps.url,
      };
    } catch (error) {
      console.error('Failed to create Cloudflare Stream input:', error);
      // Fallback to demo configuration
      return this.createDemoConfig(memorialUrl);
    }
  }

  private createDemoConfig(memorialUrl: string): CloudflareStreamConfig {
    const streamKey = `demo_${memorialUrl}_${Date.now()}`;
    
    return {
      whipEndpoint: `https://customer-demo.cloudflarestream.com/live/input/${streamKey}/webrtc/whip`,
      streamKey,
      playbackUrl: `https://customer-demo.cloudflarestream.com/${streamKey}/manifest/video.m3u8`,
      rtmpUrl: `rtmps://live.cloudflarestream.com/live/${streamKey}`,
    };
  }

  async deleteLiveInput(streamKey: string): Promise<void> {
    try {
      if (!this.accountId || !this.apiToken) {
        console.log('Demo mode: Stream input deletion skipped');
        return;
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/live_inputs/${streamKey}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to delete stream input: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting stream input:', error);
    }
  }

  async getStreamStatus(streamKey: string): Promise<string> {
    try {
      if (!this.accountId || !this.apiToken) {
        return 'demo';
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/live_inputs/${streamKey}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        return 'unknown';
      }

      const data = await response.json();
      return data.result?.status?.current || 'unknown';
    } catch (error) {
      console.error('Error getting stream status:', error);
      return 'unknown';
    }
  }
}
