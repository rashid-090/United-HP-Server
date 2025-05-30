const { default: puppeteer } = require("puppeteer");
const User = require("../../model/userModel");

// Function to get full Google Maps URL
const getFullGoogleMapsUrl = async (shortUrl) => {
  const browser = await puppeteer.launch({
    headless: true,            // Run in headless mode (no UI)
    args: ['--no-sandbox', '--disable-setuid-sandbox']  // Bypass sandboxing restrictions
  });
  const page = await browser.newPage(); // Open a new page
  await page.goto(shortUrl, { waitUntil: 'networkidle0' }); // Go to the shortened Google Maps URL

  // Get the full URL after the page loads
  const fullUrl = await page.url();

  await browser.close(); // Close the browser
  return fullUrl;
};
const extractLatLongFromUrl = (url) => {
  try {
    // First try to find coordinates in the URL path after !3d and !4d
    const pathMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pathMatch) {

      return {
        lat: parseFloat(pathMatch[1]),
        lng: parseFloat(pathMatch[2]),
      };
    }

    // If not found, try to find coordinates after !8m2!3d and !4d
    const locationMatch = url.match(/!8m2!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (locationMatch) {

      return {
        lat: parseFloat(locationMatch[1]),
        lng: parseFloat(locationMatch[2]),
      };
    }

    // Fallback to @coordinates if needed
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {

      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2]),
      };
    }

    return { latitude: null, longitude: null };
  } catch (error) {
    console.log("Error parsing Google Maps URL:", error);
    return { latitude: null, longitude: null };
  }
};

// Getting all Users to list on super admin dashboard
const getUsers = async (req, res) => {
  try {
    const {
      status,
      search,
      brand,
      state,
      district,
      city,
      page = 1,
      limit = 10,
      startingDate,
      endingDate,

    } = req.query;



    let filter = {};

    if (status) {
      if (status === "active") {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    // Brand filter
    if (brand) {
      filter.brand = brand; // Brand filter
    }

    // State filter
    if (state) {
      filter.state = state; // Direct state filter
    }

    // District filter
    if (district) {
      filter.district = district; // Direct district filter
    }

    // CIty filter
    if (city) {
      filter.city = city; // City district filter
    }

    // Date
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }
    // Search filter
    if (search) {
      // If search contains spaces, match all parts (e.g., "John Doe" should match "John" and "Doe")
      const searchRegex = search
        .split(" ")
        .map((word) => `(?=.*${word})`) // Create a regex to match each word
        .join(""); // Join with no space in between
      filter.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { email: { $regex: searchRegex, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;


    const users = await User.find(
      { role: "user", ...filter },
      {
        password: 0,
        dateOfBirth: 0,
        role: 0,
        walletBalance: 0,
        isEmailVerified: 0,
      }
    ).populate('district city state')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    // if (users.length === 0) {
    //   throw Error(`No ${true ? "active" : "blocked"} users`);
    // }
    const totalAvailableUsers = await User.countDocuments({
      role: "user",
      ...filter
    }
    );
    res.status(200).json({ users, totalAvailableUsers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id },
      {
        password: 0
      }
    )

    if (!user) {
      throw Error("No Such User");
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creating new User if needed for Super Admin
const addUser = async (req, res) => {
  try {
    const userCredentials = req.body;
    const files = req?.files;

    if (userCredentials.gMapLinkShorten) {
      try {
        const fullUrl = await getFullGoogleMapsUrl(userCredentials.gMapLinkShorten); // Wait for the full URL
        userCredentials.gMapLink = fullUrl; // Update the gMapLink field
        const { lat, lng } = extractLatLongFromUrl(fullUrl);

        if (lat && lng) {
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);

          if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: "Invalid latitude or longitude values" });
          }

          userCredentials.location = {
            type: "Point",
            coordinates: [latitude, longitude], // GeoJSON requires [longitude, latitude]
          };
        }
      } catch (error) {
        console.error("Error fetching full Google Maps URL:", error);
        return res.status(500).json({ error: "Failed to fetch full Google Maps URL" });
      }
    }




    if (files && files.length > 0) {
      userCredentials.imgURL = [];
      files.map((file) => {
        if (file.fieldname === "imgURL[]") {
          userCredentials.imgURL.push(file.filename);
        }
      });
    }

    const user = await User.signup(userCredentials, "user", true);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req?.files;



    // Wait for the full URL if gMapLinkShorten is provided
    if (data.gMapLinkShorten) {
      try {
        const fullUrl = await getFullGoogleMapsUrl(data.gMapLinkShorten); // Wait for the full URL
        data.gMapLink = fullUrl; // Update the gMapLink field
        const { lat, lng } = extractLatLongFromUrl(fullUrl);

        if (lat && lng) {
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);

          if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: "Invalid latitude or longitude values" });
          }

          data.location = {
            type: "Point",
            coordinates: [latitude, longitude], // GeoJSON requires [longitude, latitude]
          };
        }
      } catch (error) {
        console.error("Error fetching full Google Maps URL:", error);
        return res.status(500).json({ error: "Failed to fetch full Google Maps URL" });
      }
    }


    // Check if there are files to update
    if (files && files.length > 0) {
      // If the existing data has imgURL, preserve it and add the new images
      const existingImgURLs = data.imgURL || [];

      // Add new images to the imgURL array without overwriting existing ones
      files.forEach((file) => {
        if (file.fieldname === "imgURL[]") {
          // Add only the file's filename (not the full URL) to imgURL
          existingImgURLs.push(file.filename);
        } else {
          // Add file to imgURL if it's a temporary image
          existingImgURLs.push(file.filename);
        }
      });

      // Update the imgURL field with the combined list of old and new images
      data.imgURL = existingImgURLs;
    }

    // Update the user data in the database
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { ...data } },
      { new: true }
    );

    if (!user) {
      throw Error("No Such User");
    }


    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndDelete({ _id: id });

    if (!user) {
      throw Error("No Such User");
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const blockOrUnBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { isActive } = req.body;


    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );
    res.status(200).json({ user });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  deleteUser,
  updateUser,
  blockOrUnBlockUser,
};
