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
import { getShelfItems, deleteShelfItem } from '@/lib/api';

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
  const [shelfItems, setShelfItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShelfItems();
  }, []);

  const loadShelfItems = async () => {
    try {
      const response = await getShelfItems();
      if (response.success) {
        setShelfItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error loading shelf items:', error);
      Alert.alert('Error', 'Failed to load shelf items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your shelf?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteShelfItem(id);
              if (response.success) {
                await loadShelfItems();
              } else {
                Alert.alert('Error', 'Failed to delete item');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-item')}
        >
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading shelf items...</Text>
          </View>
        ) : (
        <View style={styles.itemsGrid}>
          {shelfItems.map((item) => (
            <View key={item._id || item.id} style={[
              styles.itemCard,
              (item.lowStock || item.quantity <= item.lowStockThreshold) && styles.lowStockCard
            ]}>
              <Image 
                source={{ 
                  uri: item.primaryImage?.urls?.medium || 
                       'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200' 
                }} 
                style={styles.itemImage} 
              />
              
              {(item.lowStock || item.quantity <= item.lowStockThreshold) && (
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
                <Text style={styles.itemPrice}>₹{item.price}/{item.unit}</Text>
                <Text style={styles.expiryDate}>Expires: {item.expiryDate}</Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.editButton}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item._id || item.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});