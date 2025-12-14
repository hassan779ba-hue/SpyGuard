# SpyGuard: Anti-Hacking & Spyware Detector - Design Guidelines

## Architecture Decisions

### Authentication
**No Authentication Required** - The app opens directly to the dashboard with no sign-up or login screens. However, include:
- Local user preferences (language selection, theme settings)
- Premium status stored locally (mock purchase state)

### Navigation
**Stack-Only Navigation** with modal overlays:
- **Main Stack**: Language Selection (first launch only) → Dashboard → Scan Results → Threat Details
- **Modal Screens**: Premium Upgrade, Settings, Language Switcher
- No tab bar - single-purpose security scanning flow
- Floating Action Button for Settings (gear icon) in top-right of dashboard

### Screen Specifications

#### 1. Language Selection Screen (First Launch Only)
- **Purpose**: One-time language selection on initial app launch
- **Layout**: 
  - Full-screen centered content
  - No header
  - Vertical list of 5 language options with native script
  - Large, tappable cards for each language
- **Safe Area Insets**: 
  - Top: insets.top + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
- **Components**: 5 language cards (English, اردو, हिंदी, پښتو, سنڌي) with radio buttons

#### 2. Dashboard (Main Screen)
- **Purpose**: Primary scanning interface with threat overview
- **Layout**:
  - Transparent header with app logo (left) and settings icon (right)
  - Scrollable main content
  - Large circular radar scan button (center, 200x200px)
  - Status cards below showing last scan info
  - Floating Premium banner at bottom if user is free tier
- **Safe Area Insets**: 
  - Top: headerHeight + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
- **Components**: 
  - Animated radar scan button with pulsing ring effect
  - Status cards: "Last Scan", "Threats Found", "Protection Status"
  - Premium CTA banner (sticky at bottom for free users)

#### 3. Scan Results Screen
- **Purpose**: Display categorized security threats after scan
- **Layout**:
  - Default navigation header with back button (left) and share icon (right)
  - Scrollable list of threat categories
  - Each category expandable to show individual threats
  - Premium upgrade button at top if free user
- **Safe Area Insets**: 
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
- **Components**:
  - Threat category cards: Spyware, Loan Apps, Hidden Trackers, Data Leaks
  - Each threat item shows: app icon (blurred for free), app name (????? for free), risk level badge
  - Red warning banner for HIGH RISK items

#### 4. Threat Details Screen
- **Purpose**: Show detailed information about a specific threat
- **Layout**:
  - Default navigation header with back button
  - Scrollable content
  - App info section, permissions list, recommended action
  - Uninstall button at bottom (Premium only, disabled for free users)
- **Safe Area Insets**: 
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
- **Components**:
  - App icon and name (large)
  - Risk level badge
  - Permissions requested (with danger indicators)
  - Data usage meter
  - Action buttons (Report, Uninstall)

#### 5. Premium Upgrade Modal
- **Purpose**: Convert free users to premium with psychological pricing
- **Layout**:
  - Native modal presentation
  - Centered card with close button (top-right)
  - Feature comparison list
  - Pricing section with strikethrough original price
  - Large CTA button at bottom
- **Components**:
  - Feature checklist (Free vs Premium)
  - Price display: $1.49 (large) with ~~$9.99~~ crossed out
  - "Launch Offer" badge
  - "Buy Now" button (primary action)

## Design System

### Color Palette (Dark Hacker Theme)
- **Background**: 
  - Primary: #0A0A0A (pure black)
  - Secondary: #1A1A1A (card backgrounds)
  - Tertiary: #2A2A2A (borders, dividers)
- **Functional Colors**:
  - Safe/Success: #00FF41 (neon green)
  - Danger/High Risk: #FF0033 (bright red)
  - Warning/Medium Risk: #FFB800 (amber)
  - Info: #00B8FF (cyan)
- **Text**:
  - Primary: #FFFFFF (white)
  - Secondary: #A0A0A0 (gray)
  - Disabled: #505050 (dark gray)
- **Accent**: 
  - Premium Gold: #FFD700 (for premium badges and features)

### Typography
- **Font Family**: System default (San Francisco for iOS, Roboto for Android)
- **Sizes**:
  - Hero: 48px (radar scan status)
  - H1: 32px (screen titles)
  - H2: 24px (section headers)
  - H3: 18px (card titles)
  - Body: 16px (standard text)
  - Caption: 14px (metadata, labels)
  - Small: 12px (disclaimers)
- **Weights**: Regular (400), Medium (500), Bold (700)
- **RTL Support**: Automatically flip text alignment for Urdu, Pashto, Sindhi

### Spacing System
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Visual Design

#### Interactive Elements
- **Scan Button**: 
  - Large circular button (200x200px) with gradient border (neon green glow)
  - Pulsing animation when idle (scale 1.0 to 1.05, repeat)
  - Radar sweep animation when scanning (360° rotation with trailing gradient)
  - Subtle drop shadow: shadowOffset {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8
- **Cards**: 
  - Background: #1A1A1A
  - Border: 1px solid #2A2A2A
  - Border radius: 16px
  - No shadow unless floating
- **Buttons**:
  - Primary (Premium CTA): Gradient background (#FFD700 to #FFA500), bold white text
  - Danger (Uninstall): Solid #FF0033, white text
  - Secondary: Transparent with 1px #00FF41 border, neon green text
  - Pressed state: Reduce opacity to 0.7
- **Badges**: 
  - HIGH RISK: Red pill shape (#FF0033 background, white text, 20px height)
  - SAFE: Green pill (#00FF41 background, black text)
  - PREMIUM: Gold pill (#FFD700 background, black text)

#### Free vs Premium Visual States
- **Free User Blurred Threats**:
  - App icon: Apply blur(10px) filter
  - App name: Show "?????" in same font size
  - Background: Semi-transparent overlay with lock icon
- **Premium Unlock Animation**: 
  - When premium is activated, animate blur removal (0.5s ease-out)
  - Slide-in app names from right to left

#### Icons
- Use **Feather Icons** from @expo/vector-icons for all UI elements
- Scan: activity (animated)
- Settings: settings
- Back: arrow-left
- Close: x
- Lock (premium): lock
- Shield: shield
- Alert: alert-triangle
- Data: database
- Hidden: eye-off

### Required Assets
Generate the following custom assets:
1. **App Logo/Icon**: Shield with radar waves, neon green outline on black background (512x512px)
2. **Radar Scan Animation**: SVG-based radar sweep graphic with green trailing gradient
3. **Premium Badge Icon**: Gold crown or star icon (48x48px)
4. **Threat Category Icons** (each 64x64px, neon green line art on transparent):
   - Spyware: Eye with crosshairs
   - Loan Apps: Credit card with warning symbol
   - Hidden Apps: Ghost icon
   - Data Leak: Database with arrow pointing out

### Accessibility
- All touchable elements minimum 44x44px hit area
- Sufficient color contrast (WCAG AA): white text on dark backgrounds, black text on neon green/gold
- Screen reader labels for all interactive elements
- RTL layout mirroring for Arabic/Urdu scripts (flex-direction: row-reverse)
- Language-specific font rendering for Urdu/Hindi/Pashto/Sindhi (Noto Sans family fallback)
- Visual feedback on all button presses (opacity change)

### Interaction Design
- **Scan Animation Sequence**: 
  1. Button press → Radar ring expands outward (0.3s)
  2. Radar sweep begins (3-5 second loop)
  3. "Scanning..." text pulses
  4. On completion → Brief green flash → Navigate to results
- **Pull-to-Refresh**: Dashboard supports pull-down gesture to re-scan
- **Swipe Actions**: On threat list items, swipe left reveals "Report" button (red)
- **Long-Press**: Long-press on scan button to access quick settings