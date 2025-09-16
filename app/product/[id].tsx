import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, MapPin, Calendar, Package, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { getShelfItem } from '@/lib/api';
import CartService from '@/lib/cart';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await getShelfItem(id as string);
      if (response.success) {
        setProduct(response.data);
      } else {
        Alert.alert('Error', 'Product not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity < product.minOrderQuantity) {
      Alert.alert('Error', `Minimum order quantity is ${product.minOrderQuantity} ${product.unit}`);
      return;
    }

    if (quantity > product.quantity) {
      Alert.alert('Error', `Only ${product.quantity} ${product.unit} available`);
      return;
    }

    try {
      await CartService.addToCart({
        productId: product._id,
        productName: product.name,
        sellerId: product.ownerId._id,
        sellerName: product.ownerId.name,
        sellerLocation: product.ownerId.location,
        quantity,
        unit: product.unit,
        pricePerUnit: product.price,
        image: product.primaryImage?.urls?.medium,
        category: product.category,
        estimatedDelivery: getEstimatedDelivery(),
        deliveryMode: 'delivery',
        maxQuantity: product.quantity,
      });

      Alert.alert('Success', 'Item added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = () => {
    if (!product?.expiryDate) return null;
    const now = new Date();
    const expiry = new Date(product.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image
            source={{
              uri: product.images?.[selectedImageIndex]?.urls?.large ||
                   product.primaryImage?.urls?.large ||
                   'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400'
            }}
            style={styles.mainImage}
          />
          
          {product.images && product.images.length > 1 && (
            <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
              {product.images.map((image: { urls: { thumbnail: any; }; }, index: string | number | bigint | ((prevState: number) => number) | null | undefined) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail,
                  ]}
                >
                  <Image
                    source={{ uri: image.urls?.thumbnail }}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.organic && (
              <View style={styles.organicBadge}>
                <Text style={styles.organicText}>Organic</Text>
              </View>
            )}
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>Grade {product.qualityGrade}</Text>
            </View>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.price} per {product.unit}</Text>
          
          <View style={styles.sellerInfo}>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>by {product.ownerId.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#F59E0B" />
                <Text style={styles.rating}>{product.ownerId.rating}</Text>
                <Text style={styles.tradeCount}>({product.ownerId.totalTrades} trades)</Text>
              </View>
            </View>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.location}>{product.ownerId.location}</Text>
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Package size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {product.quantity} {product.unit} available
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Harvested: {formatDate(product.harvestDate)}
              </Text>
            </View>
            
            {product.expiryDate && (
              <View style={styles.detailRow}>
                <Calendar size={16} color={daysUntilExpiry && daysUntilExpiry < 7 ? "#F59E0B" : "#6B7280"} />
                <Text style={[
                  styles.detailText,
                  daysUntilExpiry && daysUntilExpiry < 7 && styles.urgentText,
                ]}>
                  {daysUntilExpiry && daysUntilExpiry > 0
                    ? `Expires in ${daysUntilExpiry} days`
                    : daysUntilExpiry === 0
                    ? 'Expires today'
                    : 'Expired'
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={(value) => {
                  const num = parseInt(value) || 1;
                  setQuantity(Math.max(1, Math.min(product.quantity, num)));
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(product.quantity, quantity + 1))}
              >
                <Plus size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.quantityNote}>
              Min order: {product.minOrderQuantity} {product.unit}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{(product.price * quantity).toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (quantity > product.quantity || !product.available) && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={quantity > product.quantity || !product.available}
        >
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  thumbnail: {
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#22C55E',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  organicBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  organicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gradeBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 16,
  },
  sellerInfo: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sellerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  tradeCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  detailsContainer: {
    marginTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  urgentText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  quantitySection: {
    marginTop: 24,
  },
  quantityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: 12,
  },
  quantityInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 60,
    textAlign: 'center',
    paddingVertical: 8,
  },
  quantityNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addToCartButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});