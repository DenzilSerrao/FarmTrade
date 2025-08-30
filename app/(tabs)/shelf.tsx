import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Plus, TriangleAlert as AlertTriangle, Package, Calendar, CreditCard as Edit3, Trash2 } from 'lucide-react-native';

interface ShelfItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate: string;
  lowStock: boolean;
  image: string;
}

export default function ShelfScreen() {
  const [shelfItems, setShelfItems] = useState<ShelfItem[]>([
    {
      id: 1,
      name: 'Organic Tomatoes',
      quantity: 45,
      unit: 'crates',
      price: 45,
      expiryDate: '2025-01-15',
      lowStock: false,
      image: 'https://images.pexels.com/photos/568383/pexels-photo-568383.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 2,
      name: 'Fresh Lettuce',
      quantity: 8,
      unit: 'boxes',
      price: 28,
      expiryDate: '2025-01-12',
      lowStock: true,
      image: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 3,
      name: 'Sweet Corn',
      quantity: 120,
      unit: 'bags',
      price: 35,
      expiryDate: '2025-01-20',
      lowStock: false,
      image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 4,
      name: 'Bell Peppers',
      quantity: 3,
      unit: 'crates',
      price: 55,
      expiryDate: '2025-01-14',
      lowStock: true,
      image: 'https://images.pexels.com/photos/1292556/pexels-photo-1292556.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
  ]);

  const handleDeleteItem = (id: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your shelf?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setShelfItems(prev => prev.filter(item => item.id !== id));
          }
        }
      ]
    );
  };

  const lowStockCount = shelfItems.filter(item => item.lowStock).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Shelf</Text>
          <Text style={styles.subtitle}>Manage your inventory</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <View style={styles.alertContainer}>
          <AlertTriangle size={20} color="#F59E0B" />
          <Text style={styles.alertText}>
            {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Package size={20} color="#22C55E" />
          <Text style={styles.statNumber}>{shelfItems.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.statNumber}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      {/* Shelf Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsGrid}>
          {shelfItems.map((item) => (
            <View key={item.id} style={[
              styles.itemCard,
              item.lowStock && styles.lowStockCard
            ]}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              
              {item.lowStock && (
                <View style={styles.lowStockBadge}>
                  <AlertTriangle size={14} color="#F59E0B" />
                  <Text style={styles.lowStockText}>Low Stock</Text>
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={styles.itemPrice}>${item.price}/{item.unit.slice(0, -1)}</Text>
                <Text style={styles.expiryDate}>Expires: {item.expiryDate}</Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.editButton}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  itemsGrid: {
    paddingTop: 24,
    gap: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowStockCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowStockText: {
    fontSize: 10,
    color: '#92400E',
    marginLeft: 2,
    fontWeight: '500',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 4,
  },
  expiryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
});