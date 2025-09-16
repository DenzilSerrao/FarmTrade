import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, MapPin, Edit3, Trash2, Check, X } from 'lucide-react-native';
import { getSavedAddresses, createAddress, updateAddress, deleteAddress } from '@/lib/api';
import { SavedAddress } from '@/types/payment';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  
  const [formData, setFormData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await getSavedAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'Home',
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (address: SavedAddress) => {
    setFormData({
      label: address.label,
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await createAddress(formData);
      }
      
      await loadAddresses();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(addressId);
              await loadAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await updateAddress(addressId, { isDefault: true });
      await loadAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add your first delivery address</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.labelContainer}>
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(address)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.addressName}>{address.name}</Text>
              <Text style={styles.addressText}>
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ''}
              </Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} - {address.pincode}
              </Text>
              {address.landmark && (
                <Text style={styles.landmark}>Near {address.landmark}</Text>
              )}
              <Text style={styles.phone}>📞 {address.phone}</Text>

              {!address.isDefault && (
                <TouchableOpacity
                  style={styles.setDefaultButton}
                  onPress={() => handleSetDefault(address.id)}
                >
                  <Text style={styles.setDefaultText}>Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Address Label */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address Label</Text>
              <View style={styles.labelOptions}>
                {['Home', 'Work', 'Other'].map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.labelOption,
                      formData.label === label && styles.selectedLabel,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, label }))}
                  >
                    <Text
                      style={[
                        styles.labelOptionText,
                        formData.label === label && styles.selectedLabelText,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter full name"
                value={formData.name}
                onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Line 1 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address Line 1 *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="House/Flat/Office No, Building Name"
                value={formData.addressLine1}
                onChangeText={(value) => setFormData(prev => ({ ...prev, addressLine1: value }))}
                multiline
              />
            </View>

            {/* Address Line 2 */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address Line 2</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Area, Street, Sector, Village"
                value={formData.addressLine2}
                onChangeText={(value) => setFormData(prev => ({ ...prev, addressLine2: value }))}
                multiline
              />
            </View>

            {/* City and State */}
            <View style={styles.rowGroup}>
              <View style={styles.halfWidth}>
                <Text style={styles.formLabel}>City *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, city: value }))}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.formLabel}>State *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, state: value }))}
                />
              </View>
            </View>

            {/* Pincode */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pincode *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter pincode"
                value={formData.pincode}
                onChangeText={(value) => setFormData(prev => ({ ...prev, pincode: value }))}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {/* Landmark */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nearby landmark"
                value={formData.landmark}
                onChangeText={(value) => setFormData(prev => ({ ...prev, landmark: value }))}
              />
            </View>

            {/* Set as Default */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
            >
              <View style={[styles.checkbox, formData.isDefault && styles.checkedBox]}>
                {formData.isDefault && <Check size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    textTransform: 'uppercase',
  },
  defaultBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  landmark: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 6,
  },
  setDefaultText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
  labelOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  labelOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  selectedLabel: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  labelOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedLabelText: {
    color: '#22C55E',
    fontWeight: '600',
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});