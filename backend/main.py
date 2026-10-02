# ============================================================
# PRODUCTAI - FASTAPI BACKEND
# ============================================================

from typing import List

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy.orm import Session

from sqlalchemy import (
    func,
    desc,
)

from database import (
    engine,
    Base,
    get_db,
)

import models

from recommendation import (
    get_recommendations,
    get_personalized_recommendations,
)

# Admin Product CRUD
from admin_crud import router as admin_product_router


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="ProductAI API",
    description="AI-powered Product Recommendation System",
    version="1.0.0",
)

# Register Admin Product CRUD routes
app.include_router(admin_product_router)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",

        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# PERSONALIZED RECOMMENDATIONS
# ============================================================

class PersonalizedRecommendationRequest(
    BaseModel
):

    favorite_ids: List[int] = []

    recently_viewed_ids: List[int] = []

    limit: int = 5


# ============================================================
# REQUEST MODEL
# USER INTERACTION
# ============================================================

class InteractionRequest(BaseModel):

    session_id: str

    product_id: int

    action: str


# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():

    return {
        "message": "ProductAI API is running",
        "status": "success",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "service": "ProductAI Backend",
    }


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@app.get("/api/products")
def get_products(
    db: Session = Depends(get_db),
):

    products = (
        db.query(models.Product)
        .order_by(models.Product.id)
        .all()
    )

    return products


# ============================================================
# BASIC PRODUCT RECOMMENDATIONS
# ============================================================

@app.get(
    "/api/recommendations/{product_id}"
)
def recommend_products(
    product_id: int,

    limit: int = 5,

    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # VALIDATE LIMIT
    # --------------------------------------------------------

    if limit < 1:

        raise HTTPException(
            status_code=400,
            detail="Limit must be greater than 0.",
        )


    if limit > 20:

        raise HTTPException(
            status_code=400,
            detail="Limit cannot be greater than 20.",
        )


    # --------------------------------------------------------
    # FIND PRODUCT
    # --------------------------------------------------------

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )


    if product is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Product with ID "
                f"{product_id} not found."
            ),
        )


    # --------------------------------------------------------
    # GENERATE RECOMMENDATIONS
    # --------------------------------------------------------

    recommendations = get_recommendations(
        db=db,

        product_id=product_id,

        limit=limit,
    )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "status": "success",

        "source_product": {

            "id": product.id,

            "name": product.name,

        },

        "recommendations":
            recommendations,

    }


# ============================================================
# PERSONALIZED ML RECOMMENDATIONS
# ============================================================

@app.post(
    "/api/recommendations/personalized"
)
def personalized_recommendations(
    request:
        PersonalizedRecommendationRequest,

    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # VALIDATE LIMIT
    # --------------------------------------------------------

    if request.limit < 1:

        raise HTTPException(
            status_code=400,
            detail="Limit must be greater than 0.",
        )


    if request.limit > 20:

        raise HTTPException(
            status_code=400,
            detail="Limit cannot be greater than 20.",
        )


    # --------------------------------------------------------
    # GENERATE PERSONALIZED RECOMMENDATIONS
    # --------------------------------------------------------

    recommendations = (
        get_personalized_recommendations(

            db=db,

            favorite_ids=
                request.favorite_ids,

            recently_viewed_ids=
                request.recently_viewed_ids,

            limit=request.limit,
        )
    )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "status": "success",

        "algorithm":
            "TF-IDF + Cosine Similarity",

        "personalization": {

            "favorite_products":
                len(
                    request.favorite_ids
                ),

            "recently_viewed_products":
                len(
                    request.recently_viewed_ids
                ),

        },

        "recommendations":
            recommendations,

    }


# ============================================================
# RECORD USER INTERACTION
# ============================================================

@app.post(
    "/api/interactions"
)
def record_interaction(
    request: InteractionRequest,

    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # ALLOWED ACTIONS
    # --------------------------------------------------------

    allowed_actions = {

        "view",

        "favorite",

        "unfavorite",

        "recommendation_click",

    }


    # --------------------------------------------------------
    # VALIDATE ACTION
    # --------------------------------------------------------

    if request.action not in allowed_actions:

        raise HTTPException(
            status_code=400,

            detail=(
                "Invalid action. Allowed actions: "
                "view, favorite, unfavorite, "
                "recommendation_click"
            ),
        )


    # --------------------------------------------------------
    # CHECK PRODUCT
    # --------------------------------------------------------

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id ==
            request.product_id
        )
        .first()
    )


    if product is None:

        raise HTTPException(
            status_code=404,

            detail=(
                f"Product with ID "
                f"{request.product_id} "
                f"not found."
            ),
        )


    # --------------------------------------------------------
    # CREATE INTERACTION
    # --------------------------------------------------------

    interaction = models.Interaction(

        session_id=
            request.session_id,

        product_id=
            request.product_id,

        action=
            request.action,
    )


    # --------------------------------------------------------
    # SAVE TO DATABASE
    # --------------------------------------------------------

    db.add(interaction)

    db.commit()

    db.refresh(interaction)


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "status": "success",

        "message":
            "Interaction recorded successfully.",

        "interaction": {

            "id":
                interaction.id,

            "session_id":
                interaction.session_id,

            "product_id":
                interaction.product_id,

            "action":
                interaction.action,

            "created_at":
                interaction.created_at,

        },

    }


# ============================================================
# INTERACTION STATISTICS
# ============================================================

@app.get(
    "/api/interactions/stats"
)
def interaction_stats(
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # TOTAL INTERACTIONS
    # --------------------------------------------------------

    total_interactions = (
        db.query(
            models.Interaction
        ).count()
    )


    # --------------------------------------------------------
    # TOTAL VIEWS
    # --------------------------------------------------------

    total_views = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "view"
        )
        .count()
    )


    # --------------------------------------------------------
    # TOTAL FAVORITES
    # --------------------------------------------------------

    total_favorites = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "favorite"
        )
        .count()
    )


    # --------------------------------------------------------
    # TOTAL UNFAVORITES
    # --------------------------------------------------------

    total_unfavorites = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "unfavorite"
        )
        .count()
    )


    # --------------------------------------------------------
    # RECOMMENDATION CLICKS
    # --------------------------------------------------------

    total_recommendation_clicks = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "recommendation_click"
        )
        .count()
    )


    return {

        "status": "success",

        "statistics": {

            "total_interactions":
                total_interactions,

            "total_views":
                total_views,

            "total_favorites":
                total_favorites,

            "total_unfavorites":
                total_unfavorites,

            "total_recommendation_clicks":
                total_recommendation_clicks,

        },

    }


# ============================================================
# ADMIN ANALYTICS DASHBOARD API
# ============================================================

@app.get(
    "/api/admin/analytics"
)
def admin_analytics(
    db: Session = Depends(get_db),
):

    # ========================================================
    # SUMMARY COUNTS
    # ========================================================

    total_products = (
        db.query(
            models.Product
        ).count()
    )


    total_interactions = (
        db.query(
            models.Interaction
        ).count()
    )


    total_views = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "view"
        )
        .count()
    )


    total_favorites = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "favorite"
        )
        .count()
    )


    total_unfavorites = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "unfavorite"
        )
        .count()
    )


    total_recommendation_clicks = (
        db.query(
            models.Interaction
        )
        .filter(
            models.Interaction.action ==
            "recommendation_click"
        )
        .count()
    )


    # ========================================================
    # TOP VIEWED PRODUCTS
    # ========================================================

    top_viewed_rows = (

        db.query(

            models.Product.id,

            models.Product.name,

            models.Product.brand,

            models.Product.category,

            models.Product.image_url,

            func.count(
                models.Interaction.id
            ).label("view_count"),

        )

        .join(

            models.Interaction,

            models.Product.id ==
            models.Interaction.product_id,

        )

        .filter(

            models.Interaction.action ==
            "view"

        )

        .group_by(

            models.Product.id,

            models.Product.name,

            models.Product.brand,

            models.Product.category,

            models.Product.image_url,

        )

        .order_by(

            desc("view_count")

        )

        .limit(5)

        .all()

    )


    top_viewed = [

        {

            "id": row.id,

            "name": row.name,

            "brand": row.brand,

            "category": row.category,

            "image_url": row.image_url,

            "count": row.view_count,

        }

        for row in top_viewed_rows

    ]


    # ========================================================
    # TOP FAVORITED PRODUCTS
    # ========================================================

    top_favorite_rows = (

        db.query(

            models.Product.id,

            models.Product.name,

            models.Product.brand,

            models.Product.category,

            models.Product.image_url,

            func.count(
                models.Interaction.id
            ).label("favorite_count"),

        )

        .join(

            models.Interaction,

            models.Product.id ==
            models.Interaction.product_id,

        )

        .filter(

            models.Interaction.action ==
            "favorite"

        )

        .group_by(

            models.Product.id,

            models.Product.name,

            models.Product.brand,

            models.Product.image_url,

        )

        .order_by(

            desc("favorite_count")

        )

        .limit(5)

        .all()

    )


    top_favorited = [

        {

            "id": row.id,

            "name": row.name,

            "brand": row.brand,

            "category": row.category,

            "image_url": row.image_url,

            "count": row.favorite_count,

        }

        for row in top_favorite_rows

    ]


    # ========================================================
    # RECENT ACTIVITY
    # ========================================================

    recent_rows = (

        db.query(

            models.Interaction.id,

            models.Interaction.session_id,

            models.Interaction.action,

            models.Interaction.created_at,

            models.Product.id.label(
                "product_id"
            ),

            models.Product.name.label(
                "product_name"
            ),

            models.Product.image_url.label(
                "product_image"
            ),

        )

        .join(

            models.Product,

            models.Product.id ==
            models.Interaction.product_id,

        )

        .order_by(

            desc(
                models.Interaction.created_at
            )

        )

        .limit(10)

        .all()

    )


    recent_activity = [

        {

            "id": row.id,

            "session_id":
                row.session_id,

            "action":
                row.action,

            "created_at":
                row.created_at,

            "product": {

                "id":
                    row.product_id,

                "name":
                    row.product_name,

                "image_url":
                    row.product_image,

            },

        }

        for row in recent_rows

    ]


    # ========================================================
    # CATEGORY DISTRIBUTION
    # ========================================================

    category_rows = (

        db.query(

            models.Product.category,

            func.count(
                models.Product.id
            ).label("product_count"),

        )

        .group_by(
            models.Product.category
        )

        .order_by(
            desc("product_count")
        )

        .all()

    )


    categories = [

        {

            "category":
                row.category,

            "count":
                row.product_count,

        }

        for row in category_rows

    ]


    # ========================================================
    # UNIQUE SESSIONS
    # ========================================================

    unique_sessions = (

        db.query(

            func.count(
                func.distinct(
                    models.Interaction.session_id
                )
            )

        )

        .scalar()

    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "status": "success",

        "summary": {

            "total_products":
                total_products,

            "total_interactions":
                total_interactions,

            "total_views":
                total_views,

            "total_favorites":
                total_favorites,

            "total_unfavorites":
                total_unfavorites,

            "total_recommendation_clicks":
                total_recommendation_clicks,

            "unique_sessions":
                unique_sessions or 0,

        },

        "top_viewed":
            top_viewed,

        "top_favorited":
            top_favorited,

        "recent_activity":
            recent_activity,

        "categories":
            categories,

    }