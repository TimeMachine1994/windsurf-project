# TributeStream Style Theme Guide

## Color Palette

### Primary Colors
- **Gold**: `#D5BA7F` - Primary accent color for buttons and highlights
- **Gold Hover**: `#C5A96F` - Darker gold for hover states
- **Black**: `#000000` - Navigation bar background
- **White**: `#FFFFFF` - Content card backgrounds and navigation text

### Text Colors
- **Primary Text**: `text-gray-900` - Main headings and important text
- **Secondary Text**: `text-gray-700` - Body text and descriptions
- **Navigation Text**: `text-white` - All navigation bar text
- **Hover Text**: `text-[#D5BA7F]` - Navigation hover states

### Background Colors
- **Page Background**: `bg-gradient-to-br from-white via-gray-50 to-[#D5BA7F]/30`
- **Navigation Bar**: `bg-black`
- **Content Cards**: `bg-white`
- **Card Borders**: `border-gray-200`
- **Icon Backgrounds**: `bg-[#D5BA7F]/20`
- **Hover States**: `hover:bg-gray-50`

## Typography

### Font Weights
- **Extra Bold**: `font-black` - Main page titles (text-5xl to text-7xl)
- **Bold**: `font-bold` - Section headings and buttons
- **Medium**: `font-medium` - Body text and descriptions

### Text Sizes
- **Hero Title**: `text-5xl md:text-7xl`
- **Hero Subtitle**: `text-xl md:text-2xl`
- **Section Headings**: `text-4xl md:text-5xl`
- **Card Titles**: `text-2xl`
- **Value Titles**: `text-xl`
- **Navigation**: `text-sm` and `text-xl` (logo)

## Component Styles

### Navigation Bar
```css
bg-black shadow-lg border-b border-[#D5BA7F]/40
```
- All text: `text-white`
- Hover states: `hover:text-[#D5BA7F]`
- Logo: `text-xl font-bold`
- Links: `text-sm font-medium`

### Buttons

#### Primary Button (Gold)
```css
bg-[#D5BA7F] hover:bg-[#C5A96F] text-black px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-lg
```

#### Large Primary Button
```css
bg-[#D5BA7F] hover:bg-[#C5A96F] text-black px-12 py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg min-w-[200px]
```

#### Secondary Button (White with Gold Border)
```css
bg-white border-2 border-[#D5BA7F] text-gray-900 hover:bg-gray-50 hover:border-[#C5A96F] px-12 py-5 rounded-2xl text-lg font-bold transition-all duration-300 min-w-[200px]
```

### Cards

#### Main Content Cards
```css
bg-white border border-gray-200 rounded-3xl p-12 shadow-2xl
```

#### Feature Cards
```css
bg-white border border-gray-200 p-10 rounded-3xl shadow-2xl transition-all duration-300 text-center
```

#### Icon Containers
```css
w-20 h-20 bg-[#D5BA7F]/20 rounded-2xl flex items-center justify-center mx-auto mb-6
```

### Floating Background Elements
```css
bg-gradient-to-br from-[#D5BA7F]/60 to-[#D5BA7F]/30 rounded-full blur-3xl animate-pulse
```

## Layout Structure

### Page Container
```css
min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-[#D5BA7F]/40
```

### Content Wrapper
```css
relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24
```

### Grid Layouts
- **Features**: `grid md:grid-cols-3 gap-8`
- **Values**: `grid md:grid-cols-3 gap-8`

## Design Principles

### Contrast & Readability
- **High Contrast**: Black navigation with white text
- **Clean Content**: White cards with dark text for maximum readability
- **Subtle Accents**: Gold used sparingly for buttons and highlights

### Honorable & Professional
- **Clean Lines**: Rounded corners (rounded-2xl, rounded-3xl)
- **Elegant Shadows**: `shadow-2xl` for depth
- **Soft Gradients**: Subtle gold gradients in background
- **Respectful Spacing**: Generous padding and margins

### Interactive Elements
- **Smooth Transitions**: `transition-all duration-300`
- **Hover States**: Subtle color changes and background shifts
- **Focus States**: Gold accent color for interactive elements

## Usage Guidelines

### Do's
- Use gold (`#D5BA7F`) for primary actions and accents
- Maintain high contrast between text and backgrounds
- Use white cards on gradient backgrounds for content
- Keep navigation bar black with white text
- Use consistent rounded corners and shadows

### Don'ts
- Don't use gold for large background areas
- Don't mix other accent colors with the gold theme
- Don't use dark text on dark backgrounds
- Don't overcomplicate the color palette
- Don't use harsh transitions or animations

## Accessibility Notes
- All text maintains WCAG AA contrast ratios
- Interactive elements have clear hover states
- Navigation includes proper ARIA labels
- Color is not the only indicator of interactive elements
