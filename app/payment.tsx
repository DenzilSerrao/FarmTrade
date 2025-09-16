import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CreditCard, Shield, Clock } from 'lucide-react-native';
import { PaymentDetails } from '@/types/payment';
import { createPaymentOrder, verifyPayment } from '@/lib/api';
import CartService from '@/lib/cart';

export default function PaymentScreen() {
  const { paymentDetails } = useLocalSearchParams();
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (paymentDetails && typeof paymentDetails === 'string') {
      try {
        const parsed = JSON.parse(paymentDetails);
        setDetails(parsed);
      } catch (error) {
        console.error('Error parsing payment details:', error);
        Alert.alert('Error', 'Invalid payment details');
        router.back();
      }
    }
  }, [paymentDetails]);

  const handlePhonePePayment = async () => {
    if (!details) return;

    setProcessing(true);
    try {
      // Create payment order
      const paymentOrder = await createPaymentOrder({
        amount: details.finalAmount,
        cartItems: details.cartItems,
        deliveryAddress: details.deliveryAddress,
        paymentMethod: 'phonepe',
      });

      if (paymentOrder.success) {
        // Open PhonePe payment URL
        const paymentUrl = paymentOrder.data.paymentUrl;
        const canOpen = await Linking.canOpenURL(paymentUrl);
        
        if (canOpen) {
          await Linking.openURL(paymentUrl);
          
          // Start polling for payment status
          pollPaymentStatus(paymentOrder.data.transactionId);
        } else {
          Alert.alert('Error', 'Cannot open PhonePe payment');
        }
      } else {
        Alert.alert('Error', paymentOrder.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCODOrder = async () => {
    if (!details) return;

    setProcessing(true);
    try {
      const orderResponse = await createPaymentOrder({
        amount: details.finalAmount,
        cartItems: details.cartItems,
        deliveryAddress: details.deliveryAddress,
        paymentMethod: 'cod',
      });

      if (orderResponse.success) {
        // Clear cart
        await CartService.clearCart();
        
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully. You will receive a confirmation email shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/orders'),
            },
          ]
        );
      } else {
        Alert.alert('Error', orderResponse.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('COD order error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const statusResponse = await verifyPayment({ transactionId });
        
        if (statusResponse.success) {
          if (statusResponse.data.status === 'success') {
            // Payment successful
            await CartService.clearCart();
            
            Alert.alert(
              'Payment Successful!',
              'Your order has been placed successfully. You will receive a confirmation email shortly.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(tabs)/orders'),
                },
              ]
            );
            return;
          } else if (statusResponse.data.status === 'failed') {
            Alert.alert('Payment Failed', 'Your payment was not successful. Please try again.');
            return;
          }
        }

        // Continue polling if payment is still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check again after 10 seconds
        } else {
          Alert.alert(
            'Payment Status Unknown',
            'We are unable to confirm your payment status. Please check your orders or contact support.',
            [
              {
                text: 'Check Orders',
                onPress: () => router.replace('/(tabs)/orders'),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        }
      }
    };

    // Start checking after a short delay
    setTimeout(checkStatus, 5000);
  };

  if (!details) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>Complete your order</Text>
      </View>

      <View style={styles.content}>
        {/* Payment Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>₹{details.finalAmount}</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {details.paymentMethod === 'phonepe' ? (
            <View style={styles.paymentMethodCard}>
              <CreditCard size={24} color="#5F2EEA" />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>PhonePe</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Secure payment with PhonePe
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.paymentMethodCard}>
              <CreditCard size={24} color="#F59E0B" />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>Cash on Delivery</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Pay when you receive your order
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Security Info */}
        <View style={styles.securityContainer}>
          <Shield size={20} color="#22C55E" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryAddress}>
              {details.deliveryAddress.name}
            </Text>
            <Text style={styles.deliveryAddressText}>
              {details.deliveryAddress.addressLine1}, {details.deliveryAddress.city}
            </Text>
            <View style={styles.deliveryTimeContainer}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.deliveryTime}>
                Expected delivery: {details.estimatedDelivery}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({details.cartItems.length})</Text>
              <Text style={styles.summaryValue}>₹{details.totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={styles.summaryValue}>₹{details.deliveryCharges}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & Fees</Text>
              <Text style={styles.summaryValue}>₹{details.taxes}</Text>
            </View>
            {details.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -₹{details.discount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.disabledButton]}
          onPress={details.paymentMethod === 'phonepe' ? handlePhonePePayment : handleCODOrder}
          disabled={processing}
        >
          <Text style={styles.payButtonText}>
            {processing
              ? 'Processing...'
              : details.paymentMethod === 'phonepe'
              ? `Pay ₹${details.finalAmount} with PhonePe`
              : `Place Order - ₹${details.finalAmount}`
            }
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
  amountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22C55E',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  paymentMethodInfo: {
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
  },
  deliveryCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  deliveryAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  deliveryAddressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
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
  discountValue: {
    color: '#22C55E',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});