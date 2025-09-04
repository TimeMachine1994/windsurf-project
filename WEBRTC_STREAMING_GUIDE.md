# WebRTC Live Streaming with WHIP and Cloudflare Stream

This guide explains how to use the WebRTC live streaming functionality integrated with Cloudflare Stream using the WHIP (WebRTC-HTTP Ingestion Protocol) standard.

## Features

- **Browser-based camera streaming**: Stream directly from device camera using WebRTC
- **WHIP protocol integration**: Standards-compliant WebRTC ingestion to Cloudflare Stream
- **Dual streaming modes**: Browser camera or external software (OBS, etc.)
- **Real-time statistics**: Monitor bitrate, frame rate, and connection status
- **Camera controls**: Switch between multiple cameras, preview before going live
- **Automatic fallback**: Demo mode when Cloudflare credentials aren't configured

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Cloudflare Stream Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_STREAM_CUSTOMER_CODE=your_customer_code_here
```

### 2. Cloudflare Stream Setup

1. Log into Cloudflare Dashboard
2. Navigate to Stream
3. Create API token with Stream permissions
4. Note your Account ID and Customer Code

## Usage

### Browser Camera Streaming

1. Navigate to the livestreaming page as an approved funeral director
2. Select "Browser Camera" mode
3. Click "Enable Camera" to request permissions
4. Preview your camera feed
5. Click "Go Live" to start streaming via WHIP to Cloudflare Stream

### External Software Streaming

1. Select "External Software" mode
2. Copy the RTMP URL and Stream Key
3. Configure your streaming software (OBS, XSplit, etc.)
4. Start streaming from your software
5. Click "Start Stream" to mark as live

## Technical Implementation

### WebRTC Streamer (`/src/lib/services/webrtc-stream.ts`)

- Handles WebRTC peer connections
- Manages camera access and permissions
- Implements WHIP protocol for Cloudflare Stream ingestion
- Provides real-time streaming statistics
- Supports camera switching and error handling

### Cloudflare Stream Service (`/src/lib/services/cloudflare-stream.ts`)

- Creates live input streams via Cloudflare API
- Generates WHIP endpoints and stream keys
- Handles cleanup of stream resources
- Provides fallback demo configuration

### Key Components

- **Camera Preview**: Real-time video preview with controls
- **Stream Statistics**: Live monitoring of connection quality
- **Dual Mode Interface**: Toggle between browser and external streaming
- **Error Handling**: Comprehensive error messages and recovery

## Browser Compatibility

- **Chrome/Edge**: Full WebRTC support
- **Firefox**: Full WebRTC support
- **Safari**: WebRTC support (iOS 11+)
- **Mobile**: Camera access on mobile browsers

## Streaming Quality

- **Default Resolution**: 1280x720 (HD)
- **Frame Rate**: 30 FPS
- **Bitrate**: 2.5 Mbps
- **Audio**: Echo cancellation, noise suppression enabled
- **Codecs**: VP8/VP9 video, Opus audio

## Security Considerations

- Camera permissions required
- HTTPS required for WebRTC
- Stream keys are generated per session
- Automatic cleanup of stream resources

## Troubleshooting

### Camera Access Issues
- Ensure HTTPS connection
- Check browser permissions
- Verify camera isn't in use by another app

### Streaming Connection Issues
- Check network connectivity
- Verify Cloudflare credentials
- Monitor browser console for WebRTC errors

### Performance Issues
- Reduce video resolution if needed
- Check available bandwidth
- Monitor CPU usage during streaming

## Demo Mode

When Cloudflare credentials aren't configured, the system runs in demo mode:
- Uses placeholder WHIP endpoints
- Allows testing of UI and camera functionality
- No actual streaming to Cloudflare occurs

## API Integration

The system integrates with:
- **Cloudflare Stream API**: Live input creation and management
- **WebRTC APIs**: Camera access and peer connections
- **WHIP Protocol**: Standards-compliant stream ingestion

## Future Enhancements

- Multiple camera angles
- Screen sharing support
- Recording capabilities
- Advanced streaming settings
- Viewer analytics integration
