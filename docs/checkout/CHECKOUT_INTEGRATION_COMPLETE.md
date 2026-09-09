# Checkout API Integration - Complete

## Overview
The React frontend has been fully integrated with the Laravel checkout API endpoints. This document outlines the complete integration including cart management, promo codes, payment processing, and order completion.

## Integration Summary

### 1. API Service Layer (`src/services/checkoutApi.js`)
Complete checkout API service with all endpoints:

**Cart Management:**
- `createCart()` - Initialize a new cart
- `getCart()` - Retrieve current cart
- `addItem(eventPriceId, quantity)` - Add tickets to cart
- `removeItem(eventPriceId)` - Remove tickets from cart
- `validateCart()` - Validate cart before checkout

**Promo Codes:**
- `applyPromoCode(promoCode, eventId)` - Apply discount code
- `removePromoCode()` - Remove applied promo code

**Checkout & Payment:**
- `initializeCheckout(customerData, ticketDetails)` - Initialize checkout session
- `processPayment(paymentData)` - Process M-PESA or card payment
- `verifyPayment(transactionId)` - Verify payment status
- `completeOrder(orderData)` - Complete order after payment

**Utilities:**
- `getCartToken()` - Get/generate cart token from localStorage
- `clearCart()` - Clear cart after successful purchase

### 2. Event Details Page Integration

**File:** `src/pages/EventDetailsPage.jsx`

**Features:**
- Ticket selection with quantity controls
- Real-time cart validation before checkout
- Integration with checkout API for cart management
- Proper error handling and user feedback

**Key Functions:**
```javascript
// Validate cart before proceeding to checkout
const handleCheckout = async () => {
  const validation = await checkoutApi.validateCart();
  if (validation.success) {
    navigate('/checkout', { state: { event, selectedTickets, total } });
  }
};
```

### 3. Checkout Page Integration

**File:** `src/pages/CheckoutPage.jsx`

**Complete Features:**

#### Cart Initialization
- Automatically adds selected tickets to cart on page load
- Retrieves cart details from API
- Maintains cart state throughout checkout process

#### Promo Code Management
- Apply promo codes with real-time validation
- Display discount amount and type (percentage/fixed)
- Remove promo codes
- Automatic price recalculation

#### Payment Methods

**M-PESA STK Push:**
- Send STK push to customer's phone
- Poll payment status every 2 seconds (max 30 attempts = 1 minute)
- Automatic verification on successful payment
- Fallback to manual payment on timeout

**M-PESA Manual Payment (C2B):**
- Display paybill instructions
- Accept M-PESA confirmation code
- Verify payment with backend
- Complete order on successful verification

**Card Payment (DPO):**
- Process card payments through DPO gateway
- Redirect to payment gateway when required
- Handle payment callbacks

#### Order Completion
- Display order confirmation with details
- Show transaction ID and order number
- Clear cart after successful payment
- Provide ticket download options

## API Integration Flow

### 1. Add to Cart Flow
```
EventDetailsPage
  ↓ User selects tickets
  ↓ Click "Proceed to Checkout"
  ↓ validateCart()
  ↓ Navigate to CheckoutPage
CheckoutPage
  ↓ useEffect on mount
  ↓ addItem() for each ticket
  ↓ getCart() to retrieve cart details
```

### 2. Promo Code Flow
```
CheckoutPage
  ↓ User enters promo code
  ↓ applyPromoCode(code, eventId)
  ↓ Backend validates and calculates discount
  ↓ Update UI with discount amount
  ↓ Recalculate total
```

### 3. M-PESA STK Push Flow
```
CheckoutPage
  ↓ User enters phone number
  ↓ processPayment(paymentData)
  ↓ Backend sends STK push
  ↓ Start polling: verifyPayment(transactionId)
  ↓ Poll every 2 seconds (max 30 attempts)
  ↓ On success: Display order confirmation
  ↓ On timeout: Show manual payment option
```

### 4. Manual Payment Flow
```
CheckoutPage
  ↓ Display paybill instructions
  ↓ User completes payment on phone
  ↓ User enters confirmation code
  ↓ processPayment(paymentData)
  ↓ Backend verifies transaction
  ↓ Display order confirmation
```

### 5. Card Payment Flow
```
CheckoutPage
  ↓ User enters card details
  ↓ processPayment(paymentData)
  ↓ Backend creates DPO payment
  ↓ Redirect to payment gateway
  ↓ User completes payment
  ↓ Callback to backend
  ↓ Redirect to success page
```

## State Management

### CheckoutPage State
```javascript
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  phone: ''
});
const [paymentMethod, setPaymentMethod] = useState('mpesa-stk');
const [mpesaPhone, setMpesaPhone] = useState('');
const [confirmationCode, setConfirmationCode] = useState('');
const [paymentStatus, setPaymentStatus] = useState('idle');
const [showManualPayment, setShowManualPayment] = useState(false);
const [promoCode, setPromoCode] = useState('');
const [appliedPromo, setAppliedPromo] = useState(null);
const [applyingPromo, setApplyingPromo] = useState(false);
const [orderDetails, setOrderDetails] = useState(null);
const [cart, setCart] = useState(null);
```

## Error Handling

### API Error Handling
All API calls include comprehensive error handling:
```javascript
try {
  const response = await checkoutApi.processPayment(paymentData);
  if (response.success) {
    // Handle success
  } else {
    toast.error(response.message);
  }
} catch (error) {
  const errorMsg = error.response?.data?.message || 'Operation failed';
  toast.error(errorMsg);
}
```

### User Feedback
- Loading states with spinners
- Success/error toast notifications
- Inline validation messages
- Payment status indicators

## Cart Token Management

### localStorage Implementation
```javascript
const getCartToken = () => {
  let token = localStorage.getItem('cart_token');
  if (!token) {
    token = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_token', token);
  }
  return token;
};
```

### Token Lifecycle
1. Generated on first cart operation
2. Persisted in localStorage
3. Sent with all cart/checkout requests
4. Cleared after successful order completion

## Payment Verification

### Polling Implementation
```javascript
const pollPaymentStatus = async (transactionId, attempts = 0) => {
  const maxAttempts = 30; // 30 attempts = 1 minute
  
  if (attempts >= maxAttempts) {
    // Show manual payment option
    setShowManualPayment(true);
    return;
  }

  const response = await checkoutApi.verifyPayment(transactionId);
  
  if (response.data.status === 'completed') {
    // Payment successful
    setPaymentStatus('success');
  } else {
    // Continue polling
    setTimeout(() => pollPaymentStatus(transactionId, attempts + 1), 2000);
  }
};
```

## UI Components Used

### shadcn/ui Components
- `Button` - All action buttons
- `Input` - Form inputs
- `Label` - Form labels
- `RadioGroup` - Payment method selection
- `Badge` - Status indicators
- `Card` - Container components

### Custom Components
- `Navbar` - Site navigation
- `Footer` - Site footer
- `EventImagePlaceholder` - Fallback images

### Icons (lucide-react)
- `Ticket`, `CreditCard`, `Smartphone` - Payment methods
- `CheckCircle2` - Success indicator
- `Loader2` - Loading spinner
- `Tag` - Promo code indicator
- `QrCode` - Ticket QR code
- `Download`, `Mail`, `MessageSquare` - Action icons

## Testing Checklist

### Cart Management
- [ ] Add tickets to cart
- [ ] Update ticket quantities
- [ ] Remove tickets from cart
- [ ] Validate cart before checkout
- [ ] Cart persists across page refreshes

### Promo Codes
- [ ] Apply valid promo code
- [ ] Handle invalid promo code
- [ ] Display discount amount
- [ ] Remove promo code
- [ ] Recalculate total with discount

### M-PESA STK Push
- [ ] Send STK push to phone
- [ ] Poll payment status
- [ ] Handle successful payment
- [ ] Handle timeout (show manual option)
- [ ] Handle payment cancellation

### Manual Payment
- [ ] Display paybill instructions
- [ ] Accept confirmation code
- [ ] Verify payment
- [ ] Handle invalid confirmation code
- [ ] Complete order on success

### Card Payment
- [ ] Process card payment
- [ ] Redirect to DPO gateway
- [ ] Handle payment callback
- [ ] Display order confirmation

### Order Confirmation
- [ ] Display order details
- [ ] Show transaction ID
- [ ] Clear cart after purchase
- [ ] Provide ticket download
- [ ] Send confirmation email/SMS

## Environment Variables

Ensure these are set in `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Backend Requirements

The frontend expects these API endpoints to be available:

### Cart Endpoints
- `POST /api/checkout/cart` - Create cart
- `GET /api/checkout/cart/{token}` - Get cart
- `POST /api/checkout/cart/items` - Add item
- `DELETE /api/checkout/cart/items/{eventPriceId}` - Remove item
- `POST /api/checkout/cart/validate` - Validate cart

### Promo Code Endpoints
- `POST /api/checkout/promo-code/apply` - Apply promo code
- `DELETE /api/checkout/promo-code/{token}` - Remove promo code

### Payment Endpoints
- `POST /api/checkout/initialize` - Initialize checkout
- `POST /api/checkout/payment` - Process payment
- `GET /api/checkout/payment/verify/{transactionId}` - Verify payment
- `POST /api/checkout/complete` - Complete order
- `GET /api/checkout/order/{saleId}` - Get order details

## Next Steps

1. **Test Payment Integration**
   - Test M-PESA STK push with real credentials
   - Test manual payment verification
   - Test card payment with DPO sandbox

2. **Add Ticket Download**
   - Generate PDF tickets
   - Implement download functionality
   - Add QR code generation

3. **Email/SMS Notifications**
   - Send order confirmation emails
   - Send SMS with ticket details
   - Add reminder notifications

4. **Order History**
   - Create order history page
   - Allow users to view past orders
   - Implement ticket resend functionality

5. **Analytics**
   - Track checkout funnel
   - Monitor payment success rates
   - Analyze promo code usage

## Support

For issues or questions:
- Check API logs in Laravel
- Check browser console for frontend errors
- Verify environment variables are set correctly
- Ensure backend API is running and accessible
