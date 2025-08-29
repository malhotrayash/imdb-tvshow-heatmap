import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  // search shows
  useEffect(() => {
    if (query.length > 2) {
      // ✅ reset selected show when user is searching
      setSelectedShow(null);

      fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
        .then((res) => res.json())
        .then((data) => setResults(data.map((item) => item.show)));
    } else {
      setResults([]);
    }
  }, [query]);

  // fetch episodes when a show is selected
  useEffect(() => {
    if (selectedShow) {
      fetch(`https://api.tvmaze.com/shows/${selectedShow.id}/episodes`)
        .then((res) => res.json())
        .then((data) => setEpisodes(data));
    }
  }, [selectedShow]);

  // group episodes into seasons
  const seasons = episodes.reduce((acc, ep) => {
    acc[ep.season] = acc[ep.season] || [];
    acc[ep.season].push(ep);
    return acc;
  }, {});

  const getColor = (rating) => {
    if (!rating) return "#ccc";
    if (rating >= 9) return "#006400";
    if (rating >= 7.5) return "#6B8E23";
    if (rating >= 6) return "#FF8C00";
    if (rating >= 5) return "#B22222";
    return "#800080";
  };

  return (
    <div className="app-container">
      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search TV Shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Search results */}
      {!selectedShow && results.length > 0 && (
        <div className="results-container">
          {results.map((show) => (
            <div
              key={show.id}
              onClick={() => setSelectedShow(show)}
              className="result-item"
            >
              {show.image && (
                <img
                  src={show.image.medium}
                  alt={show.name}
                  className="result-poster"
                />
              )}
              <span>{show.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Heatmap view */}
      {selectedShow && (
        <div className="show-container">
          {/* Poster on left */}
          <div className="poster-container">
            <h1 className="show-title">{selectedShow.name}</h1>
            {selectedShow.image && (
              <img
                src={selectedShow.image.original}
                alt={selectedShow.name}
                className="poster-image"
              />
            )}
          </div>

          {/* Heatmap grid on right */}
          <div className="heatmap-container">
            {/* <h2>{selectedShow.name} – Episode Ratings</h2> */}
            <div className="legend">
              <div><span className="legend-color purple"></span> Garbage</div>
              <div><span className="legend-color red"></span> Bad</div>
              <div><span className="legend-color orange"></span> Okay</div>
              <div><span className="legend-color green"></span> Good</div>
              <div><span className="legend-color darkgreen"></span> Exceptional</div>
            </div>
            <div className="heatmap-grid">
              {/* Header row with season numbers */}
              <div className="heatmap-row">
                <div className="heatmap-cell header-cell"></div>
                {Object.keys(seasons).map((s) => (
                  <div key={s} className="heatmap-cell header-cell">
                    S{s}
                  </div>
                ))}
              </div>

              {/* Episode rows */}
              {(() => {
                // find max number of episodes in any season
                const maxEpisodes = Math.max(
                  ...Object.values(seasons).map((eps) => eps.length)
                );

                return Array.from({ length: maxEpisodes }).map((_, i) => (
                  <div key={i} className="heatmap-row">
                    <div className="heatmap-cell header-cell">E{i + 1}</div>
                    {Object.keys(seasons).map((s) => {
                      const ep = seasons[s][i];
                      return ep ? (
                        <div
                          key={`${s}-${i}`}
                          className="heatmap-cell"
                          style={{
                            backgroundColor: getColor(ep.rating.average),
                          }}
                          title={`${ep.name}`}
                        >
                          {ep.rating.average || "N/A"}
                        </div>
                      ) : (
                        <div
                          key={`${s}-${i}`}
                          className="heatmap-cell"
                        />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
