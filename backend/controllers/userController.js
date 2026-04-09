const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const {
  validateRating,
  validatePasswordUpdate,
} = require("../utils/validation");

// Store operations
exports.getStores = async (req, res) => {
  try {
    const { name, address, sortBy = "name", order = "ASC" } = req.query;

    let query = `SELECT s.id, s.name, s.address FROM stores s WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (name) {
      query += ` AND s.name LIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (address) {
      query += ` AND s.address LIKE $${paramIndex}`;
      params.push(`%${address}%`);
      paramIndex++;
    }

    const validSortBy = ["name", "address"];
    if (validSortBy.includes(sortBy)) {
      query += ` ORDER BY s.${sortBy} ${order === "DESC" ? "DESC" : "ASC"}`;
    }

    const { rows: stores} = await pool.query(query, params);

    // Recalculate average rating for each store
    for (const store of stores) {
      const { rows: avgRatingResult} = await pool.query(
        "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
        [store.id],
      );
      store.average_rating = avgRatingResult[0].avg_rating || 0;
    }

    // Sort by average_rating if requested
    if (sortBy === "average_rating") {
      stores.sort((a, b) => {
        return order === "DESC" 
          ? b.average_rating - a.average_rating 
          : a.average_rating - b.average_rating;
      });
    }

    res.json(stores);
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStoreDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows: stores} = await pool.query("SELECT * FROM stores WHERE id = $1", [
      id,
    ]);

    if (stores.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const store = stores[0];

    // Get user's rating if exists
    const { rows: userRating} = await pool.query(
      "SELECT rating FROM ratings WHERE store_id = $1 AND user_id = $2",
      [id, userId],
    );

    store.userRating = userRating.length > 0 ? userRating[0].rating : null;

    res.json(store);
  } catch (error) {
    console.error("Get store details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Rating operations
exports.submitRating = async (req, res) => {
  try {
    const { error, value } = validateRating(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id: storeId } = req.params;
    const userId = req.user.id;
    const { rating } = value;

    // Check if store exists
    const { rows: store} = await pool.query("SELECT id FROM stores WHERE id = $1", [
      storeId,
    ]);
    if (store.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if rating already exists
    const { rows: existingRating} = await pool.query(
      "SELECT id FROM ratings WHERE store_id = $1 AND user_id = $2",
      [storeId, userId],
    );

    if (existingRating.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already rated this store" });
    }

    // Insert rating
    await pool.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)",
      [userId, storeId, rating],
    );

    // Update store average rating
    const { rows: ratings} = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
      [storeId],
    );

    const avgRating = ratings[0].avg_rating;
    await pool.query("UPDATE stores SET average_rating = $1 WHERE id = $2", [
      avgRating,
      storeId,
    ]);

    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Submit rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { error, value } = validateRating(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id: storeId } = req.params;
    const userId = req.user.id;
    const { rating } = value;

    // Check if rating exists
    const { rows: existingRating} = await pool.query(
      "SELECT id FROM ratings WHERE store_id = $1 AND user_id = $2",
      [storeId, userId],
    );

    if (existingRating.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Update rating
    await pool.query(
      "UPDATE ratings SET rating = $1 WHERE store_id = $2 AND user_id = $3",
      [rating, storeId, userId],
    );

    // Update store average rating
    const { rows: ratings} = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
      [storeId],
    );

    const avgRating = ratings[0].avg_rating;
    await pool.query("UPDATE stores SET average_rating = $1 WHERE id = $2", [
      avgRating,
      storeId,
    ]);

    res.json({ message: "Rating updated successfully" });
  } catch (error) {
    console.error("Update rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: ratings} = await pool.query(
      "SELECT r.rating, r.store_id, s.name as store_name FROM ratings r JOIN stores s ON r.store_id = s.id WHERE r.user_id = $1",
      [userId],
    );

    res.json(ratings);
  } catch (error) {
    console.error("Get my ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: users} = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = $1",
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
