# AWS Deployment Guide for Everblue (S3 + CloudFront + EC2)

This guide details your requested architecture:
*   **Frontend**: S3 Bucket (Storage) + CloudFront (CDN).
*   **Backend**: EC2 Instance.
*   **Database**: MongoDB Atlas.

---

## Phase 1: Deploy Backend (EC2)
*We do this FIRST because the Frontend needs the Backend URL to be built.*

1.  **Launch Instance**:
    *   Go to **EC2 Dashboard** -> **Launch Instance**.
    *   **Name**: `everblue-server`
    *   **OS**: Ubuntu Server 24.04 LTS.
    *   **Instance Type**: `t2.micro` (Free Tier).
    *   **Key Pair**: Create/Download `.pem` key.
    *   **Security Group**: Open Ports 22 (SSH), 80 (HTTP), 443 (HTTPS), and **5000** (Custom TCP).
2.  **Connect & Setup**:
    *   SSH into your instance: `ssh -i "key.pem" ubuntu@<PUBLIC_IP>`
    *   Install Node/Git:
        ```bash
        sudo apt update && sudo apt install -y nodejs npm git
        # (Optional) Install n for better node version management usually recommmended
        sudo npm install -g n && sudo n lts
        ```
3.  **Deploy Code**:
    *   `git clone <REPO_URL>`
    *   `cd ancient-spirit/server`
    *   `npm install`
4.  **Start Server**:
    *   `export MONGO_URI="<YOUR_ATLAS_URI>"`
    *   `sudo npm install -g pm2`
    *   `pm2 start index.js --name "api"`
    *   `pm2 save`
5.  **Result**: Your backend is at `http://<EC2_PUBLIC_IP>:5000`. Copy this URL.

---

## Phase 2: Deploy Frontend (S3 + CloudFront)

### Step 1: Build locally
1.  On your local machine, open `.env` (create if missing).
2.  Set: `VITE_API_URL=http://<EC2_PUBLIC_IP>:5000` (Use the IP from Phase 1).
3.  Run build:
    ```bash
    npm run build
    ```
4.  This creates a `dist` folder. This is what you upload.

### Step 2: S3 Bucket (Storage)
1.  Go to **S3 Console** -> **Create bucket**.
2.  **Name**: `everblue-frontend` (or similar unique name).
3.  **Public Access**: Uncheck "Block all public access" (We will secure it via policy or CloudFront, but for website hosting simplest path starts here).
    *   *Best Practice*: Keep it private and use CloudFront OAI/OAC, but for "Static Website Hosting" mode, it typically requires public read.
    *   *Better approach for CDN*: Keep "Block all public access" CHECKED. We will use CloudFront OAC (Origin Access Control) to access it securely. **Let's do the secure CloudFront way.** -> **LEAVE BLOCK PUBLIC ACCESS CHECKED.**
4.  **Create Bucket**.
5.  **Upload**: Upload the **contents** of the `dist` folder (index.html, assets folder) into the bucket root.

### Step 3: CloudFront (CDN)
1.  Go to **CloudFront** -> **Create Distribution**.
2.  **Origin Domain**: Select your S3 bucket.
3.  **Origin Access**: Choose **Origin access control settings (recommended)**.
    *   Click "Create control setting" -> Create.
    *   **Important**: You must update the S3 Bucket Policy after creating the distribution (CloudFront will give you the policy).
4.  **Viewer Protocol Policy**: Redirect HTTP to HTTPS.
5.  **Default Root Object**: `index.html`.
6.  **Error Pages** (Critical for React Router):
    *   Click "Error pages" tab (after creation or during setup if available).
    *   Create Custom Error Response:
        *   **HTTP Error Code**: `403` and `404` (Do both to be safe).
        *   **Customize Error Response**: Yes.
        *   **Response Page Path**: `/index.html`
        *   **HTTP Response Code**: `200`
    *   *Why?* This lets React handle routes like `/dashboard` instead of S3 looking for a file named `dashboard`.
7.  **Create Distribution**.

### Step 4: Update S3 Policy
1.  Copy the Policy provided by CloudFront (or go to Distribution -> Origins -> Edit -> Copy Policy).
2.  Go back to **S3 Bucket** -> **Permissions** -> **Bucket Policy**.
3.  Paste the policy (It allows CloudFront service principal to read files). Save.

### Step 5: Custom Domain
1.  In CloudFront Distribution Settings -> **Alternative Domain Names (CNAMEs)** -> Add `anjali.net.in`.
2.  You need an SSL Certificate from **AWS ACM** (Request public certificate -> us-east-1 region -> add domain).
3.  Once certificate issue, attach it to CloudFront.
4.  In your DNS Provider (GoDaddy/Namecheap):
    *   Create **CNAME** or **ALIAS** record pointing `anjali.net.in` to your `d1234abcd.cloudfront.net` URL.

---

## Summary
*   **Backend**: EC2 (t2.micro) running Node.js.
*   **Frontend**: S3 (hosting files) + CloudFront (CDN + SSL).
*   **Domain**: Pointed to CloudFront.
