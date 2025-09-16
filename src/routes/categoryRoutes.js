import express from 'express';
const router = express.Router();
import categoryService from '../services/categoryService.js';

// Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = categoryService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
});

// Get crops by category
router.get('/categories/:category/crops', (req, res) => {
  try {
    const { category } = req.params;
    const crops = categoryService.getCropsByCategory(category);
    res.json({
      success: true,
      data: crops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops',
    });
  }
});

// Search crops
router.get('/crops/search', (req, res) => {
  try {
    const { q } = req.query;
    const crops = categoryService.searchCrops(q);
    res.json({
      success: true,
      data: crops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search crops',
    });
  }
});

// Get all crops
router.get('/crops', (req, res) => {
  try {
    const crops = categoryService.getAllCrops();
    res.json({
      success: true,
      data: crops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops',
    });
  }
});

// Get available units
router.get('/units', (req, res) => {
  try {
    const units = categoryService.getUnits();
    res.json({
      success: true,
      data: units,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch units',
    });
  }
});

export default router;