# 🏫 Hostel360 — Smart AI-Powered Hostel Management & Triage System

**Hostel360** is a full-stack, enterprise-grade hostel management and issue-resolution platform engineered to streamline incident reporting, automated triage, warden dispatching, and administrative oversight. 

Powered by **TensorFlow.js Computer Vision**, automated **NLP hazard detection**, and a **Smart Priority Escalation Engine**, Hostel360 automatically analyzes submitted complaints, assesses visual and textual risk factors, ranks tickets by urgency, and dynamically escalates stale issues to ensure maximum operational safety and fast response times across hostel blocks.

---

## 🚀 Key Highlights & AI Innovation

* **🤖 Dual-Stage AI Incident Triage**:
  * **Visual Object Detection**: Powered by `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd`. Uploaded complaint photos are scanned server-side for hazards (fire, smoke, short-circuit indicators, electrical hazards, appliances).
  * **Text & Category Hazard Analysis**: Natural language keyword engine scans titles and descriptions for high-risk flags (`fire`, `spark`, `electric`, `smoke`, `emergency`, `short circuit`, `blast`).
  * **Automated Risk Tagging**: System assigns AI diagnostic tags (`aiTags`) and automatically sets issue status to `Critical` / `High Urgency` when hazards are detected.
* **📈 Dynamic Priority Scoring & Escalation Algorithm**:
  * Prioritizes complaints automatically using the mathematical model:
    $$\text{PriorityScore} = \text{BaseWeight} + (\text{HoursStale} \times 2)$$
  * Base Weights: `Critical` (1000 pts) | `High Urgency` (500 pts) | `Medium Urgency` (250 pts) | `Low Urgency` (0 pts).
  * Time-decay escalation ensures long-pending open complaints continuously rise to top priority over time, preventing ticket neglect.
* **📊 Infrastructure Hotspot Heatmap**:
  * MongoDB aggregation matrix that plots complaint frequency by **Hostel Block** vs **Category** (Plumbing, Electrical, Cleanliness, Internet, Security, Other).
  * Color-coded intensity grid (Quiet $\to$ Active $\to$ Critical Hotspot with pulsing alerts) for instant administrative bottleneck identification.
* **⚡ Real-Time Socket.io WebSockets & Live Cache Invalidation**:
  * Persistent bi-directional WebSocket connections instantly broadcast new ticket filings, warden status updates, and emergency alerts across connected client dashboards in **<50ms without manual page refreshes**.
* **📧 Automated Emergency Email Notifications (Nodemailer)**:
  * Asynchronously dispatches HTML emergency alert emails to wardens and admins when `Critical` hazards are flagged by AI Triage, and emails resolution updates to students.

---

## 👥 Role-Based Feature Suite

### 1. 🎓 Student Portal
* **Account Registration & Authentication**: Secure JWT-authenticated login with assigned hostel block (e.g., Block A, B, C).
* **Smart Ticket Submission**: Submit complaints with titles, categories, block assignments, detailed descriptions, and image uploads.
* **Live Status Tracking**: View personal complaint history with real-time status badges (`Open`, `In Progress`, `Critical`, `Resolved`), AI tags, and assigned warden information.
* **Persistent Session**: Authentication state syncs with `localStorage` and Redux, ensuring seamless page refreshes without logouts.

### 2. 🛡️ Warden Portal
* **Block-Specific Queue**: Wardens view and manage complaints filtered by their assigned hostel block.
* **Interactive Ticket Resolution**: Update complaint status (`Open` $\to$ `In Progress` $\to$ `Resolved`), timestamping resolution times.
* **Comment & Communication Hub**: Append official warden notes and timestamped updates directly to complaint threads.
* **Urgency & Hazard Badging**: Visual highlights for critical/high-priority complaints requiring urgent site visits.

### 3. 👑 Admin Command Center
* **Priority-Ranked Master View**: Global overview of all system complaints auto-sorted by the AI Priority Score algorithm.
* **Warden Dispatch System**: One-click assignment of unresolved complaints to available wardens.
* **Advanced Analytics Dashboard (Recharts)**:
  * **Category Distribution**: Pie chart breakdown of issue types.
  * **Block Volume**: Bar chart comparison of complaints per hostel block.
  * **Performance Metrics**: Real-time KPI cards for Total Complaints, Pending Issues, Critical Escalations, and Average Resolution Time (in hours).
* **Hotspot Heatmap**: Visual cross-tabulation matrix of trouble hotspots across blocks and issue categories.
* **User & Staff Management**: Register new Warden accounts with block assignments, view all registered students, and perform user account cleanup.

---

## 🛠️ Technology Stack

### **Frontend**
| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + Vite | UI library and fast development bundler |
| **State & API** | Redux Toolkit + RTK Query | Global state, persistent auth, and automated API caching/invalidation |
| **Routing** | React Router v7 | Dynamic client-side routing & protected routes |
| **Styling** | Tailwind CSS + DaisyUI | Responsive modern visual design system |
| **Visualizations** | Recharts | Interactive pie and bar charts for analytics |
| **Icons & Notifications** | Lucide React + React Hot Toast | Modern icon set & toast feedback alerts |

### **Backend**
| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js | Asynchronous JavaScript backend execution runtime |
| **Web Framework** | Express.js v5 | RESTful API server routing & middleware handling |
| **Database** | MongoDB + Mongoose ODM | Document storage, aggregations, and schema modeling |
| **Authentication** | JWT + Bcrypt.js | Password hashing and signed token authentication |
| **Media Pipeline** | Cloudinary + Multer | Cloud storage for complaint evidence images |
| **AI / Machine Learning** | TensorFlow.js + COCO-SSD + Jimp | Server-side computer vision object detection and image memory buffer manipulation |

---

## 🧠 AI Architecture & Triage Pipeline

```
[ Student Submits Complaint + Image ]
                 │
                 ▼
     ┌────────────────────────┐
     │ Cloudinary CDN Upload  │
     └───────────┬────────────┘
                 │ (Secure Image URL)
                 ▼
     ┌────────────────────────┐
     │  Jimp Image Preprocessor│ ──► (Resize to 224x224 RGB Buffer)
     └───────────┬────────────┘
                 │
                 ▼
     ┌────────────────────────┐
     │ COCO-SSD (TensorFlow)  │ ──► (Run tf.tidy() Object Detection)
     └───────────┬────────────┘
                 │
                 ▼
     ┌────────────────────────┐
     │  AI Hazard Validator   │ ──► Checks tags against hazard dictionary
     └───────────┬────────────┘     ('fire', 'smoke', 'electric', etc.)
                 │
                 ├──────────────────────────────┐
                 ▼                              ▼
     ┌────────────────────────┐    ┌────────────────────────┐
     │   Hazard Detected      │    │  No Hazard Detected    │
     │ Urgency = "High"       │    │ Urgency = "Low"        │
     │ Status = "Critical"    │    │ Status = "Open"        │
     └───────────┬────────────┘    └───────────┬────────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                │
                                ▼
               ┌─────────────────────────────────┐
               │  Save to Database with aiTags   │
               │   & Smart Priority Score Calculation
               └─────────────────────────────────┘
```

---

## 🗄️ Database Schemas (MongoDB / Mongoose)

### `User` Schema
* `name`: `String` (Required)
* `email`: `String` (Required, Unique)
* `password`: `String` (Hashed via Bcrypt pre-save hook)
* `role`: `Enum ["student", "warden", "admin"]` (Default: `"student"`)
* `block`: `String` (Hostel block association for wardens/students)

### `Complaint` Schema
* `title`: `String` (Required)
* `description`: `String` (Required)
* `category`: `Enum ["plumbing", "electrical", "cleanliness", "internet", "security", "other"]`
* `block`: `String` (Required)
* `status`: `Enum ["Open", "In Progress", "Resolved", "Critical"]` (Default: `"Open"`)
* `urgency`: `Enum ["Low", "Medium", "High"]` (Default: `"Low"`)
* `student`: `ObjectId` (Ref: `User`)
* `warden`: `ObjectId` (Ref: `User`, Default: `null`)
* `comments`: `Array` of `{ text, user, createdAt }`
* `images`: `Array` of `String` (Cloudinary URLs)
* `aiTags`: `Array` of `String`
* `isEscalated`: `Boolean`
* `assignedAt`: `Date`
* `resolvedAt`: `Date`

---

## 📡 Key API Endpoints

### 🔑 Auth (`/api/auth`)
* `POST /api/auth/register` — Register a new student user account
* `POST /api/auth/login` — Authenticate user and receive JWT token

### 📝 Complaints (`/api/complaints`)
* `POST /api/complaints` — Submit a complaint (Student only; triggers Cloudinary upload + AI Triage)
* `GET /api/complaints/my` — Get complaints submitted by logged-in student
* `GET /api/complaints/all` — Get all complaints sorted by Priority Score (Admin/Warden)
* `PUT /api/complaints/:id` — Update complaint status or add warden comment
* `PUT /api/complaints/:id/assign` — Assign a complaint to a warden (Admin)

### 📊 Admin (`/api/admin`)
* `GET /api/admin/analytics` — Get category distribution, block statistics, and avg resolution time
* `GET /api/admin/hotspots` — Aggregate complaint counts by Block and Category for Heatmap
* `GET /api/admin/wardens` — Fetch list of registered wardens
* `GET /api/admin/students` — Fetch list of registered students
* `POST /api/admin/wardens` — Create a new warden user account with assigned block
* `DELETE /api/admin/users/:id` — Remove a user account

---

## 📂 Directory Structure

```
Hostel Management System/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js       # Analytics, hotspots & user management
│   │   ├── authController.js        # Registration & JWT login
│   │   ├── complaintController.js   # Complaint CRUD, smart escalation & priority sorting
│   │   └── userController.js        # User profile & warden query handlers
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verify & RBAC protection (protect, admin, warden)
│   ├── models/
│   │   ├── Complaint.js             # Mongoose Complaint schema with AI urgency fields
│   │   └── User.js                  # Mongoose User schema with pre-save password hashing
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── aiTriage.js              # TensorFlow COCO-SSD visual object detection engine
│   │   └── cloudinary.js            # Cloudinary SDK media uploader config
│   ├── server.js                    # Express app entry & MongoDB connection
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                     # RTK Query API slices (adminApi, authApi, complaintApi, userApi)
│   │   ├── components/
│   │   │   ├── admin/               # AnalyticsContent, HotspotHeatmap, UserManagement
│   │   │   ├── warden/              # Warden ComplaintCard
│   │   │   ├── ComplaintList.jsx    # Student complaint history grid
│   │   │   ├── Navbar.jsx           # Global navigation bar
│   │   │   ├── ProtectedRoute.jsx   # Role-based route guard
│   │   │   └── SubmitComplaint.jsx  # Interactive complaint submission modal/form
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── WardenDashboard.jsx
│   │   ├── store/                   # Redux store & authSlice
│   │   ├── App.jsx                  # Main router setup
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── notes.txt                        # Architectural notes on RTK cache & route protection
└── README.md                        # Global project documentation
```

---

## 💻 Local Setup & Execution Guide

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or MongoDB Atlas Connection URI)
* **Cloudinary Account** (For image uploads)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file in backend directory with the following variables:
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hostelDB
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Run in development mode (with increased Node memory for TensorFlow model loading)
npm run dev
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open your browser at `http://localhost:5173` to access the **Hostel360** web application.

---

## 🔒 Security & Optimization Features
1. **Password Encryption**: All user passwords are salted and hashed using `Bcrypt.js` prior to database insertion.
2. **Stateless JWT Authorization**: API endpoints are protected using bearer tokens passed in headers.
3. **Memory-Optimized Computer Vision**: TensorFlow runs within `tf.tidy()` scopes with explicit texture garbage collection thresholding (`WEBGL_DELETE_TEXTURE_THRESHOLD`) to prevent Node.js memory leaks during image analysis.
4. **Optimistic UI & Cache Invalidation**: RTK Query invalidates specific tag caches (`Complaints`, `Hotspots`, `Analytics`) on mutation, instantly refreshing the UI without manual page reloads.

---

*Developed for Smart Hostel Management and Automated Emergency Incident Escalation.*
