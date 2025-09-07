# TributeStream - Clean Rebuild

A clean rebuild of TributeStream using SvelteKit and Firebase, focusing on authentication and basic layout without Skeleton UI.

## Features

- ✅ Clean SvelteKit setup with Tailwind CSS
- ✅ Firebase Authentication (register, login, logout)
- ✅ User profile management with CRUD functionality
- ✅ Responsive header and footer components
- ✅ Clean, modern UI design
- ✅ Role-based user system

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Copy your Firebase config and create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here

# Set to true for development with emulators
VITE_USE_FIREBASE_EMULATOR=true
```

### 3. Firebase Emulators (Development)

For local development, you can use Firebase emulators:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Start emulators
firebase emulators:start --only auth,firestore
```

### 4. Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable components
│   │   ├── Header.svelte    # Navigation header
│   │   └── Footer.svelte    # Site footer
│   ├── firebase/            # Firebase configuration
│   │   ├── config.ts        # Firebase setup
│   │   └── auth.ts          # Authentication functions
│   └── stores/              # Svelte stores
│       └── auth.ts          # Authentication state
├── routes/                  # SvelteKit routes
│   ├── +layout.svelte       # Main layout
│   ├── +page.svelte         # Homepage
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── profile/             # User profile page
└── app.css                  # Global styles
```

## Available Pages

- `/` - Homepage with hero section and features
- `/login` - User login form
- `/register` - User registration form
- `/profile` - User profile management (requires authentication)

## User Roles

- **user** - Default role for new registrations
- **admin** - Administrative access (manually assigned)

## Building for Production

```bash
npm run build
```

## Testing

```bash
# Run unit tests
npm run test:unit

# Run end-to-end tests
npm run test:e2e
```

## Technologies Used

- **SvelteKit** - Full-stack framework
- **Firebase** - Authentication and database
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool
