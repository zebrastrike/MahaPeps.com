const http = require('http');
require('dotenv').config();

// Use environment variables for credentials
// Set these in your .env file:
// ADMIN_EMAIL=your-admin@example.com
// ADMIN_PASSWORD=your-secure-password
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

async function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('===========================================');
  console.log('  MAHA Peptides Full E2E Test Suite');
  console.log('===========================================\n');

  let adminToken, clientToken, testEmail, orderId;
  testEmail = `testclient_${Date.now()}@test.com`;

  // ============ ADMIN TESTS ============
  console.log('--- ADMIN FLOW ---\n');

  // Admin Login
  console.log('1. Admin Login...');
  const adminLoginBody = JSON.stringify({email: ADMIN_EMAIL, password: ADMIN_PASSWORD});
  const adminLogin = await makeRequest({hostname:'localhost',port:3001,path:'/auth/login',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(adminLoginBody)}}, adminLoginBody);
  adminToken = adminLogin.data?.accessToken;
  console.log('   ' + ((adminLogin.status === 200 || adminLogin.status === 201) && adminToken ? '✓ PASS' : '✗ FAIL - ' + adminLogin.status));

  // ============ CLIENT REGISTRATION ============
  console.log('\n--- CLIENT FLOW ---\n');

  // Register new client
  console.log('2. Register Test Client...');
  const registerBody = JSON.stringify({email: testEmail, password: 'TestPass123!'});
  const register = await makeRequest({hostname:'localhost',port:3001,path:'/auth/register',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(registerBody)}}, registerBody);
  console.log('   ' + (register.status === 201 || register.status === 200 ? '✓ PASS - ' + testEmail : '✗ FAIL - ' + register.status));

  // Client Login
  console.log('3. Client Login...');
  const clientLoginBody = JSON.stringify({email: testEmail, password: 'TestPass123!'});
  const clientLogin = await makeRequest({hostname:'localhost',port:3001,path:'/auth/login',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(clientLoginBody)}}, clientLoginBody);
  clientToken = clientLogin.data?.accessToken;
  console.log('   ' + ((clientLogin.status === 200 || clientLogin.status === 201) && clientToken ? '✓ PASS' : '✗ FAIL - ' + clientLogin.status));

  // Verify client auth
  console.log('3b. Verify Client Auth...');
  const clientMe = await makeRequest({hostname:'localhost',port:3001,path:'/auth/me',method:'GET',headers:{'Authorization':'Bearer '+clientToken}});
  console.log('   ' + (clientMe.status === 200 ? '✓ PASS - Role: ' + clientMe.data?.role : '✗ FAIL'));

  // ============ PRODUCT CATALOG ============
  console.log('\n--- PRODUCT BROWSING ---\n');

  // Browse products
  console.log('4. Browse Product Catalog...');
  const products = await makeRequest({hostname:'localhost',port:3001,path:'/catalog/products',method:'GET'});
  console.log('   ' + (products.status === 200 ? '✓ PASS - ' + products.data?.length + ' products' : '✗ FAIL'));

  // View product details
  console.log('5. View Product Details (Semaglutide)...');
  const productDetail = await makeRequest({hostname:'localhost',port:3001,path:'/catalog/products/semaglutide',method:'GET'});
  const price = productDetail.data?.variants?.[0]?.priceCents;
  console.log('   ' + (productDetail.status === 200 ? '✓ PASS - $' + (price/100).toFixed(2) : '✗ FAIL'));

  // ============ CART OPERATIONS ============
  console.log('\n--- CART OPERATIONS ---\n');

  // Add to cart
  console.log('6. Add Item to Cart...');
  const addToCartBody = JSON.stringify({productId: productDetail.data?.id, quantity: 1});
  const addToCart = await makeRequest({hostname:'localhost',port:3001,path:'/cart/add',method:'POST',headers:{'Authorization':'Bearer '+clientToken,'Content-Type':'application/json','Content-Length':Buffer.byteLength(addToCartBody)}}, addToCartBody);
  console.log('   ' + (addToCart.status === 201 || addToCart.status === 200 ? '✓ PASS' : '✗ FAIL'));

  // View cart
  console.log('7. View Cart...');
  const cart = await makeRequest({hostname:'localhost',port:3001,path:'/cart',method:'GET',headers:{'Authorization':'Bearer '+clientToken}});
  console.log('   ' + (cart.status === 200 ? '✓ PASS - ' + cart.data?.items?.length + ' items, $' + (cart.data?.subtotal || 0).toFixed(2) : '✗ FAIL'));

  // ============ CHECKOUT ============
  console.log('\n--- CHECKOUT FLOW ---\n');

  // Checkout with compliance
  console.log('8. Create Order (with compliance)...');
  const orderBody = JSON.stringify({
    shippingAddress: {line1:'123 Test St',city:'TestCity',state:'CA',postalCode:'90210',country:'US'},
    billingAddress: {line1:'123 Test St',city:'TestCity',state:'CA',postalCode:'90210',country:'US'},
    shippingTier: 'express',
    shippingCost: 45,
    orderInsurance: true,
    processingType: 'EXPEDITED',
    compliance: {
      researchPurposeOnly: true,
      responsibilityAccepted: true,
      noMedicalAdvice: true,
      ageConfirmation: true,
      termsAccepted: true
    }
  });
  const order = await makeRequest({hostname:'localhost',port:3001,path:'/checkout',method:'POST',headers:{'Authorization':'Bearer '+clientToken,'Content-Type':'application/json','Content-Length':Buffer.byteLength(orderBody)}}, orderBody);
  orderId = order.data?.order?.id || order.data?.id;
  const orderTotal = order.data?.order?.total || order.data?.total || 0;
  console.log('   ' + (order.status === 201 && orderId ? '✓ PASS - Order: ' + orderId.substring(0,8) + '... Total: $' + orderTotal.toFixed(2) : '✗ FAIL - ' + order.status + ' ' + JSON.stringify(order.data).substring(0,150)));

  // ============ ORDER VERIFICATION ============
  console.log('\n--- ORDER VERIFICATION ---\n');

  // Client view orders
  console.log('9. Client View Orders...');
  const clientOrders = await makeRequest({hostname:'localhost',port:3001,path:'/orders',method:'GET',headers:{'Authorization':'Bearer '+clientToken}});
  console.log('   ' + (clientOrders.status === 200 ? '✓ PASS - ' + clientOrders.data?.length + ' orders' : '✗ FAIL'));

  // Admin view all orders
  console.log('10. Admin View All Orders...');
  const adminOrders = await makeRequest({hostname:'localhost',port:3001,path:'/admin/orders',method:'GET',headers:{'Authorization':'Bearer '+adminToken}});
  console.log('   ' + (adminOrders.status === 200 ? '✓ PASS - ' + (adminOrders.data?.orders?.length || 0) + ' orders' : '✗ FAIL'));

  // Admin View Specific Order
  if (orderId) {
    console.log('11. Admin View Order Details...');
    const orderDetail = await makeRequest({hostname:'localhost',port:3001,path:'/admin/orders/' + orderId,method:'GET',headers:{'Authorization':'Bearer '+adminToken}});
    console.log('   ' + (orderDetail.status === 200 ? '✓ PASS - Status: ' + orderDetail.data?.status : '✗ FAIL - ' + orderDetail.status + ' ' + JSON.stringify(orderDetail.data).substring(0,100)));

    // Mark order as paid
    console.log('12. Admin Mark Order Paid...');
    const markPaidBody = JSON.stringify({});
    const markPaid = await makeRequest({hostname:'localhost',port:3001,path:'/admin/payments/orders/' + orderId + '/mark-paid',method:'POST',headers:{'Authorization':'Bearer '+adminToken,'Content-Type':'application/json','Content-Length':Buffer.byteLength(markPaidBody)}}, markPaidBody);
    console.log('   ' + (markPaid.status === 200 || markPaid.status === 201 ? '✓ PASS - New Status: ' + markPaid.data?.status : '✗ FAIL - ' + markPaid.status));
  }

  // ============ ADDITIONAL ENDPOINTS ============
  console.log('\n--- ADDITIONAL ENDPOINTS ---\n');

  // FAQ
  console.log('13. FAQ Endpoint...');
  const faq = await makeRequest({hostname:'localhost',port:3001,path:'/faq',method:'GET'});
  console.log('   ' + (faq.status === 200 ? '✓ PASS - ' + faq.data?.length + ' FAQs' : '✗ FAIL'));

  // Contact form
  console.log('14. Contact Form...');
  const contactBody = JSON.stringify({name:'Test User',email:'test@test.com',subject:'Test Subject',message:'Test message'});
  const contact = await makeRequest({hostname:'localhost',port:3001,path:'/contact',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(contactBody)}}, contactBody);
  console.log('   ' + (contact.status === 201 || contact.status === 200 ? '✓ PASS' : '✗ FAIL'));

  // Admin products (should be empty for retail catalog test)
  console.log('15. Admin Products List...');
  const adminProducts = await makeRequest({hostname:'localhost',port:3001,path:'/admin/products',method:'GET',headers:{'Authorization':'Bearer '+adminToken}});
  console.log('   ' + (adminProducts.status === 200 ? '✓ PASS - ' + (adminProducts.data?.products?.length || 0) + ' products' : '✗ FAIL'));

  console.log('\n===========================================');
  console.log('  E2E Test Suite Complete');
  console.log('===========================================\n');
  console.log('Test Client: ' + testEmail);
  console.log('Test Password: TestPass123!');
  console.log('Order ID: ' + (orderId || 'N/A'));
}

run().catch(console.error);
