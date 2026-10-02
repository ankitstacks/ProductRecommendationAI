import React from "react";
import ProductCard from "../components/ProductCard";

export default function Products({
  products = [],
  search = "",
  category = "All",
  categories = [],
  onSearch,
  onCategoryChange,
  favorites = [],
  onFavorite,
  onView,
}) {

  const searchText =
    search.toLowerCase().trim();


  const filteredProducts =
    products.filter(
      (product) => {

        const name =
          String(
            product.name || ""
          ).toLowerCase();

        const brand =
          String(
            product.brand || ""
          ).toLowerCase();

        const description =
          String(
            product.description ||
              ""
          ).toLowerCase();


        const matchesSearch =
          !searchText ||
          name.includes(
            searchText
          ) ||
          brand.includes(
            searchText
          ) ||
          description.includes(
            searchText
          );


        const matchesCategory =
          category === "All" ||
          product.category ===
            category;


        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );


  return (
    <section
      id="products"
      className="products-section"
    >

      <div className="section-header">

        <div>

          <div className="section-label">
            EXPLORE PRODUCTS
          </div>

          <h2>
            Product Catalogue
          </h2>

        </div>

        <span>
          {filteredProducts.length}
          {" "}
          products
        </span>

      </div>


      {/* SEARCH */}

      <div className="search-box">

        <input
          value={search}
          placeholder="Search products..."
          onChange={(event) =>
            onSearch?.(
              event.target.value
            )
          }
        />

      </div>


      {/* CATEGORIES */}

      <div className="category-filter">

        {categories.map(
          (item) => (

            <button
              key={item}
              className={
                category === item
                  ? "category-active"
                  : ""
              }
              onClick={() =>
                onCategoryChange?.(
                  item
                )
              }
            >
              {item}
            </button>

          )
        )}

      </div>


      {/* PRODUCTS */}

      {filteredProducts.length >
      0 ? (

        <div className="product-grid">

          {filteredProducts.map(
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

          <h3>
            No products found
          </h3>

          <p>
            Try a different search
            or category.
          </p>

        </div>

      )}

    </section>
  );
}