# TributeStream Technical Design Document

## Project Overview

**TributeStream** is a professional memorial livestreaming service built with SvelteKit and Firebase. The application enables funeral homes and families to create digital memorials with livestreaming capabilities, photo galleries, and comprehensive user management systems.

## Architecture Overview

### Technology Stack

- **Frontend Framework**: SvelteKit 2.22.0 with Svelte 5.0.0
- **Styling**: Tailwind CSS 4.0.0 with Skeleton UI 3.2.0
- **Authentication & Database**: Firebase 12.2.1 (Auth, Firestore, Storage)
- **Payment Processing**: Stripe 18.5.0
- **Email Service**: SendGrid 8.1.5
- **Livestreaming**: Cloudflare Stream with WebRTC/WHIP protocol
- **Build Tool**: Vite 7.0.4
- **Language**: TypeScript 5.0.0

### Project Structure

```
Tweb/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   ├── firebase/           # Firebase configuration and services
│   │   ├── services/           # Business logic services
│   │   ├── stores/             # Svelte stores for state management
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── routes/                 # SvelteKit file-based routing
│   │   ├── api/                # Server-side API endpoints
│   │   └── [various pages]/    # Application pages
│   ├── app.css                 # Global styles
│   ├── app.html                # HTML template
│   └── app.d.ts                # TypeScript declarations
├── static/                     # Static assets
├── firebase.json               # Firebase configuration
├── firestore.rules            # Firestore security rules
└── package.json               # Dependencies and scripts
```

## Core Features & Implementation

### 1. Authentication System

**Implementation**: Firebase Authentication with role-based access control

**User Roles**:
- **Viewer**: Default role for new registrations
- **Owner**: Memorial creators with full memorial management rights
- **Admin**: System administrators with approval rights
- **FuneralDirector**: Funeral home staff requiring admin approval

**Key Files**:
- `/src/lib/firebase/auth.ts` - Authentication functions
- `/src/lib/firebase/config.ts` - Firebase configuration with emulator support

**Features**:
- Email/password registration and login
- User profile creation with automatic role assignment
- Admin approval system for funeral directors
- Firebase emulator support for development
- Comprehensive error handling with user-friendly messages

### 2. Memorial Management System

**Implementation**: Firestore-based memorial creation and management

**Key Components**:
- Memorial creation with automatic URL generation
- User account creation with generated passwords
- URL uniqueness validation with fallback strategies
- Role-based permissions for memorial access

**Data Structure**:
```typescript
interface Memorial {
  id: string;
  lovedOneName: string;
  customUrl: string;
  creatorUid: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Photo Gallery & Slideshow System

**Implementation**: Firebase Storage integration with drag-and-drop management

**Features**:
- Photo upload with file validation (type, size, count limits)
- Drag-and-drop photo reordering with visual feedback
- Automatic saving with 1-second delay after changes
- Photo deletion with confirmation dialogs
- Fullscreen slideshow viewer with auto-advance
- Configurable slideshow timers (1s, 2s, 3s, 5s, 10s)
- Keyboard navigation support
- Mobile-responsive design

**Key Components**:
- `PhotoUploader.svelte` - File upload with drag-and-drop
- `PhotoReorderGrid.svelte` - Drag-and-drop reordering
- `PhotoGallery.svelte` - Grid display of photos
- `PhotoShadowbox.svelte` - Fullscreen slideshow viewer

### 4. Live Streaming System

**Implementation**: WebRTC with Cloudflare Stream integration

**Features**:
- Browser-based camera streaming using WHIP protocol
- External software streaming (OBS, etc.) via RTMP
- Real-time camera preview with controls
- Live streaming statistics (bitrate, frame rate, connection status)
- Dual streaming modes with toggle functionality
- HD quality streaming (1280x720 at 30 FPS, 2.5 Mbps)

**Key Services**:
- `webrtc-stream.ts` - WebRTC connection management
- `cloudflare-stream.ts` - Cloudflare Stream API integration
- `livestream.ts` - Firebase livestream data management

### 5. Payment Processing

**Implementation**: Stripe integration for service payments

**Features**:
- Secure payment intent creation
- Multiple payment methods support
- Memorial-specific payment tracking
- Customer information collection
- Receipt generation and email delivery

**API Endpoints**:
- `/api/create-payment-intent` - Payment intent creation
- `/api/send-receipt` - Receipt email delivery

### 6. Communication System

**Implementation**: SendGrid email service integration

**Features**:
- Contact form submissions
- Automated receipt delivery
- Professional email templates
- Error handling for email delivery failures

## Firebase Integration

### Configuration

The application uses Firebase for:
- **Authentication**: User registration, login, and session management
- **Firestore**: Document database for users, memorials, and metadata
- **Storage**: File storage for photos and media assets

### Development Environment

- **Emulator Support**: Full Firebase emulator integration for development
- **Environment Variables**: Comprehensive configuration via environment variables
- **Dual Mode**: Toggle between live Firebase and emulator environments

### Security Rules

Firestore security rules implement:
- Role-based access control
- Memorial ownership validation
- Funeral director approval requirements
- Photo upload permissions

## UI/UX Design

### Design System

**Skeleton UI Framework**: Custom TributeStream theme with:
- **Primary Colors**: Gold palette (#D5BA7F)
- **Secondary Colors**: Grey palette (#A8A8A6)
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-first approach

### Key Design Principles

- **Accessibility**: WCAG compliant components
- **Performance**: Optimized loading and interactions
- **User Experience**: Intuitive navigation and clear feedback
- **Professional Appearance**: Dignified design appropriate for memorial services

## API Architecture

### Server-Side Endpoints

```
/api/
├── contact/              # Contact form submission
├── create-payment-intent/ # Stripe payment processing
├── send-email/           # Email delivery service
└── send-receipt/         # Receipt email delivery
```

### Client-Side Services

```
/src/lib/services/
├── auth.ts              # Authentication service
├── memorial.ts          # Memorial management
├── photos.ts            # Photo management
├── webrtc-stream.ts     # WebRTC streaming
├── cloudflare-stream.ts # Cloudflare integration
└── email.ts             # Email service
```

## Development Workflow

### Environment Setup

1. **Firebase Configuration**: Set up Firebase project with Auth, Firestore, and Storage
2. **Environment Variables**: Configure all required API keys and settings
3. **Emulator Setup**: Use Firebase emulators for local development
4. **Package Installation**: Install dependencies with `npm install`

### Development Commands

```bash
# Development with emulators
npm run dev:emulator

# Development with live Firebase
npm run dev:live

# Production build
npm run build

# Type checking
npm run check
```

### Testing Strategy

- **Firebase Emulators**: Local testing environment
- **Type Safety**: Full TypeScript coverage
- **Component Testing**: Svelte component testing
- **Integration Testing**: End-to-end user flows

## Security Considerations

### Data Protection

- **Firebase Security Rules**: Comprehensive access control
- **Environment Variables**: Secure API key management
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Secure error messages without sensitive data exposure

### Authentication Security

- **Role-Based Access**: Granular permission system
- **Admin Approval**: Funeral director verification process
- **Session Management**: Secure Firebase session handling
- **Password Generation**: Secure password generation for memorial accounts

## Performance Optimization

### Frontend Performance

- **SvelteKit SSR**: Server-side rendering for improved initial load
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Optimized photo loading and display
- **Lazy Loading**: Deferred loading of non-critical components

### Backend Performance

- **Firebase Optimization**: Efficient Firestore queries and indexing
- **CDN Integration**: Cloudflare for global content delivery
- **Caching Strategy**: Strategic caching for frequently accessed data

## Deployment Architecture

### Production Environment

- **SvelteKit Adapter**: Auto-adapter for flexible deployment
- **Firebase Hosting**: Static site hosting with CDN
- **Environment Configuration**: Production environment variables
- **Monitoring**: Firebase Analytics and error tracking

### Scalability Considerations

- **Firebase Scaling**: Automatic scaling with Firebase services
- **CDN Distribution**: Global content delivery via Cloudflare
- **Database Optimization**: Efficient data structure and indexing
- **Resource Management**: Optimized asset delivery and caching

## Future Enhancements

### Planned Features

1. **Mobile Application**: Native mobile app development
2. **Advanced Analytics**: Detailed viewing and engagement metrics
3. **Social Integration**: Social media sharing and integration
4. **Multi-language Support**: Internationalization capabilities
5. **Advanced Streaming**: Multiple camera angles and professional controls

### Technical Improvements

1. **Progressive Web App**: PWA capabilities for offline access
2. **Real-time Features**: Live chat and real-time interactions
3. **AI Integration**: Automated content moderation and enhancement
4. **Advanced Security**: Enhanced security measures and compliance
5. **Performance Monitoring**: Advanced performance tracking and optimization

## Conclusion

TributeStream represents a comprehensive, professional-grade memorial livestreaming platform built with modern web technologies. The architecture provides scalability, security, and maintainability while delivering a dignified user experience appropriate for memorial services. The Firebase integration ensures reliable data management and authentication, while the modular design allows for future enhancements and feature additions.
