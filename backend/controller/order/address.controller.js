const axios = require("axios");

const getAddress = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: "lat & lon are required" });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
          addressdetails: 1,
        },
        headers: {
      
          "User-Agent": "my-shop-app/1.0 (contact@myshop.com)",
        },
        timeout: 10000,
      }
    );

    const address = response.data?.address || {};


    const street =
      address.road ||
      address.residential ||
      address.pedestrian ||
      address.hamlet ||
      "";

    const ward =
      address.suburb ||
      address.village ||
      address.town ||
      address.city_district ||
      "";

    const province = address.city || address.state || address.county || "";

    const fullAddress = response.data.display_name || "";

    return res.json({
      street,
      ward,
      province,
      fullAddress,
    });
  } catch (err) {
    console.error("Reverse geocode error:", err.message);

    return res.status(500).json({
      message: "Reverse geocode failed",
    });
  }
};

module.exports = { getAddress };
