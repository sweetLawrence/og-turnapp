# Checkout Integration - Quick Reference

## Quick Start

### 1. Add Tickets to Cart (EventDetailsPage)
```javascript
import { checkoutApi } from '../services/checkoutApi';

// Validate cart before checkout
const handleCheckout = async () => {
  const validation = await checkoutApi.validateCart();
  if (validation.success) {
    navigate('/checkout', { state: { event, selectedTickets, total } });
  }
};
```

### 2. Initialize Cart (CheckoutPage)
```javascript
useEffect(() => {
  if (event && selectedTickets) {
    initializeCart();
  }
}, []);

const initializeCart = async () => {
  for (const ticket of selectedTickets) {
    await checkoutApi.addItem(ticket.id, ticket.quantity);
  }
  const cartData = await checkoutApi.getCart();
  setCart(cartData.data);
};
```

### 3. Apply Promo Code
```javascript
const handleApplyPromoCode = async () => {
  const response = await checkoutApi.applyPromoCode(promoCode, event.id);
  if (response.success) {
    setAppliedPromo(response.data);
    toast.success(`Saved KES ${response.data.discount_amount}`);
  }
};
```

### 4. Process M-PESA Payment
```javascript
const handleMpesaSTKPush = async () => {
  const ticketDetails = selectedTickets.map(ticket => ({
    event_price_id: ticket.id,
    quantity: ticket.quantity,
    attendee_name: formData.fullName,
    attendee_email: formData.email,
    attendee_phone: formData.phone
  }));

  const paymentData = {
    eventId: event.id,
    customerName: formData.fullName,
    customerEmail: formData.email,
    customerPhone: formData.phone,
    paymentMethod: 'mpesa',
    phoneNumber: mpesaPhone,
    ticketDetails: ticketDetails,
    promoCodeId: appliedPromo?.id
  };

  const response = await checkoutApi.processPayment(paymentData);
  if (response.success) {
    pollPaymentStatus(response.data.transaction_id);
  }
};
```

### 5. Verify Payment
```javascript
const pollPaymentStatus = async (transactionId, attempts = 0) => {
  if (attempts >= 30) {
    setShowManualPayment(true);
    return;
  }

  const response = await checkoutApi.verifyPayment(transactionId);
  
  if (response.data.status === 'completed') {
    setPaymentStatus('success');
    checkoutApi.clearCart();
  } else {
    setTimeout(() => pollPaymentStatus(transactionId, attempts + 1), 2000);
  }
};
```

## API Methods

### Cart Management
```javascript
// Create cart
await checkoutApi.createCart();

// Get cart
const cart = await checkoutApi.getCart();

// Add item
await checkoutApi.addItem(eventPriceId, quantity);

// Remove item
await checkoutApi.removeItem(eventPriceId);

// Validate cart
const validation = await checkoutApi.validateCart();
```

### Promo Codes
```javascript
// Apply promo code
const result = await checkoutApi.applyPromoCode(code, eventId);

// Remove promo code
await checkoutApi.removePromoCode();
```

### Payment & Orders
```javascript
// Initialize checkout
await checkoutApi.initializeCheckout(customerData, ticketDetails);

// Process payment
const payment = await checkoutApi.processPayment(paymentData);

// Verify payment
const status = await checkoutApi.verifyPayment(transactionId);

// Complete order
const order = await checkoutApi.completeOrder(orderData);

// Get order details
const orderInfo = await checkoutApi.getOrder(saleId);
```

### Utilities
```javascript
// Get cart token
const token = checkoutApi.getCartToken();

// Clear cart
checkoutApi.clearCart();
```

## Payment Data Structure

### Ticket Details
```javascript
const ticketDetails = [
  {
    event_price_id: 1,
    quantity: 2,
    attendee_name: "John Doe",
    attendee_email: "john@example.com",
    attendee_phone: "0712345678"
  }
];
```

### Payment Data
```javascript
const paymentData = {
  eventId: 1,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "0712345678",
  paymentMethod: "mpesa", // or "card"
  phoneNumber: "0712345678", // for M-PESA
  ticketDetails: ticketDetails,
  promoCodeId: 1 // optional
};
```

## Response Structures

### Success Response
```javascript
{
  success: true,
  message: "Operation successful",
  data: {
    // Response data
  }
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error message",
  errors: {
    // Validation errors
  }
}
```

### Cart Response
```javascript
{
  success: true,
  data: {
    cart_token: "cart-123456",
    items: [
      {
        event_price_id: 1,
        quantity: 2,
        price: 1000,
        subtotal: 2000
      }
    ],
    total: 2000,
    promo_code: null
  }
}
```

### Payment Response
```javascript
{
  success: true,
  data: {
    transaction_id: "TXN123456",
    sale_id: 1,
    status: "pending", // or "completed", "failed"
    payment_url: "https://payment-gateway.com/pay" // for card payments
  }
}
```

## Common Patterns

### Loading States
```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await checkoutApi.someMethod();
  } finally {
    setLoading(false);
  }
};
```

### Error Handling
```javascript
try {
  const response = await checkoutApi.someMethod();
  if (response.success) {
    toast.success('Success!');
  } else {
    toast.error(response.message);
  }
} catch (error) {
  const errorMsg = error.response?.data?.message || 'Operation failed';
  toast.error(errorMsg);
}
```

### Form Validation
```javascript
const validateForm = () => {
  if (!formData.fullName || !formData.email || !formData.phone) {
    toast.error('Please fill in all fields');
    return false;
  }
  if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
    toast.error('Invalid phone number');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    toast.error('Invalid email');
    return false;
  }
  return true;
};
```

## Environment Setup

### .env File
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### API Base URL
The checkout API automatically uses:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

## Testing Tips

### Test M-PESA STK Push
1. Use a real Safaricom number
2. Ensure backend has valid M-PESA credentials
3. Check phone for STK push prompt
4. Monitor polling in browser console

### Test Manual Payment
1. Use paybill details from UI
2. Complete payment on phone
3. Enter confirmation code
4. Verify payment processes correctly

### Test Promo Codes
1. Create test promo codes in backend
2. Test percentage discounts
3. Test fixed amount discounts
4. Test expired/invalid codes

### Test Cart Validation
1. Add tickets to cart
2. Modify ticket availability in backend
3. Validate cart should catch issues
4. Display appropriate error messages

## Troubleshooting

### Cart Token Issues
```javascript
// Clear cart token if issues occur
localStorage.removeItem('cart_token');
```

### Payment Polling Timeout
- Default: 30 attempts × 2 seconds = 1 minute
- Adjust in `pollPaymentStatus` function
- Show manual payment option on timeout

### CORS Issues
- Ensure backend allows frontend origin
- Check Laravel CORS configuration
- Verify API_BASE_URL is correct

### State Management
- Use React DevTools to inspect state
- Check console for API responses
- Verify data flow through components
