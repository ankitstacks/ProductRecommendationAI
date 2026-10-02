# ============================================================
# PRODUCTAI - STARTER PRODUCT SEED
# ============================================================

from database import SessionLocal
import models


PRODUCTS = [
    {
        "name": "Samsung Galaxy S25",
        "description": "Flagship Android smartphone with a bright AMOLED display, fast processor and advanced camera system.",
        "brand": "Samsung", "category": "Electronics", "price": 79999, "rating": 4.7, "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Samsung Galaxy Watch 7",
        "description": "Smartwatch with fitness tracking, health features, notifications and a premium AMOLED display.",
        "brand": "Samsung", "category": "Accessories", "price": 29999, "rating": 4.6, "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Apple iPhone 16",
        "description": "Premium smartphone with powerful performance, high quality cameras and a vibrant display.",
        "brand": "Apple", "category": "Electronics", "price": 79900, "rating": 4.8, "stock": 20,
        "image_url": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Apple MacBook Air M3",
        "description": "Thin and lightweight laptop powered by Apple silicon for study, coding and productivity.",
        "brand": "Apple", "category": "Laptops", "price": 114900, "rating": 4.9, "stock": 12,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Dell XPS 13",
        "description": "Compact premium laptop designed for development, office work and everyday productivity.",
        "brand": "Dell", "category": "Laptops", "price": 99999, "rating": 4.7, "stock": 10,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Dell Inspiron 15",
        "description": "Versatile everyday laptop suitable for students, programming and office applications.",
        "brand": "Dell", "category": "Laptops", "price": 64999, "rating": 4.4, "stock": 22,
        "image_url": "https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Sony WH-1000XM5",
        "description": "Wireless noise cancelling headphones with immersive sound and long battery life.",
        "brand": "Sony", "category": "Audio", "price": 29990, "rating": 4.8, "stock": 16,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Apple AirPods Pro 2",
        "description": "Premium wireless earbuds with active noise cancellation, transparency mode and spatial audio.",
        "brand": "Apple", "category": "Audio", "price": 24900, "rating": 4.7, "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Nike Air Max 270",
        "description": "Comfortable everyday sneakers with a cushioned sole and modern athletic design.",
        "brand": "Nike", "category": "Shoes", "price": 12995, "rating": 4.5, "stock": 35,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Adidas Ultraboost",
        "description": "Performance running shoes with responsive cushioning and breathable construction.",
        "brand": "Adidas", "category": "Shoes", "price": 14999, "rating": 4.6, "stock": 28,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Nike Dri-FIT T-Shirt",
        "description": "Lightweight sports t-shirt made for training, running and casual activewear.",
        "brand": "Nike", "category": "Clothing", "price": 2499, "rating": 4.4, "stock": 50,
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Levi's 511 Jeans",
        "description": "Classic slim-fit denim jeans suitable for everyday casual wear.",
        "brand": "Levi's", "category": "Clothing", "price": 3999, "rating": 4.5, "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Kindle Paperwhite",
        "description": "Water-resistant e-reader with a high-resolution display and adjustable warm light.",
        "brand": "Amazon", "category": "Books", "price": 14999, "rating": 4.7, "stock": 14,
        "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Logitech MX Master 3S",
        "description": "Advanced wireless mouse designed for productivity, coding and creative workflows.",
        "brand": "Logitech", "category": "Accessories", "price": 9995, "rating": 4.8, "stock": 24,
        "image_url": "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Keychron K2 Mechanical Keyboard",
        "description": "Compact wireless mechanical keyboard for programmers and productivity users.",
        "brand": "Keychron", "category": "Accessories", "price": 8499, "rating": 4.6, "stock": 19,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Samsung 27-inch 4K Monitor",
        "description": "Sharp 4K monitor for coding, design, entertainment and multitasking.",
        "brand": "Samsung", "category": "Monitors", "price": 27999, "rating": 4.5, "stock": 11,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "JBL Flip 6",
        "description": "Portable Bluetooth speaker with powerful sound, waterproof design and long battery life.",
        "brand": "JBL", "category": "Audio", "price": 11999, "rating": 4.6, "stock": 27,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Canon EOS R50",
        "description": "Compact mirrorless camera for photography, content creation and travel.",
        "brand": "Canon", "category": "Cameras", "price": 69999, "rating": 4.7, "stock": 8,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Anker 737 Power Bank",
        "description": "High-capacity fast-charging power bank with USB-C support for phones and laptops.",
        "brand": "Anker", "category": "Accessories", "price": 8999, "rating": 4.7, "stock": 32,
        "image_url": "https://images.unsplash.com/photo-1609592424851-0b3f0b4e9f1c?auto=format&fit=crop&w=900&q=80",
    },
]


def seed_products():
    db = SessionLocal()
    try:
        existing_count = db.query(models.Product).count()
        if existing_count > 0:
            print(f"ProductAI seed skipped: {existing_count} products already exist.")
            return

        for item in PRODUCTS:
            db.add(models.Product(**item))

        db.commit()
        print(f"ProductAI seed complete: {len(PRODUCTS)} products inserted.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
