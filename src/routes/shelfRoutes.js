// routes/shelfRoutes.js - Complete Shelf Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import shelfService from '../services/shelfService.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  imageConfig,
  imageUtils,
  IMAGE_CATEGORIES,
} from '../config/images.config.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = `${imageConfig.storage.local.uploadDir}${imageConfig.paths.products}`;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = imageUtils.generateFilename(
      file.originalname,
      req.user?.id
    );
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: imageConfig.maxFileSize,
    files: 5, // Max 5 images per product
  },
  fileFilter: (req, file, cb) => {
    if (imageUtils.isValidFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// Get user's shelf items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, lowStock, page, limit, search } = req.query;
    const options = { category, lowStock, page, limit, search };

    const result = await shelfService.getUserShelfItems(req.user.id, options);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public marketplace items (for buyers)
router.get('/marketplace', async (req, res) => {
  try {
    const { category, location, priceRange, page, limit, search, sortBy } =
      req.query;
    const options = {
      category,
      location,
      priceRange,
      page,
      limit,
      search,
      sortBy,
    };

    const result = await shelfService.getMarketplaceItems(options);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific shelf item
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await shelfService.getShelfItemById(
      req.params.id,
      req.user.id
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new shelf item
router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const itemData = {
        ...req.body,
        ownerId: req.user.id,
      };

      const item = await shelfService.addShelfItem(itemData, req.files);
      res.status(201).json({ success: true, item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Update shelf item
router.put(
  '/:id',
  authMiddleware,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const item = await shelfService.updateShelfItem(
        req.params.id,
        req.user.id,
        req.body,
        req.files
      );

      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: 'Item not found' });
      }

      res.json({ success: true, item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Remove specific image from item
router.delete('/:id/images/:imageId', authMiddleware, async (req, res) => {
  try {
    const item = await shelfService.removeItemImage(
      req.params.id,
      req.user.id,
      req.params.imageId
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Set primary image
router.patch(
  '/:id/images/:imageId/primary',
  authMiddleware,
  async (req, res) => {
    try {
      const item = await shelfService.setPrimaryImage(
        req.params.id,
        req.user.id,
        req.params.imageId
      );

      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: 'Item not found' });
      }

      res.json({ success: true, item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Update item availability
router.patch('/:id/availability', authMiddleware, async (req, res) => {
  try {
    const { available, soldQuantity } = req.body;
    const item = await shelfService.updateItemAvailability(
      req.params.id,
      req.user.id,
      available,
      soldQuantity
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Bulk update quantities
router.patch('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { itemId, quantity }
    const items = await shelfService.bulkUpdateQuantities(req.user.id, updates);
    res.json({ success: true, items });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete shelf item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const success = await shelfService.deleteShelfItem(
      req.params.id,
      req.user.id
    );
    if (!success) {
      return res
        .status(404)
        .json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get shelf analytics
router.get('/analytics/dashboard', authMiddleware, async (req, res) => {
  try {
    const analytics = await shelfService.getShelfAnalytics(req.user.id);
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
