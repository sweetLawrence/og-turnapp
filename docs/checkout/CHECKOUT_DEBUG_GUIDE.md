# Checkout Payment Debugging Guide

## Issue: Getting Both Success and Error Messages

If you're seeing both the error toast (red) and success toast (green) at the same time, this indicates the API is returning an error status code (400, 500, etc.) but the response body might still contain success data.

## Debugging Steps

### 1. Check Browser Console

Open the browser console (F12) and look for these logs:

```
Sending payment request: {...}
Payment response: {...}
```

Or if there's an error:

```
Payment error (catch block): {...}
Error response: {...}
```

### 2. Check What's Being Logged

The logs will show:
- **Request data**: What's being sent to the backend
- **Response data**: What the backend is returning
- **Error details**: If there's an error, what type and why

### 3. Common Scenarios

#### Scenario A: Backend Returns 200 with success:false
```json
{
  "success": false,
  "message": "Some error message"
}
```
**Expected behavior:** Should show error toast only, no success toast

#### Scenario B: Backend Returns 400/500 with success:true in body
```json
HTTP 400 Bad Request
{
  "success": true,
  "data": {
    "transaction_id": "TXN123"
  }
}
```
**Expected behavior:** Should extract data from error response and proceed

#### Scenario C: Backend Returns 200 with success:true
```json
{
  "success": true,
  "data": {
    "transaction_id": "TXN123"
  }
}
```
**Expected behavior:** Should show success toast and start polling

### 4. Check Backend Response

Look at the Network tab in browser DevTools:
1. Find the `/api/checkout/payment` request
2. Check the Status Code (200, 400, 500, etc.)
3. Check the Response body
4. Check if there's a `transaction_id` in the response

### 5. Backend Issues to Check

#### Missing Transaction ID
If the backend returns success but no transaction_id:
```json
{
  "success": true,
  "data": {}  // No transaction_id!
}
```
**Fix:** Backend should always return transaction_id when STK push is sent

#### Wrong Status Code
If the backend sends STK push successfully but returns 400/500:
```php
// Backend should return 200 on success
return response()->json([
    'success' => true,
    'data' => ['transaction_id' => $txnId]
], 200);  // Not 400 or 500!
```

#### Inconsistent Success Flag
If the backend returns different success values:
```json
// Don't do this
{
  "success": false,
  "data": {
    "transaction_id": "TXN123"  // Has data but success is false?
  }
}
```

## Current Implementation

### Frontend Error Handling

The frontend now:
1. Logs all requests and responses
2. Checks if response exists and has `success` property
3. Validates that `transaction_id` exists before polling
4. Returns error response data if available (handles non-200 status codes)
5. Shows appropriate error messages based on the error type

### API Service Layer

The `checkoutApi.processPayment()` now:
```javascript
try {
  const response = await api.post('/payment', data);
  return response.data;
} catch (error) {
  // If error response has data, return it
  // This handles cases where backend sends non-200 status
  if (error.response?.data) {
    return error.response.data;
  }
  throw error;
}
```

### CheckoutPage Component

The component now:
```javascript
const response = await checkoutApi.processPayment(paymentData);

// Check if response exists and has success property
if (response && response.success) {
  // Check if transaction_id exists
  if (response.data && response.data.transaction_id) {
    // Start polling
    pollPaymentStatus(response.data.transaction_id);
  } else {
    // No transaction ID - show error
    toast.error('Payment initiated but no transaction ID received');
    setShowManualPayment(true);
  }
} else {
  // Backend returned error
  toast.error(response?.message || 'Failed to send STK Push');
  setShowManualPayment(true);
}
```

## Testing Checklist

### Test Case 1: Successful STK Push
- [ ] Backend returns 200 status
- [ ] Response has `success: true`
- [ ] Response has `transaction_id`
- [ ] Only success toast appears
- [ ] Polling starts
- [ ] No error messages

### Test Case 2: Backend Error
- [ ] Backend returns 400/500 status
- [ ] Response has `success: false`
- [ ] Only error toast appears
- [ ] Manual payment option shows
- [ ] No success message

### Test Case 3: Network Error
- [ ] Network request fails
- [ ] Error toast appears
- [ ] Manual payment option shows
- [ ] No success message

### Test Case 4: Missing Transaction ID
- [ ] Backend returns 200 status
- [ ] Response has `success: true`
- [ ] Response missing `transaction_id`
- [ ] Error toast appears
- [ ] Manual payment option shows

## Backend Requirements

For proper frontend integration, the backend should:

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "data": {
    "transaction_id": "TXN123456",
    "sale_id": 1,
    "status": "pending"
  }
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": {
    "phone_number": ["Invalid phone number format"]
  }
}
```

### Important Rules
1. **Always return 200 status for successful operations**
2. **Always include transaction_id when STK push is sent**
3. **Use consistent success flag (true/false)**
4. **Provide descriptive error messages**
5. **Don't return success:true with error status codes**

## Quick Fixes

### If You See Both Messages

1. **Check console logs** - See what the actual response is
2. **Check backend status code** - Should be 200 for success
3. **Check transaction_id** - Must be present in response
4. **Check success flag** - Must match the actual result

### If STK Push Works But Shows Error

This means:
- Backend sent STK push successfully
- But returned error status code (400/500)
- Or returned success:false

**Fix:** Update backend to return 200 with success:true

### If No Transaction ID

This means:
- Backend returned success
- But didn't include transaction_id

**Fix:** Update backend to always include transaction_id

## Console Commands for Testing

### Check if API is reachable
```javascript
fetch('http://localhost:8000/api/checkout/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* test data */ })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Check cart token
```javascript
console.log(localStorage.getItem('cart_token'));
```

### Clear cart and retry
```javascript
localStorage.removeItem('cart_token');
location.reload();
```

## Support

If issues persist:
1. Share console logs
2. Share network request/response
3. Share backend logs
4. Check Laravel logs: `tail -f storage/logs/laravel.log`
5. Check M-PESA logs if available
