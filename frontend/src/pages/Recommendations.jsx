import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Heart,
  Star,
  ArrowLeft,
  ShoppingBag,
  Eye,
  Brain,
  Lightbulb,
  Tag,
  Award,
  Activity,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://https://productrecommendationai.onrender.com";

const FAVORITES_KEY = "productAI_favorites";
const RECENTLY_VIEWED_KEY = "productAI_recentlyViewed";
const SESSION_KEY = "productAI_session_id";

function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId =
      "session_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substring(2, 10);

    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

function getStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getProductId(item) {
  if (typeof item === "number") return item;
  if (typeof item === "string") return Number(item);

  return Number(
    item?.id ||
      item?.product_id ||
      item?.productId ||
      0
  );
}

function buildActivityProducts(favorites, recentlyViewed) {
  const combined = [
    ...favorites,
    ...recentlyViewed,
  ];

  const map = new Map();

  combined.forEach((product) => {
    const id = getProductId(product);

    if (id && !map.has(id)) {
      map.set(id, product);
    }
  });

  return Array.from(map.values());
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function getLocalReasons(product, activityProducts) {
  const reasons = [];

  if (!activityProducts.length) {
    return reasons;
  }

  const categories = new Set(
    activityProducts
      .map((item) => String(item?.category || "").toLowerCase())
      .filter(Boolean)
  );

  const brands = new Set(
    activityProducts
      .map((item) => String(item?.brand || "").toLowerCase())
      .filter(Boolean)
  );

  const category = String(
    product?.category || ""
  ).toLowerCase();

  const brand = String(
    product?.brand || ""
  ).toLowerCase();

  if (category && categories.has(category)) {
    reasons.push(
      `Similar category: ${product.category}`
    );
  }

  if (brand && brands.has(brand)) {
    reasons.push(
      `Similar brand: ${product.brand}`
    );
  }

  const productWords = new Set([
    ...normalizeText(product?.name),
    ...normalizeText(product?.description),
  ]);

  let matchingWords = 0;

  activityProducts.forEach((item) => {
    const activityWords = new Set([
      ...normalizeText(item?.name),
      ...normalizeText(item?.description),
    ]);

    productWords.forEach((word) => {
      if (
        word.length > 3 &&
        activityWords.has(word)
      ) {
        matchingWords++;
      }
    });
  });

  if (matchingWords >= 2) {
    reasons.push(
      "Similar product content to your activity"
    );
  }

  if (activityProducts.length > 0) {
    reasons.push(
      "Matches your recent activity"
    );
  }

  return reasons.slice(0, 4);
}

function getRecommendationReasons(
  product,
  activityProducts
) {
  const backendReasons = Array.isArray(
    product?.why_recommended
  )
    ? product.why_recommended.filter(Boolean)
    : [];

  const localReasons = getLocalReasons(
    product,
    activityProducts
  );

  const allReasons = [
    ...backendReasons,
    ...localReasons,
  ];

  const uniqueReasons = [];

  allReasons.forEach((reason) => {
    const normalized = String(reason)
      .trim()
      .toLowerCase();

    if (
      normalized &&
      !uniqueReasons.some(
        (item) =>
          item.trim().toLowerCase() === normalized
      )
    ) {
      uniqueReasons.push(String(reason).trim());
    }
  });

  if (
    product?.similarity_score !== undefined &&
    product?.similarity_score !== null
  ) {
    const score = Number(
      product.similarity_score
    );

    if (
      score > 0 &&
      !uniqueReasons.some((reason) =>
        reason
          .toLowerCase()
          .includes("content similarity")
      )
    ) {
      uniqueReasons.push(
        `Strong content similarity: ${score.toFixed(
          2
        )}% match`
      );
    }
  }

  if (!uniqueReasons.length) {
    uniqueReasons.push(
      "Recommended based on your product preferences"
    );
  }

  return uniqueReasons.slice(0, 4);
}

export default function Recommendations({
  onBack,
  onViewProduct,
}) {
  const [recommendations, setRecommendations] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState(
    []
  );

  const [
    activityProducts,
    setActivityProducts,
  ] = useState([]);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  // ==========================================================
  // LOAD USER ACTIVITY
  // ==========================================================

  useEffect(() => {
    loadUserActivity();
    loadRecommendations();
  }, []);

  function loadUserActivity() {
    const storedFavorites =
      getStoredArray(FAVORITES_KEY);

    const storedRecentlyViewed =
      getStoredArray(
        RECENTLY_VIEWED_KEY
      );

    const favoriteIds =
      storedFavorites
        .map(getProductId)
        .filter(Boolean);

    const activityProducts =
      buildActivityProducts(
        storedFavorites,
        storedRecentlyViewed
      );

    setFavorites(favoriteIds);
    setActivityProducts(activityProducts);
  }

  // ==========================================================
  // LOAD PERSONALIZED RECOMMENDATIONS
  // ==========================================================

  async function loadRecommendations() {
    setLoading(true);
    setError("");

    try {
      const storedFavorites =
        getStoredArray(FAVORITES_KEY);

      const storedRecentlyViewed =
        getStoredArray(
          RECENTLY_VIEWED_KEY
        );

      const favoriteIds =
        storedFavorites
          .map(getProductId)
          .filter(Boolean);

      const recentlyViewedIds =
        storedRecentlyViewed
          .map(getProductId)
          .filter(Boolean);

      setFavorites(favoriteIds);

      setActivityProducts(
        buildActivityProducts(
          storedFavorites,
          storedRecentlyViewed
        )
      );

      const response = await fetch(
        `${API_URL}/api/recommendations/personalized`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            favorite_ids: favoriteIds,
            recently_viewed_ids:
              recentlyViewedIds,
            limit: 5,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load recommendations"
        );
      }

      const data = await response.json();

      const result = Array.isArray(data)
        ? data
        : data?.recommendations ||
          data?.data ||
          [];

      setRecommendations(result);
    } catch (err) {
      console.error(
        "Recommendation error:",
        err
      );

      setError(
        "Unable to load personalized recommendations."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // TRACK INTERACTION
  // ==========================================================

  async function trackInteraction(
    productId,
    action
  ) {
    try {
      await fetch(
        `${API_URL}/api/interactions`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            session_id: getSessionId(),
            product_id: Number(productId),
            action,
          }),
        }
      );
    } catch (err) {
      console.error(
        "Interaction tracking error:",
        err
      );
    }
  }

  // ==========================================================
  // RECOMMENDATION CLICK
  // ==========================================================

  async function handleRecommendationClick(
    product
  ) {
    if (!product?.id) return;

    await trackInteraction(
      product.id,
      "recommendation_click"
    );

    await trackInteraction(
      product.id,
      "view"
    );

    // Save recently viewed
    const existing =
      getStoredArray(
        RECENTLY_VIEWED_KEY
      );

    const filtered = existing.filter(
      (item) =>
        getProductId(item) !==
        Number(product.id)
    );

    const updated = [
      product,
      ...filtered,
    ].slice(0, 10);

    localStorage.setItem(
      RECENTLY_VIEWED_KEY,
      JSON.stringify(updated)
    );

    if (onViewProduct) {
      onViewProduct(product);
    }

    setSelectedProduct(product);
  }

  // ==========================================================
  // FAVORITE
  // ==========================================================

  async function toggleFavorite(product) {
    if (!product?.id) return;

    const productId = Number(
      product.id
    );

    const isFavorite =
      favorites.includes(productId);

    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites =
        favorites.filter(
          (id) => id !== productId
        );

      await trackInteraction(
        productId,
        "unfavorite"
      );
    } else {
      updatedFavorites = [
        ...favorites,
        productId,
      ];

      await trackInteraction(
        productId,
        "favorite"
      );
    }

    setFavorites(updatedFavorites);

    // Keep complete product objects
    // inside localStorage.
    const existingProducts =
      getStoredArray(FAVORITES_KEY);

    let updatedProducts;

    if (isFavorite) {
      updatedProducts =
        existingProducts.filter(
          (item) =>
            getProductId(item) !==
            productId
        );
    } else {
      const filtered =
        existingProducts.filter(
          (item) =>
            getProductId(item) !==
            productId
        );

      updatedProducts = [
        ...filtered,
        product,
      ];
    }

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedProducts)
    );

    loadUserActivity();
  }

  // ==========================================================
  // BACK BUTTON
  // ==========================================================

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }

  // ==========================================================
  // LOADING UI
  // ==========================================================

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="recommendations-loading">
          <div className="loading-icon">
            <Sparkles size={32} />
          </div>

          <h2>
            Finding products for you...
          </h2>

          <p>
            Our AI is analyzing your
            favorites and recent activity.
          </p>

          <div className="loading-bar">
            <span />
          </div>
        </div>

        <style>{`
          .recommendations-page {
            min-height: 100vh;
            padding: 100px 6%;
            background:
              radial-gradient(
                circle at 20% 10%,
                rgba(124, 58, 237, 0.16),
                transparent 35%
              ),
              radial-gradient(
                circle at 80% 20%,
                rgba(59, 130, 246, 0.12),
                transparent 35%
              ),
              #070711;
            color: #fff;
          }

          .recommendations-loading {
            min-height: 65vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .loading-icon {
            width: 78px;
            height: 78px;
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(
              135deg,
              #7c3aed,
              #2563eb
            );
            box-shadow:
              0 0 50px rgba(124, 58, 237, 0.35);
            animation: pulse 1.6s infinite;
          }

          .recommendations-loading h2 {
            margin: 25px 0 8px;
            font-size: 30px;
          }

          .recommendations-loading p {
            color: #a1a1aa;
            margin: 0;
          }

          .loading-bar {
            width: 240px;
            height: 5px;
            margin-top: 25px;
            overflow: hidden;
            border-radius: 10px;
            background: #181824;
          }

          .loading-bar span {
            display: block;
            width: 45%;
            height: 100%;
            border-radius: 10px;
            background: linear-gradient(
              90deg,
              #7c3aed,
              #ec4899,
              #2563eb
            );
            animation: loading 1.3s infinite;
          }

          @keyframes pulse {
            50% {
              transform: scale(1.08);
            }
          }

          @keyframes loading {
            0% {
              transform: translateX(-120px);
            }

            100% {
              transform: translateX(250px);
            }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================================
  // ERROR UI
  // ==========================================================

  if (error) {
    return (
      <div className="recommendations-page">
        <div className="recommendations-error">
          <Brain size={42} />

          <h2>
            Recommendations unavailable
          </h2>

          <p>{error}</p>

          <button
            onClick={loadRecommendations}
          >
            Try Again
          </button>
        </div>

        <style>{`
          .recommendations-page {
            min-height: 100vh;
            padding: 100px 6%;
            background: #070711;
            color: #fff;
          }

          .recommendations-error {
            min-height: 65vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .recommendations-error svg {
            color: #a78bfa;
          }

          .recommendations-error p {
            color: #a1a1aa;
          }

          .recommendations-error button {
            margin-top: 20px;
            border: 0;
            padding: 12px 22px;
            border-radius: 12px;
            color: white;
            cursor: pointer;
            background: linear-gradient(
              135deg,
              #7c3aed,
              #2563eb
            );
          }
        `}</style>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="recommendations-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="recommendations-header">

        <button
          className="back-button"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="title-area">

          <div className="title-icon">
            <Sparkles size={25} />
          </div>

          <div>
            <div className="eyebrow">
              AI POWERED
            </div>

            <h1>
              Recommended For You
            </h1>

            <p>
              Personalized products based
              on your activity
            </p>
          </div>

        </div>

        <div className="ai-badge">
          <Brain size={16} />
          ML Recommendations
        </div>

      </header>

      {/* ======================================================
          INFO BANNER
      ====================================================== */}

      <section className="ai-info">

        <div className="ai-info-icon">
          <Brain size={24} />
        </div>

        <div className="ai-info-content">
          <h3>
            Your recommendations are
            personalized by AI
          </h3>

          <p>
            We analyze your favorites and
            recently viewed products using
            TF-IDF and cosine similarity to
            discover products matching your
            interests.
          </p>
        </div>

        <div className="ai-info-stats">

          <div>
            <strong>
              {favorites.length}
            </strong>
            <span>Favorites</span>
          </div>

          <div>
            <strong>
              {activityProducts.length}
            </strong>
            <span>Activity</span>
          </div>

          <div>
            <strong>
              {recommendations.length}
            </strong>
            <span>Results</span>
          </div>

        </div>

      </section>

      {/* ======================================================
          RECOMMENDATION GRID
      ====================================================== */}

      <section className="recommendations-section">

        <div className="section-heading">

          <div>
            <h2>
              <Sparkles size={21} />
              Top Picks For You
            </h2>

            <p>
              Products selected by our
              recommendation engine
            </p>
          </div>

          <div className="result-count">
            {recommendations.length} products
          </div>

        </div>

        {recommendations.length === 0 ? (
          <div className="empty-state">

            <ShoppingBag size={42} />

            <h3>
              No personalized products yet
            </h3>

            <p>
              Browse or favorite some
              products and we'll learn your
              preferences.
            </p>

          </div>
        ) : (
          <div className="recommendation-grid">

            {recommendations.map(
              (product, index) => {

                const isFavorite =
                  favorites.includes(
                    Number(product.id)
                  );

                const score = Number(
                  product.similarity_score || 0
                );

                const reasons =
                  getRecommendationReasons(
                    product,
                    activityProducts
                  );

                return (
                  <article
                    className="recommendation-card"
                    key={product.id}
                  >

                    {/* RANK */}

                    <div className="rank-badge">
                      #{index + 1}
                    </div>

                    {/* IMAGE */}

                    <div
                      className="product-image"
                      onClick={() =>
                        handleRecommendationClick(
                          product
                        )
                      }
                    >

                      {product.image_url ? (
                        <img
                          src={
                            product.image_url
                          }
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingBag
                          size={55}
                        />
                      )}

                      <div className="image-overlay">
                        <Eye size={18} />
                        View Product
                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="product-content">

                      <div className="product-meta">

                        <span>
                          {product.category ||
                            "Product"}
                        </span>

                        {product.brand && (
                          <>
                            <span>•</span>
                            <span>
                              {product.brand}
                            </span>
                          </>
                        )}

                      </div>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="rating-row">

                        <div className="rating">
                          <Star
                            size={15}
                            fill="currentColor"
                          />

                          <span>
                            {Number(
                              product.rating || 0
                            ).toFixed(1)}
                          </span>
                        </div>

                        <strong>
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                      {/* =================================================
                          MATCH SCORE
                      ================================================= */}

                      <div className="match-box">

                        <div className="match-header">

                          <span>
                            <Sparkles
                              size={15}
                            />
                            AI Match
                          </span>

                          <strong>
                            {score.toFixed(2)}%
                          </strong>

                        </div>

                        <div className="match-progress">
                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  score,
                                  4
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                      </div>

                      {/* =================================================
                          WHY THIS PRODUCT
                      ================================================= */}

                      <div className="why-box">

                        <div className="why-title">

                          <Lightbulb
                            size={17}
                          />

                          <span>
                            Why this product?
                          </span>

                        </div>

                        <div className="why-list">

                          {reasons.map(
                            (
                              reason,
                              reasonIndex
                            ) => {

                              let Icon = Activity;

                              if (
                                reason
                                  .toLowerCase()
                                  .includes(
                                    "categor"
                                  )
                              ) {
                                Icon = Tag;
                              }

                              if (
                                reason
                                  .toLowerCase()
                                  .includes(
                                    "brand"
                                  )
                              ) {
                                Icon = Award;
                              }

                              if (
                                reason
                                  .toLowerCase()
                                  .includes(
                                    "similarity"
                                  )
                              ) {
                                Icon = Brain;
                              }

                              return (
                                <div
                                  className="why-item"
                                  key={
                                    reasonIndex
                                  }
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

                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="product-actions">

                        <button
                          className="view-button"
                          onClick={() =>
                            handleRecommendationClick(
                              product
                            )
                          }
                        >
                          View Product
                          <ChevronRight
                            size={17}
                          />
                        </button>

                        <button
                          className={`favorite-button ${
                            isFavorite
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            toggleFavorite(
                              product
                            )
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

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="how-section">

        <div className="how-heading">
          <span>HOW IT WORKS</span>

          <h2>
            Recommendation Engine
          </h2>

          <p>
            Your ProductAI recommendation
            system continuously learns from
            your interactions.
          </p>
        </div>

        <div className="how-grid">

          <div className="how-card">

            <div className="how-icon">
              <Heart size={22} />
            </div>

            <span>01</span>

            <h3>
              Your Favorites
            </h3>

            <p>
              Favorite products receive
              stronger preference weight in
              the recommendation model.
            </p>

          </div>

          <div className="how-card">

            <div className="how-icon">
              <Eye size={22} />
            </div>

            <span>02</span>

            <h3>
              Recent Activity
            </h3>

            <p>
              Recently viewed products help
              identify your current interests.
            </p>

          </div>

          <div className="how-card">

            <div className="how-icon">
              <Brain size={22} />
            </div>

            <span>03</span>

            <h3>
              ML Analysis
            </h3>

            <p>
              TF-IDF converts product content
              into vectors and cosine similarity
              finds relevant products.
            </p>

          </div>

          <div className="how-card">

            <div className="how-icon">
              <Sparkles size={22} />
            </div>

            <span>04</span>

            <h3>
              Personalized Results
            </h3>

            <p>
              The highest matching products
              are presented as personalized
              recommendations.
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          PRODUCT DETAIL MODAL
      ====================================================== */}

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedProduct(null)
          }
        >

          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ×
            </button>

            <div className="modal-image">

              {selectedProduct.image_url ? (
                <img
                  src={
                    selectedProduct.image_url
                  }
                  alt={
                    selectedProduct.name
                  }
                />
              ) : (
                <ShoppingBag
                  size={70}
                />
              )}

            </div>

            <div className="modal-details">

              <div className="product-meta">
                {selectedProduct.category}
              </div>

              <h2>
                {selectedProduct.name}
              </h2>

              <p>
                {selectedProduct.description ||
                  "No description available."}
              </p>

              <div className="modal-price">
                ₹
                {Number(
                  selectedProduct.price || 0
                ).toLocaleString("en-IN")}
              </div>

              <div className="modal-rating">

                <Star
                  size={17}
                  fill="currentColor"
                />

                {Number(
                  selectedProduct.rating || 0
                ).toFixed(1)}

              </div>

              <button
                className="modal-action"
                onClick={() =>
                  setSelectedProduct(null)
                }
              >
                Continue Shopping
                <ChevronRight size={18} />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .recommendations-page {
          min-height: 100vh;
          padding: 90px 6% 80px;
          color: #f8fafc;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(124, 58, 237, 0.18),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(37, 99, 235, 0.15),
              transparent 30%
            ),
            #070711;
        }

        /* HEADER */

        .recommendations-header {
          max-width: 1400px;
          margin: 0 auto 35px;
          display: flex;
          align-items: center;
          gap: 25px;
          position: relative;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 15px;
          border: 1px solid #272738;
          border-radius: 12px;
          background: rgba(20, 20, 34, 0.8);
          color: #c4c4d4;
          cursor: pointer;
          transition: 0.25s;
        }

        .back-button:hover {
          color: #fff;
          border-color: #7c3aed;
          transform: translateX(-3px);
        }

        .title-area {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .title-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              #7c3aed,
              #2563eb
            );
          box-shadow:
            0 10px 40px
            rgba(124, 58, 237, 0.3);
        }

        .eyebrow {
          font-size: 10px;
          letter-spacing: 2px;
          color: #a78bfa;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .title-area h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 43px);
          line-height: 1.1;
          background:
            linear-gradient(
              90deg,
              #fff,
              #c4b5fd,
              #93c5fd
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .title-area p {
          margin: 7px 0 0;
          color: #8f8fa3;
          font-size: 14px;
        }

        .ai-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          border: 1px solid
            rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          background: rgba(124, 58, 237, 0.08);
          color: #c4b5fd;
          font-size: 12px;
          white-space: nowrap;
        }

        /* AI INFO */

        .ai-info {
          max-width: 1400px;
          margin: 0 auto 50px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 18px;
          border: 1px solid
            rgba(124, 58, 237, 0.2);
          border-radius: 20px;
          background:
            linear-gradient(
              120deg,
              rgba(124, 58, 237, 0.09),
              rgba(37, 99, 235, 0.05)
            );
          backdrop-filter: blur(15px);
        }

        .ai-info-icon {
          width: 52px;
          height: 52px;
          min-width: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: #c4b5fd;
          background: rgba(124, 58, 237, 0.15);
        }

        .ai-info-content {
          flex: 1;
        }

        .ai-info-content h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .ai-info-content p {
          margin: 0;
          color: #9494a8;
          font-size: 13px;
          line-height: 1.6;
        }

        .ai-info-stats {
          display: flex;
          gap: 25px;
          padding-left: 20px;
          border-left: 1px solid #29293a;
        }

        .ai-info-stats div {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .ai-info-stats strong {
          font-size: 21px;
          color: #c4b5fd;
        }

        .ai-info-stats span {
          color: #77778a;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        /* SECTION */

        .recommendations-section {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0;
          font-size: 24px;
        }

        .section-heading h2 svg {
          color: #a78bfa;
        }

        .section-heading p {
          margin: 6px 0 0;
          color: #77778a;
          font-size: 13px;
        }

        .result-count {
          padding: 8px 13px;
          border: 1px solid #28283a;
          border-radius: 10px;
          color: #a1a1b1;
          font-size: 12px;
          background: #10101b;
        }

        /* GRID */

        .recommendation-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .recommendation-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #252537;
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              rgba(22, 22, 37, 0.98),
              rgba(12, 12, 22, 0.98)
            );
          transition:
            transform 0.3s,
            border-color 0.3s,
            box-shadow 0.3s;
        }

        .recommendation-card:hover {
          transform: translateY(-7px);
          border-color:
            rgba(124, 58, 237, 0.55);
          box-shadow:
            0 22px 60px
            rgba(0, 0, 0, 0.4),
            0 0 30px
            rgba(124, 58, 237, 0.08);
        }

        .rank-badge {
          position: absolute;
          z-index: 4;
          top: 13px;
          left: 13px;
          padding: 6px 9px;
          border-radius: 9px;
          color: #ddd6fe;
          font-size: 11px;
          font-weight: 700;
          background: rgba(7, 7, 17, 0.78);
          border: 1px solid
            rgba(167, 139, 250, 0.25);
          backdrop-filter: blur(8px);
        }

        /* IMAGE */

        .product-image {
          height: 230px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(
              circle,
              rgba(124, 58, 237, 0.1),
              transparent 65%
            );
          cursor: pointer;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 24px;
          transition: transform 0.4s;
        }

        .recommendation-card:hover
          .product-image img {
          transform: scale(1.07);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          opacity: 0;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          background:
            rgba(7, 7, 17, 0.5);
          backdrop-filter: blur(3px);
          transition: 0.25s;
        }

        .product-image:hover
          .image-overlay {
          opacity: 1;
        }

        /* CONTENT */

        .product-content {
          padding: 20px;
        }

        .product-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #8b7fc1;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 700;
        }

        .product-content h3 {
          margin: 8px 0 12px;
          font-size: 18px;
          line-height: 1.3;
          color: #f8fafc;
        }

        .rating-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #fbbf24;
          font-size: 13px;
        }

        .rating-row strong {
          font-size: 18px;
          color: #fff;
        }

        /* MATCH */

        .match-box {
          padding: 12px;
          margin-bottom: 13px;
          border: 1px solid
            rgba(124, 58, 237, 0.16);
          border-radius: 13px;
          background:
            rgba(124, 58, 237, 0.055);
        }

        .match-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 11px;
        }

        .match-header span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #aaa3c4;
        }

        .match-header strong {
          color: #c4b5fd;
        }

        .match-progress {
          height: 5px;
          overflow: hidden;
          border-radius: 10px;
          background: #252536;
        }

        .match-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #7c3aed,
              #ec4899,
              #2563eb
            );
          transition: width 0.7s ease;
        }

        /* WHY BOX */

        .why-box {
          padding: 14px;
          margin-bottom: 15px;
          border: 1px solid
            rgba(251, 191, 36, 0.12);
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              rgba(251, 191, 36, 0.045),
              rgba(124, 58, 237, 0.045)
            );
        }

        .why-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #fcd34d;
          font-size: 12px;
          font-weight: 700;
        }

        .why-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .why-item {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          color: #a9a9ba;
          font-size: 11px;
          line-height: 1.45;
        }

        .why-item svg {
          min-width: 14px;
          margin-top: 1px;
          color: #a78bfa;
        }

        /* ACTIONS */

        .product-actions {
          display: flex;
          gap: 9px;
        }

        .view-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px;
          border: 0;
          border-radius: 11px;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          background:
            linear-gradient(
              135deg,
              #7c3aed,
              #2563eb
            );
          transition: 0.25s;
        }

        .view-button:hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
        }

        .favorite-button {
          width: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #303044;
          border-radius: 11px;
          color: #9b9bad;
          background: #151522;
          cursor: pointer;
          transition: 0.25s;
        }

        .favorite-button:hover,
        .favorite-button.active {
          color: #fb7185;
          border-color:
            rgba(244, 63, 94, 0.35);
          background:
            rgba(244, 63, 94, 0.08);
        }

        /* EMPTY */

        .empty-state {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed #303044;
          border-radius: 20px;
          text-align: center;
          color: #77778a;
        }

        .empty-state svg {
          color: #7c3aed;
          margin-bottom: 10px;
        }

        .empty-state h3 {
          color: #ddd;
          margin: 5px 0;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        /* HOW */

        .how-section {
          max-width: 1400px;
          margin: 100px auto 0;
        }

        .how-heading {
          text-align: center;
          max-width: 650px;
          margin: 0 auto 35px;
        }

        .how-heading > span {
          color: #a78bfa;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .how-heading h2 {
          margin: 8px 0;
          font-size: 30px;
        }

        .how-heading p {
          color: #77778a;
          font-size: 13px;
          line-height: 1.7;
        }

        .how-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 16px;
        }

        .how-card {
          position: relative;
          padding: 25px;
          border: 1px solid #242436;
          border-radius: 18px;
          background: rgba(16, 16, 27, 0.8);
          transition: 0.25s;
        }

        .how-card:hover {
          border-color:
            rgba(124, 58, 237, 0.35);
          transform: translateY(-4px);
        }

        .how-card > span {
          position: absolute;
          top: 20px;
          right: 20px;
          color: #3b3b50;
          font-size: 12px;
          font-weight: 800;
        }

        .how-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border-radius: 13px;
          color: #c4b5fd;
          background:
            rgba(124, 58, 237, 0.1);
        }

        .how-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
        }

        .how-card p {
          margin: 0;
          color: #77778a;
          font-size: 12px;
          line-height: 1.65;
        }

        /* MODAL */

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(10px);
        }

        .product-modal {
          position: relative;
          width: min(800px, 100%);
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          border: 1px solid #303044;
          border-radius: 25px;
          background: #10101b;
          box-shadow:
            0 30px 100px
            rgba(0, 0, 0, 0.65);
        }

        .modal-close {
          position: absolute;
          z-index: 3;
          top: 12px;
          right: 15px;
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 50%;
          color: #aaa;
          background: #202031;
          cursor: pointer;
          font-size: 22px;
        }

        .modal-image {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background:
            radial-gradient(
              circle,
              rgba(124, 58, 237, 0.12),
              transparent 65%
            );
        }

        .modal-image img {
          width: 100%;
          height: 100%;
          max-height: 360px;
          object-fit: contain;
        }

        .modal-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px;
        }

        .modal-details h2 {
          margin: 9px 0 15px;
          font-size: 27px;
        }

        .modal-details p {
          color: #858598;
          font-size: 13px;
          line-height: 1.7;
        }

        .modal-price {
          margin: 18px 0 8px;
          font-size: 25px;
          font-weight: 800;
        }

        .modal-rating {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #fbbf24;
          font-size: 13px;
        }

        .modal-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 25px;
          padding: 13px;
          border: 0;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          background:
            linear-gradient(
              135deg,
              #7c3aed,
              #2563eb
            );
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {

          .recommendation-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .how-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 760px) {

          .recommendations-page {
            padding: 75px 18px 50px;
          }

          .recommendations-header {
            flex-wrap: wrap;
          }

          .back-button {
            order: 1;
          }

          .title-area {
            order: 2;
            width: 100%;
          }

          .ai-badge {
            order: 3;
          }

          .ai-info {
            flex-wrap: wrap;
          }

          .ai-info-stats {
            width: 100%;
            padding: 15px 0 0;
            border-left: 0;
            border-top: 1px solid #29293a;
            justify-content: space-around;
          }

          .recommendation-grid {
            grid-template-columns: 1fr;
          }

          .how-grid {
            grid-template-columns: 1fr;
          }

          .section-heading {
            align-items: flex-start;
            gap: 15px;
            flex-direction: column;
          }

          .product-modal {
            grid-template-columns: 1fr;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-image {
            min-height: 250px;
          }

          .modal-details {
            padding: 25px;
          }

        }

      `}</style>

    </div>
  );
}