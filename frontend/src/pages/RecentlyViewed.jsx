import React from "react";
import {
  Eye,
  Trash2,
} from "lucide-react";

import ProductCard from "../components/ProductCard";

export default function RecentlyViewed({
  products = [],
  onView,
  onFavorite,
  favorites = [],
  onClear,
}) {

  return (
    <section className="products-section">

      <div className="section-header">

        <div>

          <div className="section-label">
            <Eye size={16} />
            RECENT ACTIVITY
          </div>

          <h2>
            Recently Viewed
          </h2>

        </div>


        {products.length > 0 && (

          <button
            className="secondary-button"
            onClick={onClear}
          >
            <Trash2 size={15} />
            Clear
          </button>

        )}

      </div>


      {products.length > 0 ? (

        <div className="product-grid">

          {products.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  image:
                    product.image_url,
                }}
                isFavorite={
                  favorites.includes(
                    Number(
                      product.id
                    )
                  )
                }
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

          <Eye size={40} />

          <h3>
            No recently viewed products
          </h3>

          <p>
            Products you view will
            appear here.
          </p>

        </div>

      )}

    </section>
  );
}