# ============================================================
# ProductAI - ADMIN PRODUCT CRUD
# ============================================================

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import models
from database import get_db


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/admin/products",
    tags=["Admin Product CRUD"],
)


# ============================================================
# CREATE PRODUCT MODEL
# ============================================================

class ProductCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    description: Optional[str] = None

    brand: Optional[str] = Field(
        default=None,
        max_length=100
    )

    category: Optional[str] = Field(
        default=None,
        max_length=100
    )

    price: float = Field(
        ...,
        ge=0
    )

    rating: float = Field(
        default=0,
        ge=0,
        le=5
    )

    image_url: Optional[str] = None

    stock: int = Field(
        default=0,
        ge=0
    )


# ============================================================
# UPDATE PRODUCT MODEL
# ============================================================

class ProductUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200
    )

    description: Optional[str] = None

    brand: Optional[str] = Field(
        default=None,
        max_length=100
    )

    category: Optional[str] = Field(
        default=None,
        max_length=100
    )

    price: Optional[float] = Field(
        default=None,
        ge=0
    )

    rating: Optional[float] = Field(
        default=None,
        ge=0,
        le=5
    )

    image_url: Optional[str] = None

    stock: Optional[int] = Field(
        default=None,
        ge=0
    )


# ============================================================
# PRODUCT RESPONSE HELPER
# ============================================================

def product_to_dict(product):

    return {

        "id": product.id,

        "name": product.name,

        "description": product.description,

        "brand": product.brand,

        "category": product.category,

        "price": product.price,

        "rating": product.rating,

        "image_url": product.image_url,

        "stock": product.stock,

        "created_at": (
            product.created_at.isoformat()
            if product.created_at
            else None
        ),

    }


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get("")
def admin_get_products(
    db: Session = Depends(get_db),
):

    products = (
        db.query(models.Product)
        .order_by(
            models.Product.id.desc()
        )
        .all()
    )

    return [
        product_to_dict(product)
        for product in products
    ]


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@router.get("/{product_id}")
def admin_get_product(
    product_id: int,
    db: Session = Depends(get_db),
):

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return product_to_dict(product)


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "",
    status_code=201
)
def admin_create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
):

    product = models.Product(

        name=payload.name.strip(),

        description=payload.description,

        brand=payload.brand,

        category=payload.category,

        price=payload.price,

        rating=payload.rating,

        image_url=payload.image_url,

        stock=payload.stock,

    )

    db.add(product)

    db.commit()

    db.refresh(product)

    return product_to_dict(product)


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put("/{product_id}")
def admin_update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if (
        "name" in update_data
        and update_data["name"]
    ):

        update_data["name"] = (
            update_data["name"].strip()
        )

    for field, value in update_data.items():

        setattr(
            product,
            field,
            value
        )

    db.commit()

    db.refresh(product)

    return product_to_dict(product)


# ============================================================
# DELETE PRODUCT
# ============================================================

@router.delete("/{product_id}")
def admin_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    db.delete(product)

    db.commit()

    return {

        "success": True,

        "message": "Product deleted successfully",

        "id": product_id,

    }