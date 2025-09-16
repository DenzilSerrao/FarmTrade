import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CategoryService {
  constructor() {
    this.categories = null;
    this.crops = null;
    this.loadCategories();
  }

  loadCategories() {
    try {
      const csvPath = path.join(__dirname, '../../Category.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').slice(1); // Skip header
      
      const categoriesSet = new Set();
      const cropsArray = [];
      
      lines.forEach(line => {
        if (line.trim()) {
          const [commodity, category] = line.split(',');
          if (commodity && category) {
            const cleanCategory = category.trim();
            const cleanCommodity = commodity.replace(/\+/g, ' ').replace(/%2f/g, '/').replace(/%2c/g, ',').trim();
            
            categoriesSet.add(cleanCategory);
            cropsArray.push({
              name: cleanCommodity,
              category: cleanCategory,
              searchTerms: cleanCommodity.toLowerCase().split(' '),
            });
          }
        }
      });

      this.categories = Array.from(categoriesSet).sort();
      this.crops = cropsArray;
      
      console.log(`Loaded ${this.categories.length} categories and ${this.crops.length} crops`);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback data
      this.categories = [
        'Vegetables',
        'Fruits', 
        'Cereals & Grains',
        'Pulses & Legumes',
        'Nuts & Oilseeds',
        'Spices & Condiments',
        'Commercial & Plantation Crops',
      ];
      this.crops = [
        { name: 'Tomatoes', category: 'Vegetables' },
        { name: 'Potatoes', category: 'Vegetables' },
        { name: 'Onions', category: 'Vegetables' },
        { name: 'Wheat', category: 'Cereals & Grains' },
        { name: 'Rice', category: 'Cereals & Grains' },
      ];
    }
  }

  getCategories() {
    return [...this.categories, 'Other'];
  }

  getCropsByCategory(category) {
    if (category === 'Other') {
      return [];
    }
    return this.crops.filter(crop => crop.category === category);
  }

  getAllCrops() {
    return this.crops;
  }

  searchCrops(query) {
    if (!query || query.length < 2) {
      return this.crops.slice(0, 10); // Return first 10 crops
    }

    const searchTerm = query.toLowerCase();
    return this.crops.filter(crop => 
      crop.name.toLowerCase().includes(searchTerm) ||
      crop.searchTerms.some(term => term.includes(searchTerm))
    ).slice(0, 20); // Limit to 20 results
  }

  getUnits() {
    return [
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'gram', label: 'Grams (g)' },
      { value: 'quintal', label: 'Quintals (q)' },
      { value: 'ton', label: 'Tons (t)' },
      { value: 'piece', label: 'Pieces' },
      { value: 'dozen', label: 'Dozens' },
      { value: 'liter', label: 'Liters (L)' },
      { value: 'bag', label: 'Bags' },
      { value: 'box', label: 'Boxes' },
      { value: 'crate', label: 'Crates' },
    ];
  }
}

export default new CategoryService();