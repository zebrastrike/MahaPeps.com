# E2E Test Suite

## Setup

1. **Copy the example file:**
   ```bash
   cp e2e-test.example.js e2e-test.js
   ```

2. **Ensure your `.env` file has the admin credentials:**
   ```env
   ADMIN_EMAIL=your-admin@mahapeps.com
   ADMIN_PASSWORD=your-secure-password
   ```

3. **Make sure both servers are running:**
   - API: `npm run start:dev` (port 3001)
   - Web: `npm run dev` (port 3002)

## Running Tests

```bash
node e2e-test.js
```

## What Gets Tested

### Authentication
- ✓ Admin login
- ✓ Client registration
- ✓ Client login
- ✓ Auth verification

### Product Catalog
- ✓ Browse products
- ✓ View product details
- ✓ Pricing information

### Shopping Cart
- ✓ Add items to cart
- ✓ View cart contents

### Checkout Flow
- ✓ Create order with compliance acknowledgments
- ✓ Shipping tier selection
- ✓ Processing type selection
- ✓ Order insurance

### Order Management
- ✓ Client view orders
- ✓ Admin view all orders
- ✓ Admin view order details
- ✓ Admin mark order as paid

### Additional Features
- ✓ FAQ endpoint
- ✓ Contact form submission
- ✓ Admin product list

## Security Notes

⚠️ **IMPORTANT:**
- `e2e-test.js` is gitignored and should NOT be committed
- Always use environment variables for credentials
- Never commit real passwords or API keys to the repository
- Use `e2e-test.example.js` as a template for new developers

## Expected Results

All 15 tests should pass:
```
✓ PASS - Admin Login
✓ PASS - Register Test Client
✓ PASS - Client Login
✓ PASS - Client Auth
✓ PASS - Browse Product Catalog (28 products)
✓ PASS - View Product Details
✓ PASS - Add Item to Cart
✓ PASS - View Cart
✓ PASS - Create Order
✓ PASS - Client View Orders
✓ PASS - Admin View All Orders
✓ PASS - Admin View Order Details
✓ PASS - Admin Mark Order Paid
✓ PASS - FAQ Endpoint
✓ PASS - Contact Form
✓ PASS - Admin Products List
```

## Troubleshooting

**Admin login fails:**
- Check `.env` has correct `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Verify admin account exists in database

**Connection refused:**
- Ensure API server is running on port 3001
- Ensure Web server is running on port 3002

**Product not found:**
- Run database seeds: `npm run seed:retail`
- Verify products exist: Check `/catalog/products` endpoint
