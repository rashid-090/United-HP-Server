const { default: puppeteer } = require("puppeteer");
const User = require("../../model/userModel");

// Function to get full Google Maps URL
const getFullGoogleMapsUrl = async (shortUrl) => {
  const browser = await puppeteer.launch({ headless: true }); // Start a headless browser
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

// Getting all Admins to list on super admin dashboard
const getAdmins = async (req, res) => {
  try {
    const {
      status,
      search,
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

    // Date
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }

    // District filter
    if (district) {
      filter.district = district; // Direct district filter
    }

    // CIty filter
    if (city) {
      filter.city = city; // City district filter
    }

    if (search) {
      if (search.includes(" ")) {
        filter.search = { $regex: new RegExp(search, "i") };
      } else {
        filter.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { email: { $regex: new RegExp(search, "i") } },

        ];
      }
    }
    const skip = (page - 1) * limit;


    const admins = await User.find(
      { role: "admin", ...filter },
      {
        password: 0,
        dateOfBirth: 0,
        role: 0,
        walletBalance: 0,
        isEmailVerified: 0,
      }
    ).populate('district city')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    // if (admins.length === 0) {
    //   throw Error(`No ${true ? "active" : "blocked"} admin`);
    // }
    const totalAvailableAdmins = await User.countDocuments({
      role: "admin",
      ...filter
    }
    );
    res.status(200).json({ admins, totalAvailableAdmins });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({ _id: id },
      {
        password: 0
      }
    )

    if (!admin) {
      throw Error("No Such Admin");
    }

    res.status(200).json({ admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creating new Admin if needed for Super Admin
const addAdmin = async (req, res) => {
  try {
    const userCredentials = req.body;

    const files = req?.files;

    if (userCredentials.gMapLinkShorten) {
      try {
        const fullUrl = await getFullGoogleMapsUrl(userCredentials.gMapLinkShorten); // Wait for the full URL
        userCredentials.gMapLink = fullUrl; // Update the gMapLink field
        console.log("Full URL:", fullUrl);
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

    const user = await User.signup(userCredentials, "admin", true);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAdmin = async (req, res) => {
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

    // Update the admin data in the database
    const admin = await User.findByIdAndUpdate(
      id,
      { $set: { ...data } },
      { new: true }
    );

    if (!admin) {
      throw Error("No Such Admin");
    }
    console.log(admin.name);


    res.status(200).json({ admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOneAndDelete({ _id: id });

    if (!admin) {
      throw Error("No Such Admin");
    }

    res.status(200).json({ admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const blockOrUnBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const { isActive } = req.body;
    console.log(req.body);


    const admin = await User.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );
    res.status(200).json({ admin });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAdmins,
  getAdmin,
  addAdmin,
  deleteAdmin,
  updateAdmin,
  blockOrUnBlock,
};
