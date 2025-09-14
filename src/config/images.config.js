// config/images.config.js
export const imageConfig = {
  // Base paths
  basePath: '/uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',

  // Category-specific paths
  paths: {
    products: '/products',
    users: '/users/avatars',
    categories: '/categories',
    temp: '/temp',
  },

  // Image variants/sizes
  variants: {
    thumbnail: { width: 150, height: 150, suffix: '_thumb' },
    medium: { width: 400, height: 400, suffix: '_med' },
    large: { width: 800, height: 800, suffix: '_large' },
    original: { suffix: '' },
  },

  // File constraints
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],

  // Storage settings
  storage: {
    local: {
      uploadDir: './uploads',
      publicPath: '/uploads',
    },
    cloud: {
      bucket: process.env.AWS_S3_BUCKET || 'your-app-images',
      region: process.env.AWS_REGION || 'us-east-1',
    },
  },
};

// Helper functions
export const imageUtils = {
  // Get full path for a category
  getFullPath(category, filename = '') {
    return `${imageConfig.basePath}${imageConfig.paths[category]}/${filename}`.replace(
      /\/+/g,
      '/'
    );
  },

  // Get full URL for serving images
  getFullUrl(category, filename) {
    const path = this.getFullPath(category, filename);
    return `${imageConfig.baseUrl}${path}`;
  },

  // Generate variant filename
  getVariantFilename(originalName, variant) {
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const name = originalName.substring(0, originalName.lastIndexOf('.'));
    return `${name}${imageConfig.variants[variant].suffix}${ext}`;
  },

  // Get all variant URLs for an image
  getAllVariants(category, originalFilename) {
    const variants = {};
    Object.keys(imageConfig.variants).forEach((variant) => {
      const filename = this.getVariantFilename(originalFilename, variant);
      variants[variant] = this.getFullUrl(category, filename);
    });
    return variants;
  },

  // Validate file type
  isValidFileType(mimetype) {
    return imageConfig.allowedTypes.includes(mimetype);
  },

  // Validate file size
  isValidFileSize(size) {
    return size <= imageConfig.maxFileSize;
  },

  // Generate unique filename
  generateFilename(originalName, userId = null) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const prefix = userId ? `user_${userId}_` : '';
    return `${prefix}${timestamp}_${random}${ext}`;
  },
};

// Product-specific image helpers
export const productImageUtils = {
  // Save product images with multiple variants
  async saveProductImages(files, productId) {
    const savedImages = [];

    for (const file of files) {
      const filename = imageUtils.generateFilename(
        file.originalname,
        productId
      );
      const category = 'products';

      // Save original and generate variants
      const variants = await this.processImageVariants(
        file,
        category,
        filename
      );

      savedImages.push({
        originalName: file.originalname,
        filename: filename,
        category: category,
        variants: variants,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      });
    }

    return savedImages;
  },

  // Process image variants (placeholder for actual image processing)
  async processImageVariants(file, category, filename) {
    const variants = {};

    // In a real implementation, you'd use Sharp, Jimp, or similar
    Object.keys(imageConfig.variants).forEach((variant) => {
      const variantFilename = imageUtils.getVariantFilename(filename, variant);
      variants[variant] = {
        filename: variantFilename,
        url: imageUtils.getFullUrl(category, variantFilename),
        dimensions: imageConfig.variants[variant],
      };
    });

    return variants;
  },

  // Get product image URLs
  getProductImageUrls(productImages) {
    return productImages.map((img) => ({
      id: img._id,
      original: imageUtils.getFullUrl('products', img.filename),
      variants: imageUtils.getAllVariants('products', img.filename),
      alt: img.alt || '',
      isPrimary: img.isPrimary || false,
    }));
  },
};

// Usage examples and constants
export const IMAGE_CATEGORIES = {
  PRODUCT: 'products',
  USER: 'users',
  CATEGORY: 'categories',
  TEMP: 'temp',
};

export const IMAGE_VARIANTS = {
  THUMBNAIL: 'thumbnail',
  MEDIUM: 'medium',
  LARGE: 'large',
  ORIGINAL: 'original',
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  imageConfig.baseUrl = process.env.PRODUCTION_BASE_URL;
  imageConfig.storage.local.uploadDir = process.env.UPLOAD_DIR || './uploads';
}

export default {
  imageConfig,
  imageUtils,
  productImageUtils,
  IMAGE_CATEGORIES,
  IMAGE_VARIANTS,
};
