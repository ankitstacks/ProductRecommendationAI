import React from "react";
import {
  Heart,
  Home,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";

export default function Navbar({
  favoritesCount = 0,
  onNavigate,
}) {
  const navigate = (section) => {
    if (onNavigate) {
      onNavigate(section);
      return;
    }

    const element =
      document.getElementById(section);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="navbar">

      <div
        className="logo"
        onClick={() => navigate("home")}
        style={{ cursor: "pointer" }}
      >
        Product<span>AI</span>
      </div>

      <div className="nav-links">

        <button onClick={() => navigate("home")}>
          <Home size={15} />
          Home
        </button>

        <button
          onClick={() =>
            navigate("products")
          }
        >
          <ShoppingBag size={15} />
          Products
        </button>

        <button
          onClick={() =>
            navigate("recommendations")
          }
        >
          <Sparkles size={15} />
          Recommendations
        </button>

        <button
          onClick={() =>
            navigate("favorites")
          }
        >
          <Heart size={15} />
          Favorites
        </button>

      </div>

      <div className="nav-actions">

        <button
          className="icon-button"
          onClick={() =>
            navigate("favorites")
          }
        >
          <Heart size={19} />

          {favoritesCount > 0 && (
            <span>
              {favoritesCount}
            </span>
          )}
        </button>

        <button className="profile-button">
          <User size={17} />
          <span>Account</span>
        </button>

      </div>

    </nav>
  );
}