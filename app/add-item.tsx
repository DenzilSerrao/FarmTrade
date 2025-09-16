import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, X, Check, ChevronDown, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { addShelfItem } from '@/lib/api';

interface Category {
  name: string;
}

interface Crop {
  name: string;
  category: string;
}

interface Unit {
  value: string;
  label: string;
}

export default function AddItemScreen() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    minOrderQuantity: '1',
    lowStockThreshold: '',
    organic: false,
    harvestDate: '',
    expiryDate: '',
    qualityGrade: 'B',
    customCropName: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [cropSearch, setCropSearch] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/categories`),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/units`),
      ]);

      const categoriesData = await categoriesRes.json();
      const unitsData = await unitsRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }

      if (unitsData.success) {
        setUnits(unitsData.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadCropsForCategory = async (category: string) => {
    if (category === 'Other') {
      setCrops([]);
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/categories/${encodeURIComponent(category)}/crops`);
      const data = await response.json();

      if (data.success) {
        setCrops(data.data);
      }
    } catch (error) {
      console.error('Error loading crops:', error);
    }
  };

  const searchCrops = async (query: string) => {
    if (!query || query.length < 2) {
      setCrops([]);
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/crops/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setCrops(data.data);
      }
    } catch (error) {
      console.error('Error searching crops:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category, name: '' }));
    setShowCategoryModal(false);
    loadCropsForCategory(category);
  };

  const handleCropSelect = (crop: Crop) => {
    setFormData(prev => ({ 
      ...prev, 
      name: crop.name,
      category: crop.category 
    }));
    setShowCropModal(false);
    setCropSearch('');
  };

  const handleCustomCrop = () => {
    if (formData.customCropName.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        name: prev.customCropName.trim() 
      }));
      setShowCropModal(false);
      setCropSearch('');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Price must be greater than 0');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const itemData = {
        name: formData.name,
        description: formData.description || `Fresh ${formData.name.toLowerCase()} from farm`,
        category: formData.category.toLowerCase().replace(/\s+/g, '_'),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        minOrderQuantity: parseInt(formData.minOrderQuantity) || 1,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || Math.floor(parseInt(formData.quantity) * 0.1),
        organic: formData.organic,
        harvestDate: formData.harvestDate || new Date().toISOString(),
        expiryDate: formData.expiryDate,
        qualityGrade: formData.qualityGrade,
        tags: [formData.category, formData.organic ? 'organic' : 'conventional', 'fresh'],
        images: images.map((uri, index) => ({
          uri,
          isPrimary: index === 0,
        })),
      };

      const response = await addShelfItem(itemData);

      if (response.success) {
        Alert.alert('Success', 'Item added to shelf successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item to shelf');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Item</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>Primary</Text>
                  </View>
                )}
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Camera size={24} color="#6B7280" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.dropdownText, !formData.category && styles.placeholder]}>
              {formData.category || 'Select category'}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Crop Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Name *</Text>
          {formData.category && formData.category !== 'Other' ? (
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCropModal(true)}
            >
              <Text style={[styles.dropdownText, !formData.name && styles.placeholder]}>
                {formData.name || 'Select or search crop'}
              </Text>
              <Search size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter crop name"
              value={formData.name}
              onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your product (quality, farming method, etc.)"
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price and Quantity Row */}
        <View style={styles.rowSection}>
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Price per {formData.unit} *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.price}
              onChangeText={(value) => setFormData(prev => ({ ...prev, price: value }))}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.quantity}
              onChangeText={(value) => setFormData(prev => ({ ...prev, quantity: value }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Unit Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unit *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowUnitModal(true)}
          >
            <Text style={styles.dropdownText}>
              {units.find(u => u.value === formData.unit)?.label || formData.unit}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Additional Details */}
        <View style={styles.rowSection}>
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Min Order Qty</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={formData.minOrderQuantity}
              onChangeText={(value) => setFormData(prev => ({ ...prev, minOrderQuantity: value }))}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Low Stock Alert</Text>
            <TextInput
              style={styles.input}
              placeholder="Auto"
              value={formData.lowStockThreshold}
              onChangeText={(value) => setFormData(prev => ({ ...prev, lowStockThreshold: value }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Quality and Organic */}
        <View style={styles.rowSection}>
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Quality Grade</Text>
            <View style={styles.gradeContainer}>
              {['A', 'B', 'C'].map(grade => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeButton,
                    formData.qualityGrade === grade && styles.selectedGrade,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, qualityGrade: grade }))}
                >
                  <Text style={[
                    styles.gradeText,
                    formData.qualityGrade === grade && styles.selectedGradeText,
                  ]}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Organic</Text>
            <TouchableOpacity
              style={styles.organicToggle}
              onPress={() => setFormData(prev => ({ ...prev, organic: !prev.organic }))}
            >
              <View style={[styles.toggleTrack, formData.organic && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, formData.organic && styles.toggleThumbActive]} />
              </View>
              <Text style={styles.organicText}>
                {formData.organic ? 'Organic' : 'Conventional'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.rowSection}>
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Harvest Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.harvestDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, harvestDate: value }))}
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.expiryDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, expiryDate: value }))}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding Item...' : 'Add to Shelf'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.modalOption}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={styles.modalOptionText}>{category}</Text>
                {formData.category === category && (
                  <Check size={20} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Crop Modal */}
      <Modal visible={showCropModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Crop</Text>
            <TouchableOpacity onPress={() => setShowCropModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crops..."
              value={cropSearch}
              onChangeText={(value) => {
                setCropSearch(value);
                searchCrops(value);
              }}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Custom crop option */}
            <View style={styles.customCropSection}>
              <Text style={styles.customCropLabel}>Or enter custom crop name:</Text>
              <View style={styles.customCropContainer}>
                <TextInput
                  style={styles.customCropInput}
                  placeholder="Enter crop name"
                  value={formData.customCropName}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, customCropName: value }))}
                />
                <TouchableOpacity
                  style={styles.customCropButton}
                  onPress={handleCustomCrop}
                  disabled={!formData.customCropName.trim()}
                >
                  <Text style={styles.customCropButtonText}>Use</Text>
                </TouchableOpacity>
              </View>
            </View>

            {filteredCrops.map((crop, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => handleCropSelect(crop)}
              >
                <View>
                  <Text style={styles.modalOptionText}>{crop.name}</Text>
                  <Text style={styles.modalOptionSubtext}>{crop.category}</Text>
                </View>
                {formData.name === crop.name && (
                  <Check size={20} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Unit Modal */}
      <Modal visible={showUnitModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Unit</Text>
            <TouchableOpacity onPress={() => setShowUnitModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={styles.modalOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, unit: unit.value }));
                  setShowUnitModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{unit.label}</Text>
                {formData.unit === unit.value && (
                  <Check size={20} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
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
  title: {
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
    marginTop: 24,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  halfWidth: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  gradeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedGrade: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedGradeText: {
    color: '#22C55E',
  },
  organicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#22C55E',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  organicText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalOptionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  customCropSection: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    margin: 24,
    marginBottom: 0,
  },
  customCropLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  customCropContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  customCropInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
  },
  customCropButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  customCropButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});