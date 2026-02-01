# Everblue Application Walkthrough

This document outlines the key features and screens of the Everblue Fintech Application.

## 1. 🔐 Login & Security
- **Path**: `/login`
- **Features**:
  - Secure authentication using Email/Password.
  - **Inline Validation**: Immediate feedback for invalid emails or empty passwords.
  - **Clean UI**: Removed unnecessary text ("256-bit encryption") for a modern look.
  - **Error Handling**: Displays user-friendly error messages if login fails.

## 2. 🏠 Dashboard
- **Path**: `/` (Overview)
- **Features**:
  - **Financial Summary**: View total balance, income, and expenses at a glance.
  - **Recent Activity**: Quick list of the latest transactions.
  - **Dark Mode Support**: The top navigation bar adapts to the theme, ensuring visibility.

## 3. 💸 Transactions Management
- **Path**: `/transactions`
- **Features**:
  - **Data Table**: View all transactions with Sort and Filter capabilities.
  - **Search & Filter**: Find specific transactions by description, category, or date.
  - **✨ New Feature: Edit**: Click the **Pencil Icon** to modify details (Amount, Date, Category).
  - **✨ New Feature: Delete**: Click the **Trash Icon** to remove erroneous entries (with confirmation).
  - **Export**: Download transaction history as CSV.

## 4. 📊 Reports & Analysis
- **Path**: `/reports`
- **Features**:
  - **Dynamic Data**: Fetches real-time spending data from your backend.
  - **Spending by Category**: Automatically calculates and displays spending distribution (e.g., Food: 40%, Transport: 20%).
  - **Visual Table**: Clear breakdown of expenses per category.

## 5. 🤖 AI Coach (Chatbot)
- **Path**: `/coach`
- **Features**:
  - **Financial Assistant**: Ask questions like "What is my balance?" or "How much calculated on Food?".
  - **Full Screen UI**: Enjoy a spacious, full-width chat interface for better readability.
  - **🎙️ Voice & Speech**: Speak to the coach using the Mic. Toggle voice output ON/OFF with the speaker icon.
  - **🚀 Instant Help**: Automatically see available commands and capabilities when you open the page.
  - **🎯 Goal Planning**: Ask "Plan for 1 Lakh holiday" -> Get personalized saving plan.
  - **💡 Smart Affordability**: Check if you can add an expense: "5000 on Shopping" -> Bot checks your budget.
  - **💰 Flexible Queries**: Ask naturally: "Shopping spend", "Cost of Food", "Total expenses".
  - **Quick Prompts**: Clickable chips for common queries.

## 6. ⚙️ Settings
- **Path**: `/settings`
- **Features**:
  - **Theme Toggle**: Switch between **Light** and **🌙 Dark Mode**.
  - **Currency Preference**: Change default currency (USD, INR, EUR, GBP). The entire app updates instantly to show the selected symbol (e.g., ₹, $).
  - **Email Reports**: Trigger manual email reports to your registered address.

## 6. 📝 Signup (New Accounts)
- **Path**: `/signup`
- **Features**:
  - **Strict Password Policy**: Enforces strong passwords (Uppercase, Lowercase, Number, Special Char).
  - **Smart Validation**: The "Create Account" button remains disabled until all fields are valid.
