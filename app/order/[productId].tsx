import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Package, Plus, Minus, CreditCard } from 'lucide-react-native';
import { getShelfItem, getSavedAddresses, createOrder } from '@/lib/api';
import { SavedAddress } from '@/types/payment';

export default function OrderScreen() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (productId) {
      loadOrderData();
    }
  }, [productId]);

  const loadOrderData = async () => {
    try {
      const [productRes, addressRes] = await Promise.all([
        getShelfItem(productId as string),
        getSavedAddresses(),
      ]);

      if (productRes.success) {
        setProduct(productRes.data);
        setQuantity(productRes.data.minOrderQuantity || 1);
      }

      if (addressRes.success) {
        setAddresses(addressRes.data || []);
        const defaultAddress = addressRes.data?.find((addr: SavedAddress) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      Alert.alert('Error', 'Failed to load order data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (deliveryMode === 'delivery' ? 3 : 1));
    return deliveryDate.toLocaleDateString();
  };

  const handlePlaceOrder = async () => {
    if (!product) return;

    // Validation
    if (quantity < product.minOrderQuantity) {
      Alert.alert('Error', `Minimum order quantity is ${product.minOrderQuantity} ${product.unit}`);
      return;
    }

    if (quantity > product.quantity) {
      Alert.alert('Error', `Only ${product.quantity} ${product.unit} available`);
      return;
    }

    if (deliveryMode === 'delivery' && !selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setPlacing(true);

    try {
      const orderData = {
        productId: product._id,
        productName: product.name,
        sellerId: product.ownerId._id,
        quantity,
        unit: product.unit,
        pricePerUnit: product.price,
        totalPrice: calculateTotal(),
        deliveryMode,
        shippingAddress: deliveryMode === 'delivery' ? {
          name: selectedAddress?.name,
          phone: selectedAddress?.phone,
          street: selectedAddress?.addressLine1,
          city: selectedAddress?.city,
          state: selectedAddress?.state,
          pincode: selectedAddress?.pincode,
          country: 'India',
        } : null,
        notes,
        requestedDeliveryDate: getEstimatedDelivery(),
      };

      const response = await createOrder(orderData);

      if (response.success) {
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully. The seller will be notified.',
          [
            {
              text: 'View Orders',
              onPress: () => router.replace('/(tabs)/orders'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading order details...</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.productCard}>
            <Image
              source={{
                uri: product.primaryImage?.urls?.medium ||
                     'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200'
              }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.sellerName}>by {product.ownerId.name}</Text>
              <Text style={styles.productPrice}>₹{product.price} per {product.unit}</Text>
              <Text style={styles.availableStock}>{product.quantity} {product.unit} available</Text>
            </View>
          </View>
        </View>

        {/* Quantity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(product.minOrderQuantity, quantity - 1))}
            >
              <Minus size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(value) => {
                const num = parseInt(value) || product.minOrderQuantity;
                setQuantity(Math.max(product.minOrderQuantity, Math.min(product.quantity, num)));
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
            Min order: {product.minOrderQuantity} {product.unit} • Max: {product.quantity} {product.unit}
          </Text>
        </View>

        {/* Delivery Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Mode</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryMode === 'delivery' && styles.selectedDeliveryOption,
              ]}
              onPress={() => setDeliveryMode('delivery')}
            >
              <Package size={20} color={deliveryMode === 'delivery' ? '#22C55E' : '#6B7280'} />
              <View style={styles.deliveryInfo}>
                <Text style={[
                  styles.deliveryTitle,
                  deliveryMode === 'delivery' && styles.selectedDeliveryText,
                ]}>
                  Home Delivery
                </Text>
                <Text style={styles.deliverySubtitle}>Delivered to your address</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryMode === 'pickup' && styles.selectedDeliveryOption,
              ]}
              onPress={() => setDeliveryMode('pickup')}
            >
              <MapPin size={20} color={deliveryMode === 'pickup' ? '#22C55E' : '#6B7280'} />
              <View style={styles.deliveryInfo}>
                <Text style={[
                  styles.deliveryTitle,
                  deliveryMode === 'pickup' && styles.selectedDeliveryText,
                ]}>
                  Self Pickup
                </Text>
                <Text style={styles.deliverySubtitle}>Collect from farm</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address (if delivery mode) */}
        {deliveryMode === 'delivery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => router.push('/addresses')}>
                <Text style={styles.changeAddressText}>Change</Text>
              </TouchableOpacity>
            </View>

            {selectedAddress ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addressName}>{selectedAddress.name}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.addressLine1}, {selectedAddress.city}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.state} - {selectedAddress.pincode}
                </Text>
                <Text style={styles.addressPhone}>📞 {selectedAddress.phone}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => router.push('/addresses')}
              >
                <Text style={styles.addAddressText}>+ Add Delivery Address</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Pickup Location (if pickup mode) */}
        {deliveryMode === 'pickup' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.pickupCard}>
              <MapPin size={20} color="#22C55E" />
              <View style={styles.pickupInfo}>
                <Text style={styles.pickupTitle}>{product.ownerId.name}'s Farm</Text>
                <Text style={styles.pickupAddress}>{product.ownerId.location}</Text>
                <Text style={styles.pickupNote}>Contact seller for exact pickup location</Text>
              </View>
            </View>
          </View>
        )}

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requirements or notes for the seller..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Estimated Delivery */}
        <View style={styles.section}>
          <View style={styles.estimatedDelivery}>
            <Calendar size={20} color="#3B82F6" />
            <View style={styles.deliveryTimeInfo}>
              <Text style={styles.deliveryTimeTitle}>
                Estimated {deliveryMode === 'delivery' ? 'Delivery' : 'Pickup'}
              </Text>
              <Text style={styles.deliveryTimeDate}>{getEstimatedDelivery()}</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {product.name} × {quantity} {product.unit}
              </Text>
              <Text style={styles.summaryValue}>₹{calculateTotal()}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {deliveryMode === 'delivery' ? 'Delivery Charges' : 'Pickup Charges'}
              </Text>
              <Text style={styles.summaryValue}>
                {deliveryMode === 'delivery' ? '₹50' : 'Free'}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ₹{calculateTotal() + (deliveryMode === 'delivery' ? 50 : 0)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotal}>
            ₹{calculateTotal() + (deliveryMode === 'delivery' ? 50 : 0)}
          </Text>
          <Text style={styles.footerSubtitle}>Total Amount</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.placeOrderButton, placing && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          <CreditCard size={20} color="#FFFFFF" />
          <Text style={styles.placeOrderText}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </Text>
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
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sellerName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 4,
  },
  availableStock: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  deliveryOptions: {
    gap: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  selectedDeliveryOption: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  deliveryInfo: {
    marginLeft: 12,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedDeliveryText: {
    color: '#22C55E',
  },
  deliverySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  changeAddressText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    textTransform: 'uppercase',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addAddressButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#22C55E',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  addAddressText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
  },
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  pickupInfo: {
    marginLeft: 12,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickupAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  pickupNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#1F2937',
    height: 80,
    textAlignVertical: 'top',
  },
  estimatedDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
  },
  deliveryTimeInfo: {
    marginLeft: 12,
  },
  deliveryTimeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  deliveryTimeDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  summaryContainer: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
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
  footerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  footerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  placeOrderButton: {
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
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});