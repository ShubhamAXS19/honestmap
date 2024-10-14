import React, { useState } from "react";

interface PizzaSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface PizzaSpotSelectorProps {
  onSelectSpot: (spot: PizzaSpot) => void;
  onFetchSpots: (distance: number) => Promise<PizzaSpot[]>;
}

const PizzaSpotSelector: React.FC<PizzaSpotSelectorProps> = ({
  onSelectSpot,
  onFetchSpots,
}) => {
  const [distance, setDistance] = useState<number>(1);
  const [spots, setSpots] = useState<PizzaSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchSpots = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSpots = await onFetchSpots(distance);
      setSpots(fetchedSpots);
    } catch (err) {
      setError("Failed to fetch pizza spots. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Select a Pizza Spot</h3>
      <div>
        <label htmlFor="distance">Distance (km): </label>
        <input
          type="number"
          id="distance"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          min="0.1"
          step="0.1"
        />
        <button onClick={handleFetchSpots} disabled={loading}>
          {loading ? "Fetching..." : "Find Pizza Spots"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {spots.length > 0 && (
        <ul>
          {spots.map((spot) => (
            <li key={spot.id}>
              {spot.name}{" "}
              <button onClick={() => onSelectSpot(spot)}>Select</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PizzaSpotSelector;
