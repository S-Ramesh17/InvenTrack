# InvenTrack — AI-Powered Smart Inventory & Warehouse Management Platform

A full-stack MERN web application for managing inventory, products, warehouses, and stock movements — with rule-based AI recommendations and Google Gemini AI insights.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router DOM, Axios, Plain CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | bcryptjs (no JWT) |
| AI | Rule-Based Logic + Google Gemini API |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Project Structure

```
inventory-management/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js  # User auth state (localStorage)
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Inventory.js
│   │   │   ├── Reports.js
│   │   │   └── AIInsights.js
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── Sidebar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── reportsService.js
│   │   │   └── aiService.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── server/                     # Express backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── StockMovement.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── inventoryController.js
│   │   ├── reportsController.js
│   │   └── aiController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── inventory.js
│   │   ├── reports.js
│   │   └── ai.js
│   ├── middleware/
│   │   └── auth.js
│   ├── db.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Default Users

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | 1234 |
| Staff | staff@test.com | 1234 |

These are auto-created on server startup if they don't exist.

---

## User Roles

### Admin
- Login, manage products (add/edit/delete)
- View inventory, stock movements
- Access reports and AI insights
- View all stock analytics

### Staff
- Login, register
- View products and inventory
- Update stock (IN/OUT)
- View dashboard summary

---

## AI Features

### Rule-Based (No External API)
| Stock Condition | Status |
|---|---|
| Stock = 0 | Out Of Stock |
| Stock < Minimum Stock | Critical |
| Stock < Minimum Stock + 20 | Low |
| Otherwise | Healthy |

**Auto Reorder:**
- Stock < Min → Restock 100 Units
- Stock < Min + 20 → Restock 50 Units
- Otherwise → No Action Required

**Fast Moving:** Monthly Sales > 100 = Fast Moving Product

### Gemini AI Insights
Click "AI Insight" on any product to get:
1. Inventory Health assessment
2. Risk Level (Low/Medium/High/Critical)
3. Suggested Reorder Quantity
4. Improvement Suggestions

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/inventory-db
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env
```

Edit `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm start
```

Visit: `http://localhost:3000`

---

## 📦 Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node index.js`
6. Add Environment Variables:
   - `MONGO_URI` = your MongoDB Atlas URI
   - `GEMINI_API_KEY` = your Gemini API key
   - `CLIENT_URL` = your Vercel frontend URL
   - `PORT` = 5000

### Frontend → Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `client`
4. Set **Framework Preset** to `Create React App`
5. Add Environment Variables:
   - `REACT_APP_API_URL` = your Render backend URL (e.g., `https://your-app.onrender.com`)
6. Deploy!
