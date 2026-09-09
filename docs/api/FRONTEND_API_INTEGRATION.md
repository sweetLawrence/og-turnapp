# Frontend API Integration Guide

## Overview

The frontend has been updated to consume the Event API endpoints. The LandingPage and EventDetailsPage now fetch real data from the backend API.

---

## What Was Updated

### 1. New Files Created

#### `src/services/eventApi.js`
API service layer that handles all HTTP requests to the backend.

**Methods:**
- `getEvents(params)` - Get paginated list of events with filters
- `getEvent(id)` - Get single event details
- `getFeaturedEvents(limit)` - Get featured events
- `getUpcomingEvents(limit)` - Get upcoming events
- `searchEvents(searchTerm, params)` - Search events

#### `src/utils/eventTransformer.js`
Utility functions to transform API data to match frontend component structure.

**Functions:**
- `transformEventListItem(apiEvent)` - Transform list item
- `transformEventDetails(apiEvent)` - Transform detailed event
- `transformTicket(apiTicket)` - Transform ticket data
- `transformEventList(apiEvents, isFeatured)` - Transform array of events
- `formatPrice(price)` - Format price for display
- `formatDate(dateString)` - Format date for display
- `formatTime(timeString)` - Format time for display

### 2. Updated Components

#### `src/pages/LandingPage.jsx`
- ✅ Fetches featured events from API
- ✅ Fetches upcoming events from API
- ✅ Implements "Load More" pagination
- ✅ Shows loading states
- ✅ Error handling with toast notifications

#### `src/pages/EventDetailsPage.jsx`
- ✅ Fetches single event details from API
- ✅ Displays new fields: `short_description`, `event_highlights`, `lineup`
- ✅ Shows loading state while fetching
- ✅ Error handling and redirect on failure
- ✅ Renders HTML description safely

### 3. Environment Configuration

#### `.env`
```
REACT_APP_API_URL=http://localhost:8000/api
```

For production, update to your production API URL.

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
yarn install
```

### 2. Configure Environment
Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

Update the API URL if needed:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Start the Backend
Make sure the Laravel backend is running:
```bash
cd turnapp
php artisan serve
```

### 4. Start the Frontend
```bash
cd frontend
yarn start
```

The app will open at `http://localhost:3000`

---

## Features

### LandingPage

**Featured Events Section:**
- Fetches up to 6 featured events
- Displays in carousel format
- Only shows if featured events exist

**Upcoming Events Section:**
- Fetches 12 events initially
- "Load More" button for pagination
- Loads 12 more events per click
- Button disabled when no more events

**Loading States:**
- Full-page loader on initial load
- Button loader for "Load More"

**Error Handling:**
- Toast notifications for errors
- Graceful fallback on failure

### EventDetailsPage

**Event Information:**
- Title, short description, full description
- Date, time, venue, location
- Category badge
- Event poster image with fallback

**Event Highlights:**
- Displays as bulleted list
- Only shows if highlights exist

**Lineup:**
- Displays as badge chips
- Only shows if lineup exists

**Tickets:**
- Real-time availability
- Price display
- Quantity selection
- Sold out indicators
- Low stock warnings

**Loading States:**
- Full-page loader while fetching
- Smooth transitions

**Error Handling:**
- Redirects to home on error
- Toast notifications
- 404 handling

---

## API Data Flow

### LandingPage Flow
```
Component Mount
    ↓
loadInitialData()
    ↓
Promise.all([
    getFeaturedEvents(6),
    getUpcomingEvents(12)
])
    ↓
Transform API Data
    ↓
Update State
    ↓
Render Components
```

### EventDetailsPage Flow
```
Component Mount
    ↓
loadEvent(id)
    ↓
getEvent(id)
    ↓
Transform API Data
    ↓
Update State
    ↓
Render Event Details
```

---

## Data Transformation

### API Response → Frontend Format

**API Event:**
```json
{
  "id": 1,
  "title": "Event Name",
  "short_description": "Brief text",
  "location": "Venue Name",
  "from": "2024-06-15",
  "from_time": "18:00",
  "poster_url": "http://...",
  "event_highlights": ["Item 1", "Item 2"],
  "lineup": ["Artist 1", "Artist 2"]
}
```

**Transformed Event:**
```javascript
{
  id: 1,
  title: "Event Name",
  description: "Brief text",
  venue: "Venue Name",
  date: "2024-06-15",
  time: "18:00",
  image: "http://...",
  highlights: ["Item 1", "Item 2"],
  lineup: ["Artist 1", "Artist 2"]
}
```

---

## Error Handling

### Network Errors
```javascript
try {
  const response = await eventApi.getEvents();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to load events');
}
```

### API Errors
- 404: Event not found → Redirect to home
- 500: Server error → Show error toast
- Network timeout → Show error toast

### Image Errors
```javascript
<img 
  src={event.image}
  onError={(e) => {
    e.target.src = '/placeholder-event.jpg';
  }}
/>
```

---

## Testing

### Test LandingPage
1. Open `http://localhost:3000`
2. Verify featured events load
3. Verify upcoming events load
4. Click "Load More" button
5. Verify more events load

### Test EventDetailsPage
1. Click on any event card
2. Verify event details load
3. Check that highlights display
4. Check that lineup displays
5. Verify ticket selection works
6. Test countdown timer

### Test Error Handling
1. Stop backend server
2. Refresh frontend
3. Verify error messages appear
4. Restart backend
5. Verify data loads again

---

## Troubleshooting

### Issue: Events not loading
**Solution:**
1. Check backend is running: `php artisan serve`
2. Check API URL in `.env`
3. Check browser console for errors
4. Verify CORS is enabled in backend

### Issue: Images not displaying
**Solution:**
1. Run `php artisan storage:link` in backend
2. Check image URLs in API response
3. Verify images exist in storage

### Issue: CORS errors
**Solution:**
1. Check `turnapp/config/cors.php`
2. Ensure `http://localhost:3000` is allowed
3. Restart backend after changes

### Issue: Stale data
**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check API returns latest data

---

## Performance Optimization

### Current Optimizations
- ✅ Parallel API calls for featured and upcoming events
- ✅ Pagination for large datasets
- ✅ Image lazy loading
- ✅ Efficient state management

### Future Improvements
- Add React Query for caching
- Implement infinite scroll
- Add skeleton loaders
- Optimize image sizes
- Add service worker for offline support

---

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Verify data displays correctly
3. ⏳ Add search functionality
4. ⏳ Add category filtering
5. ⏳ Add date range filtering
6. ⏳ Implement caching
7. ⏳ Add error boundaries
8. ⏳ Add analytics tracking

---

## API Endpoints Used

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/events/featured` | GET | Featured events carousel |
| `/api/events/upcoming` | GET | Initial upcoming events |
| `/api/events` | GET | Load more events (paginated) |
| `/api/events/{id}` | GET | Event details page |

---

## Dependencies

- `axios` - HTTP client
- `react-router-dom` - Routing
- `sonner` - Toast notifications
- `lucide-react` - Icons

All dependencies are already installed in `package.json`.

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Verify API responses in Network tab
4. Review this documentation
5. Check `API_DOCUMENTATION.md` in backend
