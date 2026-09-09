# Checkout Integration - Testing Guide

## Test Environment Setup

### Prerequisites
1. Backend API running on `http://localhost:8000`
2. Frontend running on `http://localhost:3000`
3. Test M-PESA credentials configured in backend
4. Test promo codes created in database

### Environment Variables
```env
# frontend/.env
REACT_APP_API_URL=http://localhost:8000/api
```

## Test Scenarios

### 1. Cart Management Tests

#### Test 1.1: Add Items to Cart
**Steps:**
1. Navigate to event details page
2. Select ticket type and quantity
3. Click "Proceed to Checkout"

**Expected Result:**
- Cart validation succeeds
- Navigate to checkout page
- Cart items displayed correctly
- Total calculated accurately

**API Calls:**
- `POST /api/checkout/cart/items`
- `GET /api/checkout/cart/{token}`

#### Test 1.2: Update Cart Quantities
**Steps:**
1. On event details page, increase ticket quantity
2. Decrease ticket quantity
3. Remove ticket (set quantity to 0)

**Expected Result:**
- Quantity updates immediately
- Total recalculates
- UI reflects changes

#### Test 1.3: Cart Validation
**Steps:**
1. Add tickets to cart
2. In backend, reduce ticket availability
3. Click "Proceed to Checkout"

**Expected Result:**
- Validation fails
- Error message displayed
- User cannot proceed

**API Calls:**
- `POST /api/checkout/cart/validate`

#### Test 1.4: Cart Persistence
**Steps:**
1. Add tickets to cart
2. Refresh page
3. Check cart state

**Expected Result:**
- Cart token persists in localStorage
- Cart items remain after refresh

### 2. Promo Code Tests

#### Test 2.1: Apply Valid Percentage Promo Code
**Steps:**
1. Proceed to checkout
2. Enter valid percentage promo code (e.g., "SAVE20")
3. Click "Apply"

**Expected Result:**
- Success message displayed
- Discount amount shown
- Total recalculated with discount
- Promo badge displayed

**API Calls:**
- `POST /api/checkout/promo-code/apply`

**Test Data:**
```sql
-- Create test promo code
INSERT INTO promo_codes (code, discount_type, discount_value, valid_from, valid_to)
VALUES ('SAVE20', 'percentage', 20, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
```

#### Test 2.2: Apply Valid Fixed Amount Promo Code
**Steps:**
1. Enter fixed amount promo code (e.g., "FLAT500")
2. Click "Apply"

**Expected Result:**
- KES 500 discount applied
- Total reduced by 500

**Test Data:**
```sql
INSERT INTO promo_codes (code, discount_type, discount_value, valid_from, valid_to)
VALUES ('FLAT500', 'fixed', 500, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
```

#### Test 2.3: Apply Invalid Promo Code
**Steps:**
1. Enter invalid code (e.g., "INVALID")
2. Click "Apply"

**Expected Result:**
- Error message: "Invalid promo code"
- No discount applied
- Total unchanged

#### Test 2.4: Apply Expired Promo Code
**Steps:**
1. Enter expired promo code
2. Click "Apply"

**Expected Result:**
- Error message: "Promo code has expired"
- No discount applied

**Test Data:**
```sql
INSERT INTO promo_codes (code, discount_type, discount_value, valid_from, valid_to)
VALUES ('EXPIRED', 'percentage', 10, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY));
```

#### Test 2.5: Remove Promo Code
**Steps:**
1. Apply valid promo code
2. Click "Remove" on promo badge
3. Verify total recalculated

**Expected Result:**
- Promo code removed
- Discount removed
- Total back to original amount

**API Calls:**
- `DELETE /api/checkout/promo-code/{token}`

### 3. M-PESA STK Push Tests

#### Test 3.1: Successful STK Push Payment
**Steps:**
1. Fill customer information
2. Select "M-PESA STK Push"
3. Enter valid phone number (e.g., "0712345678")
4. Click "Send STK Push"
5. Accept payment on phone

**Expected Result:**
- STK push sent to phone
- Loading indicator shown
- Polling starts
- Payment verified within 1 minute
- Order confirmation displayed

**API Calls:**
- `POST /api/checkout/payment`
- `GET /api/checkout/payment/verify/{transactionId}` (polling)

**Backend Requirements:**
- Valid M-PESA API credentials
- STK push callback URL configured

#### Test 3.2: STK Push Timeout
**Steps:**
1. Send STK push
2. Cancel or ignore prompt on phone
3. Wait for timeout (1 minute)

**Expected Result:**
- Polling stops after 30 attempts
- Manual payment option displayed
- Error message shown

#### Test 3.3: Invalid Phone Number
**Steps:**
1. Enter invalid phone number (e.g., "123")
2. Click "Send STK Push"

**Expected Result:**
- Validation error
- Cannot proceed
- Error message: "Please enter a valid M-PESA phone number"

### 4. Manual Payment (C2B) Tests

#### Test 4.1: Successful Manual Payment
**Steps:**
1. Click manual payment option (or wait for STK timeout)
2. Note paybill details displayed
3. Complete payment on phone using displayed details
4. Enter M-PESA confirmation code
5. Click "Verify Payment"

**Expected Result:**
- Paybill instructions displayed clearly
- Payment verified successfully
- Order confirmation shown

**API Calls:**
- `POST /api/checkout/payment`

**Test Data:**
- Paybill: 400200
- Account: EVT{eventId}2024
- Amount: Total from cart

#### Test 4.2: Invalid Confirmation Code
**Steps:**
1. Enter invalid confirmation code
2. Click "Verify Payment"

**Expected Result:**
- Error message: "Invalid confirmation code"
- Payment not verified
- User can retry

#### Test 4.3: Short Confirmation Code
**Steps:**
1. Enter code less than 8 characters
2. Click "Verify Payment"

**Expected Result:**
- Validation error
- Error message: "Please enter a valid M-PESA confirmation code"

### 5. Card Payment Tests

#### Test 5.1: Card Payment Redirect
**Steps:**
1. Select "Card Payment via DPO"
2. Enter card details
3. Click "Pay"

**Expected Result:**
- Payment processing
- Redirect to DPO payment gateway
- Payment form displayed

**API Calls:**
- `POST /api/checkout/payment`

**Note:** Full card payment testing requires DPO sandbox credentials

#### Test 5.2: Card Payment Callback
**Steps:**
1. Complete payment on DPO gateway
2. Wait for redirect back

**Expected Result:**
- Redirect to success page
- Order confirmation displayed
- Payment verified

### 6. Form Validation Tests

#### Test 6.1: Empty Form Fields
**Steps:**
1. Leave all fields empty
2. Try to proceed with payment

**Expected Result:**
- Error: "Please fill in all customer details"
- Cannot proceed

#### Test 6.2: Invalid Email
**Steps:**
1. Enter invalid email (e.g., "notanemail")
2. Try to proceed

**Expected Result:**
- Error: "Please enter a valid email address"

#### Test 6.3: Invalid Phone Number
**Steps:**
1. Enter invalid phone (e.g., "123")
2. Try to proceed

**Expected Result:**
- Error: "Please enter a valid 10-digit phone number"

#### Test 6.4: Valid Form
**Steps:**
1. Fill all fields correctly
2. Proceed with payment

**Expected Result:**
- Validation passes
- Payment process starts

### 7. Order Confirmation Tests

#### Test 7.1: Display Order Details
**Steps:**
1. Complete successful payment
2. View order confirmation

**Expected Result:**
- Order number displayed
- Transaction ID shown
- Event details correct
- Total amount accurate
- Ticket count correct

#### Test 7.2: Download Tickets
**Steps:**
1. On confirmation page
2. Click "Download Tickets"

**Expected Result:**
- PDF tickets downloaded
- Contains QR code
- Shows event details

**Note:** Requires backend PDF generation

#### Test 7.3: Email Confirmation
**Steps:**
1. Complete payment
2. Check email

**Expected Result:**
- Confirmation email received
- Contains order details
- Includes ticket attachment or link

**Note:** Requires backend email configuration

#### Test 7.4: SMS Confirmation
**Steps:**
1. Complete payment
2. Check phone for SMS

**Expected Result:**
- SMS received
- Contains order number
- Includes event details

**Note:** Requires backend SMS configuration

### 8. Error Handling Tests

#### Test 8.1: Network Error
**Steps:**
1. Stop backend server
2. Try to add items to cart

**Expected Result:**
- Error message displayed
- User notified of connection issue
- Graceful degradation

#### Test 8.2: API Error Response
**Steps:**
1. Trigger API error (e.g., invalid data)
2. Observe error handling

**Expected Result:**
- Error message from backend displayed
- User can retry
- No app crash

#### Test 8.3: Payment Gateway Timeout
**Steps:**
1. Simulate payment gateway timeout
2. Observe behavior

**Expected Result:**
- Timeout message displayed
- Alternative payment option offered
- Transaction not duplicated

### 9. Edge Cases

#### Test 9.1: Sold Out Tickets
**Steps:**
1. Add last available tickets to cart
2. Another user purchases same tickets
3. Try to complete checkout

**Expected Result:**
- Validation fails
- Error: "Tickets no longer available"
- Cart updated

#### Test 9.2: Price Change During Checkout
**Steps:**
1. Add tickets to cart
2. Admin changes ticket price
3. Complete checkout

**Expected Result:**
- Price validation occurs
- User notified of price change
- Must confirm new price

#### Test 9.3: Multiple Browser Tabs
**Steps:**
1. Open checkout in two tabs
2. Complete payment in one tab
3. Try to pay in second tab

**Expected Result:**
- Second tab detects completed payment
- Prevents duplicate payment
- Redirects to confirmation

#### Test 9.4: Browser Back Button
**Steps:**
1. Complete payment
2. Click browser back button

**Expected Result:**
- Cart already cleared
- Cannot re-submit payment
- Redirected appropriately

### 10. Performance Tests

#### Test 10.1: Large Cart
**Steps:**
1. Add maximum allowed tickets
2. Proceed to checkout
3. Complete payment

**Expected Result:**
- Page loads quickly
- No lag in UI
- Payment processes normally

#### Test 10.2: Concurrent Users
**Steps:**
1. Multiple users checkout simultaneously
2. Monitor performance

**Expected Result:**
- All users can checkout
- No race conditions
- Inventory managed correctly

#### Test 10.3: Payment Polling Performance
**Steps:**
1. Initiate STK push
2. Monitor network requests
3. Check polling frequency

**Expected Result:**
- Polls every 2 seconds
- Stops after 30 attempts
- No memory leaks

## Test Data Setup

### Create Test Event
```sql
INSERT INTO events (title, description, date, time, venue, location, category, featured)
VALUES ('Test Event', 'Test Description', '2024-12-31', '20:00:00', 'Test Venue', 'Nairobi', 'concert', 1);
```

### Create Test Tickets
```sql
INSERT INTO event_prices (event_id, ticket_name, price, quantity_available)
VALUES 
  (1, 'Regular', 1000, 100),
  (1, 'VIP', 2500, 50),
  (1, 'VVIP', 5000, 20);
```

### Create Test Promo Codes
```sql
INSERT INTO promo_codes (code, discount_type, discount_value, valid_from, valid_to, usage_limit)
VALUES 
  ('SAVE20', 'percentage', 20, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100),
  ('FLAT500', 'fixed', 500, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 50),
  ('EXPIRED', 'percentage', 10, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), 100);
```

## Automated Testing

### Jest Test Example
```javascript
// checkoutApi.test.js
import { checkoutApi } from '../services/checkoutApi';

describe('Checkout API', () => {
  test('should add item to cart', async () => {
    const result = await checkoutApi.addItem(1, 2);
    expect(result.success).toBe(true);
    expect(result.data.quantity).toBe(2);
  });

  test('should apply promo code', async () => {
    const result = await checkoutApi.applyPromoCode('SAVE20', 1);
    expect(result.success).toBe(true);
    expect(result.data.discount_type).toBe('percentage');
  });
});
```

### React Testing Library Example
```javascript
// CheckoutPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';

test('validates form before payment', () => {
  render(<CheckoutPage />);
  
  const payButton = screen.getByText(/Pay/i);
  fireEvent.click(payButton);
  
  expect(screen.getByText(/Please fill in all customer details/i)).toBeInTheDocument();
});
```

## Monitoring & Debugging

### Browser Console Checks
```javascript
// Check cart token
console.log(localStorage.getItem('cart_token'));

// Check API responses
// Open Network tab in DevTools
// Filter by "checkout"
// Inspect request/response payloads
```

### Backend Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# M-PESA logs
tail -f storage/logs/mpesa.log
```

### Common Issues

**Issue:** Cart token not persisting
**Solution:** Check localStorage, clear browser cache

**Issue:** STK push not received
**Solution:** Verify M-PESA credentials, check phone number format

**Issue:** Payment polling timeout
**Solution:** Check backend callback URL, verify M-PESA configuration

**Issue:** Promo code not applying
**Solution:** Check code validity, expiry date, usage limits

## Test Checklist

- [ ] Cart management (add, remove, validate)
- [ ] Promo code application (valid, invalid, expired)
- [ ] Form validation (all fields)
- [ ] M-PESA STK push (success, timeout)
- [ ] Manual payment (valid, invalid code)
- [ ] Card payment (redirect, callback)
- [ ] Order confirmation (display, email, SMS)
- [ ] Error handling (network, API, validation)
- [ ] Edge cases (sold out, price change, concurrent)
- [ ] Performance (large cart, polling, concurrent users)
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, screen readers)

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device information
5. Console errors
6. Network request/response
7. Screenshots/videos

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Proper error messages displayed
✅ Payment processing works end-to-end
✅ Order confirmation accurate
✅ Cart management reliable
✅ Promo codes function correctly
✅ Performance acceptable
✅ Mobile responsive
✅ Accessible
