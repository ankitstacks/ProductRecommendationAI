import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Search,
  Sparkles,
  ShoppingBag,
  Heart,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import ProductCard from "./components/ProductCard";

import "./App.css";


function App() {

  // =====================================================
  // BACKEND URL
  // =====================================================

  const API_BASE_URL =
    "https://productrecommendationai.onrender.com";


  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");


  // =====================================================
  // CATEGORY
  // =====================================================

  const [category, setCategory] = useState("All");


  // =====================================================
  // FAVORITES
  // =====================================================

  const [favorites, setFavorites] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "productAI_favorites"
        );

      return saved
        ? JSON.parse(saved)
        : [];

    } catch (error) {

      console.error(
        "Favorites loading error:",
        error
      );

      return [];

    }

  });


  // =====================================================
  // RECENTLY VIEWED
  // =====================================================

  const [recentlyViewed, setRecentlyViewed] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            "productAI_recentlyViewed"
          );

        return saved
          ? JSON.parse(saved)
          : [];

      } catch (error) {

        console.error(
          "Recently viewed loading error:",
          error
        );

        return [];

      }

    });


  // =====================================================
  // SELECTED PRODUCT
  // =====================================================

  const [selectedProduct, setSelectedProduct] =
    useState(null);


  // =====================================================
  // RECOMMENDATIONS
  // =====================================================

  const [recommendations, setRecommendations] =
    useState([]);


  // =====================================================
  // RECOMMENDATION LOADING
  // =====================================================

  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(false);


  // =====================================================
  // RECOMMENDATION ERROR
  // =====================================================

  const [
    recommendationError,
    setRecommendationError,
  ] = useState("");


  // =====================================================
  // SESSION ID
  // =====================================================

  const [sessionId] = useState(() => {

    try {

      const existingSession =
        localStorage.getItem(
          "productAI_session_id"
        );


      if (existingSession) {

        return existingSession;

      }


      const newSession =
        `session-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}`;


      localStorage.setItem(
        "productAI_session_id",
        newSession
      );


      return newSession;

    } catch (error) {

      console.error(
        "Session creation error:",
        error
      );


      return `session-${Date.now()}`;

    }

  });


  // =====================================================
  // TRACK USER INTERACTION
  // =====================================================

  const trackInteraction = async (
    productId,
    action
  ) => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/interactions`,
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
              productId,

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
        "Interaction recorded:",
        data
      );


    } catch (error) {

      console.error(
        "Interaction tracking error:",
        error
      );

    }

  };


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {

    const loadProducts = async () => {

      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          `${API_BASE_URL}/api/products`
        );


        if (!response.ok) {

          throw new Error(
            `Backend returned ${response.status}`
          );

        }


        const data =
          await response.json();


        console.log(
          "Products loaded from PostgreSQL:",
          data
        );


        setProducts(data);

      } catch (error) {

        console.error(
          "Product API Error:",
          error
        );


        setError(
          "Unable to load products. Please make sure the FastAPI backend is running."
        );

      } finally {

        setLoading(false);

      }

    };


    loadProducts();

    const productRefreshInterval = setInterval(
      loadProducts,
      5000
    );

    return () => {
      clearInterval(productRefreshInterval);
    };

  }, []);


  // =====================================================
  // UPDATE URL HASH WHILE SCROLLING
  // =====================================================

  useEffect(() => {

    const sectionIds = [
      "home",
      "search",
      "products",
      "favorites",
      "recommendations",
      "recommendation-results",
      "recently-viewed",
    ];

    const updateActiveSection = () => {

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      if (!sections.length) return;

      // Use the section whose top has most recently crossed
      // the upper part of the viewport. This reliably catches
      // the Products section even when sections have different heights.
      const triggerPoint = window.innerHeight * 0.35;

      let activeSection = sections[0];

      for (const section of sections) {
        const top = section.getBoundingClientRect().top;

        if (top <= triggerPoint) {
          activeSection = section;
        }
      }

      const activeId = activeSection.id;

      if (window.location.hash !== `#${activeId}`) {
        window.history.replaceState(
          null,
          "",
          `#${activeId}`
        );
      }
    };

    updateActiveSection();

    window.addEventListener(
      "scroll",
      updateActiveSection,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateActiveSection
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateActiveSection
      );

      window.removeEventListener(
        "resize",
        updateActiveSection
      );
    };

  }, [loading, recentlyViewed.length]);


  // =====================================================
  // SAVE FAVORITES
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "productAI_favorites",
      JSON.stringify(favorites)
    );

  }, [favorites]);


  // =====================================================
  // SAVE RECENTLY VIEWED
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "productAI_recentlyViewed",
      JSON.stringify(
        recentlyViewed
      )
    );

  }, [recentlyViewed]);


  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {

    return [
      "All",

      ...new Set(
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      ),

    ];

  }, [products]);


  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {

    const searchText =
      search
        .toLowerCase()
        .trim();


    return products.filter(
      (product) => {

        const name =
          product.name
            ?.toLowerCase() || "";


        const brand =
          product.brand
            ?.toLowerCase() || "";


        const matchesSearch =
          name.includes(
            searchText
          ) ||
          brand.includes(
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

  }, [
    products,
    search,
    category,
  ]);


  // =====================================================
  // FAVORITE PRODUCTS
  // =====================================================

  const favoriteProducts =
    products.filter(
      (product) =>
        favorites.includes(
          product.id
        )
    );


  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const toggleFavorite = (id) => {

    const alreadyFavorite =
      favorites.includes(id);


    if (alreadyFavorite) {

      trackInteraction(
        id,
        "unfavorite"
      );

    } else {

      trackInteraction(
        id,
        "favorite"
      );

    }


    setFavorites((current) => {

      if (
        current.includes(id)
      ) {

        return current.filter(
          (item) =>
            item !== id
        );

      }


      return [
        ...current,
        id,
      ];

    });

  };


  // =====================================================
  // VIEW PRODUCT
  // =====================================================

  const handleViewProduct = (
    product
  ) => {

    trackInteraction(
      product.id,
      "view"
    );


    setSelectedProduct(
      product
    );


    setRecentlyViewed(
      (current) => {

        const filtered =
          current.filter(
            (item) =>
              item.id !==
              product.id
          );


        return [
          product,
          ...filtered,
        ].slice(0, 4);

      }
    );


    console.log(
      "Product viewed:",
      product.name
    );

  };


  // =====================================================
  // RECOMMENDATION PRODUCT CLICK
  // =====================================================

  const handleRecommendationView = (
    product
  ) => {

    trackInteraction(
      product.id,
      "recommendation_click"
    );


    handleViewProduct(
      product
    );

  };


  // =====================================================
  // PERSONALIZED ML RECOMMENDATIONS
  // =====================================================

  const loadRecommendations =
    async () => {

      try {

        setRecommendationLoading(
          true
        );

        setRecommendationError("");

        setRecommendations([]);


        // -------------------------------------------------
        // GET RECENTLY VIEWED PRODUCT IDS
        // -------------------------------------------------

        let viewedIds =
          recentlyViewed.map(
            (product) =>
              product.id
          );


        // -------------------------------------------------
        // IF NOTHING VIEWED YET
        // -------------------------------------------------

        if (
          viewedIds.length === 0 &&
          selectedProduct
        ) {

          viewedIds = [
            selectedProduct.id,
          ];

        }


        // -------------------------------------------------
        // REQUEST BODY
        // -------------------------------------------------

        const requestBody = {

          favorite_ids:
            favorites,

          recently_viewed_ids:
            viewedIds,

          limit: 5,

        };


        console.log(
          "Personalization request:",
          requestBody
        );


        // -------------------------------------------------
        // CALL ML API
        // -------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/api/recommendations/personalized`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  requestBody
                ),

            }
          );


        if (!response.ok) {

          const errorText =
            await response.text();

          throw new Error(
            `Recommendation API returned ${response.status}: ${errorText}`
          );

        }


        const data =
          await response.json();


        console.log(
          "Personalized ML response:",
          data
        );


        setRecommendations(
          data.recommendations ||
            []
        );


        // -------------------------------------------------
        // SCROLL TO RESULTS
        // -------------------------------------------------

        setTimeout(() => {

          document
            .getElementById(
              "recommendation-results"
            )
            ?.scrollIntoView({
              behavior:
                "smooth",
            });

        }, 100);


      } catch (error) {

        console.error(
          "Personalized recommendation error:",
          error
        );


        setRecommendationError(
          "Unable to generate personalized recommendations. Please make sure the FastAPI backend is running."
        );

      } finally {

        setRecommendationLoading(
          false
        );

      }

    };


  // =====================================================
  // CLEAR FAVORITES
  // =====================================================

  const clearFavorites = () => {

    // Record unfavorite interaction
    // for all currently saved favorites.

    favorites.forEach(
      (productId) => {

        trackInteraction(
          productId,
          "unfavorite"
        );

      }
    );


    setFavorites([]);

  };


  // =====================================================
  // CLEAR RECENTLY VIEWED
  // =====================================================

  const clearRecentlyViewed = () => {

    setRecentlyViewed([]);

    setSelectedProduct(null);

  };


  // =====================================================
  // RECOMMENDATION REASONS
  // =====================================================

  const getRecommendationReasons = (product) => {

    const reasons = [];

    if (Array.isArray(product?.why_recommended)) {
      product.why_recommended
        .filter(Boolean)
        .forEach((reason) => {
          if (!reasons.includes(reason)) {
            reasons.push(reason);
          }
        });
    }

    const category = String(product?.category || '').toLowerCase();
    const brand = String(product?.brand || '').toLowerCase();

    const categoryMatch = recentlyViewed.some(
      (item) => String(item?.category || '').toLowerCase() === category
    );

    const brandMatch = recentlyViewed.some(
      (item) => String(item?.brand || '').toLowerCase() === brand
    );

    if (category && categoryMatch && !reasons.some((r) => r.toLowerCase().includes('categor'))) {
      reasons.push(`Similar category: ${product.category}`);
    }

    if (brand && brandMatch && !reasons.some((r) => r.toLowerCase().includes('brand'))) {
      reasons.push(`Similar brand: ${product.brand}`);
    }

    const score = Number(product?.similarity_score || 0);

    if (score > 0 && !reasons.some((r) => r.toLowerCase().includes('similarity'))) {
      reasons.push(`Strong content similarity: ${score.toFixed(2)}% match`);
    }

    if ((favorites.length > 0 || recentlyViewed.length > 0) && !reasons.some((r) => r.toLowerCase().includes('activity'))) {
      reasons.push('Matches your favorites and recent activity');
    }

    if (!reasons.length) {
      reasons.push('Recommended based on your product preferences');
    }

    return reasons.slice(0, 4);
  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (

      <div className="app">

        <div
          className="empty-state"
          style={{
            minHeight:
              "100vh",

            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "center",

            alignItems:
              "center",

            gap:
              "12px",
          }}
        >

          <Sparkles size={40} />

          <h2>
            Loading ProductAI...
          </h2>

          <p>
            Connecting to PostgreSQL database
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="app">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <div className="logo">

          Product<span>AI</span>

        </div>


        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#products">
            Products
          </a>

          <a href="#recommendations">
            Recommendations
          </a>

          <a href="#favorites">
            Favorites
          </a>

        </div>


        <div className="nav-actions">

          <button
            className="icon-button"
            title="Favorites"
            onClick={() => {

              document
                .getElementById(
                  "favorites"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });

            }}
          >

            <Heart size={20} />

            {favorites.length >
              0 && (

              <span>
                {favorites.length}
              </span>

            )}

          </button>


        </div>

      </nav>



      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="hero"
        id="home"
      >

        <div
          className="hero-glow glow-one"
        />

        <div
          className="hero-glow glow-two"
        />


        <div className="hero-content">

          <div className="eyebrow">

            <Sparkles size={16} />

            AI-POWERED PRODUCT DISCOVERY

          </div>


          <h1>

            Find Products

            <br />

            <span>
              You’ll Love.
            </span>

          </h1>


          <p>

            Discover products personalized
            around your interests,
            preferences and activity.

          </p>


          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() => {

                document
                  .getElementById(
                    "products"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  });

              }}
            >

              Explore Products

              <ArrowRight
                size={18}
              />

            </button>


            <button
              className="secondary-button"
              onClick={() => {

                document
                  .getElementById(
                    "recommendations"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  });

              }}
            >

              How it works

            </button>

          </div>

        </div>


        <div className="hero-card">

          <div className="floating-icon">

            <Sparkles size={22} />

          </div>


          <p>
            Personalized for you
          </p>


          <h3>
            Smart Recommendations
          </h3>

        </div>

      </section>



      {/* =================================================
          SEARCH
      ================================================= */}

      <section
        className="search-section"
        id="search"
      >

        <div className="search-box">

          <Search size={20} />


          <input
            type="text"
            placeholder="Search products or brands..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </section>



      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section
        className="products-section"
        id="products"
      >

        <div className="section-header">

          <div>

            <div className="section-label">

              <TrendingUp
                size={16}
              />

              EXPLORE PRODUCTS

            </div>


            <h2>
              Popular Products
            </h2>

          </div>


          {!error &&
            products.length >
              0 && (

            <p>

              {filteredProducts.length}
              {" "}
              products

            </p>

          )}

        </div>



        {/* ERROR */}

        {error && (

          <div className="empty-state">

            <Search size={35} />

            <h3>
              Backend Connection Error
            </h3>

            <p>
              {error}
            </p>

          </div>

        )}



        {/* CATEGORY FILTER */}

        {!error &&
          products.length >
            0 && (

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
                    setCategory(
                      item
                    )
                  }
                >

                  {item}

                </button>

              )
            )}

          </div>

        )}



        {/* PRODUCT GRID */}

        {!error && (

          <div className="product-grid">

            {filteredProducts.map(
              (product) => (

                <ProductCard

                  key={
                    product.id
                  }

                  product={{
                    ...product,

                    image:
                      product.image_url,
                  }}

                  isFavorite={
                    favorites.includes(
                      product.id
                    )
                  }

                  onFavorite={
                    toggleFavorite
                  }

                  onView={
                    handleViewProduct
                  }

                />

              )
            )}

          </div>

        )}



        {/* NO RESULTS */}

        {!error &&
          products.length >
            0 &&
          filteredProducts.length ===
            0 && (

          <div className="empty-state">

            <Search size={35} />

            <h3>
              No products found
            </h3>

            <p>
              Try another search
              or category.
            </p>

          </div>

        )}

      </section>



      {/* =================================================
          FAVORITES
      ================================================= */}

      <section
        className="products-section"
        id="favorites"
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


          {favoriteProducts.length >
            0 && (

            <button
              className="secondary-button"
              onClick={
                clearFavorites
              }
            >

              Clear Favorites

            </button>

          )}

        </div>


        {favoriteProducts.length >
          0 ? (

          <div className="product-grid">

            {favoriteProducts.map(
              (product) => (

                <ProductCard

                  key={
                    product.id
                  }

                  product={{
                    ...product,

                    image:
                      product.image_url,
                  }}

                  isFavorite={
                    true
                  }

                  onFavorite={
                    toggleFavorite
                  }

                  onView={
                    handleViewProduct
                  }

                />

              )
            )}

          </div>

        ) : (

          <div className="empty-state">

            <Heart size={35} />

            <h3>
              No favorites yet
            </h3>

            <p>
              Click the heart icon
              on any product to
              save it here.
            </p>

          </div>

        )}

      </section>



      {/* =================================================
          PERSONALIZED RECOMMENDATIONS
      ================================================= */}

      <section
        className="recommendation-section"
        id="recommendations"
      >

        <div className="recommendation-content">

          <div className="section-label">

            <Sparkles size={16} />

            PERSONALIZED MACHINE LEARNING

          </div>


          <h2>

            Recommendations

            <br />

            made for <span>you.</span>

          </h2>


          <p>

            ProductAI learns from your
            favorites and recently viewed
            products to create a personalized
            product profile using machine
            learning.

          </p>


          {selectedProduct && (

            <div
              style={{
                marginBottom:
                  "18px",

                padding:
                  "12px 16px",

                borderRadius:
                  "12px",

                background:
                  "rgba(255,255,255,0.06)",

                border:
                  "1px solid rgba(255,255,255,0.1)",
              }}
            >

              <small>
                Latest product viewed
              </small>

              <strong
                style={{
                  display:
                    "block",

                  marginTop:
                    "4px",
                }}
              >

                {selectedProduct.name}

              </strong>

            </div>

          )}


          <button
            className="primary-button"
            onClick={
              loadRecommendations
            }
            disabled={
              recommendationLoading
            }
          >

            {recommendationLoading ? (

              <>

                <RefreshCw
                  size={18}
                  className="spin"
                />

                Analyzing Preferences...

              </>

            ) : (

              <>

                See My Recommendations

                <ArrowRight
                  size={18}
                />

              </>

            )}

          </button>

        </div>


        <div className="recommendation-visual">

          <div className="ai-orb">

            <Sparkles size={40} />

          </div>


          <div className="recommendation-floating-card">

            <Heart size={17} />

            <span>
              Learning your preferences...
            </span>

          </div>

        </div>

      </section>



      {/* =================================================
          ML RESULTS
      ================================================= */}

      <section
        className="products-section"
        id="recommendation-results"
      >

        <div className="section-header">

          <div>

            <div className="section-label">

              <Sparkles size={16} />

              AI RECOMMENDATIONS

            </div>


            <h2>
              You May Also Like
            </h2>

          </div>


          {recommendations.length >
            0 && (

            <p>

              {recommendations.length}
              {" "}
              personalized matches

            </p>

          )}

        </div>



        {/* LOADING */}

        {recommendationLoading && (

          <div className="empty-state">

            <RefreshCw
              size={35}
              className="spin"
            />

            <h3>
              Analyzing your preferences...
            </h3>

            <p>
              Combining favorites and recently
              viewed products with ML.
            </p>

          </div>

        )}



        {/* ERROR */}

        {!recommendationLoading &&
          recommendationError && (

          <div className="empty-state">

            <Search size={35} />

            <h3>
              Recommendation Error
            </h3>

            <p>
              {recommendationError}
            </p>

          </div>

        )}



        {/* RESULTS */}

        {!recommendationLoading &&
          !recommendationError &&
          recommendations.length >
            0 && (

          <div className="product-grid">

            {recommendations.map(
              (product) => (

                <div
                  key={
                    product.id
                  }

                  style={{
                    position:
                      "relative",
                  }}
                >

                  {/* MATCH SCORE */}

                  <div
                    style={{
                      position:
                        "absolute",

                      top:
                        "12px",

                      left:
                        "12px",

                      zIndex:
                        10,

                      padding:
                        "6px 10px",

                      borderRadius:
                        "20px",

                      background:
                        "rgba(0,0,0,0.78)",

                      border:
                        "1px solid rgba(255,255,255,0.15)",

                      fontSize:
                        "12px",

                      fontWeight:
                        "700",

                      backdropFilter:
                        "blur(10px)",
                    }}
                  >

                    {product.similarity_score}
                    % match

                  </div>


                  <ProductCard

                    product={{
                      ...product,

                      image:
                        product.image_url,
                    }}

                    isFavorite={
                      favorites.includes(
                        product.id
                      )
                    }

                    onFavorite={
                      toggleFavorite
                    }

                    onView={
                      handleRecommendationView
                    }

                  />

                  {/* WHY THIS PRODUCT */}
                  <div
                    style={{
                      marginTop: '-1px',
                      padding: '14px 16px',
                      borderRadius: '0 0 16px 16px',
                      background: 'linear-gradient(135deg, rgba(124,58,237,.08), rgba(251,191,36,.04))',
                      border: '1px solid rgba(124,58,237,.18)',
                      borderTop: '1px solid rgba(124,58,237,.10)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        color: '#fcd34d',
                        fontSize: '12px',
                        fontWeight: 700,
                        marginBottom: '9px',
                      }}
                    >
                      <span>💡</span>
                      <span>Why this product?</span>
                    </div>

                    {getRecommendationReasons(product).map((reason, reasonIndex) => (
                      <div
                        key={`${product.id}-reason-${reasonIndex}`}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '7px',
                          color: '#aaaabd',
                          fontSize: '11px',
                          lineHeight: '1.45',
                          marginTop: reasonIndex ? '6px' : '0',
                        }}
                      >
                        <span style={{ color: '#a78bfa' }}>✓</span>
                        <span>{reason}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: '11px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px',
                          fontSize: '10px',
                          color: '#77778a',
                        }}
                      >
                        <span>AI relevance</span>
                        <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
                          {Number(product.similarity_score || 0).toFixed(2)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          overflow: 'hidden',
                          borderRadius: '10px',
                          background: '#272738',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(Math.max(Number(product.similarity_score || 0), 3), 100)}%`,
                            height: '100%',
                            borderRadius: '10px',
                            background: 'linear-gradient(90deg, #7c3aed, #ec4899, #2563eb)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                </div>

              )
            )}

          </div>

        )}



        {/* EMPTY */}

        {!recommendationLoading &&
          !recommendationError &&
          recommendations.length ===
            0 && (

          <div className="empty-state">

            <Sparkles size={35} />

            <h3>
              Your recommendations
              will appear here
            </h3>

            <p>
              Add favorites or view some
              products, then click
              "See My Recommendations".
            </p>

          </div>

        )}

      </section>



      {/* =================================================
          RECENTLY VIEWED
      ================================================= */}

      {recentlyViewed.length >
        0 && (

        <section
          className="products-section"
          id="recently-viewed"
        >

          <div className="section-header">

            <div>

              <div className="section-label">

                <TrendingUp
                  size={16}
                />

                RECENT ACTIVITY

              </div>


              <h2>
                Recently Viewed
              </h2>

            </div>


            <button
              className="secondary-button"
              onClick={
                clearRecentlyViewed
              }
            >

              Clear History

            </button>

          </div>


          <div className="product-grid">

            {recentlyViewed.map(
              (product) => (

                <ProductCard

                  key={
                    product.id
                  }

                  product={{
                    ...product,

                    image:
                      product.image_url,
                  }}

                  isFavorite={
                    favorites.includes(
                      product.id
                    )
                  }

                  onFavorite={
                    toggleFavorite
                  }

                  onView={
                    handleViewProduct
                  }

                />

              )
            )}

          </div>

        </section>

      )}



      {/* =================================================
          PRODUCT DETAILS MODAL
      ================================================= */}

      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "24px",
              background: "linear-gradient(145deg, #171725, #0f0f18)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 30px 100px rgba(0,0,0,0.65)",
              position: "relative",
              padding: "28px",
            }}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.07)",
                color: "#fff",
                fontSize: "22px",
                cursor: "pointer",
                zIndex: 5,
              }}
              aria-label="Close product details"
            >
              ×
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 0.9fr) minmax(300px, 1.1fr)",
                gap: "32px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  minHeight: "360px",
                  borderRadius: "20px",
                  background: "linear-gradient(145deg, #202033, #12121d)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "25px",
                }}
              >
                <img
                  src={selectedProduct.image_url || selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{
                    width: "100%",
                    maxHeight: "330px",
                    objectFit: "contain",
                    borderRadius: "16px",
                  }}
                />
              </div>

              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "7px 12px",
                    borderRadius: "20px",
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "#c4b5fd",
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "16px",
                  }}
                >
                  {selectedProduct.category || "Product"}
                </span>

                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#fff",
                    fontSize: "32px",
                    lineHeight: "1.15",
                  }}
                >
                  {selectedProduct.name}
                </h2>

                {selectedProduct.brand && (
                  <p
                    style={{
                      margin: "0 0 18px",
                      color: "#9292a8",
                      fontSize: "15px",
                    }}
                  >
                    {selectedProduct.brand}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px",
                    color: "#fcd34d",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  ⭐ {selectedProduct.rating ?? "4.5"}
                  <span style={{ color: "#77778a", fontWeight: "400" }}>
                    Product Rating
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: "20px",
                  }}
                >
                  ₹{Number(selectedProduct.price || 0).toLocaleString("en-IN")}
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <h4 style={{ color: "#fff", margin: "0 0 8px", fontSize: "14px" }}>
                    Description
                  </h4>
                  <p
                    style={{
                      color: "#aaaabd",
                      lineHeight: "1.7",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    {selectedProduct.description ||
                      "No description available for this product."}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "24px",
                    color:
                      Number(selectedProduct.stock || 0) > 0
                        ? "#86efac"
                        : "#fca5a5",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background:
                        Number(selectedProduct.stock || 0) > 0
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                  />
                  {Number(selectedProduct.stock || 0) > 0
                    ? `In Stock • ${selectedProduct.stock} available`
                    : "Out of Stock"}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="primary-button"
                    onClick={() => toggleFavorite(selectedProduct.id)}
                  >
                    <Heart
                      size={18}
                      fill={
                        favorites.includes(selectedProduct.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {favorites.includes(selectedProduct.id)
                      ? "Remove Favorite"
                      : "Add to Favorites"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
          padding: "34px 8%",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            minWidth: 0,
          }}
        >

          <div className="logo" style={{ flexShrink: 0 }}>
            Product<span>AI</span>
          </div>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.42)",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            Intelligent product discovery
            <br />
            powered by machine learning.
          </p>

        </div>


        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 13px",
            borderRadius: "999px",
            border: "1px solid rgba(124,58,237,0.22)",
            background: "rgba(255,255,255,0.025)",
            boxShadow: "0 0 24px rgba(124,58,237,0.07)",
            whiteSpace: "nowrap",
            animation: "footerCreditFloat 3.5s ease-in-out infinite",
          }}
        >

          <span
            style={{
              color: "rgba(255,255,255,0.42)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Crafted by
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              background:
                "linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6,#a78bfa)",
              backgroundSize: "250% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              animation: "footerNameShimmer 4s linear infinite",
            }}
          >
            Ankit Kushwaha
          </span>

          <span
            style={{
              width: "5px",
              height: "5px",
              flexShrink: 0,
              borderRadius: "50%",
              background: "#8b5cf6",
              boxShadow: "0 0 9px rgba(139,92,246,0.9)",
              animation: "footerDotPulse 1.8s ease-in-out infinite",
            }}
          />

        </div>


        <style>{`
          @keyframes footerNameShimmer {
            0% {
              background-position: 0% center;
            }
            100% {
              background-position: 250% center;
            }
          }

          @keyframes footerDotPulse {
            0%, 100% {
              opacity: 0.45;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.25);
            }
          }

          @keyframes footerCreditFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
          }

          @media (max-width: 700px) {
            footer {
              justify-content: center !important;
              text-align: center;
            }

            footer > div:first-child {
              justify-content: center;
              flex-wrap: wrap;
            }

            footer > div:first-child p {
              width: 100%;
            }
          }
        `}</style>

      </footer>

    </div>

  );

}


export default App;