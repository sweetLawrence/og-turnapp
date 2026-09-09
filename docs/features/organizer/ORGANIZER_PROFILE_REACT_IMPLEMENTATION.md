# Organizer Profile - React Frontend Implementation

## Overview
This document describes the React frontend implementation of the organizer profile feature. This allows users to view organizer profiles, see their events, and connect via social media.

## Files Created

### 1. Pages
- **`src/pages/OrganizerProfilePage.jsx`** - Main organizer profile page component

### 2. Components
- **`src/components/OrganizerCard.jsx`** - Organizer card component for event details page

### 3. Services
- **`src/services/organizerApi.js`** - API service for organizer-related requests

### 4. Updated Files
- **`src/App.js`** - Added organizer profile route
- **`src/pages/EventDetailsPage.jsx`** - Added organizer card integration
- **`src/components/EventCard.jsx`** - Added support for past events
- **`src/utils/eventTransformer.js`** - Added organizer data transformation

## Features

### Organizer Profile Page (`/organizer/:userId`)

#### Header Section
- Profile photo (circular, 128px)
- Organizer name (large heading)
- Bio (if available)
- Social media links (Facebook, Twitter, Instagram, Website)

#### Statistics Dashboard
- Total Events
- Upcoming Events (green)
- Past Events (gray)
- Total Tickets Sold (primary color)

#### Events Section
- Tabbed interface (Upcoming / Past)
- Event grid (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Empty states for no events
- Event cards with all details

### Organizer Card Component

Used on event details page to link to organizer profile:
- Profile photo
- Organizer name
- Bio snippet (or "View organizer profile")
- Hover effects
- Click to navigate to profile

### Event Card Updates

Added support for past events:
- "ENDED" badge for past events
- `isPast` prop to control display

## Routes

```javascript
// App.js
<Route path="/organizer/:userId" element={<OrganizerProfilePage />} />
```

## API Integration

### Organizer API Service

```javascript
// src/services/organizerApi.js
export const organizerApi = {
  async getOrganizerProfile(userId) {
    // GET /api/organizer/{userId}
    // Returns organizer data, statistics, and events
  }
};
```

### API Response Structure

```json
{
  "success": true,
  "data": {
    "organizer": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "profile_photo_url": "https://...",
      "bio": "Event organizer bio...",
      "social_links": {
        "facebook": "https://facebook.com/...",
        "twitter": "https://twitter.com/...",
        "instagram": "https://instagram.com/...",
        "website": "https://example.com"
      }
    },
    "statistics": {
      "total_events": 10,
      "upcoming_events": 3,
      "past_events": 7,
      "total_tickets_sold": 1500
    },
    "upcoming_events": [...],
    "past_events": [...]
  }
}
```

## Component Usage

### OrganizerProfilePage

```jsx
import OrganizerProfilePage from './pages/OrganizerProfilePage';

// Used in routing
<Route path="/organizer/:userId" element={<OrganizerProfilePage />} />
```

### OrganizerCard

```jsx
import { OrganizerCard } from './components/OrganizerCard';

// In EventDetailsPage
{event.organizer && event.userId && (
  <OrganizerCard organizer={event.organizer} userId={event.userId} />
)}
```

### EventCard with Past Events

```jsx
import { EventCard } from './components/EventCard';

// For past events
<EventCard event={event} isPast={true} />

// For upcoming events
<EventCard event={event} isPast={false} />
```

## Styling

### Tailwind Classes Used

- **Glass effect**: `glass` (custom class)
- **Hover effects**: `hover:bg-white/10`, `hover:border-primary/50`
- **Transitions**: `transition-all`
- **Responsive grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Text colors**: `text-white`, `text-muted-foreground`, `text-primary`

### Custom Animations

- Profile photo border on hover
- Card lift on hover
- Smooth color transitions
- Icon color changes

## State Management

### OrganizerProfilePage State

```javascript
const [organizerData, setOrganizerData] = useState(null);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('upcoming');
```

### Loading States

- Initial loading spinner
- Error handling with toast notifications
- Redirect to home on error

## Navigation Flow

```
Event Details Page
    ↓ (Click Organizer Card)
Organizer Profile Page
    ↓ (Click Event Card)
Event Details Page
```

## Responsive Design

### Breakpoints

- **Mobile**: < 640px (sm)
  - Single column layout
  - Stacked statistics
  - Full-width cards

- **Tablet**: 640px - 1024px (md)
  - Two column event grid
  - Side-by-side statistics

- **Desktop**: > 1024px (lg)
  - Three column event grid
  - Full statistics row

### Mobile Optimizations

- Touch-friendly buttons
- Larger tap targets
- Optimized image sizes
- Responsive typography

## Error Handling

### API Errors

```javascript
try {
  const response = await organizerApi.getOrganizerProfile(userId);
  if (response.success) {
    setOrganizerData(response.data);
  } else {
    toast.error('Organizer not found');
    navigate('/');
  }
} catch (error) {
  console.error('Error loading organizer profile:', error);
  toast.error('Failed to load organizer profile');
  navigate('/');
}
```

### Empty States

- No upcoming events
- No past events
- No social links
- No bio

## Performance Optimizations

### Image Loading

- Lazy loading for event images
- Placeholder images
- Error handling for broken images

### Data Fetching

- Single API call for all data
- No unnecessary re-renders
- Efficient state updates

### Code Splitting

- Route-based code splitting (automatic with React Router)
- Lazy loading of components

## Accessibility

### ARIA Labels

- Semantic HTML elements
- Proper heading hierarchy
- Alt text for images

### Keyboard Navigation

- Tab navigation support
- Focus indicators
- Accessible buttons and links

### Screen Readers

- Descriptive text for icons
- Proper labeling of interactive elements

## Testing Checklist

### Functionality
- [ ] Profile loads correctly
- [ ] Statistics display accurately
- [ ] Tabs switch properly
- [ ] Events display in correct tab
- [ ] Social links open in new tab
- [ ] Navigation works correctly
- [ ] Error handling works
- [ ] Loading states display

### Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Images scale properly
- [ ] Text is readable on all sizes

### Performance
- [ ] Page loads quickly
- [ ] Images load efficiently
- [ ] No console errors
- [ ] Smooth animations

## Environment Variables

```env
# .env
REACT_APP_API_URL=http://localhost:8000/api
```

For production:
```env
# .env.production
REACT_APP_API_URL=https://your-domain.com/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **Profile Editing** (for authenticated organizers)
   - Edit bio
   - Update social links
   - Change profile photo

2. **Follow System**
   - Follow/unfollow organizers
   - Get notifications for new events

3. **Reviews & Ratings**
   - Rate organizers
   - Leave reviews
   - Display average rating

4. **Analytics**
   - View count
   - Click-through rate
   - Popular events

5. **Sharing**
   - Share organizer profile
   - Social media integration

## Troubleshooting

### Profile not loading
- Check API endpoint is correct
- Verify userId parameter
- Check network tab for errors
- Ensure backend API is running

### Images not displaying
- Check image URLs
- Verify CORS settings
- Check image file permissions

### Styling issues
- Clear browser cache
- Check Tailwind config
- Verify custom CSS classes

## Dependencies

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "lucide-react": "^0.x",
  "sonner": "^1.x",
  "@radix-ui/react-tabs": "^1.x"
}
```

## Build & Deploy

### Development
```bash
cd frontend/frontend
npm install
npm start
```

### Production Build
```bash
npm run build
```

### Deploy
```bash
# Build files will be in build/ directory
# Deploy to your hosting service
```

## Support

For issues or questions:
- Check the main documentation
- Review the API documentation
- Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Status:** ✅ Complete and Ready for Testing
