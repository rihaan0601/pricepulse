# INTELLECTUAL PROPERTY & COPYRIGHT NOTICE

**Legal Entity & Owner:** PricePulse Technologies & Engine  
**Effective Date:** July 27, 2026  
**Status:** Proprietary & Confidential | All Rights Reserved  

---

## 1. Scope of Intellectual Property Claim
This Copyright & Legal Claim protects all intellectual property, original works, algorithms, system concepts, and technical assets associated with **PricePulse**, including but not limited to:

### A. The Core Idea & Conceptual Innovation
* **Hyperlocal Multi-Platform Real-Time Price Aggregation:** The concept, business logic, workflow, and system dynamics of aggregating live inventory, pricing, delivery times, and store stock across quick-commerce providers (Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, Amazon Fresh) based on precise GPS coordinates or pincodes.
* **Split-Basket Cart Optimization Engine:** The mathematical model and programmatic solver used to optimize multi-item purchases, calculate threshold savings against delivery/platform fees, and recommend single-platform vs. split-platform checkout routes.

### B. Software Architecture & Server Engines
* **Modular Connector Framework (Adapter Pattern):** All connector modules, HTTP/2 dynamic payload formatters, header generators, and anti-bot mitigation routines (`blinkit_connector`, `zepto_connector`, `instamart_connector`, `flipkart_minutes_connector`).
* **Canonical Catalog Normalization Engine:** The data pipeline and fuzzy match algorithms mapping disparate vendor items into unified canonical products.
* **Background Worker & Cron Pipeline:** BullMQ/Redis automated hourly queue architecture, rate limit handlers, and price sync cron routines.

### C. Application Source Code & User Interface (Web/App/Server)
* **Frontend Application & Component System:** All Next.js/React components, custom CSS tokens, dark mode design system, micro-animations, glassmorphism layouts, cart store modules (`useCartStore.ts`), and PWA service worker configurations.
* **Backend API Routes & Services:** All API handlers (`/api/search`, `/api/optimize`, `/api/location`, `/api/canonical-search`) and server-side utilities.

---

## 2. Legal Protections & Restrictions

1. **Copyright Assertion:**  
   Under international copyright treaties (including the Berne Convention and WIPO treaties), all original source code, design elements, visual aesthetics, user workflows, and database schemas are copyrighted works. Unauthorized copying, distribution, or cloning is strictly prohibited.

2. **Proprietary Trade Secrets:**  
   The internal connector logic, API endpoints structure, header dynamic generation routines, and split-basket optimization heuristics constitute valuable trade secrets.

3. **Reverse Engineering Prohibition:**  
   No party may decompile, reverse engineer, dissect, or replicate the server APIs, database schema, or client application bundle for commercial or competitive purposes.

---

## 3. Nominative Fair Use Statement
All third-party trademarks, logos, brand names (such as Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, Amazon Fresh, and product brand names) displayed within the application are the property of their respective owners. They are used exclusively for **nominative fair use** to identify quick-commerce platforms and products for real-time comparison purposes by end consumers.

---

**© 2026 PricePulse Technologies. All Rights Reserved.**  
*For legal inquiries or permission requests, contact the official repository owner.*
