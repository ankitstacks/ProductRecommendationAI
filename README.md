ProductAI --- AI-Powered Product Recommendation System
ProductAI is a full-stack AI-powered product recommendation system that
provides personalized product recommendations based on user interests,
favorites, recently viewed products, and product similarity.
The system combines a modern React frontend, FastAPI backend, PostgreSQL
database, and a machine-learning-based recommendation engine using
TF-IDF and Cosine Similarity.
---
🚀 Live Demo
Frontend:  
https://productrecommendationai.vercel.app/
Admin Dashboard:  
https://productrecommendationai.vercel.app/admin.html
Backend API:  
https://productrecommendationai.onrender.com/
API Documentation:  
https://productrecommendationai.onrender.com/docs
---
✨ Features
🛍️ Product Catalogue
Browse available products
Product cards with image, name, brand, category, price, rating, and
stock
Product details view
Dynamic product loading from PostgreSQL through the backend API
🔎 Search & Filtering
Search by product name or brand
Filter by category
Dynamic product catalogue
❤️ Favorites
Add/remove favorites
View favorite products
Favorites persist using LocalStorage
Favorite actions are recorded for analytics
👀 Recently Viewed
Automatically track viewed products
Display recently viewed products
Persist recent activity using LocalStorage
Use recent activity for recommendation personalization
🤖 AI Product Recommendations
Personalized recommendations
Uses favorites and recently viewed products
Calculates product similarity
Displays match percentage
Provides a "Why this product?" explanation
Recommendation count is configurable
🧠 Machine Learning
The recommendation engine uses:
TF-IDF (Term Frequency--Inverse Document Frequency)
Cosine Similarity
Product name
Description
Brand
Category
📊 Admin Dashboard
The Admin Dashboard provides:
Total Products
Product Views
Favorites
Recommendation Clicks
Unique Sessions
Total Interactions
Product management
⚙️ Admin CRUD
Administrators can:
Add products
View products
Update products
Delete products
---
🧠 How Recommendation Works
ProductAI uses a content-based recommendation approach combined with
user activity.
Step 1 --- Product Data
The system combines important product information:
    Product Name
    +
    Description
    +
    Brand
    +
    Category

This combined text becomes the input for the recommendation engine.
Example:
    Samsung Galaxy S25
    Samsung
    Electronics
    Flagship Android smartphone with AMOLED display, fast processor and advanced camera system.

Step 2 --- TF-IDF
TF-IDF stands for Term Frequency--Inverse Document Frequency.
The system converts the combined product text into numerical vectors
using TF-IDF.
TF-IDF helps represent the importance of words in product information.
Step 3 --- Cosine Similarity
The system compares product vectors using Cosine Similarity.
Conceptually:
    Higher similarity
          ↓
    More similar product content
          ↓
    Higher recommendation relevance

Step 4 --- User Activity
ProductAI uses user activity to personalize recommendations:
    Favorite Products
            +
    Recently Viewed Products
            +
    Product Similarity

The user's favorites and recent views act as signals for finding
relevant products.
Step 5 --- Recommendation Ranking
Candidate products are scored and ranked by relevance.
Example:
    Dell Inspiron 15      → 17.56% match
    Samsung Galaxy S25    → 16.29% match
    Apple iPhone 16       → 13.38% match
    Apple MacBook Air M3  → 12.51% match

The number of recommendations can be configured by the application.
💡 Why This Product?
ProductAI explains recommendation results with reasons such as:
    Similar category: Laptops
    Similar brand: Dell
    Strong content similarity
    Matches your favorites and recent activity

---
🏗️ System Architecture
    PRODUCTAI
        |
        v
    +-------------------------+
    |      React Frontend     |
    |         Vercel          |
    +------------+------------+
                 |
                 | REST API
                 v
    +-------------------------+
    |     FastAPI Backend     |
    |         Render          |
    +------------+------------+
                 |
         +-------+-------+
         |       |       |
         v       v       v
    +--------+ +--------+ +----------------+
    |Postgres| |   ML / | | Interaction   |
    |  SQL   | | Recomm.| | Tracking      |
    +--------+ +---+----+ +----------------+
                     |
                     v
               +-----------+
               |  TF-IDF   |
               |     +     |
               |  Cosine   |
               | Similarity|
               +-----------+

---
🛠️ Technology Stack
Frontend
React
JavaScript
HTML5
CSS3
Vite
LocalStorage
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Uvicorn
Database
PostgreSQL
Machine Learning
Scikit-learn
TF-IDF
Cosine Similarity
Content-Based Recommendation
Deployment
Vercel --- Frontend
Render --- Backend
PostgreSQL --- Production Database
Development Tools
Visual Studio Code
Git
GitHub
Chrome DevTools
---
📁 Project Structure
    ProductRecommendationAI/
    ├── backend/
    │   ├── main.py
    │   ├── models.py
    │   ├── database.py
    │   ├── recommendation.py
    │   ├── admin_crud.py
    │   ├── seed_products.py
    │   ├── requirements.txt
    │   └── .env
    │
    ├── frontend/
    │   ├── public/
    │   │   ├── admin.html
    │   │   └── favicon.png
    │   ├── src/
    │   │   ├── assets/
    │   │   ├── components/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── ProductCard.jsx
    │   │   │   ├── RecommendationCard.jsx
    │   │   │   └── SearchBar.jsx
    │   │   ├── data/
    │   │   │   └── products.js
    │   │   ├── pages/
    │   │   │   ├── Home.jsx
    │   │   │   ├── Products.jsx
    │   │   │   ├── Favorites.jsx
    │   │   │   ├── RecentlyViewed.jsx
    │   │   │   ├── Recommendations.jsx
    │   │   │   └── ProductDetails.jsx
    │   │   ├── App.jsx
    │   │   ├── App.css
    │   │   ├── index.css
    │   │   └── main.jsx
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── .gitignore
    └── README.md

---
🔌 API Endpoints
Products
    GET /api/products

Returns products stored in PostgreSQL.
Product Recommendations
    GET /api/recommendations/{product_id}

Returns products similar to the selected product.
Personalized Recommendations
    POST /api/recommendations/personalized

Example request:
    {
      "favorite_ids": [1, 2],
      "recently_viewed_ids": [3, 4],
      "limit": 8
    }

Interactions
    POST /api/interactions

Supported actions:
    view
    favorite
    unfavorite
    recommendation_click

Interaction Statistics
    GET /api/interactions/stats

Returns interaction statistics.
Admin Products
    GET    /api/admin/products
    GET    /api/admin/products/{product_id}
    POST   /api/admin/products
    PUT    /api/admin/products/{product_id}
    DELETE /api/admin/products/{product_id}

---
🗄️ Database Design
ProductAI uses PostgreSQL.
Products Table
Stores:
Product ID
Name
Description
Brand
Category
Price
Rating
Image URL
Stock
Creation timestamp
Interactions Table
Stores:
Interaction ID
Session ID
Product ID
Action
Creation timestamp
---
📈 Interaction Tracking
The frontend records:
Product view
Favorite
Unfavorite
Recommendation click
Interaction data is stored in PostgreSQL and used for analytics and
recommendation personalization.
---
💻 Local Installation
Prerequisites
Python
Node.js
npm
PostgreSQL
Git
Visual Studio Code
Clone Repository
    git clone https://github.com/ankitstacks/ProductRecommendationAI.git
    cd ProductRecommendationAI

Backend Setup
    cd backend
    python -m venv venv

Windows:
    venv\Scripts	ctivate

Install dependencies:
    pip install -r requirements.txt

Create `backend/.env`:
    DATABASE_URL=your_postgresql_connection_string

Run backend:
    uvicorn main:app --reload

Local API:
    http://127.0.0.1:8000

FastAPI docs:
    http://127.0.0.1:8000/docs

Frontend Setup
Open another terminal:
    cd frontend
    npm install
    npm run dev

---
🔐 Environment Variables
Never commit database credentials or other secrets.
Example:
    DATABASE_URL=your_postgresql_connection_string

Keep `.env` private.
---
🚀 Production Deployment
Frontend
Deployed on Vercel:
https://productrecommendationai.vercel.app/
Backend
Deployed on Render:
https://productrecommendationai.onrender.com/
Database
Production backend uses PostgreSQL through the `DATABASE_URL`
environment variable.
---
🧪 Testing
Product Features
Product loading
Product catalogue
Product details
Search
Category filtering
Product availability
User Features
Add favorite
Remove favorite
Favorite persistence
Recently viewed products
Recently viewed persistence
Recommendation Features
Product similarity
Personalized recommendations
Recommendation match percentage
Recommendation explanation
Recommendation click tracking
Analytics
Product views
Favorites
Recommendation clicks
Unique sessions
Total interactions
Admin Features
Product creation
Product listing
Product update
Product deletion
Admin analytics
Production
Frontend deployment
Backend deployment
PostgreSQL connection
REST API communication
CORS configuration
Production data synchronization
---
🎯 Project Objectives
Build an intelligent product discovery platform.
Implement personalized product recommendations.
Use machine learning for product similarity.
Apply TF-IDF to product text data.
Calculate similarity using Cosine Similarity.
Use user activity to personalize recommendations.
Track user interactions.
Provide product management through an admin dashboard.
Store application data using PostgreSQL.
Deploy the complete full-stack application to production.
---
📚 Key Concepts Demonstrated
React
REST APIs
FastAPI
Python
PostgreSQL
SQLAlchemy
Machine Learning
TF-IDF
Cosine Similarity
Content-Based Recommendation
LocalStorage
CRUD operations
User interaction tracking
Analytics
Git
GitHub
Cloud deployment
---
🔮 Future Scope
Collaborative Filtering
Use behavior from multiple users to identify users with similar
preferences.
Hybrid Recommendation System
Combine content-based filtering with collaborative filtering.
    Content-Based Filtering
              +
    Collaborative Filtering
              ↓
    Hybrid Recommendation System

User Authentication
Future versions can include:
User registration
Login
User profiles
Account-specific recommendation history
Product Reviews
Users could provide:
Reviews
Ratings
Feedback
Advanced Analytics
Future Admin Dashboard improvements could include:
Product popularity charts
Category analytics
User activity trends
Recommendation conversion rates
Most viewed products
Real-Time Recommendations
Recommendations could be updated dynamically as users interact with
products.
Mobile Application
The system could be extended into Android, iOS, or cross-platform
applications.
Advanced Machine Learning
Future versions could explore:
Embeddings
Semantic similarity
Neural networks
Deep learning
Transformer-based recommendation models
---
📸 Screenshots
Screenshots can be added for:
Home Page
Product Catalogue
Product Details
Favorites
Recently Viewed
Personalized Recommendations
Admin Dashboard
Admin Product Management
---
👨‍💻 Author
Ankit Kushwaha
MCA Student and Full-Stack Developer
GitHub:  
https://github.com/ankitstacks
Project Repository:  
https://github.com/ankitstacks/ProductRecommendationAI
Live Application:  
https://productrecommendationai.vercel.app/
---
📄 License
This project is developed for educational, academic, and project
demonstration purposes.
---
⭐ Project Summary
ProductAI demonstrates how a complete full-stack application can combine
modern web technologies, a relational database, user interaction
tracking, and machine-learning-based recommendation techniques.
The complete workflow is:
    Browse Products
          ↓
    Search / Filter
          ↓
    View Product
          ↓
    Favorite / Recently Viewed
          ↓
    User Activity
          ↓
    Recommendation Engine
          ↓
    TF-IDF
          ↓
    Cosine Similarity
          ↓
    Recommendation Ranking
          ↓
    Personalized Recommendations
          ↓
    Recommendation Explanation

ProductAI provides both a user-facing product discovery platform and an
administrative dashboard for managing products and monitoring system
activity.