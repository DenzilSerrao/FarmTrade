import {
  imageUtils,
  productImageUtils,
  IMAGE_CATEGORIES,
} from '../config/images.config.js';
import Product from '../models/Product.js';

class ProductService {
  // Create product with images
  async createProduct(productData, imageFiles) {
    try {
      // Process and save images
      const processedImages = await productImageUtils.saveProductImages(
        imageFiles,
        productData.sellerId
      );

      // Create product with image references
      const product = new Product({
        ...productData,
        images: processedImages.map((img) => ({
          filename: img.filename,
          originalName: img.originalName,
          variants: img.variants,
          isPrimary: false, // Set first image as primary elsewhere
        })),
      });

      // Set first image as primary
      if (product.images.length > 0) {
        product.images[0].isPrimary = true;
      }

      await product.save();
      return this.getProductWithImages(product);
    } catch (error) {
      throw error;
    }
  }

  // Get product with formatted image URLs
  async getProductWithImages(product) {
    const formattedProduct = product.toObject();

    // Convert image filenames to full URLs with variants
    formattedProduct.images = productImageUtils.getProductImageUrls(
      product.images
    );

    return formattedProduct;
  }

  // Get all products with images
  async getAllProducts() {
    const products = await Product.find({ isActive: true });

    return products.map((product) => ({
      ...product.toObject(),
      images: productImageUtils.getProductImageUrls(product.images),
      primaryImage: this.getPrimaryImageUrl(product.images),
    }));
  }

  // Get primary image URL for product listings
  getPrimaryImageUrl(images) {
    const primaryImage = images.find((img) => img.isPrimary) || images[0];
    if (!primaryImage) return null;

    return {
      thumbnail: imageUtils.getFullUrl(
        IMAGE_CATEGORIES.PRODUCT,
        imageUtils.getVariantFilename(primaryImage.filename, 'thumbnail')
      ),
      medium: imageUtils.getFullUrl(
        IMAGE_CATEGORIES.PRODUCT,
        imageUtils.getVariantFilename(primaryImage.filename, 'medium')
      ),
    };
  }
}
