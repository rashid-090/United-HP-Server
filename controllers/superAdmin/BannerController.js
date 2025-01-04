const Banner = require("../../model/bannerModel");

// Creating Banner collection for first time. if already existing just pushing the banners to existing array.
const addBanners = async (req, res) => {
    try {
        const files = req?.files;
         console.log("Logged from adding banner ", files);


        // Check if files are uploaded
        if (!files || files.length === 0) {
            throw new Error("No files are uploaded");
        }

        // Extract file names into an array
        let filesNames = files.map(file => file.filename);

        // Check if a Banner already exists
        const exists = await Banner.findOne();

        let banners;
        if (!exists) {
            // If no Banner exists, create a new one
            banners = await Banner.create({ images: filesNames });
        } else {
            // If Banner exists, push new images into the images array
            banners = await Banner.findByIdAndUpdate(
                exists._id,
                {
                    $push: {
                        images: { $each: filesNames }, // Use $each to push multiple files
                    },
                },
                { new: true }
            );
        }

        // Return the banners response
        return res.status(200).json({ banners });
    } catch (error) {
        // Log the error for debugging
        console.error("Error occurred:", error);
        res.status(400).json({ error: error.message });
    }
};


// Reading entire banners
const readBanners = async (req, res) => {
    try {
        const banners = await Banner.findOne();

        return res.status(200).json({ banners });
    } catch (error) {
        console.log(error);

        res.status(400).json({ error: error.message });
    }
};

// Deleting one banner
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const fullPath = `uploads/${id}`;

        
        const exists = await Banner.findOne();

        const banners = await Banner.findByIdAndUpdate(
            exists._id,
            {
                $pull: {
                    images: fullPath,
                },
            },
            { new: true }
        );

        return res.status(200).json({ banners });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Updating the listing order
const updateBannerOrder = async (req, res) => {
    try {
        const { images } = req.body;

        const exists = await Banner.findOne();

        if (!exists) {
            throw Error("No Banner Collection in the DB");
        }

        const banners = await Banner.findByIdAndUpdate(
            exists._id,
            {
                $set: {
                    images: images,
                },
            },
            { new: true }
        );

        return res.status(200).json({ banners });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    addBanners,
    readBanners,
    deleteBanner,
    updateBannerOrder,
};
