import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { io } from "socket.io-client";
import UserInputForm from "./UserInput";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number]>([
    19.28322, 72.86943,
  ]);
  const [matchLocation, setMatchLocation] = useState<[number, number] | null>(
    null
  );
  const [pizzaSpotLocation, setPizzaSpotLocation] = useState<[number, number]>([
    19.3113, 72.8526,
  ]);
  const [preferences, setPreferences] = useState(null);
  const [matchStatus, setMatchStatus] = useState("idle");

  const updateUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(newLocation);
          socket.emit("updateLocation", {
            latitude: newLocation[0],
            longitude: newLocation[1],
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("matchFound", (matchData) => {
      console.log("Match found:", matchData);
      setMatchLocation([matchData.latitude, matchData.longitude]);
      setMatchStatus("matched");
    });

    socket.on("locationUpdate", (location) => {
      setMatchLocation([location.latitude, location.longitude]);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("matchFound");
      socket.off("locationUpdate");
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (matchStatus === "matched") {
      updateUserLocation(); // Initial update
      intervalId = setInterval(updateUserLocation, 10000); // Update every 10 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [matchStatus, updateUserLocation]);

  const handleSubmit = (userPreferences) => {
    setPreferences(userPreferences);
    setUserLocation([
      userPreferences.location.latitude,
      userPreferences.location.longitude,
    ]);
    setMatchStatus("searching");
    socket.emit("findMatch", {
      preferences: userPreferences,
      location: userPreferences.location,
    });
  };

  function AddRoute1() {
    const map = useMap();

    useEffect(() => {
      if (!map || !matchLocation || !pizzaSpotLocation) return;

      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(matchLocation[0], matchLocation[1]),
          L.latLng(pizzaSpotLocation[0], pizzaSpotLocation[1]),
        ],
        routeWhileDragging: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: "blue", opacity: 0.6, weight: 4 }],
        },
      }).addTo(map);

      return () => {
        map.removeControl(routingControl);
      };
    }, [map, userLocation, matchLocation, pizzaSpotLocation]);

    return null;
  }

  return (
    <div>
      <h1>Pizza Splitting App</h1>
      {matchStatus === "idle" && <UserInputForm onSubmit={handleSubmit} />}
      {matchStatus === "searching" && <p>Searching for a match...</p>}
      {matchStatus === "matched" && (
        <p>Match found! Check the map for directions.</p>
      )}
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "calc(100vh - 200px)" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={userLocation}>
          <Popup>Your Location</Popup>
        </Marker>
        {matchLocation && (
          <Marker position={matchLocation}>
            <Popup>Match Location</Popup>
          </Marker>
        )}
        <Marker position={pizzaSpotLocation}>
          <Popup>Pizza Spot</Popup>
        </Marker>
        <AddRoute1 />
        {/* <AddRoute2 /> */}
      </MapContainer>
    </div>
  );
};

export default App;
