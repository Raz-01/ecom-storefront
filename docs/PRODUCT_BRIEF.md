# MASTER CLAUDE CODE PROMPT
## Build a Production-Quality Nigerian Bulk Food Wholesale E-Commerce Platform — Demo Phase

You are acting as a **senior full-stack software engineer, product designer, UX engineer, database architect, and technical mentor**.

I want you to build a polished, production-quality **bulk foodstuff wholesale e-commerce platform** for a Nigerian business based in **Ilorin, Kwara State**, which sells branded and packaged food products in bulk to customers across Nigeria.

This is NOT supposed to look like a generic tutorial CRUD application.

It should look like a real Nigerian wholesale business that could eventually become a production system.

However, we are deliberately developing it in phases.

---

# PROJECT DEVELOPMENT STRATEGY

Build this project in three major stages:

### Phase 1 — Excellent Demo / MVP
Build a highly polished, realistic demonstration of the platform.

The demo should include:

- Customer-facing website
- Product catalogue
- Product detail pages
- Categories
- Search/filtering
- Cart
- Bulk quantity selection
- Checkout
- Delivery/pickup options
- Paystack payment integration structure
- Order management
- Quote requests
- WhatsApp integration
- Admin dashboard
- Product management
- Inventory management
- Low-stock alerts
- Inventory history
- Basic analytics
- Admin authentication
- Role-based access structure
- Responsive/mobile-first design
- Realistic Nigerian products and pricing
- Realistic sample data

Some integrations can use sandbox/test/demo behavior where appropriate.

### Phase 2 — Production Business System
After Phase 1 is complete and tested, the application should be capable of evolving into a real business system with:

- Production Paystack integration
- Real payment verification
- Real email/WhatsApp notifications
- Advanced order management
- More sophisticated inventory
- Delivery fee management
- Staff management
- Better reporting
- Audit logs
- Customer communication
- Invoice/receipt generation
- Production deployment

Do NOT implement all of Phase 2 now.

Architect Phase 1 so that Phase 2 can be added without rebuilding the application.

### Phase 3 — ERP-Lite / Advanced Business Management
Eventually the system can support:

- Procurement
- Supplier management
- Purchase orders
- Expenses
- Profit tracking
- Advanced inventory valuation
- More advanced analytics
- Financial reporting
- Business intelligence
- Advanced staff permissions
- Audit trails
- Automated notifications
- More sophisticated logistics

Again, do NOT build Phase 3 now.

Only make architectural decisions that won't unnecessarily prevent these features later.

---

# IMPORTANT DEVELOPMENT/TEACHING MODE

I am using this project partly to learn.

Therefore, DO NOT simply generate the entire application without teaching me.

You should act as a **mentor while building a real project**.

For every major feature:

1. Explain what we are about to build.
2. Explain why the feature exists.
3. Explain the architectural decision.
4. Explain important files before creating them.
5. Implement the feature.
6. Explain the important parts of the implementation.
7. Test it.
8. Only then proceed to the next feature.

However, this should NOT become a slow beginner tutorial.

I want to actually build a serious project.

---

# GUIDED IMPLEMENTATION EXERCISES

At strategic points, leave small sections for me to implement.

For example:

```ts
// TODO: YOUR TURN
// Implement the function that calculates the order subtotal.
//
// Think about:
// 1. Product price
// 2. Quantity
// 3. Multiple cart items
//
// ANSWER:
// const subtotal = items.reduce(
//   (total, item) => total + item.price * item.quantity,
//   0
// );
```

IMPORTANT:

Never give me an exercise involving something I haven't already been taught.

Before asking me to implement something myself:

1. Teach/explain the concept.
2. Show me an example.
3. Use the concept somewhere else in the project first.
4. Then give me a small exercise using the same concept.
5. Put the answer immediately below or inside a comment so I can check myself.

The goal is:

**Learn → See it used → Try it myself → Check answer → Continue.**

Do not turn every line of code into an exercise.

Choose strategically important concepts.

---

# PROJECT IDENTITY

Use a temporary business name:

**Ilorin Bulk Mart**

IMPORTANT:

The name MUST NOT be hardcoded throughout the application.

Create a central business configuration such as:

```ts
business.config.ts
```

or an appropriate equivalent.

It should contain things such as:

- Business name
- Tagline
- Phone number
- WhatsApp number
- Email
- Address
- Business location
- Currency
- Logo
- Brand colors
- Social media links

This will allow the real business name and information to be changed later.

Use clearly marked placeholder values.

---

# BUSINESS MODEL

The business:

- Is located in Ilorin, Kwara State, Nigeria.
- Delivers nationwide within Nigeria.
- Sells food products strictly in bulk/wholesale quantities.
- Sells branded and packaged products.
- Sources products directly from manufacturers.
- Serves anyone willing to buy in bulk.
- Customers may include:
  - Individuals
  - Retailers
  - Wholesalers
  - Restaurants
  - Supermarkets
  - Food businesses
  - Distributors
  - Other businesses

There is currently only ONE physical warehouse.

Do NOT over-engineer the warehouse architecture yet.

Still model inventory in a way that allows multiple warehouses to be added later.

---

# PRODUCTS

Use realistic demo products.

Create approximately 15 sample products.

Categories should include:

### Rice
Examples:
- 50kg Rice
- 25kg Rice
- 10kg Rice

### Beans
Examples:
- 50kg Beans
- 25kg Beans

### Garri
Examples:
- 50kg Garri
- 25kg Garri

### Flour
Examples:
- 50kg Flour
- 25kg Flour

### Semovita
Examples:
- 10kg Semovita
- 5kg Semovita

### Cooking Oil
Examples:
- Palm Oil
- Groundnut Oil

### Noodles / Packaged Foods
Examples:
- Carton of noodles
- Carton of spaghetti

### Spices
Examples:
- Bulk packaged spices

Use recognizable Nigerian-style products/brands where appropriate, but avoid creating false claims about an actual company.

Product images can initially use appropriate royalty-free/online imagery or placeholders.

DO NOT depend on external images being permanently available.

The architecture should allow product images to eventually be uploaded through the admin dashboard.

---

# PRODUCT MODEL

Products should support:

- Name
- Slug
- SKU
- Description
- Category
- Brand
- Product image
- Unit/package type
- Package size
- Price
- Previous price
- Stock quantity
- Low-stock threshold
- Active/inactive status
- Featured status
- Minimum order quantity
- Optional bulk pricing
- Created date
- Updated date

Examples of package types:

- Bag
- Carton
- Bottle
- Pack
- Sack
- Box

Examples:

```text
Royal Stallion Rice
50kg Bag
₦XX,XXX
```

or

```text
Indomie Instant Noodles
1 Carton
₦XX,XXX
```

---

# BULK PRICING

Normal products should have a fixed displayed price.

However, the architecture should support optional quantity-based pricing.

Example:

```text
1–9 bags       ₦50,000 each
10–49 bags     ₦48,500 each
50+ bags       Request bulk quote
```

This feature can be partially implemented in Phase 1.

The product page should make it clear when a customer may qualify for special pricing.

---

# QUOTE SYSTEM

Customers must be able to request a quotation.

There should be a prominent:

**Request Bulk Quote**

button.

A customer can request a quote for one or multiple products.

The quote request should collect:

- Name
- Phone number
- WhatsApp number
- Email (optional)
- Products
- Quantities
- Delivery location
- Additional message

Because this business expects bulk buyers, the quote system is important.

The quote request should be viewable by the admin.

There should also be a:

**Send Quote Request on WhatsApp**

option.

For Phase 1, WhatsApp can be the main communication channel for quote requests.

Generate a properly formatted WhatsApp message containing:

- Customer name
- Products
- Quantities
- Estimated total if applicable
- Delivery location
- Additional message

Use a centralized WhatsApp configuration.

---

# CUSTOMER AUTHENTICATION

DO NOT create customer accounts.

Customers should be able to complete purchases as guests.

This deliberately keeps the initial architecture simpler.

Customers should provide their information during checkout.

The system should support:

- Guest checkout
- Name
- Phone
- WhatsApp number
- Email
- Delivery address
- State
- City
- Optional landmark

After payment/order creation, the customer should receive a confirmation/receipt page.

They should be able to:

- Screenshot it
- Print it
- Download/print a receipt if implemented
- Continue the conversation through WhatsApp

Do not build customer login/account management in Phase 1.

---

# CUSTOMER WEBSITE

The website should feel like a **modern Nigerian wholesale marketplace**.

It should NOT look like a generic template.

Design principles:

- Modern
- Clean
- Trustworthy
- Professional
- Commercial
- Mobile-first
- Fast
- Easy to navigate
- Strong product photography
- Clear prices
- Strong CTAs
- Nigerian context without looking stereotypical

Avoid excessive animations.

Use animations only when they improve UX.

---

# REQUIRED PUBLIC PAGES

Create:

### Home
Include:

- Hero section
- Strong wholesale-focused headline
- Search
- Featured products
- Product categories
- Why buy from us
- Bulk purchasing explanation
- Nationwide delivery
- Pickup option
- Call-to-action
- WhatsApp CTA
- Trust indicators
- Footer

Possible headline:

**Buy Foodstuff in Bulk. Get Better Value. Delivered Across Nigeria.**

But feel free to improve it.

---

### Shop

Include:

- Search
- Categories
- Filters
- Sorting
- Product cards
- Price
- Package size
- Stock status
- Bulk pricing indicator
- Add to cart
- Request quote

---

### Category Pages

Allow users to browse:

- Rice
- Beans
- Garri
- Flour
- Semovita
- Cooking Oil
- Noodles & Pasta
- Spices
- Other packaged foods

---

### Product Details

Include:

- Product image
- Product name
- Brand
- Package size
- Price
- Stock availability
- Quantity selector
- Minimum order quantity
- Bulk pricing
- Description
- Add to cart
- Request bulk quote
- WhatsApp CTA

If stock is low, clearly communicate:

**Only 7 bags left**

or similar.

---

### Cart

Display:

- Products
- Quantity
- Unit price
- Subtotal
- Delivery estimate/fee
- Total
- Continue shopping
- Checkout

Quantity changes should immediately update totals.

---

# CHECKOUT

Checkout must support:

### Customer Information

- Full name
- Phone
- WhatsApp
- Email

### Delivery

Options:

**Pickup**
- Customer collects from warehouse

**Delivery**
- Customer provides:
  - State
  - City
  - Address
  - Landmark

Delivery fee should be calculated using a configurable/manual system.

Because actual logistics pricing is not yet defined, build the architecture so delivery pricing can later depend on:

- Location
- Quantity
- Package size
- Weight
- Manual admin configuration

For Phase 1, use a simple configurable demo delivery calculation.

Do NOT hardcode delivery logic into random components.

Create a delivery service/module.

---

# ORDER STATES

VERY IMPORTANT:

An order being created is NOT the same as an order being paid.

Implement clear order statuses.

For example:

```text
PENDING_PAYMENT
PAYMENT_PROCESSING
PAID
PROCESSING
READY_FOR_PICKUP
OUT_FOR_DELIVERY
COMPLETED
CANCELLED
```

For the demo, some states may be manually updated by the admin.

Inventory MUST NOT decrease merely because an order was created.

Inventory should only be deducted when payment has been successfully confirmed.

This is a critical business rule.

For example:

```text
Customer creates order
        ↓
PENDING_PAYMENT
        ↓
Payment successful
        ↓
PAID
        ↓
Inventory deducted
        ↓
PROCESSING
```

Never reduce inventory simply because an item was added to cart or an unpaid order was created.

---

# PAYSTACK

Use Paystack as the payment provider.

Phase 1 should support a realistic test/sandbox integration architecture.

Payment flow should conceptually be:

```text
Checkout
   ↓
Create pending order
   ↓
Initialize Paystack payment
   ↓
Customer pays
   ↓
Verify payment
   ↓
Mark order as PAID
   ↓
Deduct inventory
   ↓
Create payment record
   ↓
Show receipt/confirmation
```

Do not trust the frontend alone to determine whether a payment succeeded.

Payment verification must happen server-side.

Keep Paystack secret keys server-side.

Use environment variables.

Create:

```env
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
```

or the correct structure for the selected implementation.

Do not commit secrets.

If actual Paystack credentials aren't available, create a clean test/mock flow for the demo.

---

# RECEIPT / ORDER CONFIRMATION

After successful payment, display a beautiful confirmation page.

Example:

**Payment Successful**

Order:

`#IBL-20260901-001`

Include:

- Customer name
- Products
- Quantities
- Subtotal
- Delivery fee
- Total
- Payment status
- Order status
- Delivery/pickup information
- Date/time
- Business information

Buttons:

**Print Receipt**

**Download Receipt** (if practical)

**Continue on WhatsApp**

WhatsApp should generate a message such as:

```text
Hello, I just placed an order with Ilorin Bulk Mart.

Order: #IBL-20260901-001
Total: ₦XXX,XXX
Payment: Successful

I'd like to confirm the next steps for my order.
```

---

# ADMIN DASHBOARD

The admin dashboard is one of the most important parts of this project.

It should feel like a real business management application.

Do NOT make it look like the customer website.

Use a professional dashboard layout with:

- Sidebar
- Top navigation
- Notifications
- Search
- User profile
- Responsive mobile navigation

---

# DASHBOARD OVERVIEW

Display:

### Sales

- Revenue today
- Revenue this week
- Revenue this month
- Revenue this year

### Orders

- Total orders
- Pending orders
- Paid orders
- Processing
- Completed
- Cancelled

### Customers

Since there are no customer accounts, customers are represented by their order information.

Display:

- Unique customers
- New customers
- Returning customers

### Inventory

- Total products
- Total stock units
- Low-stock products
- Out-of-stock products

### Analytics

Create useful charts for:

- Revenue over time
- Orders over time
- Best-selling products
- Sales by category
- Order status distribution

Allow date filters:

- Today
- 7 days
- 30 days
- 3 months
- 1 year
- Custom range

Use appropriate chart libraries.

Do not add charts simply for decoration.

---

# INVENTORY DASHBOARD

Create a dedicated inventory page.

Display:

| Product | SKU | Stock | Threshold | Status |
|---|---|---:|---:|---|
| Rice 50kg | RICE-50 | 23 | 10 | Healthy |
| Beans 50kg | BEANS-50 | 7 | 10 | Low Stock |

Use visually obvious stock states.

Example:

- Healthy
- Low Stock
- Out of Stock

Low-stock alerts should be visible in:

- Dashboard
- Inventory page
- Notification area

---

# INVENTORY HISTORY

Create an inventory movement/history system.

Example:

```text
September 1
Rice 50kg
+100 units
Stock received

September 2
Rice 50kg
-5 units
Order #IBL-0021

September 3
Rice 50kg
-10 units
Order #IBL-0025
```

Inventory movement records should contain:

- Product
- Quantity change
- Previous quantity
- New quantity
- Reason
- Related order if applicable
- Timestamp
- Admin/user responsible

This becomes important later for auditability.

---

# PRODUCT MANAGEMENT

Admin should be able to:

- Create product
- Edit product
- Delete/deactivate product
- Change price
- Change stock
- Change low-stock threshold
- Change product image
- Change category
- Mark featured
- Set minimum order quantity
- Configure bulk pricing

Price changes should immediately affect future orders.

Historical orders should retain the price that was actually charged.

Do NOT calculate historical order totals from the current product price.

---

# ORDER MANAGEMENT

Admin should be able to:

- View orders
- Filter orders
- Search orders
- View order details
- Change order status
- See customer information
- See payment status
- See delivery/pickup method
- See items
- See total
- Contact customer through WhatsApp

Order details should clearly distinguish:

**Payment Status**

from

**Fulfillment Status**

For example:

```text
Payment: PAID
Fulfillment: PROCESSING
```

Do NOT combine these into one confusing field.

---

# QUOTE MANAGEMENT

Admin should be able to:

- View quote requests
- View customer information
- View requested products
- View quantities
- View delivery location
- Add notes
- Change quote status

Quote statuses:

```text
NEW
CONTACTED
QUOTED
ACCEPTED
REJECTED
EXPIRED
```

For Phase 1, actual quote negotiation can happen through WhatsApp.

---

# WHATSAPP

WhatsApp should be integrated throughout the website.

Create reusable WhatsApp functionality.

Potential locations:

- Floating WhatsApp button
- Header
- Product page
- Quote request
- Checkout
- Order confirmation
- Admin order page
- Admin quote page

Do NOT duplicate WhatsApp URL generation logic everywhere.

Create a reusable utility/service.

---

# ADMIN USERS & ROLES

There will be:

### Owner / Super Admin

Can:

- View everything
- Manage products
- Manage inventory
- Manage orders
- Manage quotes
- View analytics
- Manage employees
- Manage settings

### Admin / Sales Staff

Can:

- View orders
- Manage orders
- View customers/order information
- Manage quotes
- Contact customers

Cannot:

- Change sensitive business settings
- Manage staff permissions

### Warehouse Staff

Can:

- View inventory
- Update inventory
- View relevant orders
- Process fulfillment

Cannot:

- View sensitive financial analytics
- Manage employees
- Change payment settings

Design the authorization system so additional roles can be added later.

---

# AUTHENTICATION

Only administrators/staff need accounts.

Customers do NOT need accounts.

Implement secure admin authentication.

Passwords must never be stored as plaintext.

Use appropriate password hashing/authentication mechanisms.

Protect admin routes.

Do not rely solely on frontend route protection.

Server-side authorization is required.

---

# DATABASE DESIGN

Use PostgreSQL.

Use Prisma ORM unless there is a strong technical reason not to.

Design the database carefully.

Likely models/entities include:

```text
User
Role
Product
Category
ProductImage
Inventory
InventoryMovement
Order
OrderItem
Payment
QuoteRequest
QuoteItem
DeliveryConfiguration
BusinessSettings
```

Potentially:

```text
BulkPrice
Notification
AuditLog
```

where useful.

Think carefully about relationships.

For example:

Order
→ OrderItems
→ Product

Payment
→ Order

InventoryMovement
→ Product
→ User
→ Order (optional)

QuoteRequest
→ QuoteItems
→ Product

Do not prematurely create unnecessary tables.

---

# IMPORTANT DATABASE RULES

Orders must snapshot relevant product information.

OrderItem should store at minimum:

- Product ID
- Product name at purchase
- SKU at purchase
- Unit price at purchase
- Quantity
- Subtotal

This means if the product is renamed or its price changes later, historical orders remain correct.

Likewise, inventory movements should preserve enough information to remain understandable even if a product changes.

Use appropriate:

- Foreign keys
- Unique constraints
- Indexes
- Decimal/money handling
- Timestamps

Do not use floating-point numbers for financial calculations.

Use a safe monetary representation such as integer kobo where appropriate or Prisma Decimal.

Explain the decision.

---

# SECURITY

Treat this as a real application.

Implement protection against:

- Unauthorized admin access
- Broken access control
- Client-side price manipulation
- Client-side inventory manipulation
- Invalid quantities
- Negative quantities
- Fake payment confirmations
- Exposing secret keys
- Basic injection attacks
- Unsafe input
- Invalid order states

Never trust:

```text
price
subtotal
total
inventory
payment status
```

coming from the browser.

The server should recalculate important values.

---

# FINANCIAL CALCULATION

The server should calculate:

```text
subtotal
bulk discounts
delivery fee
total
```

Never trust totals sent by the frontend.

For example:

```text
Frontend says:
Total = ₦10,000

Server:
Recalculate actual total from database prices.

If values don't match:
Reject or recalculate.
```

Explain why this matters.

---

# UI/UX DETAILS

Use:

- Tailwind CSS
- shadcn/ui or an equivalent high-quality component system
- Lucide icons or another appropriate icon library
- Responsive design
- Accessible components
- Proper loading states
- Empty states
- Error states
- Success states
- Toast notifications
- Skeleton loading where appropriate

Do not overuse rounded cards.

Avoid the generic "AI-generated SaaS dashboard" aesthetic.

The design should feel like a polished Nigerian commerce/business platform.

---

# RESPONSIVENESS

Mobile is extremely important.

Many Nigerian customers will access this through mobile devices.

Test:

- 320px+
- 375px
- 390px
- 414px
- Tablet
- Desktop

The checkout experience should be particularly good on mobile.

---

# SEARCH

Implement product search.

Search should support:

- Product name
- Brand
- SKU
- Category

Add useful empty states.

Example:

**No products found**

Try another search or browse our categories.

---

# DEMO DATA

Seed the database with realistic demo data.

Create approximately:

- 15 products
- 8 categories
- Several inventory records
- Several historical inventory movements
- Several orders
- Several customers represented through orders
- Several quote requests
- Several payment records
- Different order statuses
- Low-stock products
- At least one out-of-stock product

IMPORTANT:

The admin dashboard should NOT look empty when I first log in.

The analytics should have enough data to demonstrate the system.

Create believable demo history.

---

# DEMO ANALYTICS

The dashboard should demonstrate:

Example:

```text
Revenue this month
₦4,850,000

Orders
126

Average Order Value
₦38,492

Low Stock
7 products
```

These numbers should come from seeded database data, not hardcoded UI values.

This is important.

If I delete an order or create a new one, analytics should change accordingly.

---

# BUSINESS SETTINGS

Create an admin settings section where appropriate.

At minimum prepare the architecture for:

- Business name
- Phone
- WhatsApp
- Email
- Address
- Delivery settings
- Currency
- Low-stock defaults

The real business information will be entered later.

---

# SEO

Implement proper basic SEO:

- Metadata
- Page titles
- Descriptions
- Open Graph metadata
- Product metadata
- Semantic HTML

Create useful slugs.

Example:

```text
/shop/rice/royal-stallion-rice-50kg
```

---

# PERFORMANCE

Pay attention to:

- Image optimization
- Server/client boundaries
- Database query efficiency
- Pagination
- Avoiding unnecessary API requests
- Loading states
- Caching where appropriate

Do not prematurely optimize everything.

Explain important performance decisions.

---

# ERROR HANDLING

Create proper error handling.

Do not expose raw database errors to customers.

Customer-facing errors should be understandable.

Example:

Instead of:

```text
PrismaClientKnownRequestError...
```

display:

**We couldn't complete your order. Please try again or contact us on WhatsApp.**

Admin logs can contain more technical details.

---

# PROJECT STRUCTURE

Use a clean, scalable project structure.

Do not create one giant file.

Separate:

- Components
- Pages/routes
- Database
- Services
- Utilities
- Validation
- Authentication
- Payment logic
- Inventory logic
- Order logic
- Analytics logic
- Configuration

Keep business logic out of UI components where possible.

---

# VALIDATION

Use a validation library such as Zod where appropriate.

Validate:

- Checkout information
- Product creation
- Product updates
- Quantity
- Quote requests
- Admin forms

Do not rely only on HTML validation.

---

# TESTING

Testing is important.

At minimum, create tests for critical business logic:

### Inventory

- Inventory decreases only after successful payment.
- Inventory cannot become negative.
- Out-of-stock products cannot be ordered.
- Low-stock thresholds work.

### Orders

- Server calculates correct subtotal.
- Server calculates correct total.
- Order items snapshot prices.
- Order cannot be marked paid without valid payment confirmation.

### Bulk Pricing

- Correct price tier is selected.

### Delivery

- Delivery fee calculation works.

### Authorization

- Warehouse staff cannot access restricted financial analytics.
- Normal staff cannot manage staff accounts.
- Unauthorized users cannot access admin APIs.

Do not try to test every UI component initially.

Prioritize business-critical functionality.

---

# DOCKER

Do NOT start with Docker.

Build the application normally first.

Once the application is working:

1. Explain why Docker is useful.
2. Explain containers.
3. Explain images.
4. Explain volumes.
5. Explain networking.
6. Add Docker configuration.
7. Dockerize the application.
8. Dockerize PostgreSQL for local development.
9. Create appropriate environment configuration.
10. Verify the entire application works using Docker.

The goal is for me to learn Docker as part of the project rather than simply receiving a Dockerfile.

---

# GIT

Treat the project as a real software project.

Use sensible commits/checkpoints where appropriate.

Examples:

```text
feat: initialize application architecture
feat: add product catalogue
feat: add shopping cart
feat: implement checkout
feat: add order management
feat: add inventory tracking
feat: add admin analytics
feat: add role-based authorization
feat: add Paystack payment flow
chore: dockerize application
```

Do not create meaningless commits.

---

# ENVIRONMENT VARIABLES

Use `.env.example`.

Never commit secrets.

Document variables such as:

```env
DATABASE_URL=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=
WHATSAPP_NUMBER=
```

Add any others required.

---

# README

Create a professional README.

It should explain:

- What the project is
- Features
- Tech stack
- Architecture
- Database
- Local setup
- Environment variables
- Running migrations
- Seeding demo data
- Running tests
- Payment setup
- Docker setup
- Deployment
- Future roadmap

Also include an architecture diagram if practical.

---

# PHASE 1 ACCEPTANCE CRITERIA

Do not declare Phase 1 complete until all of these work.

## Customer

A customer can:

- Visit homepage
- Browse products
- Search
- Filter products
- View product details
- Select quantities
- Add products to cart
- View cart
- Checkout as guest
- Choose pickup or delivery
- Enter contact information
- Enter delivery address
- See calculated delivery fee
- See total
- Request a quote
- Send quote request to WhatsApp
- Start WhatsApp conversation
- Complete demo/test payment
- Receive payment confirmation
- View order confirmation
- See order number
- Continue on WhatsApp

## Admin

Admin can:

- Login
- View dashboard
- See sales analytics
- See order analytics
- See inventory analytics
- View products
- Create products
- Edit products
- Change prices
- Change inventory
- Configure low-stock thresholds
- See low-stock alerts
- See inventory movement history
- View orders
- Update order statuses
- View quote requests
- Manage quote statuses
- Use WhatsApp links
- Manage staff according to role

## Business logic

The system correctly:

- Distinguishes unpaid from paid orders
- Only deducts inventory after successful payment
- Prevents overselling
- Preserves historical order prices
- Calculates totals server-side
- Handles delivery fees
- Supports bulk pricing architecture
- Protects admin functionality
- Protects payment secrets

---

# DEVELOPMENT ORDER

Do not randomly jump between features.

Follow a logical sequence approximately like this:

### Step 1
Project planning and architecture.

### Step 2
Initialize Next.js/TypeScript application.

### Step 3
Install/configure UI system.

### Step 4
Set up PostgreSQL + Prisma.

### Step 5
Design database schema.

### Step 6
Create migrations.

### Step 7
Create seed data.

### Step 8
Build global configuration.

### Step 9
Build public layout.

### Step 10
Build homepage.

### Step 11
Build product catalogue.

### Step 12
Build product details.

### Step 13
Build cart.

### Step 14
Build checkout.

### Step 15
Build order creation.

### Step 16
Build payment abstraction/test flow.

### Step 17
Build payment verification architecture.

### Step 18
Build receipt/order confirmation.

### Step 19
Build WhatsApp integration.

### Step 20
Build admin authentication.

### Step 21
Build admin dashboard.

### Step 22
Build product management.

### Step 23
Build inventory management.

### Step 24
Build inventory history.

### Step 25
Build order management.

### Step 26
Build quote management.

### Step 27
Build analytics.

### Step 28
Implement role-based permissions.

### Step 29
Testing.

### Step 30
Security review.

### Step 31
UX polish.

### Step 32
Performance review.

### Step 33
Documentation.

### Step 34
Introduce Docker.

### Step 35
Final Phase 1 demo walkthrough.

---

# HOW YOU SHOULD WORK

Before writing substantial code:

1. Inspect the repository.
2. Determine whether a project already exists.
3. Do not overwrite existing work without understanding it.
4. Present the proposed architecture.
5. Explain major technology choices.
6. Start implementing.

After each meaningful milestone:

- Tell me what was built.
- Explain the important concepts.
- Tell me how to test it.
- Give me a small guided exercise if appropriate.
- Provide the answer in a comment.
- Then continue.

If you encounter an architectural decision, explain the tradeoffs briefly and choose a sensible option rather than endlessly asking me.

Do not ask for approval for every tiny implementation detail.

---

# IMPORTANT: DO NOT OVERBUILD

This is Phase 1.

Do NOT build:

- Customer accounts
- Customer loyalty systems
- Complex procurement
- Supplier management
- Multi-warehouse management
- Delivery tracking
- Coupon systems
- Complex CRM
- Advanced accounting
- Mobile apps
- Microservices
- Kubernetes
- Event-driven architecture unless genuinely necessary

Keep the architecture clean and extensible.

A well-designed modular monolith is preferred.

Do not introduce complexity merely because it sounds impressive.

---

# IMPORTANT: MAKE THE DEMO LOOK REAL

The demo should be convincing enough that I can show the business owner:

> "This is what your online wholesale store could look like."

It should not feel like:

> "This is a student CRUD project."

Use realistic:

- Nigerian currency
- Product packaging
- Business terminology
- Wholesale language
- Delivery/pickup concepts
- WhatsApp workflows
- Bulk order quantities
- Stock levels
- Order statuses
- Business analytics

The website should communicate trust.

---

# FINAL GOAL

At the end of Phase 1, I should have a polished, realistic Nigerian bulk-food wholesale platform that demonstrates:

**Customer side**

```text
Browse
  ↓
Product
  ↓
Bulk Quantity
  ↓
Cart
  ↓
Checkout
  ↓
Payment
  ↓
Receipt
  ↓
WhatsApp
```

and

**Business side**

```text
Orders
   ↓
Payments
   ↓
Inventory
   ↓
Fulfillment
   ↓
Analytics
```

The application should be designed so that the Phase 1 demo can naturally evolve into a real production business platform in Phase 2 and eventually an ERP-lite system in Phase 3.

Start by inspecting the current repository and then give me:

1. Your proposed architecture.
2. The technology stack and why.
3. The database/entity plan.
4. The folder structure.
5. The Phase 1 implementation roadmap.

Then begin implementation.
