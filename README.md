# TurnApp (EventHub) - Modern Events Booking Platform

A stunning, modern events booking platform built with React, featuring a sleek black background with deep red accents, glassmorphism effects, and complete booking flow from browsing to payment.

> **Migration note:** This project was migrated from Create React App + Craco
> to **Vite** in July 2026, and from `<BrowserRouter>` to React Router's
> `createBrowserRouter` API. See `MIGRATION.md` for full details on what
> changed and why. Package management moved from `npm`/`yarn` to **pnpm**.

## 🎯 Features

### 🏠 Landing Page
- **Hero Carousel**: Auto-rotating carousel showcasing featured events with manual navigation
- **Featured Events Section**: Premium events with special badges and red glow effects
- **Upcoming Events Grid**: Events displayed in responsive grid layout, with load-more pagination
- **Responsive Design**: Mobile-first approach with perfect adaptation to all screen sizes

### 📅 Event Details Page
- **Event Hero Image**: Full-width banner with gradient overlay
- **Countdown Timer**: Real-time countdown to event start (days, hours, minutes, seconds)
- **Event Information**: Comprehensive details including description, highlights, and lineup
- **Ticket Selection Panel**: Sticky sidebar with multiple ticket types
- **Quantity Controls**: Increment/decrement buttons with availability indicators
- **Real-time Total Calculation**: Updates instantly as tickets are selected
- **Sold Out Indicators**: Clear visual feedback for unavailable tickets

### 💳 Checkout Page
- **Order Summary**: Complete breakdown of selected tickets and pricing
- **Customer Information Form**: Full name, email, and phone number with validation
- **Dual Payment Options**:
  - **M-PESA STK Push**: Lipa na M-PESA with phone number input
  - **Manual M-PESA (C2B)**: Step-by-step instructions with paybill details
  - **Card Payment via DPO**: Complete card payment form (Visa, Mastercard, Amex)
- **Payment Success Page**: QR code ticket, order confirmation, and download option
- **Booking Fee Calculation**: Automatic service fee

### 🎨 Design System
- **Color Scheme**: Pure black (#000000) background with deep crimson red (#DC143C)
- **Glassmorphism**: Frosted glass effects with backdrop blur on cards and panels
- **Red Glow Effects**: Subtle shadows for emphasis on featured elements
- **Typography**: Space Grotesk for headings, Inter for body text
- **Animations**: Smooth transitions, fade-ins, and scale effects
- **Custom Scrollbar**: Themed scrollbar matching the design system

## 🏗️ Technical Stack

### Frontend
- **React 19** with **React Router v7** (`createBrowserRouter`) for navigation
- **Vite** as the build tool and dev server
- **Tailwind CSS v3** for utility-first styling
- **Shadcn/UI** (Radix-based) components for accessible, customizable UI elements
- **Lucide React** for consistent iconography
- **Sonner** for elegant toast notifications
- **React Hook Form + Zod** for form handling and validation
- **Axios** for API requests

### Backend Integration
This app talks to a live backend API (see `src/services/`) rather than mock
data — event listings, checkout, and payments are backed by real endpoints.
Configure the API base URL via environment variables (see below).

## 📱 Pages

Full route list lives in `src/App.jsx`. Key pages:

1. **Landing Page** (`/`) — hero carousel, featured events, upcoming events grid
2. **Events Page** (`/events`) — full event listing
3. **Event Details Page** (`/events/:id`) — event info, countdown timer, ticket selection
4. **Checkout Page** (`/checkout`) — order summary, payment method selection
5. **Manual Payment / Success Pages** — M-PESA C2B instructions and confirmation
6. **Dashboard** (`/dashboard/*`) — organizer-facing event, order, and campaign management
7. **Affiliate Pages** (`/affiliate/*`) — affiliate registration, dashboard, campaigns, earnings
8. **Admin** (`/admin/withdrawals`) — admin withdrawal management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- **pnpm** (this project uses pnpm, not npm or yarn)

If you don't have pnpm installed:
```bash
npm install -g pnpm
```

### Installation

```bash
cd frontend-new
pnpm install
```

### Environment variables

Copy the example env file and fill in real values:
```bash
cp .env.example .env
```
See `.env.example` for the full list of variables and production notes
(Vite-specific behavior around build-time env baking, the `VITE_` prefix
requirement, and what's safe vs. unsafe to expose client-side).

### Start development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000` (port is set in
`vite.config.js`; Vite's own default is 5173 if that config is ever removed).

### Build for production

```bash
pnpm build
```

This creates an optimized production build in the `dist/` folder.

### Preview a production build locally

```bash
pnpm preview
```

Useful for a final smoke test before deploying — serves the actual `dist/`
output rather than the dev server.

## 🎨 Design Tokens

### Color Palette (HSL Format)
Defined as CSS custom properties in `src/index.css`, consumed via
Tailwind's `theme.extend.colors` in `tailwind.config.cjs` (wrapped in
`hsl(var(--x))`):

```css
--background: 0 0% 0%;           /* Pure black */
--foreground: 0 0% 98%;          /* Near white */
--primary: 348 83% 47%;          /* Crimson red */
--primary-dark: 348 100% 27%;    /* Dark red */
--primary-light: 348 83% 57%;    /* Light red */
--muted: 0 0% 8%;                /* Dark gray */
--card: 0 0% 3%;                 /* Slightly lighter black */
```

### Glass Effects
```css
.glass {
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(24px);
}
```

### Red Glow
```css
.red-glow {
  box-shadow: 0 4px 24px -4px rgba(220, 20, 60, 0.35);
}
```

## 📦 Component Structure

```
frontend-new/
├── index.html                # Vite entry HTML (real entry point, not a template)
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
├── jsconfig.json             # @/ path alias for editor tooling
├── .env.example
└── src/
    ├── main.jsx               # Vite entry — mounts <App />
    ├── App.jsx                # createBrowserRouter route tree + RootLayout
    ├── index.css              # Global styles & design tokens
    ├── App.css                # Toaster mobile-responsive fixes
    ├── components/
    │   ├── ui/                 # Shadcn UI components (Radix-based)
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── EventCard.jsx
    │   └── HeroCarousel.jsx
    ├── pages/                  # Route-level page components
    ├── services/                # API clients (eventApi, apiClient, etc.)
    └── lib/
        └── utils.js             # shadcn's cn() helper
```

## 🔧 Key Features Implementation

### Ticket Selection Logic
- Real-time quantity tracking with useState
- Availability checks before incrementing
- Automatic total calculation
- Disabled state for sold-out tickets

### Payment Flow
1. **STK Push**: Triggers an M-PESA push notification to the customer's phone
2. **Manual Payment**: Shows detailed paybill instructions with a unique account number
3. **Confirmation**: Accepts M-PESA confirmation code for verification
4. **Card Payment**: DPO-style card input with validation
5. **Success State**: Displays QR code, order number, and confirmation details

### Responsive Breakpoints
- Mobile: < 768px (1 column)
- Tablet: 768px – 1024px (2 columns)
- Desktop: > 1024px (3–4 columns)

## 🇰🇪 Kenyan Localization

- **Currency**: All prices in KES (Kenyan Shillings)
- **Phone Format**: Kenyan format (07XX XXX XXX or 01XX XXX XXX)
- **Payment Methods**: M-PESA (STK & C2B) + Cards

## 🎯 User Flow

1. **Landing** → Browse hero carousel and event cards
2. **Event Details** → View full event info and select tickets
3. **Checkout** → Fill customer details and choose payment
4. **Payment** → Complete M-PESA or card payment
5. **Success** → Receive QR code ticket and confirmation

## 📄 License

This project is a prototype demonstration built for educational purposes.

## 🙏 Acknowledgments

- Design inspiration from premium event platforms
- Glassmorphism trend in modern UI design
- Kenyan events and culture
- Shadcn/UI for accessible components
- Tailwind CSS for rapid styling

---
**me try**

**Built with ❤️ for the Kenyan events community**