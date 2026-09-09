# EventCard Bug Fix

## Issue
```
TypeError: Cannot read properties of undefined (reading 'filter')
```

The error occurred in the `EventCard` component when trying to access `event.tickets.filter()`.

## Root Cause

The API returns different data structures for:
1. **Event List** (`/api/events`, `/api/events/featured`, `/api/events/upcoming`) - Does NOT include ticket details
2. **Event Details** (`/api/events/{id}`) - DOES include ticket details

The `EventCard` component was expecting `event.tickets` to always be an array, but for list views, this property didn't exist.

## Solution

### 1. Updated `eventTransformer.js`
Added an empty `tickets` array to list items:

```javascript
export const transformEventListItem = (apiEvent) => {
  return {
    // ... other fields
    tickets: [], // Added empty array for list items
  };
};
```

### 2. Updated `EventCard.jsx`
Made the component handle both cases:

**Before:**
```javascript
const getLowestPrice = () => {
  const prices = event.tickets.filter(t => t.available > 0).map(t => t.price);
  return prices.length > 0 ? Math.min(...prices) : 0;
};
```

**After:**
```javascript
const getLowestPrice = () => {
  // If tickets array exists and has items, use it
  if (event.tickets && event.tickets.length > 0) {
    const prices = event.tickets.filter(t => t.available > 0).map(t => t.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }
  // Otherwise, use priceRange or price from the event
  if (event.priceRange && event.priceRange.min !== undefined) {
    return event.priceRange.min;
  }
  return event.price || 0;
};
```

### 3. Additional Improvements

**Sold Out Check:**
```javascript
const isSoldOut = event.tickets && event.tickets.length > 0 
  ? event.tickets.every(t => t.available === 0)
  : false;
```

**Image Error Handling:**
```javascript
<img 
  src={event.image}
  onError={(e) => {
    e.target.src = '/placeholder-event.jpg';
  }}
/>
```

**Featured Badge:**
```javascript
{(featured || event.featured) && (
  <Badge>FEATURED</Badge>
)}
```

**Description Fallback:**
```javascript
{event.shortDescription || event.description}
```

## Result

✅ EventCard now works with both list and detail data
✅ Displays price from `priceRange.min` for list items
✅ Displays price from tickets for detail items
✅ No more runtime errors
✅ Graceful fallbacks for missing data

## Testing

1. Visit `http://localhost:3000`
2. Events should load without errors
3. Prices should display correctly
4. Click on an event to see details
5. All data should display properly

## Files Modified

- `frontend/src/utils/eventTransformer.js`
- `frontend/src/components/EventCard.jsx`
