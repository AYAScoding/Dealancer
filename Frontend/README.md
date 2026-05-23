# Dealancer - Project State & Architecture Overview

This document provides a detailed context of the `Dealancer` application, serving as a comprehensive blueprint for LLMs and developers to understand the current architecture, implemented features, and the strategic roadmap for future development.

## 1. Project Architecture & Tech Stack

**Dealancer** is a two-sided marketplace connecting Clients (who post jobs) and Freelancers (who submit proposals/bids). 

- **Backend:** Django & Django REST Framework (DRF)
  - **Database:** PostgreSQL (production-ready relational database)
  - **Authentication:** JWT (JSON Web Tokens) via `rest_framework_simplejwt`
  - **Architecture:** Modular apps (`core/users` and `core/jobs`)
- **Frontend:** React 19 + Vite
  - **Styling:** Tailwind CSS v4, utilizing a premium glassmorphism aesthetic (`glass`, `glass-dark` utilities) and standard UI colors (slate, primary indigo).
  - **Routing:** React Router v7 (`react-router-dom`)
  - **Icons:** `lucide-react`
  - **HTTP Client:** Axios with custom interceptors for JWT token refresh cycles.

---

## 2. Currently Implemented Features

### 2.1 Authentication & User Management (Backend `users` app)
- **Custom User Model:** Replaces default Django User. Uses `email` as the primary identifier (no username). Supports dual roles: `CLIENT` and `FREELANCER`.
- **Email Verification:** Users must verify their email via a tokenized link before logging in.
- **Password Management:** Reset password flows implemented.
- **Automated Profile Creation:** Django Signals (`post_save`) automatically create a `ClientProfile` or `FreelancerProfile` when a `CustomUser` is registered.
- **Dynamic Profile Completeness:** A robust `@property` on `CustomUser` (`is_profile_complete`) dynamically evaluates if the user has filled in required profile fields (e.g., bio, hourly rate, and skills for Freelancers; company name and industry for Clients).
- **Profile API endpoints:** A unified `/api/auth/me/profile/` endpoint dynamically serializes the correct profile model based on the user's role. Uses `get_or_create` to prevent 404s. Supports `multipart/form-data` for avatar image uploads.

### 2.2 Jobs & Bids Management (Backend `jobs` app)
- **Job Postings:** Clients can create, read, and manage jobs. Jobs belong to a `Category` and require specific `Skills`. Includes fields for budget, description, and status.
- **Bidding System:** Freelancers can submit bids on active jobs. Bids include proposed rates, delivery times, and cover letters.
- **Granular Permissions:** 
  - `IsClientOrReadOnly`: Only clients can create jobs.
  - `IsJobOwner` / `IsFreelancerBidOwner`: Restricts edit/delete access to creators.
  - `IsProfileComplete`: A strict guard blocking access to `/api/jobs/` and `/api/bids/` if the user has not completed their profile details.

### 2.3 Frontend Application (`Frontend/src`)
- **Global Auth State:** `AuthContext.jsx` manages the JWT lifecycle, fetching `/api/auth/me/` on load, and handling silent token refreshes via Axios interceptors.
- **Protected Routing:** `ProtectedRoute.jsx` guards routes based on authentication, specific roles (`allowedRoles`), and heavily enforces the `is_profile_complete` rule, instantly redirecting incomplete profiles to the `/profile` editor.
- **Dashboards:** Dedicated `ClientDashboard.jsx` and `FreelancerDashboard.jsx` with responsive sidebars and metric cards.
- **Interactive Profile Editor (`Profile.jsx`):** A premium, unified profile form that dynamically adapts to the user's role.
  - **Freelancers:** Features a searchable, multi-select dropdown for assigning skills (fetched from `/api/skills/`).
  - **Both Roles:** Supports instant photo upload previews using `URL.createObjectURL`.
- **Job Marketplace:** `JobMarketplace.jsx` for browsing jobs, `JobDetail.jsx` for viewing specifics, and `JobForm.jsx` for Clients to post new gigs.

---

## 3. Strategic Roadmap: What to Implement Next

To make Dealancer a standout, top-tier platform, the following features and architectural improvements should be prioritized in subsequent planning phases:

### 3.1 Core Marketplace Enhancements
1. **Real-time Messaging System:**
   - Implement WebSockets using Django Channels.
   - Build a chat interface allowing Clients and Freelancers to communicate directly once a bid is accepted or during the negotiation phase.
2. **Escrow & Payment Gateway Integration:**
   - Integrate Stripe Connect.
   - Implement an escrow system where funds are captured upon contract start and released upon milestone completion/approval.
3. **Advanced Search & Filtering:**
   - Upgrade the basic DRF `SearchFilter` to use PostgreSQL Full-Text Search (or Elasticsearch/Typesense) for lighting-fast job and freelancer discovery.
   - Add faceted filtering (by budget, category, exact skill match, rating).

### 3.2 Reputation & Workflow
1. **Review & Rating Engine:**
   - Implement a robust system where Clients and Freelancers review each other upon job completion.
   - Dynamically calculate and update `avg_rating` and `total_reviews` fields on the profiles using Django aggregation.
2. **Milestone & Contract Management:**
   - Transition from simple "bids" to a formal "Contract" model.
   - Allow jobs to be split into deliverable milestones with individual due dates and payment allocations.
3. **Enhanced Freelancer Portfolios:**
   - Expand `FreelancerProfile` to allow a one-to-many relationship with a `PortfolioProject` model, letting freelancers upload galleries of past work, external links, and rich text case studies.

### 3.3 UI/UX & Quality of Life (Frontend)
1. **Micro-interactions & Animations:**
   - Integrate `framer-motion` for page transitions, modal pop-ups, and interactive element feedback to elevate the "premium" feel.
2. **Real-time Notifications:**
   - A global notification bell (WebSocket-driven) alerting users of new bids, messages, or contract status changes.
3. **AI-Powered Assistance (Standout Feature):**
   - Integrate LLM APIs (e.g., OpenAI or Gemini) to offer an "AI Proposal Writer" for freelancers.
   - Provide an "AI Job Description Generator" for clients to quickly draft professional postings based on a few keywords.

### 3.4 Infrastructure & DevOps
1. **File Storage:**
   - Configure AWS S3 or Google Cloud Storage for handling `ImageField` (profile photos) and future portfolio attachments.

## Summary for LLM Planners
When prompted to generate implementation plans based on this repository, assume the foundational auth, permissions, and profile enforcement layers are fully stable. Direct your focus towards expanding domain models (contracts, messages, reviews), optimizing UI/UX with modern React patterns, and implementing robust external integrations (Payments, WebSockets, AI).
