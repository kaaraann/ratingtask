const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const {
  validateStoreCreation,
  validateUserCreation,
} = require("../utils/validation");

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const { rows: totalUsers } = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role != 'admin'",
    );
    const { rows: totalStores } = await pool.query(
      "SELECT COUNT(*) as count FROM stores",
    );
    const { rows: totalRatings } = await pool.query(
      "SELECT COUNT(*) as count FROM ratings",
    );

    res.json({
      totalUsers: totalUsers[0].count,
      totalStores: totalStores[0].count,
      totalRatings: totalRatings[0].count,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Store management
exports.createStore = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerAddress,
    } = req.body;

    // Validate store details
    if (!name || !email || !address) {
      return res.status(400).json({ message: "Store details are required" });
    }

    if (name.length < 20 || name.length > 60) {
      return res
        .status(400)
        .json({ message: "Store name must be 20-60 characters" });
    }

    if (address.length > 400) {
      return res
        .status(400)
        .json({ message: "Address must not exceed 400 characters" });
    }

    // Validate owner details
    if (!ownerName || !ownerEmail || !ownerPassword || !ownerAddress) {
      return res.status(400).json({ message: "Owner details are required" });
    }

    if (ownerName.length < 20 || ownerName.length > 60) {
      return res
        .status(400)
        .json({ message: "Owner name must be 20-60 characters" });
    }

    if (ownerPassword.length < 8 || ownerPassword.length > 16) {
      return res
        .status(400)
        .json({ message: "Password must be 8-16 characters" });
    }

    if (!/[A-Z]/.test(ownerPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (!/[@$!%*?&]/.test(ownerPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one special character",
      });
    }

    // Check if store email already exists
    const { rows: existingStore } = await pool.query(
      "SELECT id FROM stores WHERE email = $1",
      [email],
    );
    if (existingStore.length > 0) {
      return res.status(400).json({ message: "Store email already exists" });
    }

    // Check if owner email already exists
    const { rows: existingUser } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [ownerEmail],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Owner email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ownerPassword, salt);

    // Create store owner user
    const { rows: userResult } = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [ownerName, ownerEmail, hashedPassword, ownerAddress, "store_owner"],
    );

    const ownerId = userResult[0].id;

    // Create store
    const { rows: storeResult } = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, address, ownerId],
    );

    const storeId = storeResult[0].id;

    // Update user with store_id
    await pool.query(
      "UPDATE users SET store_id = $1 WHERE id = $2",
      [storeId, ownerId],
    );

    res.status(201).json({
      message: "Store and owner created successfully",
      ownerEmail: ownerEmail,
      ownerId: ownerId,
      storeId: storeId,
    });
  } catch (error) {
    console.error("Store creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, address, email, sortBy = "name", order = "ASC" } = req.query;

    let query =
      "SELECT id, name, email, address FROM stores WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (email) {
      query += ` AND email LIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }
    if (name) {
      query += ` AND name LIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (address) {
      query += ` AND address LIKE $${paramIndex}`;
      params.push(`%${address}%`);
      paramIndex++;
    }

    const validSortBy = ["name", "email", "address"];
    if (validSortBy.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${order === "DESC" ? "DESC" : "ASC"}`;
    }

    const { rows: stores } = await pool.query(query, params);

    // Recalculate average rating for each store
    for (const store of stores) {
      const { rows: avgRatingResult } = await pool.query(
        "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
        [store.id],
      );
      store.average_rating = avgRatingResult[0].avg_rating ? parseFloat(avgRatingResult[0].avg_rating) : 0;
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
    const { rows: stores } = await pool.query("SELECT * FROM stores WHERE id = $1", [
      id,
    ]);

    if (stores.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const store = stores[0];
    const { rows: ratings } = await pool.query(
      "SELECT user_id, rating FROM ratings WHERE store_id = $1",
      [id],
    );

    // Recalculate average rating from actual ratings
    const { rows: avgRatingResult } = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
      [id],
    );

    store.average_rating = avgRatingResult[0].avg_rating || 0;

    res.json({
      ...store,
      ratings,
    });
  } catch (error) {
    console.error("Get store details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    const { rows: store } = await pool.query("SELECT id FROM stores WHERE id = $1", [
      id,
    ]);
    if (store.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    await pool.query(
      "UPDATE stores SET name = $1, email = $2, address = $3 WHERE id = $4",
      [name, email, address, id],
    );

    res.json({ message: "Store updated successfully" });
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: store } = await pool.query("SELECT id, owner_id FROM stores WHERE id = $1", [
      id,
    ]);
    if (store.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Delete store's ratings
    await pool.query("DELETE FROM ratings WHERE store_id = $1", [id]);

    // Delete the associated store owner user
    if (store[0].owner_id) {
      await pool.query("DELETE FROM users WHERE id = $1", [store[0].owner_id]);
    }

    await pool.query("DELETE FROM stores WHERE id = $1", [id]);
    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User management
exports.getUsers = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      address,
      sortBy = "name",
      order = "ASC",
    } = req.query;

    let query =
      "SELECT id, name, email, address, role FROM users WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (name) {
      query += ` AND name LIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      query += ` AND email LIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }
    if (address) {
      query += ` AND address LIKE $${paramIndex}`;
      params.push(`%${address}%`);
      paramIndex++;
    }

    const validSortBy = ["name", "email", "address", "role"];
    if (validSortBy.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${order === "DESC" ? "DESC" : "ASC"}`;
    }

    const { rows: users } = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: users } = await pool.query(
      "SELECT id, name, email, address, role, store_id FROM users WHERE id = $1",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // If store owner, get store rating
    if (user.role === "store_owner" && user.store_id) {
      const { rows: store } = await pool.query(
        "SELECT average_rating FROM stores WHERE id = $1",
        [user.store_id],
      );
      if (store.length > 0) {
        // Recalculate average rating from actual ratings
        const { rows: ratings } = await pool.query(
          "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = $1",
          [user.store_id],
        );
        if (ratings.length > 0 && ratings[0].avg_rating !== null) {
          user.storeRating = ratings[0].avg_rating;
        } else {
          user.storeRating = 0;
        }
      }
    }

    res.json(user);
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    console.log("Create user - Incoming request body:", req.body);
    const { error, value } = validateUserCreation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, address, role } = value;
    console.log("Create user - Validated data:", { name, email, address, role });

    // Check if email already exists
    const { rows: existingUser } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { rows: newUser } = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role",
      [name, email, hashedPassword, address, role],
    );

    res.status(201).json({ 
      message: "User created successfully",
      user: newUser[0]
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: user } = await pool.query("SELECT id, role, store_id FROM users WHERE id = $1", [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's ratings
    await pool.query("DELETE FROM ratings WHERE user_id = $1", [id]);

    // If user is a store owner, delete their associated store
    if (user[0].role === "store_owner" && user[0].store_id) {
      await pool.query("DELETE FROM stores WHERE id = $1", [user[0].store_id]);
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
