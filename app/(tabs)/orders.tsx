import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Clock, CircleCheck as CheckCircle, Truck, Package, X, ChevronDown } from 'lucide-react-native';

interface Order {
  id: number;
  crop: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'accepted' | 'shipped' | 'delivered';
  seller: string;
  price: number;
  orderDate: string;
  estimatedDelivery?: string;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      crop: 'Organic Tomatoes',
      quantity: 20,
      unit: 'crates',
      status: 'shipped',
      seller: 'Green Valley Farm',
      price: 900,
      orderDate: '2025-01-08',
      estimatedDelivery: '2025-01-12'
    },
    {
      id: 2,
      crop: 'Fresh Lettuce',
      quantity: 15,
      unit: 'boxes',
      status: 'accepted',
      seller: 'Sunrise Organics',
      price: 420,
      orderDate: '2025-01-09'
    },
    {
      id: 3,
      crop: 'Bell Peppers',
      quantity: 8,
      unit: 'crates',
      status: 'pending',
      seller: 'Mountain View Farm',
      price: 440,
      orderDate: '2025-01-10'
    }
  ]);

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    crop: '',
    quantity: '',
    preferences: {
      closest: false,
      cheapest: false,
      singleVendor: false,
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      case 'accepted':
        return <CheckCircle size={16} color="#3B82F6" />;
      case 'shipped':
        return <Truck size={16} color="#8B5A2B" />;
      case 'delivered':
        return <Package size={16} color="#22C55E" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'accepted':
        return '#3B82F6';
      case 'shipped':
        return '#8B5A2B';
      case 'delivered':
        return '#22C55E';
      default:
        return '#6B7280';
    }
  };

  const handleCreateOrder = () => {
    if (!newOrder.crop || !newOrder.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Create new order
    const order: Order = {
      id: Date.now(),
      crop: newOrder.crop,
      quantity: parseInt(newOrder.quantity),
      unit: 'units',
      status: 'pending',
      seller: 'Finding best match...',
      price: 0,
      orderDate: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [order, ...prev]);
    setNewOrder({ crop: '', quantity: '', preferences: { closest: false, cheapest: false, singleVendor: false } });
    setShowNewOrderModal(false);
    
    Alert.alert('Success', 'Order placed successfully! We\'re finding the best matches for you.');
  };

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Track your purchases</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowNewOrderModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statusCounts.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statusCounts.accepted}</Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statusCounts.shipped}</Text>
          <Text style={styles.statLabel}>Shipped</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{statusCounts.delivered}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderCrop}>{order.crop}</Text>
                <Text style={styles.orderQuantity}>
                  {order.quantity} {order.unit}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                {getStatusIcon(order.status)}
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <Text style={styles.sellerName}>{order.seller}</Text>
              <Text style={styles.orderDate}>Ordered: {order.orderDate}</Text>
              {order.estimatedDelivery && (
                <Text style={styles.deliveryDate}>
                  Estimated delivery: {order.estimatedDelivery}
                </Text>
              )}
              {order.price > 0 && (
                <Text style={styles.orderPrice}>${order.price}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New Order Modal */}
      <Modal
        visible={showNewOrderModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Order</Text>
            <TouchableOpacity onPress={() => setShowNewOrderModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Crop Type *</Text>
              <TouchableOpacity style={styles.dropdown}>
                <TextInput
                  style={styles.dropdownText}
                  placeholder="Select crop type"
                  value={newOrder.crop}
                  onChangeText={(value) => setNewOrder(prev => ({ ...prev, crop: value }))}
                />
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quantity *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter quantity"
                value={newOrder.quantity}
                onChangeText={(value) => setNewOrder(prev => ({ ...prev, quantity: value }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preferences</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setNewOrder(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, closest: !prev.preferences.closest }
                  }))}
                >
                  <View style={[styles.checkboxBox, newOrder.preferences.closest && styles.checkboxChecked]}>
                    {newOrder.preferences.closest && <CheckCircle size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Closest to me</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setNewOrder(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, cheapest: !prev.preferences.cheapest }
                  }))}
                >
                  <View style={[styles.checkboxBox, newOrder.preferences.cheapest && styles.checkboxChecked]}>
                    {newOrder.preferences.cheapest && <CheckCircle size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Cheapest price</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setNewOrder(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, singleVendor: !prev.preferences.singleVendor }
                  }))}
                >
                  <View style={[styles.checkboxBox, newOrder.preferences.singleVendor && styles.checkboxChecked]}>
                    {newOrder.preferences.singleVendor && <CheckCircle size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Entire stock from one vendor</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateOrder}>
              <Text style={styles.createButtonText}>Create Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderCrop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  deliveryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1F2937',
  },
  checkboxContainer: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});