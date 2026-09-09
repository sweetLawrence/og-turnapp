# Event Details Page Debugging Guide

## Issues Fixed

### 1. Inconsistent Property Checking
**Problem**: The code was checking both camelCase and snake_case versions of properties
- `event.eventType` vs `event.event_type`
- `event.externalLink` vs `event.external_link`
- `event.priceFrom` vs `event.price_from`

**Solution**: Now only checks camelCase versions since the transformer converts everything to camelCase.

### 2. Price Display Issues
**Problem**: Ticket prices might not display correctly if they come as strings from the API

**Solution**: 
- Added `parseFloat()` to ensure prices are numbers before calling `.toLocaleString()`
- Updated transformer to parse prices as floats and quantities as integers

### 3. Enhanced Debugging
Added console logging to help identify data structure issues:
```javascript
console.log('Event data loaded:', {
  title: event.title,
  eventType: event.eventType,
  externalLink: event.externalLink,
  priceFrom: event.priceFrom,
  currency: event.currency,
  tickets: event.tickets,
  ticketsCount: event.tickets?.length,
});
```

## How to Debug

1. **Open Browser Console** (F12)
2. **Navigate to an event details page**
3. **Check the console output** for the event data structure
4. **Verify the following**:
   - `eventType` should be 'promotional' or 'ticketed'
   - `externalLink` should be a valid URL for promotional events
   - `priceFrom` should be a number for promotional events
   - `tickets` should be an array with ticket objects for ticketed events
   - Each ticket should have a numeric `price` property

## Common Issues

### Issue: "Book Now" button not showing
**Check**: 
- Is `event.eventType === 'promotional'`?
- Does `event.externalLink` exist and is it a valid URL?

### Issue: Ticket prices showing as NaN or undefined
**Check**:
- Are ticket prices coming from the API as numbers or strings?
- Look at the console log for the `tickets` array structure
- Verify each ticket has a `price` property

### Issue: "Proceed to Checkout" not working
**Check**:
- Are tickets selected? (totalTickets > 0)
- Do tickets have valid IDs and prices?
- Check browser console for any errors during checkout

## Testing Checklist

- [ ] Promotional events show "Book Now" button with external link
- [ ] Promotional events display "Price From" correctly
- [ ] Ticketed events show ticket selection interface
- [ ] Ticket prices display correctly with currency
- [ ] Ticket quantity controls work (+ and - buttons)
- [ ] Total price calculates correctly
- [ ] "Proceed to Checkout" button is enabled when tickets are selected
- [ ] Sold out tickets are properly disabled

## API Response Structure Expected

### Promotional Event:
```json
{
  "event_type": "promotional",
  "external_link": "https://example.com/tickets",
  "price_from": 1000,
  "currency": "KES"
}
```

### Ticketed Event:
```json
{
  "event_type": "ticketed",
  "tickets": [
    {
      "id": 1,
      "name": "General Admission",
      "price": 1500,
      "available": 100,
      "status": "Available"
    }
  ],
  "currency": "KES"
}
```
