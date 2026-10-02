import React from "react";
import {
  Heart,
  Star,
  Brain,
  Lightbulb,
  Tag,
  Award,
  Activity,
  Eye,
} from "lucide-react";

export default function RecommendationCard({
  product,
  isFavorite = false,
  onFavorite,
  onView,
}) {
  const score = Number(
    product?.similarity_score ||
      product?.score ||
      0
  );

  const reasons =
    Array.isArray(
      product?.why_recommended
    )
      ? product.why_recommended
      : [
          "Recommended based on your preferences",
        ];

  const getIcon = (reason) => {
    const text =
      String(reason).toLowerCase();

    if (text.includes("categor")) {
      return Tag;
    }

    if (text.includes("brand")) {
      return Award;
    }

    if (
      text.includes("similarity") ||
      text.includes("content")
    ) {
      return Brain;
    }

    return Activity;
  };

  return (
    <div
      className="recommendation-card"
      style={{
        position: "relative",
      }}
    >

      {/* MATCH */}

      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 5,
          padding: "6px 10px",
          borderRadius: "20px",
          background:
            "rgba(0,0,0,.78)",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {score.toFixed(2)}% match
      </div>


      {/* FAVORITE */}

      <button
        onClick={() =>
          onFavorite?.(product)
        }
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 5,
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border:
            "1px solid rgba(255,255,255,.2)",
          background:
            "rgba(0,0,0,.45)",
          color: isFavorite
            ? "#fb7185"
            : "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Heart
          size={19}
          fill={
            isFavorite
              ? "currentColor"
              : "none"
          }
        />
      </button>


      {/* IMAGE */}

      <div
        onClick={() =>
          onView?.(product)
        }
        style={{
          height: "230px",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >

        {product?.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "20px",
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBag
              size={50}
            />
          </div>
        )}

      </div>


      {/* CONTENT */}

      <div
        style={{
          padding: "18px",
        }}
      >

        <small
          style={{
            color: "#8b7fc1",
          }}
        >
          {product?.category ||
            "Product"}
        </small>

        <h3>
          {product?.name}
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >

          <span
            style={{
              color: "#fbbf24",
              display: "flex",
              gap: "4px",
            }}
          >
            <Star
              size={15}
              fill="currentColor"
            />

            {Number(
              product?.rating || 0
            ).toFixed(1)}
          </span>

          <strong>
            ₹
            {Number(
              product?.price || 0
            ).toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>


        {/* WHY */}

        <div
          style={{
            marginTop: "14px",
            padding: "13px",
            borderRadius: "13px",
            background:
              "rgba(124,58,237,.07)",
            border:
              "1px solid rgba(124,58,237,.18)",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "7px",
              color: "#fcd34d",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "9px",
            }}
          >

            <Lightbulb
              size={16}
            />

            Why this product?

          </div>


          {reasons
            .slice(0, 4)
            .map(
              (
                reason,
                index
              ) => {

                const Icon =
                  getIcon(reason);

                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "7px",
                      marginTop:
                        "6px",
                      color:
                        "#aaaabd",
                      fontSize:
                        "11px",
                    }}
                  >
                    <Icon
                      size={14}
                    />

                    <span>
                      {reason}
                    </span>
                  </div>
                );
              }
            )}

        </div>


        {/* VIEW */}

        <button
          onClick={() =>
            onView?.(product)
          }
          style={{
            width: "100%",
            marginTop: "13px",
            padding: "11px",
            border: "none",
            borderRadius: "10px",
            background:
              "linear-gradient(135deg,#7c3aed,#2563eb)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
          }}
        >
          <Eye size={16} />
          View Product
        </button>

      </div>

    </div>
  );
}