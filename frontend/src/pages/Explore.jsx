import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Explore.css";

const destinations = [
  {
    name: "Palawan",
    category: "Island",
    desc: "Lagoons, limestone cliffs, and island hopping",
    img: "https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Siargao",
    category: "Surf",
    desc: "Surf breaks, lagoons, and laid-back island days",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Vigan",
    category: "Heritage",
    desc: "Historic streets and preserved Spanish-era architecture",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Bohol",
    category: "Nature",
    desc: "Chocolate Hills, beaches, and countryside tours",
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tagaytay",
    category: "Relax",
    desc: "Cool weather, lake views, and weekend escapes",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
];

const categories = ["All", "Island", "Surf", "Heritage", "Nature", "Relax"];

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");

const navigateWithTransition = (navigate, path) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      navigate(path);
    });
  } else {
    navigate(path);
  }
};

const Explore = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredDestinations = useMemo(() => {
    return destinations.filter((place) => {
      const matchesQuery =
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.desc.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || place.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  return (
    <main className="explore-page">
      <div className="explore-content">
        <div className="page-header explore-header">
          <div>
            <h2>Explore Destinations</h2>
            <p>Browse places you can add to your next travel plan.</p>
          </div>

          <div className="explore-count">
            <span>{filteredDestinations.length}</span>
            <p>places found</p>
          </div>
        </div>

        <div className="explore-toolbar">
          <input
            type="text"
            placeholder="Search destinations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="empty-state">
            No destinations found. Try another search or category.
          </div>
        ) : (
          <div className="explore-grid">
            {filteredDestinations.map((place) => {
              const slug = slugify(place.name);

              return (
                <div
                  className="explore-card"
                  key={place.name}
                  style={{ viewTransitionName: `dest-card-${slug}` }}
                >
                  <img
                    src={place.img}
                    alt={place.name}
                    style={{ viewTransitionName: `dest-image-${slug}` }}
                  />

                  <div className="explore-card-body">
                    <div className="card-title-row">
                      <h3>{place.name}</h3>
                      <span>{place.category}</span>
                    </div>

                    <p>{place.desc}</p>

                    <button
                      className="button-ripple"
                      onClick={() =>
                        navigateWithTransition(navigate, `/destination/${slug}`)
                      }
                    >
                      View Trips
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Explore;
