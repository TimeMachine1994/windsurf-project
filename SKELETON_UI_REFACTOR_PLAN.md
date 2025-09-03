# Skeleton UI Component Library Refactor Plan

## Executive Summary

This document outlines a comprehensive refactor plan to migrate your current custom styling system to Skeleton UI, creating a consistent, maintainable, and scalable component library. Your current implementation uses custom CSS variables and utility classes, which can be seamlessly upgraded to leverage Skeleton's design system.

## Current State Analysis

### Existing Architecture
- **Framework**: SvelteKit with Svelte 5
- **Styling**: Custom CSS variables with manual theming system
- **Components**: 49+ Svelte components with inconsistent styling patterns
- **Theme System**: Manual light/dark mode with CSS custom properties
- **Build System**: Standard SvelteKit with custom CSS

### Current Styling Patterns Identified

#### 1. Custom CSS Variables System
```css
:root {
  --color-primary: #D5BA7F;
  --color-secondary: #A8A8A6;
  --color-background: #FFFFFF;
  /* ... 30+ custom variables */
}
```

#### 2. Manual Button Classes
```css
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  /* Custom styling */
}
```

#### 3. Form Input Styling
```css
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  /* Custom form styling */
}
```

#### 4. Inconsistent Component Patterns
- Mixed inline styles and CSS classes
- Duplicate styling logic across components
- Manual responsive design implementations
- Inconsistent spacing and typography

## Skeleton UI Migration Strategy

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Install Skeleton UI Dependencies
```bash
npm install -D @skeletonlabs/skeleton @skeletonlabs/skeleton-svelte
npm install tailwindcss @tailwindcss/vite
```

#### 1.2 Configure Tailwind with Skeleton
Replace `src/app.css` with:
```css
@import 'tailwindcss';

@import '@skeletonlabs/skeleton';
@import '@skeletonlabs/skeleton/optional/presets';
@import '@skeletonlabs/skeleton/themes/cerberus';

@source '../node_modules/@skeletonlabs/skeleton-svelte/dist';
```

#### 1.3 Update Vite Configuration
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit()
  ]
});
```

#### 1.4 Configure Theme System
Update `src/app.html`:
```html
<html data-theme="cerberus" class="%sveltekit.theme%">
```

### Phase 2: Core Component Migration (Week 2-3)

#### 2.1 Button System Migration

**Before (Custom)**:
```svelte
<button class="btn btn-primary">Submit</button>
```

**After (Skeleton)**:
```svelte
<script>
import { Button } from '@skeletonlabs/skeleton-svelte';
</script>

<Button preset="filled-primary">Submit</Button>
```

#### 2.2 Form Components Migration

**Before (Custom)**:
```svelte
<input type="text" class="form-input" bind:value={name} />
```

**After (Skeleton)**:
```svelte
<script>
import { Input } from '@skeletonlabs/skeleton-svelte';
</script>

<Input bind:value={name} placeholder="Enter name" />
```

#### 2.3 Card Components Migration

**Before (Custom)**:
```svelte
<div class="bg-surface rounded-lg shadow-lg p-8">
  <h2 class="text-3xl font-bold mb-2">Title</h2>
  <p class="text-secondary mb-8">Content</p>
</div>
```

**After (Skeleton)**:
```svelte
<div class="card preset-outlined p-8">
  <h2 class="h2">Title</h2>
  <p class="text-surface-700-300 mb-8">Content</p>
</div>
```

### Phase 3: Layout System Migration (Week 3-4)

#### 3.1 Header Component Refactor

**Current Issues**:
- Custom dropdown menu implementation
- Manual responsive design
- Inconsistent button styling

**Skeleton Solution**:
```svelte
<script>
import { AppBar, Button, Avatar, Menu } from '@skeletonlabs/skeleton-svelte';
</script>

<AppBar>
  <svelte:fragment slot="lead">
    <a href="/" class="text-xl font-bold">Tributestream</a>
  </svelte:fragment>
  
  <svelte:fragment slot="trail">
    {#if $authStore.user}
      <Menu>
        <Button slot="trigger" preset="ghost">
          <Avatar src={userAvatar} name={userName} size="size-8" />
          {userName}
        </Button>
        <div slot="content" class="menu-content">
          <a href="/profile" class="menu-item">Profile</a>
          <a href="/schedule" class="menu-item">Schedule</a>
          <button class="menu-item" on:click={handleSignOut}>Sign Out</button>
        </div>
      </Menu>
    {:else}
      <div class="flex gap-2">
        <Button href="/login" preset="ghost">Sign In</Button>
        <Button href="/register" preset="filled-primary">Register</Button>
      </div>
    {/if}
  </svelte:fragment>
</AppBar>
```

#### 3.2 Layout Structure Migration

**Before (Custom)**:
```svelte
<div class="app">
  <Header />
  <main><slot /></main>
  <Footer />
</div>
```

**After (Skeleton)**:
```svelte
<script>
import { AppShell } from '@skeletonlabs/skeleton-svelte';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <Header />
  </svelte:fragment>
  
  <svelte:fragment slot="pageHeader">
    <!-- Optional page-specific header -->
  </svelte:fragment>
  
  <slot />
  
  <svelte:fragment slot="pageFooter">
    <!-- Optional page-specific footer -->
  </svelte:fragment>
  
  <svelte:fragment slot="footer">
    <Footer />
  </svelte:fragment>
</AppShell>
```

### Phase 4: Form System Overhaul (Week 4-5)

#### 4.1 Contact Form Migration

**Current Issues**:
- Custom form validation styling
- Manual error/success states
- Inconsistent input styling

**Skeleton Solution**:
```svelte
<script>
import { Input, Textarea, Button, Alert } from '@skeletonlabs/skeleton-svelte';

let form = {
  name: '',
  email: '',
  subject: '',
  message: ''
};
let errors = {};
let submitStatus = 'idle';
</script>

<div class="card preset-outlined max-w-2xl mx-auto p-8">
  <h2 class="h2 mb-4">Get in Touch</h2>
  <p class="text-surface-700-300 mb-8">
    Have questions about our memorial services? We're here to help.
  </p>

  {#if submitStatus === 'success'}
    <Alert preset="success" class="mb-6">
      <svelte:fragment slot="message">Message sent successfully!</svelte:fragment>
    </Alert>
  {/if}

  {#if submitStatus === 'error'}
    <Alert preset="error" class="mb-6">
      <svelte:fragment slot="message">Failed to send message. Please try again.</svelte:fragment>
    </Alert>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        bind:value={form.name}
        label="Full Name"
        placeholder="Your full name"
        required
        error={errors.name}
      />
      <Input
        type="email"
        bind:value={form.email}
        label="Email Address"
        placeholder="your@email.com"
        required
        error={errors.email}
      />
    </div>
    
    <Input
      bind:value={form.subject}
      label="Subject"
      placeholder="How can we help you?"
      required
      error={errors.subject}
    />
    
    <Textarea
      bind:value={form.message}
      label="Message"
      placeholder="Tell us about your needs..."
      rows={6}
      required
      error={errors.message}
    />
    
    <Button type="submit" preset="filled-primary" class="w-full" loading={isSubmitting}>
      {isSubmitting ? 'Sending...' : 'Send Message'}
    </Button>
  </form>
</div>
```

#### 4.2 Booking Calculator Migration

**Current Issues**:
- Complex custom stepper implementation
- Inconsistent form styling
- Manual progress tracking

**Skeleton Solution**:
```svelte
<script>
import { Stepper, Card, Button, Input, Checkbox, RadioGroup } from '@skeletonlabs/skeleton-svelte';

let currentStep = 0;
const steps = [
  { label: 'Select Package', component: TierSelector },
  { label: 'Service Details', component: ServiceDetails },
  { label: 'Add-ons', component: AdditionalServices },
  { label: 'Payment', component: PaymentForm }
];
</script>

<div class="container mx-auto p-6">
  <Stepper bind:value={currentStep}>
    {#each steps as step, i}
      <Step>
        <svelte:fragment slot="header">{step.label}</svelte:fragment>
        <svelte:component this={step.component} bind:formData />
      </Step>
    {/each}
  </Stepper>
  
  <div class="flex justify-between mt-8">
    <Button 
      preset="ghost" 
      on:click={() => currentStep--}
      disabled={currentStep === 0}
    >
      Previous
    </Button>
    <Button 
      preset="filled-primary"
      on:click={() => currentStep++}
      disabled={currentStep === steps.length - 1}
    >
      Next
    </Button>
  </div>
</div>
```

### Phase 5: Advanced Components (Week 5-6)

#### 5.1 Modal System Migration

**Before (Custom)**:
```svelte
<!-- Custom modal implementation -->
<div class="modal-backdrop" class:show={showModal}>
  <div class="modal-content">
    <!-- Content -->
  </div>
</div>
```

**After (Skeleton)**:
```svelte
<script>
import { Modal, Button } from '@skeletonlabs/skeleton-svelte';
</script>

<Modal bind:open={showModal}>
  <svelte:fragment slot="header">
    <h3 class="h3">Modal Title</h3>
  </svelte:fragment>
  
  <p>Modal content goes here...</p>
  
  <svelte:fragment slot="footer">
    <Button preset="ghost" on:click={() => showModal = false}>Cancel</Button>
    <Button preset="filled-primary" on:click={handleConfirm}>Confirm</Button>
  </svelte:fragment>
</Modal>
```

#### 5.2 Navigation System

**Current Issues**:
- Manual mobile menu implementation
- Inconsistent active states
- Custom dropdown logic

**Skeleton Solution**:
```svelte
<script>
import { Navigation, NavigationItem } from '@skeletonlabs/skeleton-svelte';
</script>

<Navigation>
  <NavigationItem href="/for-families">For Families</NavigationItem>
  <NavigationItem href="/for-funeral-homes">For Funeral Homes</NavigationItem>
  <NavigationItem href="/create-memorial">Create Memorial</NavigationItem>
  <NavigationItem href="/booking">Book Livestream</NavigationItem>
</Navigation>
```

### Phase 6: Theme Customization (Week 6-7)

#### 6.1 Custom Theme Creation

Create a custom theme matching your brand colors:

```css
/* Custom Tributestream Theme */
@theme {
  --color-primary-50: #fef7e7;
  --color-primary-100: #fdecc4;
  --color-primary-200: #fbd896;
  --color-primary-300: #f8c158;
  --color-primary-400: #f5ab2a;
  --color-primary-500: #D5BA7F; /* Your current primary */
  --color-primary-600: #C5A86F; /* Your current primary-dark */
  --color-primary-700: #a67c1a;
  --color-primary-800: #8b6914;
  --color-primary-900: #735617;
  --color-primary-950: #422e09;
  
  --color-secondary-50: #f8f8f8;
  --color-secondary-100: #efefef;
  --color-secondary-200: #dcdcdc;
  --color-secondary-300: #bdbdbd;
  --color-secondary-400: #989898;
  --color-secondary-500: #A8A8A6; /* Your current secondary */
  --color-secondary-600: #656565;
  --color-secondary-700: #525252;
  --color-secondary-800: #464646;
  --color-secondary-900: #3d3d3d;
  --color-secondary-950: #262626;
}
```

#### 6.2 Dark Mode Configuration

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

[data-theme="dark"] {
  --color-surface-50: #1a1a1a;
  --color-surface-100: #262626;
  --color-surface-200: #404040;
  --color-surface-300: #525252;
  --color-surface-400: #737373;
  --color-surface-500: #a3a3a3;
  --color-surface-600: #d4d4d4;
  --color-surface-700: #e5e5e5;
  --color-surface-800: #f5f5f5;
  --color-surface-900: #fafafa;
  --color-surface-950: #ffffff;
}
```

### Phase 7: Testing & Optimization (Week 7-8)

#### 7.1 Component Testing Strategy

1. **Visual Regression Testing**
   - Screenshot comparison before/after migration
   - Cross-browser compatibility testing
   - Mobile responsiveness validation

2. **Functionality Testing**
   - Form submission workflows
   - Authentication flows
   - Payment processing
   - Theme switching

3. **Performance Testing**
   - Bundle size comparison
   - Load time analysis
   - Core Web Vitals assessment

#### 7.2 Accessibility Improvements

Skeleton UI provides built-in accessibility features:

- **ARIA Labels**: Automatic ARIA attributes
- **Keyboard Navigation**: Built-in keyboard support
- **Screen Reader Support**: Semantic HTML structure
- **Focus Management**: Proper focus indicators
- **Color Contrast**: WCAG compliant color schemes

## Implementation Timeline

| Phase | Duration | Tasks | Deliverables |
|-------|----------|-------|--------------|
| **Phase 1** | Week 1 | Foundation setup, dependencies | Working Skeleton installation |
| **Phase 2** | Week 2-3 | Core components migration | Buttons, forms, cards migrated |
| **Phase 3** | Week 3-4 | Layout system overhaul | Header, footer, navigation |
| **Phase 4** | Week 4-5 | Form system migration | Contact form, booking calculator |
| **Phase 5** | Week 5-6 | Advanced components | Modals, dropdowns, complex UI |
| **Phase 6** | Week 6-7 | Theme customization | Custom Tributestream theme |
| **Phase 7** | Week 7-8 | Testing & optimization | QA, performance, accessibility |

## Migration Checklist

### Pre-Migration
- [ ] Backup current codebase
- [ ] Document current component inventory
- [ ] Set up development branch
- [ ] Install Skeleton UI dependencies

### Core Migration
- [ ] Replace custom CSS with Skeleton imports
- [ ] Migrate button components
- [ ] Migrate form components
- [ ] Migrate card components
- [ ] Update layout structure

### Component-Specific Migration
- [ ] Header component
- [ ] Footer component
- [ ] Contact form
- [ ] Booking calculator
- [ ] Authentication forms
- [ ] Payment forms
- [ ] Navigation menus
- [ ] Modal dialogs

### Theme & Styling
- [ ] Create custom Tributestream theme
- [ ] Configure dark mode
- [ ] Update color variables
- [ ] Test responsive design
- [ ] Validate accessibility

### Testing & QA
- [ ] Visual regression testing
- [ ] Functionality testing
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility audit

## Benefits of Migration

### 1. Consistency
- Unified design language across all components
- Standardized spacing, typography, and colors
- Consistent interaction patterns

### 2. Maintainability
- Reduced custom CSS codebase
- Centralized theme management
- Easier component updates

### 3. Developer Experience
- Pre-built, tested components
- Comprehensive documentation
- TypeScript support
- Better IDE integration

### 4. Performance
- Optimized component bundle
- Tree-shaking support
- Reduced CSS bloat
- Better caching strategies

### 5. Accessibility
- WCAG 2.1 AA compliance
- Built-in screen reader support
- Keyboard navigation
- Focus management

### 6. Future-Proofing
- Regular updates and maintenance
- Community support
- Framework agnostic core
- Long-term sustainability

## Risk Mitigation

### 1. Breaking Changes
- **Risk**: Components may behave differently
- **Mitigation**: Thorough testing, gradual rollout, feature flags

### 2. Bundle Size
- **Risk**: Increased JavaScript bundle size
- **Mitigation**: Tree-shaking, code splitting, performance monitoring

### 3. Learning Curve
- **Risk**: Team needs to learn new component API
- **Mitigation**: Training sessions, documentation, pair programming

### 4. Theme Compatibility
- **Risk**: Current brand colors may not translate perfectly
- **Mitigation**: Custom theme creation, design system review

## Success Metrics

### Technical Metrics
- **Bundle Size**: Target <20% increase
- **Load Time**: Maintain current performance
- **Accessibility Score**: >95% Lighthouse score
- **Code Reduction**: >50% reduction in custom CSS

### User Experience Metrics
- **Consistency Score**: Visual consistency across components
- **Usability Testing**: User task completion rates
- **Mobile Experience**: Mobile usability scores
- **Cross-browser Compatibility**: 100% feature parity

## Conclusion

This migration to Skeleton UI will significantly improve your application's consistency, maintainability, and user experience. The phased approach ensures minimal disruption while providing immediate benefits. The investment in this refactor will pay dividends in reduced development time, improved code quality, and enhanced user satisfaction.

The key to success is following the phased approach, thorough testing at each stage, and maintaining clear communication with stakeholders throughout the process.
