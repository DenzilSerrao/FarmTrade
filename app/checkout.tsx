import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Plus, CreditCard, Truck, Calendar } from 'lucide-react-native';
import CartService from '@/lib/cart';
import { CartItem, SavedAddress, PaymentDetails } from '@/types/payment';
import { getSavedAddresses } from '@/lib/api';

export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'phonepe' | 'cod'>('phonepe');
  const [loading, setLoading] = useState(true);

  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    deliveryCharges: 50,
    taxes: 0,
    discount: 0,
    finalAmount: 0,
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const [items, savedAddresses] = await Promise.all([
        CartService.getCartItems(),
        getSavedAddresses(),
      ]);

      setCartItems(items);
      setAddresses(savedAddresses.data || []);

      // Set default address
      const defaultAddress = savedAddresses.data?.find((addr: SavedAddress) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }

      // Calculate order summary
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxes = Math.round(subtotal * 0.05); // 5% tax
      const finalAmount = subtotal + orderSummary.deliveryCharges + taxes - orderSummary.discount;

      setOrderSummary({
        subtotal,
        deliveryCharges: 50,
        taxes,
        discount: 0,
        finalAmount,
      });
    } catch (error) {
      console.error('Error loading checkout data:', error);
      Alert.alert('Error', 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
  };

  const proceedToPayment = () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    const paymentDetails: PaymentDetails = {
      cartItems,
      totalAmount: orderSummary.subtotal,
      deliveryAddress: selectedAddress,
      paymentMethod,
      deliveryCharges: orderSummary.deliveryCharges,
      taxes: orderSummary.taxes,
      discount: orderSummary.discount,
      finalAmount: orderSummary.finalAmount,
      estimatedDelivery: getEstimatedDelivery(),
    };

    router.push({
      pathname: '/payment',
      params: { paymentDetails: JSON.stringify(paymentDetails) },
    });
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading checkout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Review your order</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/addresses')}>
              <Plus size={20} color="#22C55E" />
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <TouchableOpacity 
              style={styles.selectedAddress}
              onPress={() => router.push('/addresses')}
            >
              <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
              <Text style={styles.addressName}>{selectedAddress.name}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.addressLine1}, {selectedAddress.addressLine2}
              </Text>
              <Text style={styles.addressText}>
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </Text>
              <Text style={styles.addressPhone}>📞 {selectedAddress.phone}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/addresses')}
            >
              <Plus size={20} color="#22C55E" />
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({cartItems.length})</Text>
          
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemSeller}>by {item.sellerName}</Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} {item.unit} × ₹{item.pricePerUnit}
                </Text>
              </View>
              <View style={styles.itemPricing}>
                <Text style={styles.itemTotal}>₹{item.totalPrice}</Text>
                <View style={styles.deliveryBadge}>
                  <Truck size={12} color="#3B82F6" />
                  <Text style={styles.deliveryText}>
                    {item.deliveryMode === 'delivery' ? 'Delivery' : 'Pickup'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Estimated Delivery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Estimated Delivery</Text>
          </View>
          <Text style={styles.deliveryDate}>{getEstimatedDelivery()}</Text>
          <Text style={styles.deliveryNote}>
            Delivery time may vary based on seller location and weather conditions
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#8B5A2B" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'phonepe' && styles.selectedPaymentOption,
            ]}
            onPress={() => setPaymentMethod('phonepe')}
          >
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>PhonePe</Text>
              <Text style={styles.paymentSubtitle}>Pay securely with PhonePe</Text>
            </View>
            <View style={[
              styles.radioButton,
              paymentMethod === 'phonepe' && styles.selectedRadio,
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.selectedPaymentOption,
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtitle}>Pay when you receive</Text>
            </View>
            <View style={[
              styles.radioButton,
              paymentMethod === 'cod' && styles.selectedRadio,
            ]} />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.subtotal}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.deliveryCharges}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & Fees</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.taxes}</Text>
            </View>
            
            {orderSummary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₹{orderSummary.discount}
                </Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{orderSummary.finalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotal}>₹{orderSummary.finalAmount}</Text>
          <Text style={styles.footerSubtitle}>Total Amount</Text>
        </View>
        
        <TouchableOpacity style={styles.proceedButton} onPress={proceedToPayment}>
          <Text style={styles.proceedButtonText}>
            {paymentMethod === 'phonepe' ? 'Pay with PhonePe' : 'Place Order'}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  selectedAddress: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#22C55E',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addAddressText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemSeller: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  deliveryText: {
    fontSize: 10,
    color: '#3B82F6',
    marginLeft: 2,
  },
  deliveryDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  deliveryNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentOption: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  selectedRadio: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E',
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  discountValue: {
    color: '#22C55E',
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
  proceedButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});