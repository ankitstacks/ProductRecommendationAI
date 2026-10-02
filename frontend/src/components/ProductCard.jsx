import { Heart, Star } from "lucide-react";


// ============================================================
// PRODUCTAI API
// ============================================================

const API_URL = "http://127.0.0.1:8001";


// ============================================================
// GET / CREATE UNIQUE BROWSER SESSION ID
// ============================================================

function getSessionId() {
  try {
    let sessionId = localStorage.getItem(
      "productai_session_id"
    );

    if (!sessionId) {
      sessionId =
        "session-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 10);

      localStorage.setItem(
        "productai_session_id",
        sessionId
      );
    }

    return sessionId;

  } catch (error) {

    console.error(
      "Unable to create session ID:",
      error
    );

    return "temporary-session-" + Date.now();
  }
}


// ============================================================
// RECORD INTERACTION IN FASTAPI
// ============================================================

async function recordInteraction(
  productId,
  action
) {

  try {

    const sessionId =
      getSessionId();


    const response = await fetch(
      `${API_URL}/api/interactions`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          session_id:
            sessionId,

          product_id:
            Number(productId),

          action:
            action,

        }),
      }
    );


    if (!response.ok) {

      throw new Error(
        `Interaction API returned ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "ProductAI interaction recorded:",
      {
        productId,
        action,
        response: data,
      }
    );


    return data;


  } catch (error) {

    /*
     * Interaction tracking should never
     * break the product UI.
     */

    console.error(
      "Interaction tracking error:",
      error
    );

    return null;
  }
}


// ============================================================
// SAVE RECENTLY VIEWED
// ============================================================

function saveRecentlyViewed(product) {

  try {

    const existing =
      JSON.parse(
        localStorage.getItem(
          "productai_recently_viewed"
        ) || "[]"
      );


    const filtered =
      existing.filter(
        (item) =>
          Number(
            typeof item === "object"
              ? item.id
              : item
          ) !== Number(product.id)
      );


    const updated = [
      product,
      ...filtered,
    ].slice(0, 10);


    localStorage.setItem(
      "productai_recently_viewed",
      JSON.stringify(updated)
    );


  } catch (error) {

    console.error(
      "Recently viewed storage error:",
      error
    );

  }
}


// ============================================================
// SAVE FAVORITES
// ============================================================

function updateFavoriteStorage(
  product,
  isCurrentlyFavorite
) {

  try {

    const existing =
      JSON.parse(
        localStorage.getItem(
          "productai_favorites"
        ) || "[]"
      );


    let updated;


    if (isCurrentlyFavorite) {

      /*
       * Product is already favorite.
       * Remove it.
       */

      updated =
        existing.filter(
          (item) =>
            Number(
              typeof item === "object"
                ? item.id
                : item
            ) !== Number(product.id)
        );


    } else {

      /*
       * Product is not favorite.
       * Add complete product object.
       */

      const alreadyExists =
        existing.some(
          (item) =>
            Number(
              typeof item === "object"
                ? item.id
                : item
            ) === Number(product.id)
        );


      if (alreadyExists) {

        updated = existing;

      } else {

        updated = [
          ...existing,
          product,
        ];

      }

    }


    localStorage.setItem(
      "productai_favorites",
      JSON.stringify(updated)
    );


  } catch (error) {

    console.error(
      "Favorite storage error:",
      error
    );

  }
}


// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({
  product,
  isFavorite,
  onFavorite,
  onView,
}) {


  // ==========================================================
  // FAVORITE BUTTON
  // ==========================================================

  const handleFavorite = async (
    event
  ) => {

    /*
     * Prevent the click from triggering
     * any parent product action.
     */

    event.stopPropagation();


    /*
     * Save favorite state locally.
     */

    updateFavoriteStorage(
      product,
      isFavorite
    );


    /*
     * Tell parent component about
     * favorite state change.
     */

    if (onFavorite) {

      onFavorite(
        product.id
      );

    }


    /*
     * Record interaction in PostgreSQL.
     */

    await recordInteraction(

      product.id,

      isFavorite
        ? "unfavorite"
        : "favorite"

    );

  };


  // ==========================================================
  // VIEW PRODUCT
  // ==========================================================

  const handleView = async () => {

    /*
     * Save to recently viewed.
     */

    saveRecentlyViewed(
      product
    );


    /*
     * Tell parent component.
     */

    if (onView) {

      onView(
        product
      );

    }


    /*
     * Record view in PostgreSQL.
     */

    await recordInteraction(

      product.id,

      "view"

    );

  };


  // ==========================================================
  // IMAGE ERROR
  // ==========================================================

  const handleImageError =
    (event) => {

      event.currentTarget.style.display =
        "none";

    };


  // ==========================================================
  // RETURN
  // ==========================================================

  return (

    <article
      className="product-card"
    >


      {/* ==================================================== */}
      {/* PRODUCT IMAGE */}
      {/* ==================================================== */}

      <div
        className="product-image"
      >

        {product.image && (

          <img
            src={product.image}
            alt={product.name}
            onError={
              handleImageError
            }
          />

        )}


        {/* ================================================== */}
        {/* FAVORITE BUTTON */}
        {/* ================================================== */}

        <button
          className={`favorite-button ${
            isFavorite
              ? "active"
              : ""
          }`}
          onClick={
            handleFavorite
          }
          aria-label={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
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


        {/* ================================================== */}
        {/* CATEGORY */}
        {/* ================================================== */}

        <span
          className="category-badge"
        >

          {product.category}

        </span>

      </div>


      {/* ==================================================== */}
      {/* PRODUCT INFORMATION */}
      {/* ==================================================== */}

      <div
        className="product-info"
      >


        {/* ================================================== */}
        {/* RATING */}
        {/* ================================================== */}

        <div
          className="rating"
        >

          <Star
            size={15}
            fill="currentColor"
          />

          {product.rating ?? 0}

        </div>


        {/* ================================================== */}
        {/* NAME */}
        {/* ================================================== */}

        <h3>

          {product.name}

        </h3>


        {/* ================================================== */}
        {/* BRAND */}
        {/* ================================================== */}

        <p
          className="product-brand"
        >

          {product.brand}

        </p>


        {/* ================================================== */}
        {/* PRICE + VIEW */}
        {/* ================================================== */}

        <div
          className="product-bottom"
        >

          <strong>

            ₹
            {Number(
              product.price || 0
            ).toLocaleString(
              "en-IN"
            )}

          </strong>


          <button
            className="add-button"
            onClick={
              handleView
            }
          >

            View

          </button>

        </div>

      </div>

    </article>

  );

}


export default ProductCard;