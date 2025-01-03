const User = require("../../model/userModel");

// Controller to get the permissions of a user
const getPermissions = async (req, res) => {
    const userId = req.params.userId; // Get the userId from the route params

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ permissions: user.permissions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch permissions', error: error.message });
    }
};

// Controller to add a new permission to a user
const addPermission = async (req, res) => {
    const { userId, permission } = req.body;

    if (!userId || !permission) {
        return res.status(400).json({ message: 'User ID and permission are required.' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the permission already exists in the user's permissions array
        if (user.permissions.includes(permission)) {
            return res.status(400).json({ message: 'Permission already assigned.' });
        }

        user.permissions.push(permission);
        await user.save();

        res.status(200).json({ message: 'Permission added successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add permission', error: error.message });
    }
};

// Controller to remove a permission from a user
const deletePermission = async (req, res) => {
    const { userId, permission } = req.body;

    if (!userId || !permission) {
        return res.status(400).json({ message: 'User ID and permission are required.' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the permission exists in the user's permissions array
        if (!user.permissions.includes(permission)) {
            return res.status(400).json({ message: 'Permission not found.' });
        }

        // Remove the permission from the array
        user.permissions = user.permissions.filter(p => p !== permission);
        await user.save();

        res.status(200).json({ message: 'Permission removed successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove permission', error: error.message });
    }
};

module.exports = {
    getPermissions,
    addPermission,
    deletePermission
};
