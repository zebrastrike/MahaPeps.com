# Feature Implementation Prompts for Codex

## Table of Contents
1. [Product Catalog](#product-catalog)
2. [Order Management](#order-management)
3. [Payment Processing](#payment-processing)
4. [User Dashboards](#user-dashboards)
5. [Compliance & Audit](#compliance--audit)
6. [B2B Features](#b2b-features)
7. [Notifications](#notifications)
8. [Admin Portal](#admin-portal)

---

## Product Catalog

### Prompt 1: Implement Product Catalog API

```
Implement the complete product catalog API in apps/api/src/catalog/catalog.service.ts and catalog.controller.ts.

Requirements:
- GET /catalog/products - List all products with filtering (category, form, concentration)
- GET /catalog/products/:id - Get single product with batches and pricing
- POST /catalog/products - Create product (admin only)
- PATCH /catalog/products/:id - Update product (admin only)
- DELETE /catalog/products/:id - Soft delete product (admin only)

Product Filtering:
- Filter by category (RUO, CLINICAL_TRIAL, FDA_APPROVED)
- Filter by form (e.g., lyophilized powder, solution)
- Filter by concentration
- Search by name, SKU, description

Response should include:
- Product details from Product model
- Available batches with expiration dates
- Current inventory levels
- Pricing for current user's role (retail vs clinic vs distributor)

Use:
- Prisma for database queries
- Role guards (@Roles decorator)
- DTOs for input validation
- Pagination (page, limit query params)

Add audit logging for all create/update/delete operations.
Reference GUARDRAILS.md for product description requirements.
```

### Prompt 2: Implement Batch Management API

```
Implement batch tracking API in apps/api/src/batches/batches.service.ts and batches.controller.ts.

Requirements:
- GET /batches - List batches with filtering (productId, expiring soon, low stock)
- GET /batches/:id - Get single batch with files (COA, images)
- POST /batches - Create batch (admin only)
- PATCH /batches/:id - Update batch (admin only)
- POST /batches/:id/files - Upload batch files (COA, images)
- GET /batches/:id/files/:fileId/download - Download COA or description form

Batch Features:
- Calculate "expiring soon" (within 60 days)
- Track available quantity (initial minus allocated)
- Link to ProductBatch and BatchFile models
- Support file uploads with metadata

File Upload:
- Accept PDF for COA
- Accept images (PNG, JPG) for product photos
- Store file metadata in BatchFile table
- Generate signed URLs for downloads (S3 or local storage)

Validation:
- Expiration date must be after manufactured date
- Purity percentage between 0-100
- Batch code uniqueness per product

Add notifications when batch is low stock or expiring soon.
Audit log all batch creation and updates.
```

### Prompt 3: Build Product Catalog UI

```
Build the public product catalog in apps/web/app/(public)/catalog/page.tsx.

Requirements:
- Product grid with cards showing:
  - Product image
  - Product name
  - Form and concentration
  - Category badge (Research Use Only / FDA Approved)
  - Price (if logged in)
  - "View Details" button
- Filters sidebar:
  - Category checkboxes
  - Form dropdown
  - Concentration range slider
  - Search input
- Sorting options (name, price, newest)
- Pagination controls

Product Card Component (components/ProductCard.tsx):
- Display product image or placeholder
- Show category badge with color coding
- Price visible only to authenticated users
- "Add to Cart" button (if in stock)
- Compliance disclaimer: "For research use only" or FDA disclaimer based on category

Product Detail Page (app/(public)/catalog/[productId]/page.tsx):
- Full product description
- Available batches dropdown
- Purity percentage display
- Expiration date
- Storage instructions
- COA download button (if available)
- Add to cart with quantity selector
- Compliance disclaimer

Use:
- Fetch products from GET /catalog/products
- Tailwind CSS for styling
- Radix UI for accessible dropdowns and sliders
- DisclaimerBar component at bottom
- Loading and error states

Reference GUARDRAILS.md for required disclaimers on product pages.
```

---

## Order Management

### Prompt 4: Implement Order Creation and Management API

```
Implement complete order management in apps/api/src/orders/orders.service.ts and orders.controller.ts.

Requirements:
- POST /orders - Create new order (cart checkout)
- GET /orders - List user's orders with filtering (status, date range)
- GET /orders/:id - Get single order with items and payment status
- PATCH /orders/:id/status - Update order status (admin only)
- POST /orders/:id/cancel - Cancel order (user or admin)
- POST /orders/:id/items - Add item to order (draft only)
- DELETE /orders/:id/items/:itemId - Remove item from order (draft only)

Order Creation Flow:
1. Create order with status DRAFT
2. Add order items from cart
3. Calculate total (sum of item prices)
4. Validate inventory availability
5. Set order status to PENDING_PAYMENT
6. Return order with payment intent

Order Status Transitions:
- DRAFT → PENDING_PAYMENT (on checkout)
- PENDING_PAYMENT → PAID (on payment success)
- PAID → FULFILLING (when processing starts)
- FULFILLING → SHIPPED (when shipped)
- SHIPPED → COMPLETED (on delivery)
- Any status → CANCELED (on cancellation)

Validation:
- Inventory check before order creation
- Account type determines pricing (retail vs clinic vs distributor)
- Minimum order value for wholesale ($500 for clinics)
- Age verification for retail orders (21+)

Inventory Allocation:
- Reduce inventory.available when order is PAID
- Release inventory when order is CANCELED
- Prevent overselling with transaction locks

Add audit logging for status changes.
Send email notifications on status updates.
```

### Prompt 5: Build Shopping Cart and Checkout UI

```
Build shopping cart and checkout flow in apps/web.

Requirements:

Shopping Cart Page (app/(public)/cart/page.tsx):
- List cart items with:
  - Product name and image
  - Batch information
  - Quantity selector
  - Unit price and line total
  - Remove button
- Cart summary:
  - Subtotal
  - Tax (calculate based on shipping address)
  - Shipping cost
  - Total
- "Proceed to Checkout" button
- Empty cart state
- Compliance disclaimer

Checkout Page (app/(public)/checkout/page.tsx):
- Step 1: Shipping Information
  - Full name, address, phone
  - Address validation
  - Save address to user profile
- Step 2: Payment Method
  - Stripe Payment Element
  - Card tokenization (no raw card data)
  - Billing address (same as shipping checkbox)
- Step 3: Review Order
  - Order summary with all items
  - Shipping and billing addresses
  - Payment method (last 4 digits)
  - Compliance acknowledgment checkbox
  - Age verification checkbox (retail only)
  - Terms of service checkbox
- Place Order button

Order Confirmation Page (app/(public)/orders/[orderId]/success/page.tsx):
- Order number
- Order summary
- Estimated delivery date
- Tracking information (when available)
- "View Order Details" button
- Email confirmation notice

Cart State Management:
- Use React Context or localStorage
- Persist cart between sessions
- Sync cart with backend on login
- Clear cart after successful order

API Integration:
- POST /orders to create order
- POST /checkout/:orderId/pay to process payment
- GET /orders/:id to fetch order details

Use Stripe Elements for PCI compliance.
Add loading states during payment processing.
Show error messages for payment failures.
Reference GUARDRAILS.md for required checkboxes and disclaimers.
```

---

## Payment Processing

### Prompt 6: Implement Stripe Payment Integration

```
Implement Stripe payment processing in apps/api/src/payments/payments.service.ts.

Requirements:
- Initialize Stripe SDK with environment variables
- Create payment intent for orders
- Handle payment confirmation
- Process webhooks from Stripe
- Support refunds and disputes

Payment Methods:
- POST /checkout/:orderId/create-payment-intent
  - Create Stripe PaymentIntent
  - Amount from order total
  - Metadata: orderId, userId, accountType
  - Return client secret for frontend

- POST /checkout/:orderId/confirm-payment
  - Confirm payment intent
  - Update order status to PAID
  - Update payment record with transaction ID
  - Send order confirmation email
  - Allocate inventory
  - Create audit log

Webhook Handler (POST /webhooks/stripe):
- payment_intent.succeeded - Mark order as PAID
- payment_intent.payment_failed - Mark payment as FAILED
- charge.refunded - Create refund record
- charge.dispute.created - Flag order for review

Webhook Security:
- Verify Stripe signature
- Use raw body for verification
- Idempotent processing (check if already processed)
- Return 200 even for unhandled events

Refund Handling:
- POST /orders/:orderId/refund
  - Admin only
  - Create refund in Stripe
  - Update payment status to REFUNDED
  - Release inventory back to available
  - Send refund confirmation email

Error Handling:
- Card declined - Return user-friendly message
- Insufficient funds - Suggest alternative payment
- Network error - Retry logic
- Fraud detected - Flag for manual review

Use Stripe TypeScript SDK.
Store Stripe customer ID on User model for returning customers.
Reference ENGINEERING_PRINCIPLES.md for error handling patterns.
```

### Prompt 7: Integrate Stripe Elements in Checkout

```
Integrate Stripe Elements in the checkout page (apps/web/app/(public)/checkout/page.tsx).

Requirements:
- Install @stripe/stripe-js and @stripe/react-stripe-js
- Create Stripe Elements provider
- Use Payment Element for unified payment UI
- Handle payment confirmation
- Show payment errors
- Redirect to success page after payment

Implementation:
1. Load Stripe publishable key from environment
2. Create payment intent by calling POST /checkout/:orderId/create-payment-intent
3. Initialize Stripe Elements with client secret
4. Render Payment Element in checkout form
5. On submit:
   - Call stripe.confirmPayment()
   - Show loading spinner
   - Handle success: redirect to /orders/[orderId]/success
   - Handle error: display error message

Payment Element Configuration:
- appearance theme: "stripe" or custom theme
- layout: "tabs" for multiple payment methods
- fields: billingDetails required

Error Handling:
- Card declined: "Your card was declined. Please try another payment method."
- Insufficient funds: "Insufficient funds. Please try another card."
- Network error: "Payment processing error. Please try again."
- Generic error: "An unexpected error occurred. Please contact support."

Loading States:
- Disable form during payment processing
- Show spinner on submit button
- Prevent double submission

Security:
- Never store raw card data
- Use Stripe tokens only
- HTTPS enforced
- CSP headers for Stripe.js

Success Flow:
- Redirect to /orders/[orderId]/success on successful payment
- Display order confirmation
- Send confirmation email (backend handles this)

Reference Stripe docs for Payment Element setup.
Use TypeScript for Stripe types.
```

---

## User Dashboards

### Prompt 8: Build Client Dashboard

```
Build the client (retail customer) dashboard in apps/web/app/(client)/dashboard.

Requirements:

Dashboard Home (page.tsx):
- Welcome message with user's name
- Order summary widget:
  - Recent orders (last 5)
  - Order status badges
  - "View All Orders" link
- Account status widget:
  - Age verification status
  - Account type (RETAIL)
  - Member since date
- Quick actions:
  - Shop Catalog
  - Track Orders
  - View Protocols

Orders Page (orders/page.tsx):
- List all orders with filtering:
  - Status filter (All, Pending, Shipped, Completed, Canceled)
  - Date range picker
  - Search by order number
- Order cards showing:
  - Order number
  - Order date
  - Status badge
  - Total amount
  - Item count
  - "View Details" button
- Order detail modal:
  - All order items with images
  - Shipping address
  - Payment method
  - Tracking number (if shipped)
  - Estimated delivery
  - Invoice download button

Protocols Page (protocols/page.tsx):
- List of products user has purchased
- For each product:
  - Product name and image
  - Batch number
  - Storage instructions
  - COA download button
  - General information (not medical guidance per GUARDRAILS.md)

Messages Page (messages/page.tsx):
- Support ticket system
- Create new ticket
- View open and closed tickets
- Reply to tickets
- Attach files to tickets

Account Settings (settings/page.tsx):
- Personal information
- Shipping addresses (add/edit/delete)
- Payment methods (Stripe saved cards)
- Email preferences
- Password change
- Account deletion request

Layout:
- Use LayoutShell component
- Sidebar navigation
- DisclaimerBar at bottom
- Mobile responsive

API Integration:
- GET /orders for order list
- GET /orders/:id for order details
- GET /batches/:id/files/:fileId/download for COA
- GET /auth/me for user info

Use Radix UI for modals and dropdowns.
Implement loading skeletons.
Reference GUARDRAILS.md for protocol page disclaimers.
```

### Prompt 9: Build Clinic Dashboard

```
Build the clinic dashboard in apps/web/app/(clinic)/dashboard.

Requirements:

Dashboard Home (page.tsx):
- Clinic name and KYC verification status
- Key metrics:
  - Active patients count
  - Pending orders
  - Low inventory items
  - Staff members
- Quick actions:
  - Add Patient
  - Place Order
  - View Inventory
  - Manage Staff

Patients Page (patients/page.tsx):
- Patient list with search and filtering
- Add new patient button
- Patient cards showing:
  - Patient ID (anonymized)
  - Registration date
  - Order count
  - Last order date
  - Status (active/inactive)
- Patient detail view:
  - Order history
  - Protocols assigned
  - Notes (HIPAA compliant - encrypted)
  - Edit patient info

Staff Page (staff/page.tsx):
- Staff member list
- Add staff button (invite via email)
- Staff cards with:
  - Name and email
  - Role (Doctor, Nurse, Admin)
  - Permissions
  - Status (active/invited/inactive)
- Edit permissions modal
- Remove staff member (with confirmation)

Inventory Page (inventory/page.tsx):
- Inventory list with current stock levels
- Products with:
  - Product name and SKU
  - Batch number
  - Current quantity
  - Expiration date
  - Low stock badge (< 10 units)
  - Expiring soon badge (< 60 days)
- Reorder button (creates order for distributor)
- Inventory history log

Orders Page (orders/page.tsx):
- Order list with clinic-specific filters
- Bulk ordering interface
- Order templates for frequently ordered items
- Invoice download
- Track shipments
- PO number assignment

Settings Page (settings/page.tsx):
- Clinic information
- KYC document upload
- Distributor relationship
- Price list view (read-only)
- Billing information
- Tax exemption certificate upload

Compliance:
- All patient data encrypted at rest
- Audit log for patient data access
- HIPAA-compliant messaging
- Secure file storage

API Integration:
- Clinic-specific endpoints (future implementation)
- Role-based access (CLINIC role required)
- KYC status checks

Use Radix UI for data tables and modals.
Implement search with debouncing.
Add export to CSV for orders and inventory.
```

### Prompt 10: Build Distributor Dashboard

```
Build the distributor dashboard in apps/web/app/(distributor)/dashboard.

Requirements:

Dashboard Home (page.tsx):
- Distributor name and KYC status
- Key metrics:
  - Active clinic partners
  - Pending orders
  - Monthly revenue
  - Top selling products
- Quick actions:
  - Add Clinic Partner
  - Create Price List
  - View Orders
  - Generate Reports

Partners Page (partners/page.tsx):
- Clinic partner list
- Add partner button (send invite)
- Partner cards with:
  - Clinic name
  - Location
  - KYC status
  - Active since date
  - Monthly order volume
  - Assigned price list
  - Status (active/pending/suspended)
- Partner detail view:
  - Order history
  - Custom pricing
  - Credit limit
  - Payment terms
  - Contact information

Price Lists Page (pricing/page.tsx):
- Price list management
- Create new price list button
- Price list cards:
  - Price list name
  - Effective date
  - Assigned clinics count
  - Last updated
  - Edit button
- Price list editor:
  - Select products
  - Set unit prices
  - Set quantity discounts (tiers)
  - Set effective and expiration dates
  - Assign to clinics
- Clone price list functionality

Orders Page (orders/page.tsx):
- Order list with distributor view
- Filter by:
  - Clinic partner
  - Status
  - Date range
  - Product
- Bulk order fulfillment
- Generate packing slips
- Print shipping labels
- Mark orders as shipped with tracking

Billing Page (billing/page.tsx):
- Invoice list
- Generate invoices button
- Invoice status (draft, sent, paid, overdue)
- Payment tracking
- Apply payments to invoices
- Send invoice via email
- Export invoices to PDF
- Aging report (30/60/90 days)

Logistics Page (logistics/page.tsx):
- Shipment tracking dashboard
- Shipping carriers integration (FedEx, UPS, USPS)
- Batch shipping (multiple orders)
- Shipping address validation
- Track shipment status
- Delivery confirmation
- Returns management

Reports Page (reports/page.tsx):
- Sales report (by product, clinic, date range)
- Revenue report
- Inventory turnover
- Top selling products
- Clinic order frequency
- Export to CSV/Excel

Settings Page (settings/page.tsx):
- Distributor information
- KYC documents
- Tax ID
- Payment processing settings
- Shipping settings
- Notification preferences

API Integration:
- Distributor-specific endpoints
- Role guard (DISTRIBUTOR role required)
- Multi-clinic data queries

Use Radix UI for complex tables and forms.
Implement charts with recharts or similar.
Add CSV/Excel export functionality.
Reference ENGINEERING_PRINCIPLES.md for data handling patterns.
```

---

## Compliance & Audit

### Prompt 11: Implement Audit Logging System

```
Implement comprehensive audit logging in apps/api/src/audit/audit.service.ts.

Requirements:
- Log all admin actions to AuditLog table
- Log user authentication events
- Log order status changes
- Log payment events
- Log KYC approvals/rejections
- Provide audit log query API

Audit Log Service Methods:
- logAction(userId, orgId, action, metadata)
- logAuth(userId, action, ipAddress)
- logOrderChange(orderId, userId, fromStatus, toStatus)
- logPayment(paymentId, userId, action, amount)
- logKYC(userId, action, reason)

AuditLog Model Fields:
- userId - Who performed the action
- orgId - Organization context (if applicable)
- action - Action type (enum or string)
- metadata - JSON object with details
- ipAddress - Request IP
- userAgent - Browser/client info
- createdAt - Timestamp

Actions to Log:
- USER_LOGIN, USER_LOGOUT, USER_CREATED, USER_UPDATED, USER_DELETED
- ORDER_CREATED, ORDER_STATUS_CHANGED, ORDER_CANCELED
- PAYMENT_INITIATED, PAYMENT_COMPLETED, PAYMENT_FAILED, REFUND_PROCESSED
- PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED
- BATCH_CREATED, BATCH_UPDATED, BATCH_EXPIRED
- KYC_SUBMITTED, KYC_APPROVED, KYC_REJECTED
- PRICE_LIST_CREATED, PRICE_LIST_UPDATED
- ADMIN_ACCESS, SETTINGS_CHANGED

Audit Log API:
- GET /audit/logs - Query audit logs (admin only)
  - Filter by userId, orgId, action, date range
  - Pagination
  - Sorting
  - Search
- GET /audit/logs/:id - Get single audit entry
- GET /audit/logs/export - Export audit logs to CSV

Security:
- Only ADMIN role can access audit logs
- Audit logs are immutable (no updates or deletes)
- Sanitize sensitive data in metadata (no passwords, tokens)
- Retain audit logs for 7 years (compliance requirement)

Integration:
- Create AuditService as injectable
- Use interceptor to auto-log API requests
- Call audit service from other services

Use TypeScript enums for action types.
Add database indexes on userId, orgId, createdAt for performance.
```

### Prompt 12: Build Audit Log Dashboard

```
Build audit log viewer in apps/web/app/(admin)/audit/page.tsx.

Requirements:
- Admin-only access (role guard)
- Audit log table with columns:
  - Timestamp
  - User (name and email)
  - Organization
  - Action
  - Details (collapsible JSON)
  - IP Address
- Advanced filtering:
  - User selector (autocomplete)
  - Organization selector
  - Action type multi-select
  - Date range picker
  - IP address search
- Sorting by any column
- Pagination (50 entries per page)
- Export to CSV button

Audit Log Table Features:
- Expandable rows to show full metadata JSON
- Syntax highlighted JSON viewer
- User profile link from log entry
- Order link from order-related logs
- Product link from product-related logs
- Color-coded action types:
  - Auth actions: blue
  - Order actions: green
  - Payment actions: yellow
  - Admin actions: red
  - KYC actions: purple

Filters Panel:
- Date range: Quick select (Today, Last 7 days, Last 30 days, Custom)
- Action type: Checkboxes for each action category
- User: Autocomplete search
- Organization: Dropdown
- IP address: Text input
- Apply filters button
- Reset filters button

Export Functionality:
- Export current filtered results to CSV
- Include all columns
- Format JSON metadata as string
- Download with filename: audit-log-YYYY-MM-DD.csv

Real-time Updates (optional):
- WebSocket or polling for new audit entries
- Show notification badge for new entries
- Auto-refresh table every 30 seconds

API Integration:
- GET /audit/logs with query parameters
- GET /audit/logs/export

Use Radix UI for table and filters.
Implement virtual scrolling for large datasets.
Add loading skeletons during fetch.
Reference ENGINEERING_PRINCIPLES.md for table patterns.
```

### Prompt 13: Implement KYC Verification Workflow

```
Implement KYC (Know Your Customer) verification system for clinics and distributors.

Backend (apps/api/src/kyc/):
- POST /kyc/submit - Submit KYC documents
  - Upload government ID
  - Upload business license (clinics/distributors)
  - Upload medical license (clinics)
  - Upload tax documents
  - Metadata: business name, address, tax ID
- GET /kyc/status - Get KYC status for current user
- GET /admin/kyc/pending - List pending KYC submissions (admin)
- POST /admin/kyc/:id/approve - Approve KYC (admin)
- POST /admin/kyc/:id/reject - Reject KYC with reason (admin)

KYC Status Enum:
- NOT_SUBMITTED - User hasn't submitted
- PENDING - Under review
- APPROVED - Verified
- REJECTED - Failed verification
- EXPIRED - Needs renewal (annual)

Document Storage:
- Store files in S3 or local encrypted storage
- Generate unique document IDs
- Track upload timestamp
- Support multiple file uploads per submission
- Allowed formats: PDF, JPG, PNG
- Max file size: 10MB per document

Validation Rules:
- Government ID required for all
- Business license required for clinics and distributors
- Medical license required for clinics only
- All documents must be clear and readable
- Documents must not be expired

KYC Model:
- userId
- status (enum)
- submittedAt
- reviewedAt
- reviewedBy (adminId)
- rejectionReason
- documents (relation to KYCDocument model)
- expiresAt (1 year from approval)

Frontend (apps/web/app/(clinic|distributor)/kyc/):
- KYC submission form with file uploads
- Document preview before submission
- Status tracking page
- Renewal reminder (30 days before expiration)
- Rejection reason display with resubmit option

Admin KYC Review (apps/web/app/(admin)/kyc/):
- Pending submissions queue
- Document viewer
- Approve/Reject buttons with notes field
- Audit trail of all KYC actions

Notifications:
- Email on submission received
- Email on approval
- Email on rejection with reason
- Email reminder 30 days before expiration

Restrictions:
- Block wholesale features until KYC approved
- Show KYC status banner in dashboard
- Redirect to KYC page if not submitted

Add audit logging for all KYC actions.
Reference GUARDRAILS.md for KYC requirements.
```

---

## B2B Features

### Prompt 14: Implement Price List Management System

```
Implement price list management for distributor-clinic pricing.

Backend (apps/api/src/price-lists/):
- POST /price-lists - Create price list (distributor or admin)
- GET /price-lists - List price lists (filtered by distributor)
- GET /price-lists/:id - Get price list with all items
- PATCH /price-lists/:id - Update price list
- DELETE /price-lists/:id - Delete price list (if not assigned)
- POST /price-lists/:id/items - Add product to price list
- PATCH /price-lists/:id/items/:itemId - Update product price
- DELETE /price-lists/:id/items/:itemId - Remove product from price list
- POST /price-lists/:id/assign - Assign price list to clinics

Price List Model:
- name
- distributorId
- effectiveDate
- expirationDate
- currency (default USD)
- items (relation to PriceListItem)
- assignedClinics (relation to Clinic)
- createdAt, updatedAt

PriceListItem Model:
- priceListId
- productId
- unitPrice
- minQuantity (for tiered pricing)
- maxQuantity (for tiered pricing)

Tiered Pricing Support:
- Multiple PriceListItems for same product
- Different prices based on quantity ranges
- Example:
  - 1-10 units: $100 each
  - 11-50 units: $90 each
  - 51+ units: $80 each

Business Logic:
- Price lists can be cloned (copy all items)
- Only one active price list per clinic at a time
- Expiration date validation (must be after effective date)
- Historical price lists retained for order records
- Price changes don't affect existing orders

Pricing Resolution:
- Method: getPriceForClinic(clinicId, productId, quantity)
- Returns applicable price based on:
  1. Clinic's assigned price list
  2. Product in price list
  3. Quantity tier
  4. Effective date range
- Fallback to retail price if no clinic price list

API Permissions:
- Distributors can manage own price lists
- Admins can manage all price lists
- Clinics can view assigned price list (read-only)

Use transactions for price list updates.
Add audit logging for price changes.
Validate price list assignments to clinics belong to distributor.
```

### Prompt 15: Build Bulk Ordering Interface

```
Build bulk ordering interface for clinics and distributors.

Requirements:
- CSV upload for bulk orders
- Order template system
- Quick reorder from previous orders
- Multi-product order form

Bulk Order Page (apps/web/app/(clinic|distributor)/orders/bulk/page.tsx):
- Three order methods:
  1. CSV Upload
  2. Order Template
  3. Manual Multi-Product Form

CSV Upload:
- Upload CSV button
- CSV format: SKU, Quantity, Notes (per line)
- Download CSV template button
- Preview table after upload
- Validate SKUs and quantities
- Show errors for invalid rows
- Edit quantities before submitting
- Submit all button

CSV Template Format:
```csv
SKU,Quantity,Notes
PEP-001-10MG,5,Regular stock
PEP-002-20MG,10,Rush order
```

Order Templates:
- Save frequently ordered products as template
- Template card showing:
  - Template name
  - Product count
  - Last used date
  - Edit button
- "Use Template" button loads products into cart
- Quantities can be adjusted before checkout

Create Template:
- Select from previous orders or build manually
- Name the template
- Add/remove products
- Set default quantities
- Save template

Quick Reorder:
- "Reorder" button on past orders
- Loads same products and quantities into cart
- Update quantities if needed
- One-click reorder for repeat orders

Multi-Product Form:
- Add multiple products to single order
- Product search/autocomplete
- Quantity input per product
- Remove product button
- Shows subtotal per line
- Order summary sidebar with total
- Submit order button

Order Summary Panel:
- List selected products
- Quantities and line totals
- Subtotal
- Tax (if applicable)
- Shipping estimate
- Total
- Apply discount code
- Submit order button

Validation:
- Check inventory availability for all items
- Flag out-of-stock items
- Suggest alternatives if available
- Minimum order value warning ($500 for clinics)
- Maximum order quantity limits

API Integration:
- POST /orders/bulk with array of order items
- GET /orders/templates for saved templates
- POST /orders/templates to save new template
- GET /products/search for autocomplete

Use Radix UI for file upload and autocomplete.
Implement drag-and-drop for CSV upload.
Add loading states during validation.
```

---

## Notifications

### Prompt 16: Implement Email Notification System

```
Implement email notification system using Mailgun.

Backend (apps/api/src/notifications/):
- Email service with Mailgun integration
- Template system for emails
- Queue system for async sending
- Retry logic for failed sends

Email Service Methods:
- sendOrderConfirmation(orderId)
- sendOrderShipped(orderId, trackingNumber)
- sendPasswordReset(userId, resetToken)
- sendKYCApproval(userId)
- sendKYCRejection(userId, reason)
- sendBatchExpiring(batchId, clinicId)
- sendLowInventory(productId, clinicId)
- sendWelcome(userId)

Email Templates:
- Order Confirmation:
  - Order number
  - Order date
  - Items with images
  - Shipping address
  - Total amount
  - Track order link

- Order Shipped:
  - Tracking number with carrier link
  - Estimated delivery date
  - Shipping address
  - Track shipment button

- Password Reset:
  - Reset link (expires in 1 hour)
  - Security notice
  - Ignore if not requested message

- KYC Approval:
  - Congratulations message
  - Next steps
  - Access to wholesale features

- KYC Rejection:
  - Reason for rejection
  - What to fix
  - Resubmit button

- Batch Expiring:
  - Product name
  - Batch number
  - Expiration date
  - Days until expiration
  - Reorder link

Template Engine:
- Use Handlebars or EJS
- Store templates in templates/email/ directory
- Support HTML and plain text versions
- Dynamic data injection

Mailgun Integration:
- Configure API key and domain from environment
- Send via Mailgun API
- Track email status (delivered, opened, clicked)
- Handle bounces and complaints
- Unsubscribe link in all emails

Email Queue:
- Use Bull queue with Redis
- Queue emails for async processing
- Retry failed sends (3 attempts)
- Log all email sends to database
- Track delivery status

Email Preferences:
- User can opt-out of marketing emails
- Transactional emails always sent
- Preference center in account settings

Testing:
- Mock email service in tests
- Preview emails in development (Ethereal/Mailtrap)
- Send test emails to admin

Compliance:
- CAN-SPAM compliance
- Unsubscribe link in footer
- Physical address in footer
- Accurate subject lines
- Honor unsubscribe requests within 10 days

Use TypeScript for type safety.
Add logging for email tracking.
Reference GUARDRAILS.md for email content restrictions.
```

---

## Admin Portal

### Prompt 17: Build Admin User Management

```
Build admin user management in apps/web/app/(admin)/users/page.tsx.

Requirements:
- User list with search and filtering
- User detail view
- Edit user information
- Role management
- Account status controls
- Impersonation feature (for support)

User List Table:
- Columns:
  - Email
  - Name
  - Role badge
  - Account status
  - Created date
  - Last login
  - Actions (edit, disable, impersonate)
- Search by email or name
- Filter by role
- Filter by status (active, disabled, pending)
- Sort by any column
- Pagination

User Detail View:
- Personal information:
  - Name, email, phone
  - Role
  - Account status
  - Created date
  - Last login date and IP
- Organization:
  - Linked org (if clinic/distributor)
  - KYC status
- Order history:
  - Order count
  - Total spent
  - Last order date
  - View orders button
- Activity log:
  - Recent logins
  - Recent orders
  - Recent support tickets
- Actions:
  - Edit user button
  - Change role button
  - Reset password button
  - Disable account button
  - Delete account button (with confirmation)
  - Impersonate button

Edit User Modal:
- Update name, email, phone
- Change role dropdown
- Account status toggle
- Save changes button
- Validation for email format

Role Management:
- Change user role with confirmation
- Roles: CLIENT, CLINIC, DISTRIBUTOR, ADMIN
- Warning when changing from/to ADMIN
- Audit log entry on role change

Account Status Controls:
- Active - Normal access
- Disabled - Login blocked
- Suspended - Temporary block with reason
- Status change reason required
- Email notification on status change

Impersonation Feature:
- "Impersonate" button (admin only)
- Switch to user's account view
- Banner at top: "Viewing as [user email] - Exit"
- All actions logged as impersonation
- Exit impersonation button
- Original admin session preserved

Bulk Actions:
- Select multiple users (checkboxes)
- Bulk role change
- Bulk disable/enable
- Bulk export to CSV

Security:
- Only ADMIN role can access
- Audit log all user changes
- Confirm destructive actions (delete, role change)
- Require password confirmation for impersonation

API Integration:
- GET /admin/users - List users with filters
- GET /admin/users/:id - Get user details
- PATCH /admin/users/:id - Update user
- POST /admin/users/:id/impersonate - Start impersonation
- POST /admin/impersonate/exit - Exit impersonation
- DELETE /admin/users/:id - Delete user

Use Radix UI for modals and tables.
Implement role-based UI (show/hide admin actions).
Add confirmation dialogs for destructive actions.
```

### Prompt 18: Build Admin Settings Panel

```
Build admin settings panel in apps/web/app/(admin)/settings/page.tsx.

Requirements:
- System-wide configuration management
- Grouped settings by category
- Save and revert functionality
- Settings history/audit

Settings Categories:

1. General Settings:
- Site name
- Support email
- Support phone
- Business address (for email footer)
- Timezone
- Currency
- Maintenance mode toggle
- Maintenance message

2. Order Settings:
- Minimum order value (retail)
- Minimum order value (wholesale)
- Tax rate by state/region
- Shipping cost calculator settings
- Order auto-cancel after X days (unpaid)
- Allow backorders toggle

3. Compliance Settings:
- Age verification enabled (retail)
- KYC required for clinics toggle
- KYC required for distributors toggle
- Terms of service URL
- Privacy policy URL
- Research use disclaimer text
- FDA disclaimer text

4. Payment Settings:
- Stripe publishable key (masked)
- Stripe webhook secret (masked)
- Payment methods enabled (card, ACH, wire)
- Refund policy
- Chargeback threshold alert

5. Email Settings:
- Mailgun domain
- Mailgun API key (masked)
- From name
- From email
- Reply-to email
- Enable order confirmation emails
- Enable shipping notification emails
- Enable marketing emails

6. Inventory Settings:
- Low stock threshold
- Expiring soon threshold (days)
- Auto-restock enabled
- Send low stock alerts
- Alert email recipients

7. Security Settings:
- JWT token expiration (hours)
- Password minimum length
- Require password complexity
- Max login attempts before lockout
- Lockout duration (minutes)
- Session timeout (minutes)

Settings UI:
- Grouped by category (tabs or accordion)
- Form inputs with current values
- "Save Changes" button per category
- "Revert Changes" button
- Changes indicator (unsaved changes badge)
- Success message after save
- Error handling for invalid inputs

Advanced Features:
- Settings version history
- Rollback to previous version
- Settings export to JSON
- Settings import from JSON
- Change preview (show what changed)
- Audit log of all setting changes

API Integration:
- GET /admin/settings - Get all settings
- GET /admin/settings/:category - Get settings by category
- PATCH /admin/settings - Update settings
- GET /admin/settings/history - Get settings history
- POST /admin/settings/rollback/:versionId - Rollback to version

Security:
- Only ADMIN role can access
- Mask sensitive values (API keys, secrets)
- Require password confirmation for critical changes
- Audit log all setting changes
- Validate all inputs server-side

Validation:
- Email format validation
- URL format validation
- Numeric range validation
- Required field checks
- Test email sending button
- Test payment connection button

Use Radix UI for tabs and form components.
Implement auto-save draft functionality.
Add keyboard shortcuts (Cmd+S to save).
Reference ENGINEERING_PRINCIPLES.md for form patterns.
```

---

## Testing & Quality Assurance

### Prompt 19: Write API Integration Tests

```
Write comprehensive integration tests for the API.

Test Structure:
- Use Jest as test framework
- Test file per module: <module>.service.spec.ts
- Setup test database before tests
- Cleanup test data after tests
- Use factory patterns for test data

Test Categories:

1. Authentication Tests (auth.service.spec.ts):
- User registration with valid data
- Registration with duplicate email (should fail)
- Login with correct credentials
- Login with incorrect password (should fail)
- JWT token generation
- Token validation
- Token expiration
- Role-based access control

2. Product Catalog Tests (catalog.service.spec.ts):
- List products with no filters
- Filter products by category
- Search products by name
- Get product by ID
- Create product (admin only)
- Update product (admin only)
- Delete product (admin only)
- Get product with batches and pricing

3. Order Management Tests (orders.service.spec.ts):
- Create order from cart
- Add items to order
- Remove items from order
- Calculate order total correctly
- Check inventory availability
- Order status transitions
- Cancel order
- Cancel order after payment (should fail)
- Inventory allocation on payment
- Inventory release on cancellation

4. Payment Tests (payments.service.spec.ts):
- Create payment intent
- Process successful payment
- Handle payment failure
- Webhook signature validation
- Idempotent webhook processing
- Process refund
- Handle dispute

5. KYC Tests (kyc.service.spec.ts):
- Submit KYC documents
- Get KYC status
- Approve KYC (admin)
- Reject KYC with reason (admin)
- Block wholesale access without KYC
- KYC expiration after 1 year

Test Utilities:
- createTestUser(role) - Factory for test users
- createTestProduct() - Factory for test products
- createTestOrder(userId) - Factory for test orders
- authenticateAs(user) - Helper to get auth token
- cleanupTestData() - Remove all test data

Mock External Services:
- Mock Stripe API calls
- Mock Mailgun email sending
- Mock file upload service
- Use test API keys in CI/CD

Assertions:
- Use Jest expect() matchers
- Test status codes
- Test response structure
- Test error messages
- Test database state changes

Coverage Goals:
- 80%+ code coverage
- All critical paths tested
- All error cases tested
- Edge cases covered

Run tests with:
```bash
npm run test
npm run test:cov # with coverage report
```

Reference ENGINEERING_PRINCIPLES.md for testing standards.
```

---

## Deployment & DevOps

### Prompt 20: Configure Production Deployment

```
Configure production deployment with Docker, private server, and Cloudflare.

Requirements:
- Docker multi-stage builds for optimization
- Docker Compose for orchestration
- Nginx reverse proxy with SSL
- Cloudflare CDN integration
- Environment configuration
- Database backups
- Monitoring and logging

Docker Setup:

1. Backend Dockerfile (apps/api/Dockerfile):
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

2. Frontend Dockerfile (apps/web/Dockerfile):
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

3. Docker Compose (docker-compose.prod.yml):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: mahapeps
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  api:
    build: ./apps/api
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis
    restart: always

  web:
    build: ./apps/web
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
    depends_on:
      - api
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infra/nginx/ssl:/etc/nginx/ssl
      - web_static:/var/www/static
    depends_on:
      - api
      - web
    restart: always

volumes:
  postgres_data:
  web_static:
```

Nginx Configuration (infra/nginx/nginx.conf):
```nginx
upstream api {
    server api:3000;
}

upstream web {
    server web:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mahapeps.com www.mahapeps.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name mahapeps.com www.mahapeps.com;

    # SSL configured via Cloudflare (Full Strict mode)
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

    # API proxy
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://api/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend proxy
    location / {
        proxy_pass http://web/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets with caching
    location /_next/static/ {
        proxy_pass http://web/_next/static/;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

Cloudflare Configuration:
1. DNS Setup:
   - A record: mahapeps.com → [SERVER_IP]
   - A record: www.mahapeps.com → [SERVER_IP]
   - Proxy enabled (orange cloud)

2. SSL/TLS:
   - Mode: Full (Strict)
   - Always Use HTTPS: On
   - Minimum TLS Version: 1.2

3. Caching:
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
   - Cache Rules:
     - /_next/static/* → Cache Everything, Edge TTL 1 year
     - /api/* → Bypass cache
     - /images/* → Cache Everything, Edge TTL 30 days

4. Security:
   - Security Level: Medium
   - Challenge Passage: 30 minutes
   - Browser Integrity Check: On
   - DDoS Protection: On
   - WAF: Managed rules enabled

5. Performance:
   - Auto Minify: JS, CSS, HTML
   - Brotli: On
   - Early Hints: On
   - Rocket Loader: Off (Next.js handles it)

Database Backup Script (scripts/backup-db.sh):
```bash
#!/bin/bash
BACKUP_DIR=/backups
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mahapeps_$TIMESTAMP.sql"

docker exec mahapeps_postgres pg_dump -U $DB_USER mahapeps > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "mahapeps_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Deployment Script (scripts/deploy.sh):
```bash
#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin main

echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "Stopping services..."
docker-compose -f docker-compose.prod.yml down

echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "Running database migrations..."
docker-compose exec api npx prisma migrate deploy

echo "Deployment complete!"
```

Environment Variables (.env.production):
```
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/mahapeps
DB_USER=mahapeps_user
DB_PASSWORD=[SECURE_PASSWORD]

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=[SECURE_RANDOM_STRING]
JWT_EXPIRES_IN=24h

# Stripe
STRIPE_SECRET_KEY=[STRIPE_SECRET]
STRIPE_PUBLISHABLE_KEY=[STRIPE_PUBLIC]
STRIPE_WEBHOOK_SECRET=[STRIPE_WEBHOOK_SECRET]

# Mailgun
MAILGUN_API_KEY=[MAILGUN_KEY]
MAILGUN_DOMAIN=[MAILGUN_DOMAIN]
MAILGUN_FROM_EMAIL=noreply@mahapeps.com

# API
API_URL=https://mahapeps.com/api
NEXT_PUBLIC_API_URL=https://mahapeps.com/api

# Cloudflare
CLOUDFLARE_API_TOKEN=[CLOUDFLARE_TOKEN]
CLOUDFLARE_ZONE_ID=[ZONE_ID]
```

Monitoring:
- Setup application logging to file
- Use PM2 or similar for process management
- Setup log rotation
- Monitor disk space, CPU, memory
- Setup uptime monitoring (UptimeRobot, Pingdom)
- Alert on errors (Sentry, Slack webhook)

Cron Jobs:
- Daily database backup at 2 AM
- Weekly cleanup of old logs
- Daily batch expiration check
- Daily low inventory alert check

Security Checklist:
- [ ] All environment variables secured
- [ ] SSL certificates installed
- [ ] Firewall configured (only 80, 443 open)
- [ ] SSH key-based authentication only
- [ ] Regular security updates
- [ ] Database access restricted to localhost
- [ ] Redis protected with password
- [ ] API rate limiting enabled
- [ ] Cloudflare WAF enabled
- [ ] Audit logs retained

Reference ENGINEERING_PRINCIPLES.md for DevOps standards.
```

---

This comprehensive set of feature prompts covers the entire system. Use these with Codex to implement each feature with proper context and requirements. Each prompt includes the full technical specification, business logic, security considerations, and compliance requirements.
