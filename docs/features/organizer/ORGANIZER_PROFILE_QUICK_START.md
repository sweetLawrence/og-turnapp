# Organizer Profile - Quick Start Guide (React Frontend)

## What's New?

The React frontend now supports organizer profiles! Users can:
- View organizer profiles with bio and social links
- See all events by an organizer (upcoming and past)
- View organizer statistics
- Navigate from event details to organizer profile

## Quick Setup

### 1. Install Dependencies (if needed)

```bash
cd frontend/frontend
npm install
```

All required dependencies should already be installed.

### 2. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Test the Feature

1. **View an Event**
   - Navigate to any event details page
   - Scroll down to see the "Organized by" card

2. **Click Organizer Card**
   - Click on the organizer card
   - You'll be taken to the organizer profile page

3. **Explore Organizer Profile**
   - View organizer bio and social links
   - See statistics (events, tickets sold)
   - Browse upcoming and past events
   - Click on any event to view details

## File Structure

```
frontend/frontend/src/
├── pages/
│   ├── OrganizerProfilePage.jsx  ← NEW
│   └── EventDetailsPage.jsx      ← UPDATED
├── components/
│   ├── OrganizerCard.jsx         ← NEW
│   └── EventCard.jsx             ← UPDATED
├── services/
│   └── organizerApi.js           ← NEW
├── utils/
│   └── eventTransformer.js       ← UPDATED
└── App.js                        ← UPDATED
```

## New Routes

```
/organizer/:userId  → Organizer Profile Page
```

## API Endpoint

The frontend calls:
```
GET /api/organizer/{userId}
```

Make sure your backend API is running and this endpoint is available.

## Environment Variables

Check your `.env` file:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

For production, update `.env.production`:

```env
REACT_APP_API_URL=https://your-domain.com/api
```

## Testing Checklist

### Basic Functionality
- [ ] Event details page shows organizer card
- [ ] Clicking organizer card navigates to profile
- [ ] Profile page loads without errors
- [ ] Statistics display correctly
- [ ] Social links work (open in new tab)
- [ ] Tabs switch between upcoming/past events
- [ ] Event cards are clickable

### Responsive Design
- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)

### Error Handling
- [ ] Invalid organizer ID shows error
- [ ] Network errors show toast notification
- [ ] Empty states display correctly

## Common Issues

### 1. Profile Not Loading

**Problem**: Organizer profile page shows loading spinner forever

**Solutions**:
- Check if backend API is running
- Verify API endpoint: `http://localhost:8000/api/organizer/1`
- Check browser console for errors
- Verify CORS settings on backend

### 2. Organizer Card Not Showing

**Problem**: Event details page doesn't show organizer card

**Solutions**:
- Check if event has `user` relationship loaded
- Verify `event.organizer` and `event.userId` exist
- Check browser console for errors

### 3. Images Not Loading

**Problem**: Profile photos or event images not displaying

**Solutions**:
- Check image URLs in network tab
- Verify backend storage is accessible
- Check CORS settings for images

### 4. Styling Issues

**Problem**: Components look broken or unstyled

**Solutions**:
- Clear browser cache
- Restart development server
- Check Tailwind CSS is working
- Verify all UI components are imported

## Development Tips

### Hot Reload

Changes to React components will hot reload automatically. If you don't see changes:
1. Save the file
2. Check terminal for errors
3. Refresh browser if needed

### Debugging

Use React DevTools:
1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect component state and props

### API Testing

Test API directly:
```bash
curl http://localhost:8000/api/organizer/1
```

Should return JSON with organizer data.

## Next Steps

### For Users
1. Browse events
2. Click on organizer cards
3. Explore organizer profiles
4. Follow social media links

### For Developers
1. Review the implementation docs
2. Test all features
3. Check responsive design
4. Verify error handling
5. Test with real data

## Build for Production

```bash
# Create production build
npm run build

# Build output will be in build/ directory
# Deploy to your hosting service
```

## Support

Need help?
- Check `ORGANIZER_PROFILE_REACT_IMPLEMENTATION.md` for detailed docs
- Review the API documentation
- Check browser console for errors
- Contact the development team

---

**Quick Links**:
- [Full Implementation Docs](ORGANIZER_PROFILE_REACT_IMPLEMENTATION.md)
- [Backend API Docs](../../turnapp/ORGANIZER_PROFILE_API.md)
- [Feature Overview](../../turnapp/ORGANIZER_PROFILE_FEATURE.md)

**Status**: ✅ Ready to Use  
**Version**: 1.0.0
