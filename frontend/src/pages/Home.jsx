import React from "react";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Heart,
  TrendingUp,
} from "lucide-react";

export default function Home({
  onExplore,
  onRecommendations,
}) {
  return (
    <section
      id="home"
      className="hero"
    >

      <div className="hero-content">

        <div className="eyebrow">

          <Sparkles size={16} />

          AI-POWERED PRODUCT
          DISCOVERY

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
            onClick={onExplore}
          >
            Explore Products
            <ArrowRight size={18} />
          </button>

          <button
            className="secondary-button"
            onClick={
              onRecommendations
            }
          >
            <Sparkles size={17} />
            My Recommendations
          </button>

        </div>

      </div>


      <div className="hero-card">

        <div className="floating-icon">
          <Brain size={22} />
        </div>

        <p>
          Personalized for you
        </p>

        <h3>
          Smart Recommendations
        </h3>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "18px",
          }}
        >

          <span>
            <Heart size={15} />
            Favorites
          </span>

          <span>
            <TrendingUp size={15} />
            Activity
          </span>

        </div>

      </div>

    </section>
  );
}