# Dealancer 🚀

## Acknowledgement
We would like to thank all contributors, mentors, and the open‑source community whose feedback and support have been instrumental in shaping **Dealancer**. Special thanks to the project lead and the development team for their dedication.

## Abstract
Dealancer is a modern, secure, and scalable freelancing marketplace that connects talented freelancers with clients seeking high‑quality work. Built on Django Rest Framework (DRF) with JWT authentication and PostgreSQL, the platform offers role‑based access, profile management, and a roadmap toward a full‑stack solution including a React/Next.js frontend.

## 1. Introduction
The goal of Dealancer is to provide a seamless experience for project bidding, secure payments, and professional profile management. The backend implements robust authentication, role separation (CLIENT vs FREELANCER), and extensible skill management. The roadmap outlines planned features such as job postings, bidding, messaging, contracts, ratings, and payment integration.

## 2. Methodology
- **Agile Development**: Incremental feature delivery with defined phases.
- **Backend‑First Approach**: API‑first design using Django Rest Framework and OpenAPI specifications.
- **Test‑Driven**: Core authentication and profile logic verified via unit tests.
- **Continuous Documentation**: Auto‑generated Swagger / Redoc docs for all endpoints.
- **Version Control**: Git repository with clear issue tracking and milestones.

## 3. Hardware and Software Requirements
- **Operating System**: Windows 10/11 (development), Linux/WSL for production.
- **Python**: 3.x (virtual environment recommended).
- **Frameworks**: Django 4.x, Django Rest Framework, SimpleJWT.
- **Database**: PostgreSQL (development & production).
- **Other Tools**: Git, pip, virtualenv, drf‑spectacular for API docs.
- **Frontend (planned)**: Node.js, React or Next.js, npm/yarn.

## 4. Project Management Plan and Completed Activities and Achievements
### Completed Activities
- Custom user model with email login.
- JWT authentication with token blacklisting.
- Role‑based permissions (`IsFreelancer`, `IsClient`).
- Automated profile creation via signals.
- Skill system with hierarchical categories.
- API documentation (Swagger & Redoc).
- Development setup instructions and environment configuration.

### Roadmap (Planned Phases)
**Phase 1 – Job Marketplace**
- Job postings, bidding system, search & filters.

**Phase 2 – Communication & Contracts**
- Real‑time messaging, contract management, notifications.

**Phase 3 – Feedback & Payments**
- Review & rating system, Stripe/PayPal integration, financial dashboards.

**Phase 4 – Frontend Development**
- Initialize React/Next.js app, role‑specific dashboards, responsive UI.

## 5. Conclusion
Dealancer demonstrates a solid backend foundation for a freelance marketplace, with clear progress and a well‑defined roadmap. The upcoming phases will expand functionality to a full‑stack solution, delivering a complete end‑to‑end experience for freelancers and clients.

## 6. References
- Django Documentation: https://docs.djangoproject.com/
- Django Rest Framework: https://www.django-rest-framework.org/
- SimpleJWT: https://django-rest-framework-simplejwt.readthedocs.io/
- drf‑spectacular (OpenAPI): https://drf-spectacular.readthedocs.io/
- PostgreSQL: https://www.postgresql.org/
- React: https://reactjs.org/
- Next.js: https://nextjs.org/
