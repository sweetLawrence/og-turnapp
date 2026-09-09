# Checkout API Integration Guide

## Overview

This guide shows how to integrate the Checkout API with your React frontend.

## Setup

### 1. API Service Created
✅ `src/services/checkoutApi.js` - Complete checkout API service

### 2. Environment Configuration
Update `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Usage in Components

### EventDetailsPage Integration

Update `src/pages/EventDetailsPage.jsx` to use the checkout API:

```jsx
import { checkoutApi } from '../services/checkoutApi';

const EventDetailsPage = () => {
  const [cart, setCart] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});

  // Initialize cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await checkoutApi.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Add ticket to cart
  const updateTicketQuantity = async (ticketId, change) => {
    const currentQty = selectedTickets[ticketId] || 0;
    const newQty = Math.max(0, currentQty + change);

    try {
      const response = await checkoutApi.addItem(ticketId, newQty);
      
      if (response.success) {
        setSelectedTickets(prev => ({
          ...prev,
          [ticketId]: newQty
        }));
        setCart(response.data);
        toast.success('Cart updated');
      }
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (!cart || cart.summary.quantity === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    navigate('/checkout', {
      state: {
        event,
        cart: cart.summary,
        cartToken: checkoutApi.getCartToken()
      }
    });
  };

  // Rest of component...
};
```

### CheckoutPage Integration

Update `src/pages/CheckoutPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkoutApi } from '../services/checkoutApi';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, cart, cartToken } = location.state || {};

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [ticketDetails, setTicketDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState(cart);

  // Initialize ticket details
  useEffect(() => {
    if (cart && cart.ticket_count > 0) {
      const details = Array(cart.ticket_count).fill(null).map((_, i) => ({
        name: i === 0 ? customerInfo.name : '',
        email: i === 0 ? customerInfo.email : ''
      }));
      setTicketDetails(details);
    }
  }, [cart]);

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const response = await checkoutApi.applyPromoCode(promoCode, event.id);
      
      if (response.success) {
        setAppliedPromo(response.data.promo_code);
        setCartSummary(response.data.summary);
        toast.success(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid promo code');
    }
  };

  // Remove promo code
  const handleRemovePromo = async () => {
    try {
      const response = await checkoutApi.removePromoCode();
      
      if (response.success) {
        setAppliedPromo(null);
        setPromoCode('');
        setCartSummary(response.data.summary);
        toast.success('Promo code removed');
      }
    } catch (error) {
      toast.error('Failed to remove promo code');
    }
  };

  // Process payment
  const handlePayment = async () => {
    // Validate
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all customer details');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'mpesa' && !mpesaPhone) {
      toast.error('Please enter M-Pesa phone number');
      return;
    }

    setLoading(true);

    try {
      // Initialize checkout
      const initResponse = await checkoutApi.initializeCheckout(
        customerInfo,
        ticketDetails
      );

      if (!initResponse.success) {
        throw new Error('Checkout initialization failed');
      }

      // Process payment
      const paymentResponse = await checkoutApi.processPayment({
        eventId: event.id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        paymentMethod: paymentMethod,
        phoneNumber: paymentMethod === 'mpesa' ? mpesaPhone : customerInfo.phone,
        ticketDetails: ticketDetails,
        promoCodeId: appliedPromo?.id
      });

      if (paymentResponse.success) {
        if (paymentResponse.payment_required) {
          // Handle M-Pesa or Card payment
          if (paymentResponse.payment_method === 'mpesa') {
            toast.success(paymentResponse.message);
            // Start polling for payment status
            pollPaymentStatus(paymentResponse.transaction.transId);
          } else if (paymentResponse.payment_method === 'card') {
            // Redirect to card payment gateway
            toast.info(paymentResponse.message);
            // Handle DPO redirect
          }
        } else {
          // Free order completed
          toast.success(paymentResponse.message);
          checkoutApi.clearCart();
          navigate('/purchase-success', {
            state: { order: paymentResponse }
          });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (transactionId) => {
    const maxAttempts = 60; // 60 seconds
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        const response = await checkoutApi.verifyPayment(transactionId);

        if (response.is_successful) {
          clearInterval(poll);
          toast.success('Payment successful!');
          checkoutApi.clearCart();
          navigate('/purchase-success', {
            state: { transactionId }
          });
        } else if (response.is_failed) {
          clearInterval(poll);
          toast.error('Payment failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error polling payment:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(poll);
        toast.error('Payment verification timeout');
        setLoading(false);
      }
    }, 1000);
  };

  // Rest of component JSX...
};
```

## Key Integration Points

### 1. Cart Management

```jsx
// Add item to cart
const addToCart = async (ticketId, quantity) => {
  const response = await checkoutApi.addItem(ticketId, quantity);
  if (response.success) {
    // Update UI with response.data.summary
  }
};

// Get cart
const getCart = async () => {
  const response = await checkoutApi.getCart();
  if (response.success) {
    // Use response.data.summary
  }
};

// Remove item
const removeItem = async (ticketId) => {
  const response = await checkoutApi.removeItem(ticketId);
  if (response.success) {
    // Update UI
  }
};
```

### 2. Promo Codes

```jsx
// Apply promo code
const applyPromo = async (code, eventId) => {
  try {
    const response = await checkoutApi.applyPromoCode(code, eventId);
    if (response.success) {
      setPromoCode(response.data.promo_code);
      setCartSummary(response.data.summary);
      toast.success(response.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

// Remove promo code
const removePromo = async () => {
  const response = await checkoutApi.removePromoCode();
  if (response.success) {
    setPromoCode(null);
    setCartSummary(response.data.summary);
  }
};
```

### 3. Checkout Process

```jsx
// Initialize checkout
const initCheckout = async () => {
  const response = await checkoutApi.initializeCheckout(
    {
      name: customerName,
      email: customerEmail,
      phone: customerPhone
    },
    ticketDetails
  );
  
  return response.data;
};

// Process payment
const processPayment = async () => {
  const response = await checkoutApi.processPayment({
    eventId: event.id,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    paymentMethod: 'mpesa', // or 'card' or 'free'
    phoneNumber: mpesaPhone,
    ticketDetails: ticketDetails,
    promoCodeId: promoCodeId
  });

  return response;
};
```

### 4. Payment Verification

```jsx
// Poll for payment status
const pollPayment = async (transactionId) => {
  const interval = setInterval(async () => {
    const response = await checkoutApi.verifyPayment(transactionId);
    
    if (response.is_successful) {
      clearInterval(interval);
      // Payment successful
      handleSuccess();
    } else if (response.is_failed) {
      clearInterval(interval);
      // Payment failed
      handleFailure();
    }
  }, 1000);
};
```

## Cart Summary Structure

```javascript
{
  items: [
    {
      id: 1,
      item_id: 1,
      name: "VIP Ticket",
      quantity: 2,
      price: 2500,
      subtotal: 5000,
      original_subtotal: 6000,
      discount: 1000,
      promo_code: {...}
    }
  ],
  total: 5000,
  original_total: 6000,
  total_discount: 1000,
  quantity: 2,
  ticket_count: 2,
  is_free: false
}
```

## Error Handling

```jsx
try {
  const response = await checkoutApi.addItem(ticketId, quantity);
  if (response.success) {
    // Handle success
  }
} catch (error) {
  if (error.response) {
    // API error
    toast.error(error.response.data.message);
  } else {
    // Network error
    toast.error('Network error. Please try again.');
  }
}
```

## State Management

Consider using React Context for cart state:

```jsx
// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { checkoutApi } from '../services/checkoutApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await checkoutApi.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addItem = async (ticketId, quantity) => {
    setLoading(true);
    try {
      const response = await checkoutApi.addItem(ticketId, quantity);
      if (response.success) {
        setCart(response.data);
        return response;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    addItem,
    loadCart,
    // ... other methods
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
```

## Testing

```jsx
// Test cart operations
import { checkoutApi } from './services/checkoutApi';

// Create cart
const cart = await checkoutApi.createCart();
console.log('Cart created:', cart);

// Add item
const addResult = await checkoutApi.addItem(1, 2);
console.log('Item added:', addResult);

// Get cart
const cartData = await checkoutApi.getCart();
console.log('Cart data:', cartData);

// Apply promo
const promoResult = await checkoutApi.applyPromoCode('SUMMER2024', 1);
console.log('Promo applied:', promoResult);
```

## Next Steps

1. ✅ API service created
2. ⏳ Update EventDetailsPage
3. ⏳ Update CheckoutPage
4. ⏳ Create CartContext (optional)
5. ⏳ Add payment polling
6. ⏳ Create success page
7. ⏳ Add error handling
8. ⏳ Test complete flow

## Files Created

- ✅ `src/services/checkoutApi.js` - Complete API service
- ✅ `CHECKOUT_INTEGRATION_GUIDE.md` - This guide

## Support

For issues or questions:
- Check `turnapp/CHECKOUT_API_DOCUMENTATION.md` for API reference
- Check browser console for errors
- Verify API is running: `http://localhost:8000/api/checkout/cart/test`
