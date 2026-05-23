# Dealancer 🚀
A modern, secure, and scalable freelancing marketplace built with Django and (upcoming) React.

## 📌 Project Overview
Dealancer is designed to connect talented freelancers with clients looking for high-quality work. The platform focuses on a seamless experience for project bidding, secure payments, and professional profile management.

---

## 🛠️ Tech Stack (Current)
- **Backend:** Django Rest Framework (DRF)
- **Authentication:** JWT (SimpleJWT)
- **Database:** PostgreSQL (Development & Production)
- **Documentation:** drf-spectacular (OpenAPI 3.0)
- **Environment:** Python 3.x, Virtualenv

---

## ✅ Progress So Far (Done)
Here is what has been implemented and is currently functional in the backend:

### 1. **Core Authentication & User Management**
- **Custom User Model:** Using email as the primary login identifier instead of username.
- **JWT Authentication:** Secure token-based auth with access/refresh cycles and token blacklisting.
- **Role-Based Access Control:** Distinct roles for `CLIENT` and `FREELANCER`.
- **Profiles:** Automated creation of specialized profiles (Freelancer/Client) upon user registration.

### 2. **Profile & Professional Data**
- **Freelancer Profiles:** Bio, hourly rates, availability tracking, and average ratings.
- **Client Profiles:** Company details, industry, and website tracking.
- **Skill System:** Hierarchical skill categories and a many-to-many relationship between freelancers and their skills.

### 3. **Infrastructure**
- **Permissions:** Custom permission classes (e.g., `IsFreelancer`, `IsClient`) to protect sensitive endpoints.
- **API Documentation:** Automatic generation of Swagger and ReDoc documentation for all API endpoints.
- **Signals:** Django signals to automate profile creation and data integrity.

---

## 🚀 What's Next? (Roadmap)
To build a fully functional marketplace, the following features are planned:

### **Phase 1: Job Marketplace (Highest Priority)**
- [ ] **Job Postings:** Clients should be able to create, edit, and delete project listings with categories and budget settings.
- [ ] **Bidding/Proposal System:** Freelancers to apply for jobs with custom proposals, cost estimates, and duration.
- [ ] **Job Search:** Filtering and searching projects by skill, budget, and date.

### **Phase 2: Communication & Contracts**
- [ ] **Messaging System:** Real-time chat (WebSockets/Django Channels) or simple message-based communication between parties.
- [ ] **Contract Management:** A system to "Hire" a freelancer, creating an active contract with milestones.
- [ ] **Notifications:** Email and in-app alerts for new bids, messages, or project updates.

### **Phase 3: Feedback & Payments**
- [ ] **Review & Rating System:** Logic to calculate and store ratings after a project is marked as "Completed."
- [ ] **Payment Integration:** Integrating Stripe or PayPal for secure project funding and escrow.
- [ ] **Financial Dashboard:** Tracking earnings for freelancers and spending for clients.

### **Phase 4: Frontend Development**
- [ ] **Initialize Frontend:** Setup a modern React or Next.js application in the `/Frontend` directory.
- [ ] **Client/Freelancer Dashboards:** Tailored UI experiences based on the user's role.
- [ ] **Responsive Design:** Ensuring the platform works perfectly on mobile and desktop.

---

## ⚙️ Development Setup (Backend)
1. Navigate to `/Backend/core`.
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt` (Make sure to generate one if missing).
4. Run migrations: `python manage.py migrate`.
5. Start the server: `python manage.py runserver`.
6. Access API docs at `/api/schema/swagger-ui/`.

