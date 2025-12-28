const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Service za dohvat i parsiranje AI alata iz GitHub repozitorija
 * https://github.com/mehmetkahya0/AI-Catalog
 */
class GitHubCatalogService {
  constructor() {
    this.baseUrl = 'https://raw.githubusercontent.com/mehmetkahya0/AI-Catalog/main';
    this.readmeUrl = `${this.baseUrl}/README.md`;
  }

  /**
   * Dohvaća README.md fajl s GitHub-a
   */
  async fetchReadme() {
    try {
      const response = await axios.get(this.readmeUrl);
      return response.data;
    } catch (error) {
      console.error('Greška pri dohvaćanju README.md:', error.message);
      throw new Error('Ne mogu dohvatiti podatke s GitHub-a');
    }
  }

  /**
   * Čita lokalni markdown fajl (za testiranje)
   */
  async readLocalMarkdown(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.error('Greška pri čitanju lokalnog fajla:', error.message);
      throw error;
    }
  }

  /**
   * Mapa glavnih kategorija i njihovih podkategorija (prema Table of Contents)
   */
  getCategoryMap() {
    return {
      '🎨 Creative AI': {
        main: ['🎨 Creative AI', 'Creative AI'],
        subcategories: [
          'Text to Image AI\'s', 'Text to Image', 'Text to Image AIs',
          'Video Generator', 'Video Generators',
          'Audio Editing',
          '3D', '3D Tools'
        ]
      },
      '📝 Content & Writing': {
        main: ['📝 Content & Writing', 'Content & Writing'],
        subcategories: [
          'Writing',
          'Copywriting',
          'Summarizer'
        ]
      },
      '💻 Developer Tools': {
        main: ['💻 Developer Tools', 'Developer Tools'],
        subcategories: [
          'Code Assistant',
          'Developer Tools',
          'Low Code - no code Tools', 'Low Code/No Code', 'Low Code - No Code Tools'
        ]
      },
      '🧠 AI Assistants & Chat': {
        main: ['🧠 AI Assistants & Chat', 'AI Assistants & Chat'],
        subcategories: [
          'Multi-modal',
          'Large Language Models (LLMs)', 'Large Language Models', 'LLMs',
          '🔥 Commercial LLMs', 'Commercial LLMs',
          '🆓 Open Source LLMs', 'Open Source LLMs',
          '🛠️ Self-Hosted Solutions', 'Self-Hosted Solutions',
          '🔬 Research & Experimental', 'Research & Experimental',
          'Search Engines & Chatbot\'s', 'Search Engines & Chatbots'
        ]
      },
      '🎓 Education & Learning': {
        main: ['🎓 Education & Learning', 'Education & Learning'],
        subcategories: [
          'Education Assistants',
          'Education Tools'
        ]
      },
      '🏢 Business & Productivity': {
        main: ['🏢 Business & Productivity', 'Business & Productivity'],
        subcategories: [
          'Presentation',
          'E-Mail Assistant', 'Email Assistant',
          'Start-up Tools', 'Startup Tools',
          'AI Productivity'
        ]
      },
      '🔍 Specialized Tools': {
        main: ['🔍 Specialized Tools', 'Specialized Tools'],
        subcategories: [
          'AI Detection',
          'Data Analysis & BI', 'Data Analysis & Business Intelligence',
          'AI\'s for SQL', 'SQL Tools', 'AIs for SQL',
          'Chrome AI Extensions', 'Chrome Extensions'
        ]
      },
      '🎮 Entertainment & Fun': {
        main: ['🎮 Entertainment & Fun', 'Entertainment & Fun'],
        subcategories: [
          'Gaming',
          'Music',
          'Fun Tools'
        ]
      },
      '🔬 Experimental': {
        main: ['🔬 Experimental', 'Experimental'],
        subcategories: [
          'Experiments',
          'Autonomous AI Agents'
        ]
      }
    };
  }

  /**
   * Provjerava je li kategorija glavna kategorija
   * @param {string} categoryName - Ime kategorije
   * @returns {boolean}
   */
  isMainCategory(categoryName) {
    const categoryMap = this.getCategoryMap();
    
    for (const [mainCategory, data] of Object.entries(categoryMap)) {
      if (data.main.some(main => {
        const cleanMain = main.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬]/g, '').trim();
        const cleanCategory = categoryName.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬]/g, '').trim();
        return categoryName === main || 
               categoryName.includes(main) ||
               cleanCategory === cleanMain ||
               cleanCategory.includes(cleanMain);
      })) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Pronalazi glavnu kategoriju za podkategoriju
   * @param {string} subcategoryName - Ime podkategorije
   * @returns {string|null} - Ime glavne kategorije ili null
   */
  findMainCategoryForSubcategory(subcategoryName) {
    const categoryMap = this.getCategoryMap();
    
    for (const [mainCategory, data] of Object.entries(categoryMap)) {
      if (data.subcategories.some(sub => {
        const cleanSub = sub.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬🔥🆓🛠️]/g, '').trim();
        const cleanSubcategory = subcategoryName.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬🔥🆓🛠️]/g, '').trim();
        return subcategoryName === sub ||
               subcategoryName.includes(sub) ||
               cleanSubcategory === cleanSub ||
               cleanSubcategory.includes(cleanSub);
      })) {
        return data.main[0]; // Vrati glavnu kategoriju s emoji-jem
      }
    }
    
    return null;
  }

  /**
   * Parsira markdown i izvlači kategorije i alate
   * @param {string} markdown - Markdown sadržaj
   * @returns {Object} - Objekt s kategorijama i alatima
   */
  parseMarkdown(markdown) {
    const mainCategories = [];
    const subCategories = [];
    const tools = [];
    
    // Spoji linije koje su prelomljene unutar linkova
    let normalizedMarkdown = markdown;
    normalizedMarkdown = normalizedMarkdown.replace(/(\[[^\]]*)\n+([^\]]*\])/g, '$1 $2');
    normalizedMarkdown = normalizedMarkdown.replace(/(\]\([^)]*)\n+([^)]*\))/g, '$1$2');
    
    const lines = normalizedMarkdown.split('\n');
    let currentMainCategory = null;
    let currentSubCategory = null;
    let inCategorySection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Ignoriraj prazne linije i komentare
      if (!trimmedLine || trimmedLine.startsWith('<!--')) {
        continue;
      }
      
      // Provjeri je li kategorija (## ili ###)
      const categoryMatch = trimmedLine.match(/^(##|###)\s+(.+)$/);
      if (categoryMatch) {
        const categoryName = categoryMatch[2].trim();
        const isHeading2 = line.startsWith('##');
        const isHeading3 = line.startsWith('###');
        
        // Preskoči isključene sekcije
        if (this.isExcludedSection(categoryName)) {
          inCategorySection = false;
          currentMainCategory = null;
          currentSubCategory = null;
          continue;
        }
        
        // Provjeri je li validna kategorija
        if (!this.isValidCategory(categoryName)) {
          inCategorySection = false;
          currentMainCategory = null;
          currentSubCategory = null;
          continue;
        }
        
        // Ignoriraj #### sekcije (organizacijske podsekcije)
        if (line.startsWith('####')) {
          continue;
        }
        
        // Provjeri je li glavna kategorija
        if (this.isMainCategory(categoryName)) {
          // Glavna kategorija (##)
          // Pronađi puni naziv glavne kategorije s emoji-jem
          const categoryMap = this.getCategoryMap();
          let fullMainCategoryName = categoryName;
          for (const [mainCategory, data] of Object.entries(categoryMap)) {
            if (data.main.some(main => categoryName === main || categoryName.includes(main))) {
              fullMainCategoryName = data.main[0]; // Koristi prvi (s emoji-jem)
              break;
            }
          }
          
          // Provjeri da li već postoji ova glavna kategorija
          let existingMainCat = mainCategories.find(cat => {
            const cleanExisting = cat.name.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬]/g, '').trim();
            const cleanNew = fullMainCategoryName.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬]/g, '').trim();
            return cat.name === fullMainCategoryName || cleanExisting === cleanNew;
          });
          
          if (existingMainCat) {
            currentMainCategory = existingMainCat;
          } else {
            currentMainCategory = {
              name: fullMainCategoryName,
              description: '',
              isMainCategory: true,
              parentCategory: null,
              tools: []
            };
            mainCategories.push(currentMainCategory);
          }
          currentSubCategory = null; // Resetiraj podkategoriju
          inCategorySection = true;
        } else {
          // Provjeri je li ovo podkategorija (### ili ## koja je u mapi podkategorija)
          const mainCategoryForSub = this.findMainCategoryForSubcategory(categoryName);
          
          if (mainCategoryForSub) {
            // Ovo je podkategorija - pronađi ili kreiraj glavnu kategoriju
            let mainCat = mainCategories.find(cat => {
              // Provjeri točno podudaranje ili bez emoji-ja
              const cleanMain = cat.name.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬]/g, '').trim();
              const cleanMainCategoryForSub = mainCategoryForSub.replace(/[🎨📝💻🧠🎓🏢🔍🎮🔬]/g, '').trim();
              return cat.name === mainCategoryForSub || cleanMain === cleanMainCategoryForSub;
            });
            if (!mainCat) {
              // Kreiraj glavnu kategoriju ako ne postoji
              mainCat = {
                name: mainCategoryForSub,
                description: '',
                isMainCategory: true,
                parentCategory: null,
                tools: []
              };
              mainCategories.push(mainCat);
            }
            currentMainCategory = mainCat;
            
            currentSubCategory = {
              name: categoryName,
              description: '',
              isMainCategory: false,
              parentCategory: mainCategoryForSub,
              tools: []
            };
            subCategories.push(currentSubCategory);
            inCategorySection = true;
          } else if (isHeading3 || (isHeading2 && currentMainCategory)) {
            // Podkategorija (###) ili ## koja nije u mapi, ali postoji aktivna glavna kategorija
            if (currentMainCategory) {
              currentSubCategory = {
                name: categoryName,
                description: '',
                isMainCategory: false,
                parentCategory: currentMainCategory.name,
                tools: []
              };
              subCategories.push(currentSubCategory);
              inCategorySection = true;
            } else {
              // Ako nema glavne kategorije, možda je ovo glavna kategorija bez emoji-ja
              // Tretiraj kao podkategoriju bez glavne kategorije (ne bi trebalo biti)
              currentSubCategory = {
                name: categoryName,
                description: '',
                isMainCategory: false,
                parentCategory: null,
                tools: []
              };
              subCategories.push(currentSubCategory);
              inCategorySection = true;
            }
          }
        }
        continue;
      }
      
      // Provjeri je li alat (samo ako smo u kategoriji)
      if (inCategorySection && trimmedLine.match(/^[\*\-\+]\s+/)) {
        // Odredi glavnu kategoriju i podkategoriju za alat
        let mainCategoryForTool = null;
        let subCategoryForTool = null;
        
        if (currentSubCategory) {
          // Ako smo u podkategoriji, glavna kategorija je parentCategory podkategorije
          mainCategoryForTool = currentSubCategory.parentCategory || currentMainCategory?.name;
          subCategoryForTool = currentSubCategory.name;
        } else if (currentMainCategory) {
          // Ako smo direktno u glavnoj kategoriji
          mainCategoryForTool = currentMainCategory.name;
          subCategoryForTool = null;
        }
        
        if (mainCategoryForTool) {
          const tool = this.parseToolLine(
            trimmedLine, 
            mainCategoryForTool,
            subCategoryForTool
          );
          if (tool) {
            tools.push(tool);
            // Dodaj alat u podkategoriju ako postoji, inače u glavnu kategoriju
            const categoryForTool = currentSubCategory || currentMainCategory;
            if (categoryForTool) {
              categoryForTool.tools.push(tool);
            }
          }
        }
      }
    }
    
    // Kombiniraj glavne kategorije i podkategorije
    const allCategories = [...mainCategories, ...subCategories];
    
    return { categories: allCategories, tools };
  }

  /**
   * Parsira liniju s alatom i vraća objekt alata
   * @param {string} line - Linija markdowna s alatom
   * @param {string} categoryName - Ime glavne kategorije
   * @param {string} subcategoryName - Ime podkategorije (opcionalno)
   * @returns {Object|null} - Objekt alata ili null ako nije validan
   */
    extractFirstHttpUrl(text) {
    if (!text) return '';
    const m = text.match(/https?:\/\/[^\s)<>\]]+/i);
    if (!m) return '';
    // trim trailing punctuation
    let url = m[0];
    while (/[)\].,;:!]+$/.test(url)) url = url.slice(0, -1);
    return url;
  }

  extractMarkdownUrl(text) {
    if (!text) return '';
    const m = text.match(/\[[^\]]*\]\((https?:\/\/[^)]+)\)/i);
    if (!m) return '';
    let url = m[1].trim();
    while (/[)\].,;:!]+$/.test(url)) url = url.slice(0, -1);
    return url;
  }
  parseToolLine(line, categoryName, subcategoryName = null) {
    // Format 1: - **[Naziv](URL)** 💰 - Opis
    // Format 2: - **[Naziv](URL)** 🆕💰 - Opis (više ikona)
    // Format 3: - **[Naziv](URL)** 🔄 (bez opisa)
    // Format 4: - **[Naziv](URL)** - Opis (bez pricing ikone)
    let match = line.match(/^[\*\-\+]\s+\*\*\[(.+?)\]\(([^\)]+)\)\*\*\s*(.*)$/);
    
    if (match) {
      const toolName = match[1].trim();
      let website = match[2].trim();
      const rest = match[3].trim();
      
      // Ignoriraj anchor linkove
      if (website.startsWith('#')) {
        return null;
      }
      
       // Ignoriraj anchor linkove
      if (website.startsWith('#')) return null;

      // Ako nije http, pokušaj popraviti (www / domain)
      if (!website.startsWith('http')) {
        if (/^www\./i.test(website) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(website)) {
          website = `https://${website}`;
        } else {
          // fallback: probaj naći http url u ostatku linije
          const fallbackUrl = this.extractFirstHttpUrl(rest) || this.extractMarkdownUrl(rest);
          if (fallbackUrl) website = fallbackUrl;
        }
      }

      if (!website.startsWith('http')) return null;
      
      // Parsiraj pricing ikone i opis
      const { pricing, description } = this.parsePricingAndDescription(rest);
      
      return {
        name: toolName,
        description: description || '',
        pricing: pricing,
        category: categoryName,
        subcategory: subcategoryName,
        website: website,
      };
    }
    
    // Format 5: - [Naziv](URL) (bez bold)
    match = line.match(/^[\*\-\+]\s+\[(.+?)\]\(([^\)]+)\)\s*(.*)$/);
    if (match) {
      const toolName = match[1].trim();
      let website = match[2].trim();
      const rest = match[3].trim();
      
      // Ignoriraj anchor linkove
      if (website.startsWith('#')) {
        return null;
      }
      
            // Ignoriraj anchor linkove
      if (website.startsWith('#')) return null;

      // Ako nije http, pokušaj popraviti (www / domain)
      if (!website.startsWith('http')) {
        if (/^www\./i.test(website) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(website)) {
          website = `https://${website}`;
        } else {
          // fallback: probaj naći http url u ostatku linije
          const fallbackUrl = this.extractFirstHttpUrl(rest) || this.extractMarkdownUrl(rest);
          if (fallbackUrl) website = fallbackUrl;
        }
      }

      if (!website.startsWith('http')) return null;

      
      const { pricing, description } = this.parsePricingAndDescription(rest);
      
      return {
        name: toolName,
        description: description || '',
        pricing: pricing,
        category: categoryName,
        subcategory: subcategoryName,
        website: website,
      };
    }
    
    // Format 6: - Naziv (bez linka)
    match = line.match(/^[\*\-\+]\s+([^\-\*\[]+?)(?:\s*-\s*(.+))?$/);
    if (match) {
      // pokušaj izvući URL iz cijele linije (često se url nalazi na kraju)
      const urlFromLine = this.extractFirstHttpUrl(line) || this.extractMarkdownUrl(line);

      let toolName = match[1].trim();
      const description = match[2] ? match[2].trim() : '';
      
      // Ignoriraj ako je prazan ili ako sadrži markdown formatiranje
      if (!toolName || 
          toolName.startsWith('[') || 
          toolName.startsWith('**') || 
          toolName.startsWith('http') ||
          toolName.match(/^[🆓💰🔄🆕🔥]/)) {
        return null;
      }
      
      // Provjeri je li možda pricing ikona na početku
      const pricingMatch = toolName.match(/^([🆓💰🔄]+)\s*(.+)$/);
      if (pricingMatch) {
        const pricingIcon = pricingMatch[1];
        toolName = pricingMatch[2].trim();
        const pricing = this.getPricingFromIcon(pricingIcon);
        
        return {
          name: toolName,
          description: description || '',
          pricing: pricing,
          category: categoryName,
          subcategory: subcategoryName,
          website: urlFromLine || '',
        };
      }
      
      return {
        name: toolName,
        description: description || '',
        pricing: 'free',
        category: categoryName,
        subcategory: subcategoryName,
        website: urlFromLine || '',
      };
    }
    
    return null;
  }

  /**
   * Parsira pricing ikone i opis iz ostatka linije
   * @param {string} rest - Ostatak linije nakon linka
   * @returns {Object} - Objekt s pricing i description
   */
  parsePricingAndDescription(rest) {
    let pricing = 'free';
    let description = '';
    
    if (!rest) {
      return { pricing, description };
    }
    
    // Pronađi sve ikone (uključujući 🆕, 🔥, 💰, 🔄, 🆓)
    // Prvo provjeri ima li pricing ikone (💰, 🔄, 🆓)
    const pricingIconMatch = rest.match(/[💰🔄🆓]/);
    if (pricingIconMatch) {
      // Pronađi sve ikone u nizu (npr. 🆕💰 ili 🔥💰)
      const allIconsMatch = rest.match(/^([🆓💰🔄🆕🔥]+)/);
      if (allIconsMatch) {
        const allIcons = allIconsMatch[1];
        pricing = this.getPricingFromIcon(allIcons);
        
        // Ukloni sve ikone iz opisa
        rest = rest.replace(/^[🆓💰🔄🆕🔥]+\s*/, '').trim();
      }
    }
    
    // Ako ima " - " nakon ikona, to je opis
    if (rest.startsWith('-')) {
      description = rest.substring(1).trim();
    } else if (rest) {
      // Ako nema " - ", cijeli ostatak je opis
      description = rest.trim();
    }
    
    return { pricing, description };
  }

  /**
   * Određuje pricing na temelju ikone
   * @param {string} icon - Pricing ikona
   * @returns {string} - Pricing tip ('free', 'paid', 'freemium')
   */
  getPricingFromIcon(icon) {
    if (!icon) return 'free';
    
    if (icon.includes('💰')) {
      return 'paid';
    } else if (icon.includes('🔄')) {
      return 'freemium';
    } else if (icon.includes('🆓')) {
      return 'free';
    }
    
    return 'free';
  }

  /**
   * Provjerava je li sekcija validna kategorija
   */
  isValidCategory(categoryName) {
    // Preskoči sekcije koje nisu kategorije alata
    const invalidPatterns = [
      'contributing',
      'license',
      'about',
      'navigation',
      'footer',
      'resources',
      'topics',
      'code of conduct',
      'contributors',
      'releases',
      'packages',
      'languages',
      'footer navigation',
      'quick ways',
      'contribution guidelines',
      'table of contents',
      'support',
      'contact',
      'getting started',
      'star history',
      'quick stats',
      'readme',
      'legend',
    ];
    
    // Preskoči sekcije koje počinju s emoji i nisu kategorije
    const invalidEmojiPatterns = [
      '🌟', '📞', '📋', '🚀', '📊', '📧', '🐛', '💬', '🐦', '🏷️',
    ];
    
    const lowerName = categoryName.toLowerCase();
    const hasInvalidPattern = invalidPatterns.some(pattern => lowerName.includes(pattern));
    const hasInvalidEmoji = invalidEmojiPatterns.some(emoji => categoryName.includes(emoji));
    
    return !hasInvalidPattern && !hasInvalidEmoji;
  }

  /**
   * Provjerava je li sekcija isključena (npr. Contributing, License, itd.)
   */
  isExcludedSection(sectionName) {
    const excluded = [
      'Contributing',
      'License',
      'About',
      'Navigation Menu',
      'Footer',
      'Resources',
      'Topics',
      'Code of conduct',
      'Contributing Guidelines',
      'Quick Ways to Contribute',
      'Contribution Guidelines',
      'Contributors',
    ];
    
    return excluded.some(excludedName => 
      sectionName.toLowerCase().includes(excludedName.toLowerCase())
    );
  }

  /**
   * Dohvaća i parsira sve alate iz kataloga
   * @param {string} localFilePath - Opcionalno: putanja do lokalnog markdown fajla za testiranje
   * @returns {Promise<Object>} - Objekt s kategorijama i alatima
   */
  async fetchAndParseCatalog(localFilePath = null) {
    try {
      let markdown;
      if (localFilePath) {
        markdown = await this.readLocalMarkdown(localFilePath);
      } else {
        markdown = await this.fetchReadme();
      }
      const parsed = this.parseMarkdown(markdown);
      return parsed;
    } catch (error) {
      console.error('Greška pri parsiranju kataloga:', error);
      throw error;
    }
  }

  /**
   * Mapira kategoriju iz GitHub kataloga u naš Category model format
   */
  mapCategoryToModel(categoryName) {
    // Mapiranje kategorija na naše kategorije
    const categoryMapping = {
      'Image Generation': 'Generiranje Slika',
      'Text Generation': 'Generiranje Teksta',
      'Code Generation': 'Generiranje Koda',
      'Video Generation': 'Generiranje Videa',
      'Audio Generation': 'Generiranje Audio',
      'Chatbots': 'Chatbotovi',
      'Data Analysis': 'Analiza Podataka',
      'Productivity': 'Produktivnost',
      'Education': 'Obrazovanje',
      // Dodaj više mapiranja prema potrebi
    };
    
    return categoryMapping[categoryName] || categoryName;
  }

  /**
   * Mapira alat iz GitHub kataloga u naš Tool model format
   */
  mapToolToModel(tool, categoryId) {
    return {
      name: tool.name,
      description: tool.description,
      website: tool.website || '', // Možda će trebati ručno dodati
      pricing: tool.pricing,
      category: categoryId,
      // Ostala polja će se morati popuniti ručno ili iz drugih izvora
      tags: [],
      models: [],
      metadata: {},
    };
  }
}

module.exports = new GitHubCatalogService();

