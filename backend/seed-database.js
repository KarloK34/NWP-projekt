require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("./src/config/database");
const { User, Category, Tool } = require("./src/models");
const githubCatalogService = require("./src/services/githubCatalogService");

/**
 * Skripta za popunjavanje MongoDB baze podataka s podacima iz ai-catalog.md
 */
async function seedDatabase() {
  try {
    console.log("🚀 Pokretanje seed skripte...\n");

    // Poveži se na bazu
    await connectDB();
    console.log("✅ Povezan na MongoDB\n");

    // Kreiraj ili pronađi system korisnika
    let systemUser = await User.findOne({ username: "system" });
    if (!systemUser) {
      systemUser = new User({
        username: "system",
        email: "system@ai-catalog.com",
        password: "system-password-123",
        role: "admin",
      });
      await systemUser.save();
      console.log("✅ Kreiran system korisnik\n");
    } else {
      console.log("✅ System korisnik već postoji\n");
    }

    // Parsiraj ai-catalog.md
    const localFilePath = path.join(__dirname, "..", "ai-catalog.md");
    console.log("📖 Parsiranje ai-catalog.md...\n");
    const result = await githubCatalogService.fetchAndParseCatalog(
      localFilePath
    );

    console.log(`📊 Parsirano:`);
    console.log(
      `   - Glavne kategorije: ${
        result.categories.filter((c) => c.isMainCategory).length
      }`
    );
    console.log(
      `   - Podkategorije: ${
        result.categories.filter((c) => !c.isMainCategory).length
      }`
    );
    console.log(`   - Ukupno alata: ${result.tools.length}\n`);

    // Kreiraj kategorije
    console.log("📁 Kreiranje kategorija...\n");
    const categoryMap = new Map(); // name -> Category document

    // Prvo kreiraj glavne kategorije
    const mainCategories = result.categories.filter((c) => c.isMainCategory);
    for (const catData of mainCategories) {
      const existing = await Category.findOne({ name: catData.name });
      if (existing) {
        categoryMap.set(catData.name, existing);
        console.log(`   ⏭️  Glavna kategorija već postoji: ${catData.name}`);
      } else {
        const category = await Category.create({
          name: catData.name,
          description: catData.description || "",
          isMainCategory: true,
          parentCategory: null,
        });
        categoryMap.set(catData.name, category);
        console.log(`   ✅ Kreirana glavna kategorija: ${catData.name}`);
      }
    }

    // Zatim kreiraj podkategorije
    const subCategories = result.categories.filter((c) => !c.isMainCategory);
    for (const subCatData of subCategories) {
      const existing = await Category.findOne({ name: subCatData.name });
      if (existing) {
        categoryMap.set(subCatData.name, existing);
        console.log(`   ⏭️  Podkategorija već postoji: ${subCatData.name}`);
      } else {
        // Pronađi glavnu kategoriju
        const mainCategory = categoryMap.get(subCatData.parentCategory);
        if (mainCategory) {
          const subCategory = await Category.create({
            name: subCatData.name,
            description: subCatData.description || "",
            isMainCategory: false,
            parentCategory: mainCategory._id,
          });
          categoryMap.set(subCatData.name, subCategory);
          console.log(
            `   ✅ Kreirana podkategorija: ${subCatData.name} (pod ${subCatData.parentCategory})`
          );
        } else {
          console.log(
            `   ⚠️  Ne mogu pronaći glavnu kategoriju za: ${subCatData.name}`
          );
        }
      }
    }

    console.log("\n🛠️  Kreiranje alata...\n");

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const toolData of result.tools) {
      try {
        // Pronađi glavnu kategoriju
        const mainCategory = categoryMap.get(toolData.category);
        if (!mainCategory) {
          console.log(
            `   ⚠️  Preskočen alat "${toolData.name}" - glavna kategorija "${toolData.category}" ne postoji`
          );
          skippedCount++;
          continue;
        }

        // Pronađi podkategoriju ako postoji
        let subCategory = null;
        if (toolData.subcategory) {
          subCategory = categoryMap.get(toolData.subcategory);
        }

        // Provjeri je li website validan URL
        // Ako nema website ili nije validan URL, preskoči alat
        if (
          !toolData.website ||
          toolData.website.trim() === "" ||
          !toolData.website.match(/^https?:\/\/.+/)
        ) {
          console.log(
            `   ⚠️  Preskočen alat "${toolData.name}" - nema valjan URL`
          );
          skippedCount++;
          continue;
        }

        // Koristi default opis ako nema opisa
        const description =
          toolData.description && toolData.description.trim() !== ""
            ? toolData.description.trim()
            : `AI alat: ${toolData.name}`;

        // Provjeri postoji li alat s istim imenom
        const existingTool = await Tool.findOne({ name: toolData.name });

        if (existingTool) {
          // Update postojećeg alata
          existingTool.description = description;
          existingTool.website = toolData.website;
          existingTool.pricing = toolData.pricing;
          existingTool.category = mainCategory._id;
          existingTool.subcategory = subCategory ? subCategory._id : null;
          await existingTool.save();
          updatedCount++;
          console.log(`   🔄 Ažuriran alat: ${toolData.name}`);
        } else {
          // Kreiraj novi alat
          await Tool.create({
            name: toolData.name,
            description: description,
            website: toolData.website,
            pricing: toolData.pricing,
            category: mainCategory._id,
            subcategory: subCategory ? subCategory._id : null,
            createdBy: systemUser._id,
          });
          createdCount++;
          if (createdCount % 10 === 0) {
            console.log(`   ✅ Kreirano ${createdCount} alata...`);
          }
        }
      } catch (error) {
        console.error(
          `   ❌ Greška pri kreiranju alata "${toolData.name}":`,
          error.message
        );
        skippedCount++;
      }
    }

    console.log("\n📊 Sažetak:");
    console.log(`   ✅ Kreirano alata: ${createdCount}`);
    console.log(`   🔄 Ažurirano alata: ${updatedCount}`);
    console.log(`   ⚠️  Preskočeno alata: ${skippedCount}`);
    console.log(`   📁 Ukupno kategorija: ${categoryMap.size}`);

    console.log("\n✅ Seed završen uspješno!\n");

    // Zatvori konekciju
    await mongoose.connection.close();
    console.log("👋 Konekcija zatvorena");
    process.exit(0);
  } catch (error) {
    console.error("❌ Greška pri seed-u:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Pokreni seed
seedDatabase();
