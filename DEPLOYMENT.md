# Deployment Guide for Everblue (Ancient Spirit)

This guide walks you through deploying your **Frontend (React)** to Vercel and your **Backend (Node.js/Express)** to Render (free tier), using MongoDB Atlas for your database. It also covers connecting your custom domain `anjali.net.in`.

---

## 1. Prerequisites

Run the following commands in your terminal to create the necessary configuration files for deployment.

### Backend Config (`render.yaml`)
Create a file named `render.yaml` in the root directory if you want to automate Render deployment, or you can configure it manually on the dashboard.

### Frontend Config (`vercel.json`)
Create a `vercel.json` file in the root directory to handle client-side routing.
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 2. Database: MongoDB Atlas (Free)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2.  Create a **New Project**.
3.  Create a **Deployment** -> choose **M0 Sandbox** (Free Tier).
4.  **Security Quickstart**:
    *   Create a database user (username/password). **Save these!**
    *   Add your IP address to the whitelist (or `0.0.0.0/0` to allow access from anywhere, required for Render).
5.  **Connect**:
    *   Choose "Drivers" -> "Node.js".
    *   Copy the connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).

---

## 3. Backend Deployment: Render (Free)

1.  Push your code to **GitHub**.
2.  Go to [Render](https://render.com) and sign up.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Configuration**:
    *   **Name**: `everblue-backend`
    *   **Region**: Closest to you (e.g., Singapore).
    *   **Root Directory**: `server` (Important!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
    *   **Instance Type**: Free
6.  **Environment Variables** (Advanced):
    *   `MONGO_URI`: Paste your MongoDB connection string here.
    *   `PORT`: `10000` (Render default).
7.  Click **Create Web Service**.
8.  Wait for it to deploy. Copy the **Service URL** (e.g., `https://everblue-backend.onrender.com`).

---

## 4. Frontend Deployment: Vercel (Free)

1.  Go to [Vercel](https://vercel.com) and sign up.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Leave as `./` (default).
    *   **Build Command**: `vite build` (default).
    *   **Output Directory**: `dist` (default).
5.  **Environment Variables**:
    *   **Name**: `VITE_API_URL`
    *   **Value**: The **Backend Service URL** from step 3 (NO trailing slash, e.g., `https://everblue-backend.onrender.com`).
6.  Click **Deploy**.

---

## 5. Connect Custom Domain (`anjali.net.in`)

1.  In your **Vercel Project Dashboard**:
2.  Go to **Settings** -> **Domains**.
3.  Enter `anjali.net.in` and click **Add**.
4.  Vercel will show you DNS records (A Record and CNAME).
5.  **Update DNS Provider**:
    *   Log in to where you bought your domain (GoDaddy, Namecheap, etc.).
    *   Go to **DNS Management**.
    *   Add/Edit the records as shown by Vercel.
        *   **A Record**: `@` points to `76.76.21.21` (example, check Vercel).
        *   **CNAME**: `www` points to `cname.vercel-dns.com`.
6.  Wait for propagation (can take up to 24h, but usually minutes).

---

## Summary of Changes Made
*   **Refactored Code**: All hardcoded `http://localhost:5000` URLs are now replaced with a dynamic configuration that reads `VITE_API_URL`.
*   **Config File**: Created `src/config.js` to manage this centrally.
