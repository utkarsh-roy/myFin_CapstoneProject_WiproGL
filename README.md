# 🏦 MyFin Bank — Full Stack Banking Application

> A production-grade, microservices-based digital banking platform built with **Spring Boot** and **React + Vite**. Supports full banking operations including accounts, transactions, loans, investments, and real-time support chat.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Microservices](#microservices)
- [Database Design](#database-design)
- [Security](#security)
- [Features](#features)
- [API Reference](#api-reference)
- [Microservice Communication](#microservice-communication)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## 🌐 Overview

MyFin Bank is a **full-stack digital banking application** that simulates real-world banking operations. It is built using a **microservices architecture** where each domain is an independent Spring Boot service communicating via REST APIs, registered with **Eureka Service Discovery**.

### Key Highlights

- 🔐 JWT-based authentication across all services
- 🏗️ 4 independent microservices + Eureka server
- 💳 Real banking operations with transaction PIN security
- 📊 Admin audit logging for complete accountability
- 🤖 Auto-reply chat support system
- 📈 Loan status timeline tracking
- 🚫 Login attempt limiting with auto account lock

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (5173)                        │
│              Vite + React + MUI + Axios + JWT                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP Requests + JWT Token
          ┌─────────────────┼──────────────────────┐
          │                 │                      │
          ▼                 ▼                      ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ user-service │  │  admin-service   │  │ account-service  │
│   Port 8081  │  │   Port 8060      │  │   Port 8070      │
│              │  │                  │  │                  │
│ Auth, Users  │  │ Admin Panel,     │  │ Accounts, Trans- │
│ Profiles     │◄─┤ Audit Logs,      │  │ actions, PIN,    │
│              │  │ User/Loan/Account│  │ Investments,     │
└──────┬───────┘  │ Management       │  │ Limits           │
       │          └────────┬─────────┘  └────────┬─────────┘
       │                   │                     │
       │          ┌────────┴─────────┐           │
       │          │                  │           │
       │          ▼                  ▼           ▼
       │  ┌──────────────────────────────────────────────┐
       │  │         loan-support-service (8090)           │
       │  │  Loans, EMI, Chat, Notifications, Timeline   │
       │  └──────────────────────────────────────────────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────────────────┐
│           EUREKA SERVER (8761)                │
│      Service Discovery & Registration         │
│  Resolves service names to actual ports       │
└──────────────────────────────────────────────┘

Each service has its own MySQL database:
┌─────────────────┐  ┌──────────────────┐
│ user_service_db │  │ admin_service_db │
└─────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│account_service_db│  │  loan_support_db │
└──────────────────┘  └──────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Programming language |
| Spring Boot | 3.3.0 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | Database ORM |
| Spring Cloud Eureka | 4.x | Service discovery |
| JWT (jjwt) | 0.11.5 | Token generation & validation |
| MySQL | 8.0 | Relational database |
| RestTemplate | Built-in | Inter-service communication |
| Lombok | Latest | Boilerplate reduction |
| BCrypt | Built-in | Password encryption |
| Maven | 3.x | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| Axios | Latest | HTTP client |
| React Router | v6 | Client-side routing |
| Recharts | Latest | Charts & graphs |
| React Toastify | Latest | Toast notifications |
| jwt-decode | Latest | Token decoding |
| Formik + Yup | Latest | Form handling & validation |

---

## 🔧 Microservices

### 1. 🔐 user-service (Port 8081)
Handles all user authentication and profile management.

**Responsibilities:**
- User registration and login
- JWT token generation
- Profile management
- Password management (change + admin reset)
- Account activation/deactivation
- Login attempt tracking (max 5 attempts)
- Auto account lock after failed attempts

**Database:** `user_service_db`

**Key Tables:**
```
users:
  id, email, password (bcrypt), role,
  username, active, failed_attempts,
  account_locked, locked_at
```

---

### 2. 🛡️ admin-service (Port 8060)
Central admin management hub that orchestrates all other services.

**Responsibilities:**
- Admin registration with secret code
- Admin authentication (password + secret code)
- User management (activate/deactivate/delete/reset password)
- Account management overview
- Loan approval and denial
- Transaction limit configuration
- Audit log tracking for ALL admin actions

**Database:** `admin_service_db`

**Key Tables:**
```
admins:
  id, name, email, password (bcrypt),
  secret_code (bcrypt), role

audit_logs:
  id, admin_id, admin_email, action,
  target_type, target_id, details, timestamp
```

**Audit Actions Tracked:**
| Action | Trigger |
|---|---|
| `ADMIN_LOGIN` | Admin logs in |
| `USER_ACTIVATED` | User account activated |
| `USER_DEACTIVATED` | User account deactivated |
| `USER_DELETED` | User permanently deleted |
| `PASSWORD_RESET` | Admin resets user password |
| `PIN_RESET` | Admin resets transaction PIN |
| `LOAN_APPROVED` | Loan application approved |
| `LOAN_DENIED` | Loan application denied |
| `LIMIT_UPDATED` | Transaction limits changed |

---

### 3. 💰 account-service (Port 8070)
Manages all banking operations including accounts, transactions, and investments.

**Responsibilities:**
- Bank account creation with auto-generated account number
- Transaction PIN setup, change, and admin reset
- Deposits with PIN verification and limit check
- Withdrawals with PIN verification and limit check
- Fund transfers using account number (MYFIN format)
- Loan credit crediting (no PIN — system operation)
- Investment management (FD, RD, Mutual Fund)
- Transaction history (both sent and received)
- Mini statement (last 5 transactions)
- Transaction limit enforcement

**Database:** `account_service_db`

**Key Tables:**
```
accounts:
  id, user_id, balance, account_number,
  pin (bcrypt), pin_set, created_at

transactions:
  id, from_account, to_account, amount,
  type, transaction_id (UUID), timestamp

investments:
  id, user_id, type, amount, duration

transaction_limits:
  id, user_id (null=global), max_deposit,
  max_withdrawal, max_transfer,
  updated_at, updated_by
```

**Account Number Format:**
```
MYFIN + 10 digits
Example: MYFIN1234567890
```

**Transaction Types:**
```
DEPOSIT     → Money added to account
WITHDRAW    → Money removed from account
TRANSFER    → Money moved between accounts
LOAN_CREDIT → Loan amount credited (no PIN)
```

---

### 4. 🏦 loan-support-service (Port 8090)
Manages loans, EMI calculations, support chat, and notifications.

**Responsibilities:**
- Loan application with full applicant details
- EMI calculation using standard formula
- Loan status timeline tracking
- Automatic loan amount crediting on approval
- Auto-reply chat support (15+ keywords)
- Push notifications for loan events
- Notification read/unread management

**Database:** `loan_support_db`

**Key Tables:**
```
loans:
  id, user_id, loan_type, amount, tenure,
  interest_rate, emi, status, applied_at,
  applicant_name, applicant_email, age,
  address, loan_purpose, monthly_income,
  employment_type, verification_question,
  verification_answer

loan_timeline:
  id, loan_id, status, description, timestamp

messages:
  id, sender_id, receiver_id, sender_type,
  content, is_read, sent_at

notifications:
  id, user_id, type, message, is_read, created_at
```

**Loan Status Flow:**
```
PENDING → UNDER_REVIEW → APPROVED / DENIED / CANCELLED
```

**EMI Formula:**
```
R = Annual Rate / 12 / 100
EMI = P × R × (1+R)^N / ((1+R)^N - 1)

Where:
P = Principal amount
R = Monthly interest rate
N = Tenure in months
```

---

### 5. 🌐 eureka-server (Port 8761)
Netflix Eureka service registry — the backbone of service discovery.

**Responsibilities:**
- Service registration on startup
- Service health monitoring
- Load balancing support
- Service name to port resolution

**How It Works:**
```
1. Each service starts
2. Registers with Eureka:
   "I am user-service running on port 8081"
3. When admin-service needs user-service:
   → Asks Eureka: "Where is user-service?"
   → Eureka responds: "Port 8081"
   → admin-service calls port 8081
4. If service goes down:
   → Eureka removes it from registry
   → Other services get updated list
```

---

## 🗄️ Database Design

### Separation of Concerns
Each microservice has its **own dedicated database** — a core microservices principle.

```
┌───────────────────────────────────────────────────────────┐
│                     MySQL Server                           │
│                                                           │
│  ┌─────────────────┐    ┌──────────────────┐             │
│  │ user_service_db │    │ admin_service_db │             │
│  │─────────────────│    │──────────────────│             │
│  │ users           │    │ admins           │             │
│  └─────────────────┘    │ audit_logs       │             │
│                         └──────────────────┘             │
│  ┌──────────────────┐   ┌──────────────────┐             │
│  │account_service_db│   │  loan_support_db │             │
│  │──────────────────│   │──────────────────│             │
│  │ accounts         │   │ loans            │             │
│  │ transactions     │   │ loan_timeline    │             │
│  │ investments      │   │ messages         │             │
│  │ transaction_     │   │ notifications    │             │
│  │ limits           │   └──────────────────┘             │
│  └──────────────────┘                                    │
└───────────────────────────────────────────────────────────┘
```

### Table Auto-Creation
Spring Boot auto-creates all tables using:
```properties
spring.jpa.hibernate.ddl-auto=update
```

---

## 🔐 Security

### JWT Authentication Flow

```
User Login                    Every Request
─────────────                 ─────────────
1. POST /api/auth/login       1. Request arrives at service
2. Validate credentials       2. JwtFilter intercepts
3. Generate JWT token:        3. Extract Bearer token
   - subject: email           4. Validate signature
   - claim: role              5. Check expiration
   - claim: userId            6. Extract email + role
   - expiry: 24 hours         7. Check user.isActive()
4. Return token to            8. Set SecurityContext
   frontend                   9. Allow/Reject request
5. Frontend stores
   in localStorage
```

### JWT Token Structure
```
HEADER.PAYLOAD.SIGNATURE

Payload contains:
{
  "sub": "user@email.com",
  "role": "USER",
  "userId": 1,
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Shared Secret Key
All services use the **same JWT secret key** so tokens generated by one service can be validated by any other service.

```properties
jwt.secret=myfinbanksecretkeymyfinbanksecretkey123456
```

### System JWT (Service-to-Service)
When services call each other, they create **system JWT tokens** to authenticate themselves:

```java
// admin-service calling user-service
String token = jwtUtil.generateToken(
    "admin@myfin.com",  // system identity
    "ADMIN",             // role
    0L                   // system userId
);
headers.set("Authorization", "Bearer " + token);
```

### Security Features
| Feature | Implementation |
|---|---|
| Password Encryption | BCrypt with salt rounds |
| Transaction PIN | 4-digit BCrypt encrypted PIN |
| Admin Secret Code | BCrypt encrypted extra auth layer |
| Login Attempt Limit | Max 5 attempts then auto-lock |
| Account Active Check | Checked on every JWT validation |
| CORS Protection | Whitelist localhost:5173 only |
| CSRF Disabled | Stateless JWT-based auth |
| Session Management | STATELESS — no server sessions |

### Password Security
```
User Password   → BCrypt encoded → stored in users.password
Admin Password  → BCrypt encoded → stored in admins.password
Admin SecretCode→ BCrypt encoded → stored in admins.secret_code
Transaction PIN → BCrypt encoded → stored in accounts.pin
```

---

## ✨ Features

### 👤 User Features
| Feature | Description |
|---|---|
| Registration & Login | Secure auth with JWT |
| Account Creation | Auto-generated MYFIN account number |
| Transaction PIN | 4-digit PIN for all transactions |
| Deposit | Add money with PIN verification |
| Withdraw | Remove money with PIN + balance check |
| Transfer | Send money using account number |
| Transaction History | Full history (sent + received) |
| Mini Statement | Last 5 transactions on dashboard |
| Loan Application | Multi-step form with applicant details |
| EMI Calculator | Real-time EMI calculation |
| Loan Status Timeline | Visual PENDING→APPROVED flow |
| Investments | FD, RD, Mutual Fund options |
| Support Chat | Auto-reply for 15+ keywords |
| Notifications | Real-time loan and account alerts |
| Profile Management | Update username, change password |

### 👨‍💼 Admin Features
| Feature | Description |
|---|---|
| Secure Login | Password + Secret Code verification |
| Dashboard Stats | Users, Accounts, Loans counts |
| User Management | Activate/Deactivate/Delete users |
| Password Reset | Admin can reset user passwords |
| Account Overview | Enriched view with username/email |
| PIN Reset | Admin can reset transaction PINs |
| Transaction Limits | Set max deposit/withdraw/transfer |
| Loan Management | View, approve, deny loan applications |
| Audit Logs | Complete history of all admin actions |
| Multi-Admin Support | Track which admin did what |

### 🤖 Auto-Reply Chat Keywords
| Keyword | Response |
|---|---|
| `hello` / `hi` | Welcome message + available options |
| `balance` | How to check account balance |
| `loan` | Loan status and application info |
| `transfer` | Step-by-step transfer guide |
| `pin` | PIN setup and reset instructions |
| `deposit` | Deposit instructions |
| `withdraw` | Withdrawal instructions |
| `emi` | EMI calculator guide |
| `invest` | Investment options overview |
| `interest` | Current interest rates |
| `fraud` | Urgent fraud alert response |
| `block` | Account block instructions |
| `help` | Full list of available commands |
| anything else | "Customer service will contact you" |

---

## 📡 API Reference

### user-service (8081)
```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 User login
POST   /api/auth/logout                Logout

GET    /api/users/profile/{id}         Get user profile
PUT    /api/users/profile/{id}         Update username only
PUT    /api/users/change-password/{id} Change password
PUT    /api/users/admin-reset-password/{id} Admin reset password
GET    /api/users/account-status/{id}  Check active status
GET    /api/users/all                  Get all users
PUT    /api/users/activate/{id}        Activate user
PUT    /api/users/deactivate/{id}      Deactivate user
DELETE /api/users/{id}                 Delete user
```

### admin-service (8060)
```
POST   /api/admin/register             Register admin
POST   /api/admin/login                Admin login
POST   /api/admin/logout               Logout

GET    /api/admin/logs                 All audit logs
GET    /api/admin/logs/{adminId}       Logs by admin

GET    /api/admin/users/all            All users
GET    /api/admin/users/{id}           One user
PUT    /api/admin/users/activate/{id}  Activate user
PUT    /api/admin/users/deactivate/{id}Deactivate user
DELETE /api/admin/users/{id}           Delete user
PUT    /api/admin/users/reset-password/{id} Reset password

GET    /api/admin/accounts/all         All accounts (enriched)
GET    /api/admin/accounts/{userId}    One account
PUT    /api/admin/accounts/reset-pin/{accountId} Reset PIN
POST   /api/admin/accounts/limits/set  Set transaction limits
GET    /api/admin/accounts/limits/global    Global limits
GET    /api/admin/accounts/limits/user/{id} User limits

GET    /api/admin/loans/all            All loans
GET    /api/admin/loans/pending        Pending loans
PUT    /api/admin/loans/approve/{id}   Approve loan
PUT    /api/admin/loans/deny/{id}      Deny loan
```

### account-service (8070)
```
POST   /api/accounts/create            Create account
GET    /api/accounts/all               All accounts
GET    /api/accounts/{userId}          Account by userId

POST   /api/accounts/set-pin           Set PIN
PUT    /api/accounts/change-pin/{id}   Change PIN
PUT    /api/accounts/reset-pin/{id}    Reset PIN (admin)

POST   /api/accounts/deposit/{id}      Deposit (PIN required)
POST   /api/accounts/withdraw/{id}     Withdraw (PIN required)
POST   /api/accounts/transfer          Transfer (PIN required)
POST   /api/accounts/loan-credit/{id}  Credit loan (system)

GET    /api/accounts/transactions/all        All transactions
GET    /api/accounts/transactions/{accountId} By account
GET    /api/accounts/mini-statement/{accountId} Last 5

POST   /api/accounts/limits/set        Set limits
GET    /api/accounts/limits/global     Global limits
GET    /api/accounts/limits/{userId}   User limits

POST   /api/investments/create         Create investment
GET    /api/investments/all            All investments
```

### loan-support-service (8090)
```
POST   /api/loans/apply                Apply for loan
GET    /api/loans/my/{userId}          User's loans
GET    /api/loans/{loanId}             Loan details
GET    /api/loans/{loanId}/timeline    Loan timeline
DELETE /api/loans/cancel/{loanId}      Cancel loan
GET    /api/loans/all                  All loans (admin)
GET    /api/loans/pending              Pending loans (admin)
PUT    /api/loans/approve/{id}         Approve (admin)
PUT    /api/loans/deny/{id}            Deny (admin)

POST   /api/emi/calculate              Calculate EMI

POST   /api/chat/send                  Send message
GET    /api/chat/{userId}              Chat history
GET    /api/chat/admin/all             All chats (admin)
PUT    /api/chat/read/{messageId}      Mark as read

GET    /api/notifications/user/{userId} User notifications
GET    /api/notifications/admin/all    All notifications
PUT    /api/notifications/read/{id}    Mark as read
PUT    /api/notifications/read-all/{userId} Mark all read
POST   /api/notifications/create       Create notification
```

---

## 🔄 Microservice Communication

### How Services Talk To Each Other

```
Step 1: Service Registers With Eureka
   user-service starts → tells Eureka:
   "I am user-service at port 8081"

Step 2: RestTemplate With @LoadBalanced
   @Bean
   @LoadBalanced
   public RestTemplate restTemplate() {
       return new RestTemplate();
   }
   Now can use: http://user-service (not localhost:8081)

Step 3: System JWT For Trust
   admin-service creates token:
   jwtUtil.generateToken("system@myfin.com", "ADMIN", 0L)
   Puts in Authorization header

Step 4: Receiving Service Validates
   JwtFilter validates token using same secret key
   Sets security context
   Allows request to proceed

Step 5: DTO Carries Data
   User entity stays in user-service
   UserDTO carries only needed data
   Deserialized from JSON response
```

### Example: Admin Approves Loan
```
1. Admin clicks Approve
2. PUT /api/admin/loans/approve/5 → admin-service
3. admin-service creates system JWT
4. Calls: PUT http://loan-support-service/api/loans/approve/5
5. loan-service approves loan
6. loan-service calls: GET http://account-service/api/accounts/{userId}
7. Gets account ID
8. loan-service calls: POST http://account-service/api/accounts/loan-credit/{accountId}
9. Account balance updated ✅
10. Notification sent to user ✅
11. Audit log saved in admin-service ✅
```

---

## 🚀 Getting Started

### Prerequisites
```
✅ Java 21+
✅ Maven 3.8+
✅ MySQL 8.0+
✅ Node.js 18+
✅ npm 9+
```

### Step 1: Database Setup
```sql
-- Run in MySQL
CREATE DATABASE user_service_db;
CREATE DATABASE admin_service_db;
CREATE DATABASE account_service_db;
CREATE DATABASE loan_support_db;
```

### Step 2: Configure application.properties
Update MySQL password in all 4 services:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3: Start Services In Order
```bash
# Terminal 1 — Start Eureka FIRST
cd eureka-server
mvn spring-boot:run

# Wait 10 seconds, then:

# Terminal 2
cd user-service
mvn spring-boot:run

# Terminal 3
cd admin-service
mvn spring-boot:run

# Terminal 4
cd account-service
mvn spring-boot:run

# Terminal 5
cd loan-support-service
mvn spring-boot:run

# Terminal 6 — Frontend LAST
cd myfin-frontend
npm install
npm run dev
```

### Step 4: Verify All Services Running
```
Open: http://localhost:8761
You should see all 4 services registered!
```

### Step 5: Access Application
```
Frontend:  http://localhost:5173
Eureka:    http://localhost:8761
```

---

## 🌍 Environment Variables

### React Frontend — `.env`
```env
VITE_USER_SERVICE_URL=http://localhost:8081
VITE_ADMIN_SERVICE_URL=http://localhost:8060
VITE_ACCOUNT_SERVICE_URL=http://localhost:8070
VITE_LOAN_SERVICE_URL=http://localhost:8090
VITE_ADMIN_SECRET_CODE=MYFIN@ADMIN2024
```

### Each Spring Boot Service — `application.properties`
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/{db_name}
spring.datasource.username=root
spring.datasource.password=yourpassword

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT — MUST BE SAME IN ALL SERVICES!
jwt.secret=myfinbanksecretkeymyfinbanksecretkey123456
jwt.expiration=86400000

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

---

## 📁 Project Structure

```
MyFin-Bank/
│
├── eureka-server/                    # Service Discovery
│   └── src/main/
│       ├── EurekaServerApplication.java
│       └── resources/application.properties
│
├── user-service/                     # Auth + Users
│   └── src/main/java/com/myfin/userservice/
│       ├── config/
│       │   ├── JwtFilter.java        # JWT validation filter
│       │   ├── JwtUtil.java          # JWT generation/extraction
│       │   └── SecurityConfig.java   # Spring Security config
│       ├── controller/
│       │   ├── AuthController.java   # Register/Login endpoints
│       │   └── UserController.java   # Profile management
│       ├── dto/
│       │   ├── AuthResponse.java     # Login response
│       │   ├── LoginRequest.java     # Login input
│       │   └── RegisterRequest.java  # Register input
│       ├── entity/
│       │   └── User.java             # Users DB table
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   └── UserNotFoundException.java
│       ├── repository/
│       │   └── UserRepository.java
│       └── service/
│           └── UserService.java      # Business logic
│
├── admin-service/                    # Admin Operations
│   └── src/main/java/com/myfin/adminservice/
│       ├── config/
│       │   ├── JwtFilter.java
│       │   ├── JwtUtil.java
│       │   ├── RestTemplateConfig.java # @LoadBalanced bean
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   └── AdminController.java  # All admin endpoints
│       ├── dto/
│       │   ├── AccountDTO.java
│       │   ├── AdminLoginRequest.java
│       │   ├── AdminRegisterRequest.java
│       │   ├── AuthResponse.java
│       │   ├── EnrichedAccountDTO.java # Account + User data
│       │   ├── LoanDTO.java
│       │   ├── TransactionLimitRequest.java
│       │   └── UserDTO.java
│       ├── entity/
│       │   ├── Admin.java            # Admins DB table
│       │   └── AuditLog.java         # Audit logs DB table
│       ├── exception/
│       │   ├── AdminNotFoundException.java
│       │   └── GlobalExceptionHandler.java
│       ├── repository/
│       │   ├── AdminRepository.java
│       │   └── AuditLogRepository.java
│       └── service/
│           └── AdminService.java     # Business + inter-service logic
│
├── account-service/                  # Banking Operations
│   └── src/main/java/com/myfin/accountservice/
│       ├── config/
│       │   ├── JwtFilter.java
│       │   ├── JwtUtil.java
│       │   ├── RestTemplateConfig.java
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   ├── AccountController.java  # Account + transaction endpoints
│       │   └── InvestmentController.java
│       ├── dto/
│       │   ├── PinRequest.java
│       │   ├── TransactionLimitRequest.java
│       │   └── TransferRequest.java
│       ├── entity/
│       │   ├── Account.java
│       │   ├── Investment.java
│       │   ├── Transaction.java
│       │   └── TransactionLimit.java
│       ├── exception/
│       │   ├── AccountNotFoundException.java
│       │   └── GlobalExceptionHandler.java
│       ├── repository/
│       │   ├── AccountRepository.java
│       │   ├── InvestmentRepository.java
│       │   ├── TransactionLimitRepository.java
│       │   └── TransactionRepository.java
│       └── service/
│           ├── AccountService.java
│           └── InvestmentService.java
│
├── loan-support-service/             # Loans + Chat
│   └── src/main/java/com/myfin/loanservice/
│       ├── config/
│       │   ├── JwtUtil.java
│       │   ├── RestTemplateConfig.java
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   ├── ChatController.java
│       │   ├── EmiController.java
│       │   ├── LoanController.java
│       │   └── NotificationController.java
│       ├── dto/
│       │   ├── AccountDTO.java
│       │   ├── ChatRequest/Response.java
│       │   ├── EmiRequest/Response.java
│       │   ├── LoanRequest/Response.java
│       │   └── LoanTimelineResponse.java
│       ├── entity/
│       │   ├── Loan.java
│       │   ├── LoanTimeline.java
│       │   ├── Message.java
│       │   └── Notification.java
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   ├── LoanAlreadyExistsException.java
│       │   └── LoanNotFoundException.java
│       ├── filter/
│       │   └── JwtAuthFilter.java
│       ├── repository/
│       │   ├── LoanRepository.java
│       │   ├── LoanTimelineRepository.java
│       │   ├── MessageRepository.java
│       │   └── NotificationRepository.java
│       └── service/
│           ├── AutoReplyService.java   # Chat auto-replies
│           ├── ChatServiceImpl.java
│           ├── EmiServiceImpl.java
│           ├── LoanServiceImpl.java
│           └── NotificationServiceImpl.java
│
└── myfin-frontend/                   # React Application
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axiosConfig.js        # 4 axios instances + interceptors
    │   ├── components/
    │   │   ├── ui/                   # Reusable component library
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── AdminRoute.jsx
    │   │   └── Layout.jsx            # Sidebar + navbar
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global auth state
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── auth/                 # Login, Register, AdminLogin
    │   │   ├── user/                 # Dashboard, Transfer, Loans etc.
    │   │   └── admin/                # Admin panel pages
    │   └── App.jsx                   # Routes configuration
    ├── .env                          # Service URLs
    └── package.json
```

---

## 🔗 Inter-Service Communication Summary

| Caller | Called | Purpose |
|---|---|---|
| admin-service | user-service | Get/manage users |
| admin-service | account-service | Get accounts, set limits, reset PIN |
| admin-service | loan-service | Get/approve/deny loans |
| loan-service | account-service | Credit loan amount on approval |

---

## 👥 User Roles

| Role | Access |
|---|---|
| `USER` | Dashboard, transactions, loans, chat, investments, profile |
| `ADMIN` | All user features + admin panel, audit logs, user/loan/account management |

---

## 📊 Loan Interest Rates

| Loan Type | Interest Rate |
|---|---|
| Home Loan | 8.5% per annum |
| Personal Loan | 12.0% per annum |
| Car Loan | 10.5% per annum |
| Education Loan | 9.0% per annum |

---

## 🔒 Default Transaction Limits

| Transaction Type | Default Limit |
|---|---|
| Maximum Deposit | ₹1,00,000 per transaction |
| Maximum Withdrawal | ₹50,000 per transaction |
| Maximum Transfer | ₹25,000 per transaction |

> Admin can change these limits globally or per user from the admin panel.

---

## 📞 Support

```
Email:   utkarshr1405@gmail.com
```

---

## 📄 License

This project is built as a **capstone project** for educational purposes.

---

*© 2026 MyFin Bank. All rights reserved. Made with ❤️ by Utkarsh Roy*
