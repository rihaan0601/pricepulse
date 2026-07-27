# PricePulse Engine — Real-Time Quick-Commerce Price Aggregator & Tracking System

> **INTELLECTUAL PROPERTY NOTICE & COPYRIGHT CLAIM**  
> **© 2026 PricePulse Technologies. All Rights Reserved.**  
> *Proprietary & Confidential. All architectural models, codebases, connector patterns, algorithms, and application designs are protected under international copyright and trade secret laws.*

---

## ⚡ Overview
PricePulse is a high-performance backend and web platform built to fetch, normalize, compare, and optimize live item pricing, availability, discounts, and dark-store delivery times across Indian quick-commerce platforms (**Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, and Amazon Fresh**) for any given GPS location or pincode.

---

## 🔒 Copyright & Intellectual Property Protection

The **PricePulse System** encompasses several protected intellectual property domains:

1. **System Concept & Idea:** Real-time hyper-local price comparison and split-basket optimization engine across Indian Quick-Commerce providers.
2. **Backend Server Architecture:** Modular Connector Adapter Pattern (`BaseConnector`), HTTP/2 payload dynamic header generators, anti-bot mitigation, and location context manager.
3. **Cart Optimization Heuristics:** Mathematical solver optimizing single-store vs. split-store checkouts while factoring in platform delivery fee thresholds.
4. **Catalog Generator & Normalization Schema:** Database schema mapping 500k+ products into unified canonical structures with brand-accurate asset rendering.
5. **Frontend UI & PWA Application:** Custom dynamic design system built with Next.js 14, TailwindCSS, glassmorphism layouts, and offline-capable PWA service worker.

### Legal Disclaimers
* **Proprietary Software:** Unauthorized copying, decompilation, redistribution, or commercial cloning of this repository or server is strictly prohibited.
* **Nominative Fair Use:** Third-party brand names (Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, Amazon Fresh) and product trademarks are referenced solely under nominative fair use for real-time comparison indexing.

---

## 🛠️ Architecture & Tech Stack
* **Web Frontend:** Next.js 14 (App Router), React, TailwindCSS, Zustand
* **Backend API & Engine:** Node.js / TypeScript, Modular Scraper Connectors, Redis Cache Manager
* **Background Sync:** BullMQ Worker Cron Pipeline for hourly price updates
* **Deployment:** Vercel 24/7 Production Cloud Server
