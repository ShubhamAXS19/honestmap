import React, { useState } from "react";

const UserInputForm = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState({
    size: "",
    sauce: "",
    crust: "",
    cheese: "",
  });
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userPreferences = {
      ...preferences,
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      },
    };
    onSubmit(userPreferences);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Select Your Preferences</h3>
      <select
        name="size"
        value={preferences.size}
        onChange={handlePreferenceChange}
        required
      >
        <option value="">Select Size</option>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>

      <select
        name="sauce"
        value={preferences.sauce}
        onChange={handlePreferenceChange}
        required
      >
        <option value="">Select Sauce</option>
        <option value="tomato">Tomato</option>
        <option value="bbq">BBQ</option>
        <option value="garlic">Garlic</option>
      </select>

      <select
        name="crust"
        value={preferences.crust}
        onChange={handlePreferenceChange}
        required
      >
        <option value="">Select Crust</option>
        <option value="thin">Thin</option>
        <option value="thick">Thick</option>
        <option value="stuffed">Stuffed</option>
      </select>

      <select
        name="cheese"
        value={preferences.cheese}
        onChange={handlePreferenceChange}
        required
      >
        <option value="">Select Cheese</option>
        <option value="mozzarella">Mozzarella</option>
        <option value="cheddar">Cheddar</option>
        <option value="vegan">Vegan</option>
      </select>

      <h3>Enter Your Location</h3>
      <input
        type="number"
        name="latitude"
        placeholder="Latitude"
        value={location.latitude}
        onChange={handleLocationChange}
        required
      />
      <input
        type="number"
        name="longitude"
        placeholder="Longitude"
        value={location.longitude}
        onChange={handleLocationChange}
        required
      />

      <button type="submit">Find Match</button>
    </form>
  );
};

export default UserInputForm;
