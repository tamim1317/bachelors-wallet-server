# 💰 Bachelor's Wallet

> **বাংলাদেশের ব্যাচেলরদের জন্য সম্পূর্ণ মেস ও ফিন্যান্স ম্যানেজমেন্ট সিস্টেম**

![Bachelor's Wallet](https://img.shields.io/badge/Bachelor's-Wallet-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)

---

## 🌍 Live Demo

| | Link |
|---|---|
| 🌐 **Live App** | [bachelors-wallet-client.vercel.app](https://bachelors-wallet-client.vercel.app) |
| 🔧 **API Server** | [bachelors-wallet-server.onrender.com](https://bachelors-wallet-server.onrender.com) |
| 📦 **Client Repo** | [github.com/.../bachelors-wallet-client](https://github.com) |
| ⚙️ **Server Repo** | [github.com/.../bachelors-wallet-server](https://github.com) |

### 🔑 Demo Credentials
```
Demo এ সরাসরি member যোগ করে use করুন
কোনো login দরকার নেই (V1)
```

---

## ✨ Features

### 🏠 Mess Management
- ✅ Member add, edit, remove
- ✅ Daily meal tracking (সকাল / দুপুর / রাত)
- ✅ Guest meal tracking
- ✅ Auto meal rate calculation
- ✅ Monthly bill generation
- ✅ Payment tracking

### 💰 Personal Finance
- ✅ Income tracking (টিউশনি, চাকরি, বাবার কাছ থেকে)
- ✅ Mess expense tracking
- ✅ Personal expense tracking (রুম ভাড়া, transport, শপিং)
- ✅ Savings calculation
- ✅ Budget progress bar

### 📊 Analytics & Reports
- ✅ Pro Dashboard with animated counters
- ✅ 6-month spending trend (Area Chart)
- ✅ Category breakdown (Pie Chart)
- ✅ Personal expense analysis (Bar Chart)
- ✅ Income vs Expense comparison
- ✅ PDF Bill download (professional invoice)

### 🎨 UI/UX
- ✅ Dark Mode (system preference auto-detect)
- ✅ Mobile-first responsive design
- ✅ PWA (installable as app)
- ✅ Daily meal reminder notification
- ✅ Smooth animations & transitions
- ✅ Bengali language support

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI Framework |
| Vite | 4.4 | Build Tool |
| Tailwind CSS | 3.3 | Styling |
| React Router | 6.14 | Routing |
| Recharts | 2.7 | Charts |
| Axios | 1.4 | HTTP Client |
| jsPDF | latest | PDF Generation |
| react-hot-toast | 2.4 | Notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.18 | Web Framework |
| MongoDB | 7.3 | Database |
| Mongoose | 7.3 | ODM |
| dotenv | 16 | Environment Variables |
| cors | 2.8 | Cross-Origin |
| nodemon | 3.0 | Dev Server |

### Deployment
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud Database |
| Render.com | Backend Hosting |
| Vercel | Frontend Hosting |
| GitHub | Version Control |

---

## 📁 Project Structure

```
bachelors-wallet-server/
├── 📁 models/
│   ├── Member.js          # Member schema
│   ├── Meal.js            # Daily meal tracking
│   ├── Expense.js         # Mess & personal expenses
│   ├── MonthlyBill.js     # Monthly bill calculation
│   └── Income.js          # Income tracking
├── 📁 controllers/
│   ├── memberController.js
│   ├── mealController.js
│   ├── expenseController.js
│   ├── billController.js
│   └── incomeController.js
├── 📁 routes/
│   ├── memberRoutes.js
│   ├── mealRoutes.js
│   ├── expenseRoutes.js
│   ├── billRoutes.js
│   └── incomeRoutes.js
├── .env.example
└── server.js

bachelors-wallet-client/
├── 📁 public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service Worker
│   ├── icon-192.png
│   └── icon-512.png
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── DashboardPage.jsx  # Pro dashboard + charts
│   │   ├── MembersPage.jsx    # Member management
│   │   ├── MealsPage.jsx      # Daily meal entry
│   │   ├── ExpensesPage.jsx   # Expense tracking
│   │   ├── BillsPage.jsx      # Bill generator + PDF
│   │   └── IncomePage.jsx     # Income tracking
│   ├── 📁 context/
│   │   └── ThemeContext.jsx   # Dark mode context
│   └── 📁 utils/
│       ├── api.js             # All API calls
│       ├── generatePDF.js     # PDF generation
│       └── pwa.js             # PWA utilities
└── vercel.json
```

---

## 📡 API Documentation

### Base URL
```
Production: https://bachelors-wallet-server.onrender.com/api
Local:      http://localhost:5000/api
```

### Members API
```http
GET    /api/members          # সব active member
POST   /api/members          # নতুন member যোগ
PUT    /api/members/:id      # member update
DELETE /api/members/:id      # member remove (soft delete)
```

**POST /api/members** Request Body:
```json
{
  "name": "রাহিম",
  "room": "201",
  "phone": "01712345678"
}
```

### Meals API
```http
GET  /api/meals/date/:date         # একদিনের meal
POST /api/meals/entry              # meal entry/update
GET  /api/meals/summary/:year/:month  # মাসের summary
```

**POST /api/meals/entry** Request Body:
```json
{
  "memberId": "64abc...",
  "date": "2026-06-01",
  "breakfast": true,
  "lunch": true,
  "dinner": false,
  "guestMeals": 0
}
```

### Expenses API
```http
GET    /api/expenses              # expense list (filter সহ)
POST   /api/expenses              # নতুন expense
DELETE /api/expenses/:id          # expense delete
GET    /api/expenses/mess/:year/:month  # mess summary
```

**GET /api/expenses** Query Params:
```
?type=mess&month=6&year=2026
?type=personal&month=6&year=2026
```

**POST /api/expenses** Request Body:
```json
{
  "type": "mess",
  "category": "বাজার",
  "amount": 1500,
  "date": "2026-06-01",
  "note": "মাছ, সবজি"
}
```

### Bills API
```http
POST  /api/bills/generate/:year/:month  # bill generate
GET   /api/bills/:year/:month           # মাসের bills
PATCH /api/bills/pay/:id                # payment mark
```

### Income API
```http
GET    /api/income                  # income list
POST   /api/income                  # নতুন income
DELETE /api/income/:id              # income delete
GET    /api/income/summary/:month   # monthly summary
```

**POST /api/income** Request Body:
```json
{
  "source": "টিউশনি",
  "amount": 5000,
  "month": "2026-06",
  "date": "2026-06-01",
  "note": "জুনের বেতন"
}
```

---

## 🍛 Meal Rate Formula

```
মিল রেট = মোট mess খরচ ÷ মোট mess মিল সংখ্যা
একজনের বিল = তার মোট মিল × মিল রেট
```

**Example:**
```
মোট বাজার খরচ = ৳12,000
মোট মিল = 300
মিল রেট = 12000 ÷ 300 = ৳40 per meal

রাহিম এর মিল = 90
রাহিম এর বিল = 90 × 40 = ৳3,600
```

---

## 🚀 Local Setup

### Prerequisites
```
Node.js v18+
MongoDB Atlas account
```

### Installation

**1. Clone করো:**
```bash
git clone https://github.com/username/bachelors-wallet-server.git
git clone https://github.com/username/bachelors-wallet-client.git
```

**2. Server setup:**
```bash
cd bachelors-wallet-server
npm install
cp .env.example .env
# .env এ MongoDB URI বসাও
npm run dev
```

**3. Client setup:**
```bash
cd bachelors-wallet-client
npm install
npm run dev
```

**4. Browser এ যাও:**
```
http://localhost:3000
```

---

## 🔮 Upcoming Features

- [ ] Settlement System (কে কাকে কত দেবে)
- [ ] Multi-Mess Support
- [ ] Excel Export
- [ ] Push Notifications (FCM)
- [ ] Room Allocation
- [ ] Notice Board
- [ ] Expense Prediction
- [ ] Budget Alerts
- [ ] Admin Analytics
- [ ] Android App (Capacitor)

---

## 👨‍💻 Developer

**Made with ❤️ for Bangladeshi Bachelors**

> এই project টি বাংলাদেশের লক্ষ লক্ষ ব্যাচেলর student এবং কর্মজীবী মানুষের 
> মেস ও ফিন্যান্স ম্যানেজমেন্টের সমস্যা সমাধানের জন্য তৈরি করা হয়েছে।

---

## 📄 License

MIT License — feel free to use and modify!

---

⭐ **যদি এই project টি ভালো লাগে, GitHub এ Star দিতে ভুলো না!**