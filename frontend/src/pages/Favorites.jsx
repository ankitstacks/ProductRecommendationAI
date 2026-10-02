import React from "react";
import {
  Heart,
  Sparkles,
} from "lucide-react";

import ProductCard from "../components/ProductCard";

export default function Favorites({
  products = [],
  favorites = [],
  onFavorite,
  onView,
}) {

  const favoriteProducts =
    products.filter(
      (product) =>
        favorites.includes(
          Number(product.id)
        )
    );

  return (
    <section
      id="favorites"
      className="products-section"
    >

      <div className="section-header">

        <div>

          <div className="section-label">
            <Heart size={16} />
            YOUR COLLECTION
          </div>

          <h2>
            Favorites
          </h2>

        </div>

        <span>
          {favoriteProducts.length}
          {" "}
          saved
        </span>

      </div>


      {favoriteProducts.length >
      0 ? (

        <div className="product-grid">

          {favoriteProducts.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  image:
                    product.image_url,
                }}
                isFavorite={true}
                onFavorite={
                  onFavorite
                }
                onView={onView}
              />

            )
          )}

        </div>

      ) : (

        <div className="empty-state">

          <Heart size={40} />

          <h3>
            No favorites yet
          </h3>

          <p>
            Click the heart icon on
            products you love.
          </p>

        </div>

      )}

    </section>
  );
}