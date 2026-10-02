from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
)

from database import Base


# ============================================================
# PRODUCT MODEL
# ============================================================

class Product(Base):

    __tablename__ = "products"


    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )


    name = Column(
        String(200),
        nullable=False,
    )


    description = Column(
        Text,
        nullable=True,
    )


    brand = Column(
        String(100),
        nullable=True,
    )


    category = Column(
        String(100),
        nullable=True,
    )


    price = Column(
        Float,
        nullable=False,
    )


    rating = Column(
        Float,
        default=0,
    )


    image_url = Column(
        Text,
        nullable=True,
    )


    stock = Column(
        Integer,
        default=0,
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ============================================================
# USER INTERACTION MODEL
# ============================================================

class Interaction(Base):

    __tablename__ = "interactions"


    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )


    # Anonymous browser/session identifier.
    # No login system is required.
    session_id = Column(
        String(100),
        nullable=False,
        index=True,
    )


    # Product on which the action happened.
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )


    # Possible values:
    #
    # view
    # favorite
    # unfavorite
    # recommendation_click

    action = Column(
        String(50),
        nullable=False,
        index=True,
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        index=True,
    )