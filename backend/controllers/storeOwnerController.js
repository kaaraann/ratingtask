const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const { validatePasswordUpdate } = require("../utils/validation");

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owned by this user
    const { rows: stores} = await pool.query(
      "SELECT id, name, average_rating FROM stores WHERE owner_id = $1",
      [userId],
    );

    if (stores.length === 0) {
      return res.json({
        message: "No store assigned",
        store: null,
        totalRatings: 0,
      });
    }

    const store = stores[0];

    // Get total ratings count
    const { rows: ratingCount} = await pool.query(
      "SELECT COUNT(*) as count FROM ratings WHERE store_id = $1",
      [store.id],
    );

    // Recalculate average rating from actual ratings
    const { rows: avgRatingResult} = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
      [store.id],
    );

    const averageRating = avgRatingResult[0].avg_rating ? parseFloat(avgRatingResult[0].avg_rating) : 0;

    res.json({
      store: {
        id: store.id,
        name: store.name,
        averageRating: averageRating,
      },
      totalRatings: ratingCount[0].count,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Store ratings
exports.getStoreRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owned by this user
    const { rows: stores} = await pool.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [userId],
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const storeId = stores[0].id;

    // Get all ratings for the store with user info
    const { rows: ratings} = await pool.query(
      `SELECT r.id, r.rating, r.created_at, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId],
    );

    res.json(ratings);
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owned by this user
    const { rows: stores} = await pool.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [userId],
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const store = stores[0];

    // Recalculate average rating from actual ratings
    const { rows: avgRatingResult} = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
      [store.id],
    );

    res.json({
      averageRating: avgRatingResult[0].avg_rating || 0,
    });
  } catch (error) {
    console.error("Get average rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: users} = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = $1 AND role = 'store_owner'",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { error, value } = validatePasswordUpdate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = value;

    // Get user
    const { rows: users} = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId],
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(
      currentPassword,
      users[0].password,
    );
    if (!validPassword) {
      return res.status(403).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
