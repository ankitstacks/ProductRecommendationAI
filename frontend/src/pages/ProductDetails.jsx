import React from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  ShoppingBag,
} from "lucide-react";

export default function ProductDetails({
  product,
  isFavorite = false,
  onFavorite,
  onBack,
}) {

  if (!product) {

    return (
      <div className="empty-state">

        <ShoppingBag
          size={40}
        />

        <h3>
          Product not found
        </h3>

      </div>
    );
  }


  return (
    <section
      className="products-section"
      style={{
        minHeight:
          "70vh",
      }}
    >

      {/* BACK */}

      <button
        className="secondary-button"
        onClick={onBack}
        style={{
          marginBottom:
            "25px",
        }}
      >

        <ArrowLeft size={16} />

        Back to Products

      </button>


      {/* PRODUCT */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(300px, 1fr) minmax(300px, 1fr)",
          gap: "40px",
          padding: "30px",
          borderRadius: "24px",
          background:
            "rgba(20,20,32,.8)",
          border:
            "1px solid #28283a",
        }}
      >

        {/* IMAGE */}

        <div
          style={{
            minHeight:
              "400px",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >

          {product.image_url ? (

            <img
              src={
                product.image_url
              }
              alt={
                product.name
              }
              style={{
                width: "100%",
                height: "400px",
                objectFit:
                  "contain",
              }}
            />

          ) : (

            <ShoppingBag
              size={80}
            />

          )}

        </div>


        {/* DETAILS */}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            justifyContent:
              "center",
          }}
        >

          <small
            style={{
              color:
                "#a78bfa",
              textTransform:
                "uppercase",
            }}
          >
            {product.category}
          </small>


          <h1>
            {product.name}
          </h1>


          <p
            style={{
              color:
                "#9999aa",
              lineHeight:
                "1.7",
            }}
          >
            {product.description ||
              "No description available."}
          </p>


          {product.brand && (

            <p>
              Brand:{" "}
              <strong>
                {product.brand}
              </strong>
            </p>

          )}


          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems:
                "center",
              margin:
                "15px 0",
            }}
          >

            <strong
              style={{
                fontSize:
                  "28px",
              }}
            >
              ₹
              {Number(
                product.price ||
                  0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>


            <span
              style={{
                color:
                  "#fbbf24",
                display:
                  "flex",
                gap: "4px",
              }}
            >

              <Star
                size={17}
                fill="currentColor"
              />

              {Number(
                product.rating ||
                  0
              ).toFixed(1)}

            </span>

          </div>


          <button
            className="primary-button"
            onClick={() =>
              onFavorite?.(
                product
              )
            }
          >

            <Heart
              size={18}
              fill={
                isFavorite
                  ? "currentColor"
                  : "none"
              }
            />

            {isFavorite
              ? "Remove Favorite"
              : "Add to Favorites"}

          </button>

        </div>

      </div>

    </section>
  );
}