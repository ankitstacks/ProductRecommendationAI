# ============================================================
# PRODUCTAI - ML RECOMMENDATION ENGINE
# ============================================================

from typing import List, Dict

from sqlalchemy.orm import Session

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import models


# ============================================================
# CREATE PRODUCT FEATURE TEXT
# ============================================================

def create_product_text(product) -> str:
    """
    Combines important product information into one text field.

    ML features:
    - Product name
    - Description
    - Brand
    - Category
    """

    return " ".join(
        [
            str(product.name or ""),
            str(product.description or ""),
            str(product.brand or ""),
            str(product.category or ""),
        ]
    ).lower()


# ============================================================
# CREATE RECOMMENDATION REASONS
# ============================================================

def create_recommendation_reasons(
    recommended_product,
    profile_products: List,
    similarity_score: float,
) -> List[str]:
    """
    Creates human-readable explanations for why
    a product was recommended.

    The recommendation engine itself is still based on
    TF-IDF + Cosine Similarity.

    These reasons explain important matching signals:
    - Category similarity
    - Brand similarity
    - Product/content similarity
    - User activity
    """

    reasons = []

    if not profile_products:
        return reasons

    # --------------------------------------------------------
    # USER PROFILE CATEGORIES
    # --------------------------------------------------------

    profile_categories = {
        str(product.category).strip().lower()
        for product in profile_products
        if product.category
    }

    # --------------------------------------------------------
    # USER PROFILE BRANDS
    # --------------------------------------------------------

    profile_brands = {
        str(product.brand).strip().lower()
        for product in profile_products
        if product.brand
    }

    # --------------------------------------------------------
    # CATEGORY MATCH
    # --------------------------------------------------------

    recommended_category = (
        str(recommended_product.category).strip().lower()
        if recommended_product.category
        else ""
    )

    if (
        recommended_category
        and recommended_category in profile_categories
    ):
        reasons.append(
            f"Similar category: {recommended_product.category}"
        )

    # --------------------------------------------------------
    # BRAND MATCH
    # --------------------------------------------------------

    recommended_brand = (
        str(recommended_product.brand).strip().lower()
        if recommended_product.brand
        else ""
    )

    if (
        recommended_brand
        and recommended_brand in profile_brands
    ):
        reasons.append(
            f"Similar brand: {recommended_product.brand}"
        )

    # --------------------------------------------------------
    # CONTENT SIMILARITY
    # --------------------------------------------------------

    if similarity_score > 0:
        reasons.append(
            f"Strong content similarity: "
            f"{round(similarity_score * 100, 2)}% match"
        )

    # --------------------------------------------------------
    # USER ACTIVITY
    # --------------------------------------------------------

    if profile_products:
        reasons.append(
            "Matches your favorites and recent activity"
        )

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------

    if not reasons:
        reasons.append(
            "Recommended based on your product preferences"
        )

    # Maximum 4 reasons
    return reasons[:4]


# ============================================================
# GET BASIC PRODUCT RECOMMENDATIONS
# ============================================================

def get_recommendations(
    db: Session,
    product_id: int,
    limit: int = 5,
) -> List[Dict]:
    """
    Content-based recommendation using:

    TF-IDF + Cosine Similarity
    """

    # --------------------------------------------------------
    # GET ALL PRODUCTS
    # --------------------------------------------------------

    products = (
        db.query(models.Product)
        .order_by(models.Product.id)
        .all()
    )

    if not products:
        return []

    # --------------------------------------------------------
    # FIND SELECTED PRODUCT
    # --------------------------------------------------------

    selected_product = None
    selected_index = None

    for index, product in enumerate(products):

        if product.id == product_id:
            selected_product = product
            selected_index = index
            break

    if selected_index is None:
        return []

    # --------------------------------------------------------
    # CREATE PRODUCT DOCUMENTS
    # --------------------------------------------------------

    product_documents = [
        create_product_text(product)
        for product in products
    ]

    # --------------------------------------------------------
    # TF-IDF
    # --------------------------------------------------------

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(
        product_documents
    )

    # --------------------------------------------------------
    # COSINE SIMILARITY
    # --------------------------------------------------------

    similarity_matrix = cosine_similarity(
        tfidf_matrix
    )

    similarity_scores = similarity_matrix[
        selected_index
    ]

    # --------------------------------------------------------
    # SORT PRODUCTS
    # --------------------------------------------------------

    similar_product_indexes = sorted(
        range(len(similarity_scores)),
        key=lambda index: similarity_scores[index],
        reverse=True,
    )

    # --------------------------------------------------------
    # BUILD RESULTS
    # --------------------------------------------------------

    recommendations = []

    for index in similar_product_indexes:

        # Never recommend the same product
        if index == selected_index:
            continue

        product = products[index]

        similarity_score = float(
            similarity_scores[index]
        )

        # Create reasons
        reasons = create_recommendation_reasons(
            product,
            [selected_product],
            similarity_score,
        )

        recommendations.append(
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "brand": product.brand,
                "category": product.category,
                "price": product.price,
                "rating": product.rating,
                "image_url": product.image_url,
                "stock": product.stock,

                "similarity_score": round(
                    similarity_score * 100,
                    2,
                ),

                "reason": (
                    reasons[0]
                    if reasons
                    else "Similar product"
                ),

                "why_recommended": reasons,
            }
        )

        if len(recommendations) >= limit:
            break

    return recommendations


# ============================================================
# PERSONALIZED RECOMMENDATIONS
# ============================================================

def get_personalized_recommendations(
    db: Session,
    favorite_ids: List[int],
    recently_viewed_ids: List[int],
    limit: int = 5,
) -> List[Dict]:
    """
    Personalized content-based recommendation engine.

    User preference is calculated from:

        Favorites
        +
        Recently Viewed

    Favorites receive higher importance than
    recently viewed products.
    """

    # --------------------------------------------------------
    # GET ALL PRODUCTS
    # --------------------------------------------------------

    products = (
        db.query(models.Product)
        .order_by(models.Product.id)
        .all()
    )

    if not products:
        return []

    # --------------------------------------------------------
    # CLEAN INPUT IDS
    # --------------------------------------------------------

    favorite_ids = list(
        dict.fromkeys(
            int(product_id)
            for product_id in favorite_ids
        )
    )

    recently_viewed_ids = list(
        dict.fromkeys(
            int(product_id)
            for product_id in recently_viewed_ids
        )
    )

    # --------------------------------------------------------
    # CREATE PRODUCT DOCUMENTS
    # --------------------------------------------------------

    product_documents = [
        create_product_text(product)
        for product in products
    ]

    # --------------------------------------------------------
    # TF-IDF VECTORIZATION
    # --------------------------------------------------------

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(
        product_documents
    )

    # --------------------------------------------------------
    # MAP PRODUCT ID TO MATRIX INDEX
    # --------------------------------------------------------

    product_index_map = {
        product.id: index
        for index, product in enumerate(products)
    }

    # --------------------------------------------------------
    # CREATE USER PREFERENCE VECTORS
    # --------------------------------------------------------

    preference_vectors = []
    preference_weights = []

    # --------------------------------------------------------
    # FAVORITES
    # --------------------------------------------------------

    for product_id in favorite_ids:

        if product_id not in product_index_map:
            continue

        index = product_index_map[
            product_id
        ]

        preference_vectors.append(
            tfidf_matrix[index]
        )

        # Favorites are stronger signals.
        preference_weights.append(2.0)

    # --------------------------------------------------------
    # RECENTLY VIEWED
    # --------------------------------------------------------

    for product_id in recently_viewed_ids:

        if product_id not in product_index_map:
            continue

        # Avoid adding the same product twice
        if product_id in favorite_ids:
            continue

        index = product_index_map[
            product_id
        ]

        preference_vectors.append(
            tfidf_matrix[index]
        )

        # Recently viewed gets normal weight.
        preference_weights.append(1.0)

    # --------------------------------------------------------
    # NO USER ACTIVITY
    # --------------------------------------------------------

    if not preference_vectors:

        # Fallback:
        # Recommend products with highest ratings.

        fallback_products = sorted(
            products,
            key=lambda product: (
                float(product.rating or 0),
                float(product.price or 0),
            ),
            reverse=True,
        )

        recommendations = []

        for product in fallback_products[:limit]:

            score = round(
                float(product.rating or 0)
                / 5
                * 100,
                2,
            )

            recommendations.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "brand": product.brand,
                    "category": product.category,
                    "price": product.price,
                    "rating": product.rating,
                    "image_url": product.image_url,
                    "stock": product.stock,

                    "similarity_score": score,

                    "reason": "Popular product",

                    "why_recommended": [
                        "Highly rated product",
                        "Recommended for new users",
                        f"Rating: {product.rating}/5",
                    ],
                }
            )

        return recommendations

    # --------------------------------------------------------
    # BUILD WEIGHTED USER PROFILE
    # --------------------------------------------------------

    weighted_vectors = []

    total_weight = sum(
        preference_weights
    )

    for vector, weight in zip(
        preference_vectors,
        preference_weights,
    ):

        weighted_vectors.append(
            vector.multiply(weight)
        )

    # --------------------------------------------------------
    # ADD ALL WEIGHTED VECTORS
    # --------------------------------------------------------

    user_profile = weighted_vectors[0]

    for vector in weighted_vectors[1:]:

        user_profile = (
            user_profile + vector
        )

    # --------------------------------------------------------
    # NORMALIZE PROFILE
    # --------------------------------------------------------

    user_profile = (
        user_profile / total_weight
    )

    # --------------------------------------------------------
    # CALCULATE SIMILARITY
    # --------------------------------------------------------

    similarity_scores = cosine_similarity(
        user_profile,
        tfidf_matrix,
    )[0]

    # --------------------------------------------------------
    # PRODUCTS ALREADY INTERACTED WITH
    # --------------------------------------------------------

    interacted_ids = set(
        favorite_ids +
        recently_viewed_ids
    )

    # --------------------------------------------------------
    # SORT BY PERSONALIZED SCORE
    # --------------------------------------------------------

    ranked_indexes = sorted(
        range(len(products)),
        key=lambda index: similarity_scores[index],
        reverse=True,
    )

    # --------------------------------------------------------
    # GET USER PROFILE PRODUCTS
    # --------------------------------------------------------

    profile_products = []

    for product_id in (
        favorite_ids +
        recently_viewed_ids
    ):

        product_index = product_index_map.get(
            product_id
        )

        if product_index is not None:

            profile_products.append(
                products[product_index]
            )

    # --------------------------------------------------------
    # BUILD PERSONALIZED RESULTS
    # --------------------------------------------------------

    recommendations = []

    for index in ranked_indexes:

        product = products[index]

        # ----------------------------------------------------
        # DO NOT RECOMMEND ALREADY INTERACTED PRODUCTS
        # ----------------------------------------------------

        if product.id in interacted_ids:
            continue

        similarity_score = float(
            similarity_scores[index]
        )

        # ----------------------------------------------------
        # CREATE EXPLANATION
        # ----------------------------------------------------

        reasons = create_recommendation_reasons(
            product,
            profile_products,
            similarity_score,
        )

        # ----------------------------------------------------
        # BUILD RESULT
        # ----------------------------------------------------

        recommendations.append(
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "brand": product.brand,
                "category": product.category,
                "price": product.price,
                "rating": product.rating,
                "image_url": product.image_url,
                "stock": product.stock,

                "similarity_score": round(
                    similarity_score * 100,
                    2,
                ),

                "reason": (
                    reasons[0]
                    if reasons
                    else (
                        "Based on your favorites "
                        "and recently viewed products"
                    )
                ),

                "why_recommended": reasons,
            }
        )

        if len(recommendations) >= limit:
            break

    return recommendations