// scripts/migrate-images-to-webp.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// 👈 LOAD .ENV FROM BACKEND ROOT
require("dotenv").config({ path: path.join(__dirname, "../../../../.env") });

const { connectDB } = require("../../../config/db");

const migrateImagesToWebP = async () => {
  try {
    console.log("🚀 Starting image migration to WebP...");
    console.log("🔑 DB Config:", {
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      database: process.env.DB_NAME || "JAWALDB",
      hasPassword: !!process.env.DB_PASSWORD,
    });

    // Initialize database connection
    const pool = await connectDB();
    console.log("📡 Database connected for migration");

    // Get all games with existing images
    const [games] = await pool.execute(`
      SELECT id, thumbnail 
      FROM GAMES 
      WHERE thumbnail IS NOT NULL 
      AND thumbnail != ''
      AND thumbnail NOT LIKE '%.webp'
    `);

    console.log(
      `📊 Found ${games.length} games with non-WebP images to convert`
    );

    if (games.length === 0) {
      console.log("🎉 No images need conversion - all are already WebP!");
      await pool.end();
      process.exit(0);
    }

    let converted = 0;
    let skipped = 0;
    let errors = 0;

    for (const game of games) {
      try {
        const oldImageUrl = game.thumbnail;

        // Extract filename from URL
        const oldFilename = oldImageUrl.split("/uploads/")[1];
        if (!oldFilename) {
          console.log(
            `⚠️  Invalid URL format for game ${game.id}: ${oldImageUrl}`
          );
          errors++;
          continue;
        }

        // Path to old file
        const oldFilePath = path.join(__dirname, "../uploads", oldFilename);

        // Check if old file exists
        if (!fs.existsSync(oldFilePath)) {
          console.log(`⚠️  File not found for game ${game.id}: ${oldFilePath}`);
          errors++;
          continue;
        }

        // Generate new WebP filename
        const newFilename = oldFilename.replace(
          /\.(jpg|jpeg|png|gif)$/i,
          ".webp"
        );
        const newFilePath = path.join(__dirname, "../uploads", newFilename);

        console.log(
          `🔄 Converting game ${game.id}: ${oldFilename} → ${newFilename}`
        );

        // Convert image to WebP
        await sharp(oldFilePath)
          .resize(256, 256)
          .webp({
            quality: 80,
            effort: 4,
            lossless: false,
          })
          .toFile(newFilePath);

        // Update database with new URL
        const baseUrl = process.env.BASE_URL || "https://jawalgames.net";
        const newImageUrl = `${baseUrl}/uploads/${newFilename}`;

        await pool.execute(
          `
          UPDATE GAMES 
          SET thumbnail = ? 
          WHERE id = ?
        `,
          [newImageUrl, game.id]
        );

        // Delete old file
        fs.unlinkSync(oldFilePath);

        console.log(
          `✅ Converted game ${game.id}: ${oldFilename} → ${newFilename}`
        );
        converted++;
      } catch (error) {
        console.error(`❌ Error converting game ${game.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Image migration completed!`);
    console.log(`📊 Results:`);
    console.log(`   ✅ Converted: ${converted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${games.length}`);

    // Close the pool and exit
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

// Run the migration
migrateImagesToWebP();
