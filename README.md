# ProductAI — AI-Powered Product Recommendation System

ProductAI is a full-stack AI-powered product recommendation system that provides personalized product recommendations based on user interests, favorites, recently viewed products, and product similarity.

The system combines a modern React frontend, FastAPI backend, PostgreSQL database, and a machine-learning-based recommendation engine using TF-IDF and Cosine Similarity.

## 🚀 Live Demo

**Frontend:**  
https://productrecommendationai.vercel.app/

**Admin Dashboard:**  
https://productrecommendationai.vercel.app/admin.html

**Backend API:**  
https://productrecommendationai.onrender.com/

---

## ✨ Features

### 🛍️ Product Catalogue
- Browse available products
- Product cards with image, name, brand, category, price, rating, and stock
- Product details view
- Product availability information

### 🔎 Search & Filtering
- Search products by name or brand
- Filter products by category
- Dynamic product catalogue

### ❤️ Favorites
- Add products to favorites
- Remove products from favorites
- Favorites persist using browser local storage

### 👀 Recently Viewed
- Automatically records viewed products
- Displays recently viewed products
- Persists recently viewed products using local storage

### 🤖 AI Product Recommendations
- Personalized product recommendations
- Uses user's favorite products
- Uses recently viewed products
- Calculates product similarity
- Displays recommendation match percentage
- Provides a "Why this product?" explanation

### 🧠 Machine Learning
The recommendation engine uses:

- TF-IDF (Term Frequency–Inverse Document Frequency)
- Cosine Similarity
- Product content such as:
  - Product name
  - Description
  - Brand
  - Category

### 📊 Admin Dashboard
The admin dashboard provides:

- Total product count
- Product views
- Favorites
- Recommendation clicks
- Unique sessions
- Total interactions
- Product management

### ⚙️ Admin CRUD
Administrators can:

- Add products
- View products
- Update products
- Delete products

---

# 🧠 How Recommendation Works

ProductAI uses a content-based recommendation approach.

### Step 1 — Product Data

The system combines product information:

```text
Product Name
+
Description
+
Brand
+
Category