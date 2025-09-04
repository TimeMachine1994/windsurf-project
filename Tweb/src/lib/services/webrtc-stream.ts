export interface StreamConfig {
  whipEndpoint: string;
  streamKey: string;
  resolution?: {
    width: number;
    height: number;
  };
  bitrate?: number;
}

export interface StreamStats {
  isConnected: boolean;
  bytesPerSecond: number;
  framesPerSecond: number;
  resolution: { width: number; height: number };
  duration: number;
}

export class WebRTCStreamer {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private whipEndpoint: string = '';
  private streamKey: string = '';
  private isStreaming: boolean = false;
  private startTime: number = 0;
  private statsInterval: number | null = null;
  
  // Event callbacks
  public onStreamStart?: () => void;
  public onStreamStop?: () => void;
  public onError?: (error: string) => void;
  public onStatsUpdate?: (stats: StreamStats) => void;

  constructor() {
    // Configure ICE servers for better connectivity
    this.setupPeerConnection();
  }

  private setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
      
      if (this.peerConnection?.iceConnectionState === 'connected') {
        this.isStreaming = true;
        this.startTime = Date.now();
        this.startStatsCollection();
        this.onStreamStart?.();
      } else if (this.peerConnection?.iceConnectionState === 'disconnected' || 
                 this.peerConnection?.iceConnectionState === 'failed') {
        this.handleStreamStop();
      }
    };

    this.peerConnection.addEventListener('error', (event: Event) => {
      console.error('WebRTC error:', event);
      this.onError?.('WebRTC connection error');
    });
  }

  async initializeCamera(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      // Add tracks to peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      return this.localStream;
    } catch (error) {
      console.error('Camera initialization error:', error);
      let errorMessage = 'Failed to access camera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      
      this.onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async startStream(config: StreamConfig): Promise<void> {
    try {
      if (!this.localStream) {
        throw new Error('Camera not initialized. Call initializeCamera() first.');
      }

      this.whipEndpoint = config.whipEndpoint;
      this.streamKey = config.streamKey;

      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Send offer to WHIP endpoint
      const response = await fetch(this.whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'Authorization': `Bearer ${this.streamKey}`
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`WHIP request failed: ${response.status} ${response.statusText}`);
      }

      const answerSdp = await response.text();
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      });

      await this.peerConnection!.setRemoteDescription(answer);
      
      console.log('WebRTC stream started successfully');
    } catch (error) {
      console.error('Stream start error:', error);
      this.onError?.(error instanceof Error ? error.message : 'Failed to start stream');
      throw error;
    }
  }

  stopStream(): void {
    this.handleStreamStop();
  }

  private handleStreamStop(): void {
    this.isStreaming = false;
    
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.setupPeerConnection(); // Reset for next use
    }

    this.onStreamStop?.();
  }

  private startStatsCollection(): void {
    if (this.statsInterval) return;

    this.statsInterval = window.setInterval(async () => {
      if (!this.peerConnection || !this.isStreaming) return;

      try {
        const stats = await this.peerConnection.getStats();
        let bytesPerSecond = 0;
        let framesPerSecond = 0;
        let resolution = { width: 0, height: 0 };

        stats.forEach((report) => {
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            bytesPerSecond = report.bytesSent || 0;
            framesPerSecond = report.framesPerSecond || 0;
          } else if (report.type === 'track' && report.kind === 'video') {
            resolution.width = report.frameWidth || 0;
            resolution.height = report.frameHeight || 0;
          }
        });

        const duration = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;

        this.onStatsUpdate?.({
          isConnected: this.isStreaming,
          bytesPerSecond,
          framesPerSecond,
          resolution,
          duration
        });
      } catch (error) {
        console.error('Stats collection error:', error);
      }
    }, 1000);
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length < 2) {
        throw new Error('No additional cameras found');
      }

      // Find current device and switch to next one
      const currentDeviceId = videoTrack.getSettings().deviceId;
      const currentIndex = videoDevices.findIndex(device => device.deviceId === currentDeviceId);
      const nextDevice = videoDevices[(currentIndex + 1) % videoDevices.length];

      // Get new stream with different camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: nextDevice.deviceId },
        audio: true
      });

      // Replace video track
      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }

      // Stop old track and update local stream
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);

    } catch (error) {
      console.error('Camera switch error:', error);
      this.onError?.('Failed to switch camera');
    }
  }

  destroy(): void {
    this.handleStreamStop();
  }
}
