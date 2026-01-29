const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Tool = require('../models/Tool');
const Category = require('../models/Category');

const githubCatalogService = require('../services/githubCatalogService');
const huggingFaceService = require('../services/huggingFaceService');


function normKey(v) {
  return (v ?? '').toString().trim().replace(/\s+/g, ' ');
}

function cleanEmoji(name) {
  return normKey(name).replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬🔥🆓🛠️]/g, '').trim();
}

function placeholderWebsite(name) {
  const slug = normKey(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `https://example.com/${slug || 'tool'}`;
}

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);


async function ensureCategory(categoryMap, catData, dryRun) {
  const name = normKey(catData.name);
  const clean = cleanEmoji(name);

  // pokušaj naći postojeću po "clean" ili po full name
  let existing = await Category.findOne({
    $or: [{ name }, { name: clean }],
  });

  if (existing) {
    categoryMap.set(name, existing);
    categoryMap.set(clean, existing);
    return existing;
  }

  if (dryRun) return null;

  const created = await Category.create({
    name,
    description: (catData.description || '').trim(),
    isMainCategory: !!catData.isMainCategory,
    parentCategory: null, // parent rješavamo kasnije
  });

  categoryMap.set(name, created);
  categoryMap.set(clean, created);
  return created;
}

const importFromGithub = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    const {
      useLocalFile = false,
      localFilePath = null,
      categories = [],
      dryRun = false,
      limit = 500,
      skipWithoutWebsite = false,
    } = req.body;

    // 1) fetch + parse (GitHub ili lokalno)
    const parsed = await githubCatalogService.fetchAndParseCatalog(useLocalFile ? localFilePath : null);
    let parsedCategories = parsed.categories || [];
    let parsedTools = parsed.tools || [];

    // 2) filter po kategorijama (optional)
    const selected = (categories || []).map(normKey).filter(Boolean);
    if (selected.length > 0) {
      parsedTools = parsedTools.filter((t) => selected.includes(normKey(t.category)) || selected.includes(cleanEmoji(t.category)));
    }

    parsedTools = parsedTools.slice(0, Math.min(Math.max(parseInt(limit, 10) || 500, 1), 2000));

    // 3) Kreiraj kategorije (dedupe)
    const categoryMap = new Map();

    // prvo main pa sub da možemo riješiti parentCategory
    const mainCats = parsedCategories.filter((c) => c.isMainCategory);
    const subCats = parsedCategories.filter((c) => !c.isMainCategory);

    for (const cat of mainCats) {
      await ensureCategory(categoryMap, cat, dryRun);
    }

    // subcategories: parentCategory je string (ime glavne kategorije)
    for (const sub of subCats) {
      const subName = normKey(sub.name);
      const parentName = normKey(sub.parentCategory);

      // osiguraj subcategory
      let subDoc = await ensureCategory(categoryMap, sub, dryRun);

      // riješi parent
      const parentDoc =
        categoryMap.get(parentName) ||
        categoryMap.get(cleanEmoji(parentName)) ||
        (await Category.findOne({ name: parentName })) ||
        (await Category.findOne({ name: cleanEmoji(parentName) }));

      if (!dryRun && subDoc && parentDoc) {
        // set parentCategory ako nije postavljen
        if (!subDoc.parentCategory) {
          subDoc.parentCategory = parentDoc._id;
          await subDoc.save();
        }
      }
    }

    // 4) Import tools
    let created = 0;
    let updated = 0;
    let skipped = 0;

    const skippedItems = [];

    for (const t of parsedTools) {
      const toolName = normKey(t.name);
      const mainCatName = normKey(t.category);
      const subCatName = t.subcategory ? normKey(t.subcategory) : null;

      const mainCat =
        categoryMap.get(mainCatName) ||
        categoryMap.get(cleanEmoji(mainCatName)) ||
        (await Category.findOne({ name: mainCatName })) ||
        (await Category.findOne({ name: cleanEmoji(mainCatName) }));

      if (!mainCat) {
        skipped++;
        skippedItems.push({ name: toolName, reason: `Nema kategorije: ${mainCatName}` });
        continue;
      }

      const subCat = subCatName
        ? categoryMap.get(subCatName) ||
          categoryMap.get(cleanEmoji(subCatName)) ||
          (await Category.findOne({ name: subCatName })) ||
          (await Category.findOne({ name: cleanEmoji(subCatName) }))
        : null;

      let website = (t.website || '').trim();

      if (!website) {
        if (skipWithoutWebsite) {
          skipped++;
          skippedItems.push({ name: toolName, reason: 'Nema website' });
          continue;
        }
        website = placeholderWebsite(toolName); // da prođe schema required
      }

      const description = (t.description || '').trim() || `AI alat: ${toolName}`;
      const pricing = t.pricing || 'free';

      const existing = await Tool.findOne({ name: toolName });

      if (existing) {
        // Minimalno ažuriranje: category/subcategory/pricing ako su prazni
        if (!dryRun) {
          if (!existing.description) existing.description = description;
          if (!existing.website) existing.website = website;
          if (!existing.pricing) existing.pricing = pricing;
          if (!existing.category) existing.category = mainCat._id;
          if (!existing.subcategory && subCat) existing.subcategory = subCat._id;

          existing.metadata = existing.metadata || {};
          // ovo možete popuniti kasnije:
          // existing.metadata.githubUrl = existing.metadata.githubUrl || '';
          await existing.save();
        }
        updated++;
      } else {
        if (!dryRun) {
          await Tool.create({
            name: toolName,
            description,
            website,
            pricing,
            category: mainCat._id,
            subcategory: subCat ? subCat._id : null,
            tags: [],
            models: [],
            metadata: {},
            createdBy: req.user.id,
          });
        }
        created++;
      }
    }

    return res.status(200).json({
      success: true,
      message: dryRun ? 'Import (dryRun) završen' : 'Import završen',
      data: {
        source: useLocalFile ? 'local' : 'github',
        selectedCategories: selected,
        parsed: {
          categories: parsedCategories.length,
          tools: parsedTools.length,
        },
        result: { created, updated, skipped },
        skippedItems: skippedItems.slice(0, 50),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tools/:id/enrich (admin)
const enrichTool = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID alata.' });
    }

    const tool = await Tool.findById(id).populate('models');
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Alat nije pronađen.' });
    }

    const model = (tool.models || []).find((m) => m.huggingFaceModelId && m.huggingFaceModelId.trim());
    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Alat nema povezani AIModel s huggingFaceModelId.',
      });
    }

    const hfId = model.huggingFaceModelId.trim();

    const hfData = await huggingFaceService.getModelDetails(hfId);

    tool.metadata = tool.metadata || {};
    tool.metadata.huggingFaceUrl = `https://huggingface.co/${hfId}`;

    // OVO radi samo ako dodaš metadata.huggingFaceData u Tool.js schema
    tool.metadata.huggingFaceData = {
      ...hfData,
      updatedAt: new Date(),
    };

    await tool.save();

    return res.status(200).json({
      success: true,
      message: 'Alat obogaćen Hugging Face podacima',
      data: {
        toolId: tool._id,
        huggingFaceModelId: hfId,
        huggingFaceData: tool.metadata.huggingFaceData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tools/:id/external-data (public)
const getExternalData = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID alata.' });
    }

    const tool = await Tool.findById(id)
      .select('name metadata models')
      .populate('models', 'name provider huggingFaceModelId')
      .lean();

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Alat nije pronađen.' });
    }

    return res.status(200).json({
      success: true,
      message: 'External data dohvaćen',
      data: {
        tool: { id: tool._id, name: tool.name },
        links: {
          githubUrl: tool.metadata?.githubUrl || null,
          huggingFaceUrl: tool.metadata?.huggingFaceUrl || null,
          apiDocumentation: tool.metadata?.apiDocumentation || null,
        },
        huggingFace: tool.metadata?.huggingFaceData || null,
        models: tool.models || [],
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  importFromGithub,
  enrichTool,
  getExternalData,
};

