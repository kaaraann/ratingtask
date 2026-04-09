const pool = require("./config/database");

const createTablesQueries = [
  // Users table (without FK initially)
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'store_owner')),
    store_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Stores table (without FK initially)
  `CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INTEGER,
    average_rating DECIMAL(3, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Ratings table (without FK initially)
  `CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, store_id)
  )`,
];

const addConstraintsQueries = [
  // Add FK to users.store_id
  `ALTER TABLE users ADD CONSTRAINT fk_users_store_id FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL`,

  // Add FK to stores.owner_id
  `ALTER TABLE stores ADD CONSTRAINT fk_stores_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL`,

  // Add FKs to ratings
  `ALTER TABLE ratings ADD CONSTRAINT fk_ratings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`,
  `ALTER TABLE ratings ADD CONSTRAINT fk_ratings_store_id FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE`,
];

async function migrate() {
  try {
    // Create tables first
    console.log("Creating tables...");
    for (const query of createTablesQueries) {
      try {
        await pool.query(query);
        console.log(`✅ Created table`);
      } catch (error) {
        // Ignore if table already exists
        if (!error.message.includes('already exists')) {
          console.error(`❌ Error creating table: ${error.message}`);
        }
      }
    }

    // Add constraints after tables are created
    console.log("Adding constraints...");
    for (const query of addConstraintsQueries) {
      try {
        await pool.query(query);
        console.log(`✅ Added constraint`);
      } catch (error) {
        // Ignore if constraint already exists
        if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
          console.error(`❌ Error adding constraint: ${error.message}`);
        }
      }
    }

    console.log("✅ Database migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrate();
