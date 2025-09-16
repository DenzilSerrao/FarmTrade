import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, X, Check, ChevronDown, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  addShelfItem, 
  updateShelfItem, 
  getCategories, 
  getCropsByCategory, 
  searchCrops, 
  getUnits 
} from '@/lib/api';

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
  const { editMode, itemId, name, description, category, price, quantity, unit, minOrderQuantity, lowStockThreshold, organic, harvestDate, expiryDate, qualityGrade } = useLocalSearchParams();
  
  const isEditMode = editMode === 'true';

  const [formData, setFormData] = useState({
    name: isEditMode ? (name as string) : '',
    description: isEditMode ? (description as string) : '',
    category: isEditMode ? (category as string) : '',
    price: isEditMode ? (price as string) : '',
    quantity: isEditMode ? (quantity as string) : '',
    unit: isEditMode ? (unit as string) : 'kg',
    minOrderQuantity: isEditMode ? (minOrderQuantity as string) : '1',
    lowStockThreshold: isEditMode ? (lowStockThreshold as string) : '',
    organic: isEditMode ? (organic === 'true') : false,
    harvestDate: isEditMode ? (harvestDate as string) : '',
    expiryDate: isEditMode ? (expiryDate as string) : '',
    qualityGrade: isEditMode ? (qualityGrade as string) : 'B',
    customCropName: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Loading states for modals
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [cropSearch, setCropSearch] = useState('');

  useEffect(() => {
    loadInitialData();
    
    // If in edit mode and category is set, load crops for that category
    if (isEditMode && formData.category) {
      loadCropsForCategory(formData.category);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [categoriesData, unitsData] = await Promise.all([
        getCategories(),
        getUnits(),
      ]);

      if (categoriesData.success) {
        // Always include "Other" option at the end
        const categoriesWithOther = [...categoriesData.data, 'Other'];
        setCategories(categoriesWithOther);
      }

      if (unitsData.success) {
        setUnits(unitsData.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load categories and units');
    }
  };

  const loadCropsForCategory = async (category: string) => {
    if (category === 'Other') {
      setCrops([]);
      return;
    }

    setLoadingCrops(true);
    try {
      const response = await getCropsByCategory(category);
      if (response.success) {
        setCrops(response.data);
      }
    } catch (error) {
      console.error('Error loading crops:', error);
      Alert.alert('Error', 'Failed to load crops for this category');
    } finally {
      setLoadingCrops(false);
    }
  };

  const handleSearchCrops = async (query: string) => {
    setCropSearch(query);
    
    if (!query || query.length < 2) {
      // If no search query, load crops for current category
      if (formData.category && formData.category !== 'Other') {
        loadCropsForCategory(formData.category);
      } else {
        setCrops([]);
      }
      return;
    }

    setLoadingCrops(true);
    try {
      const response = await searchCrops(query);
      if (response.success) {
        setCrops(response.data);
      }
    } catch (error) {
      console.error('Error searching crops:', error);
    } finally {
      setLoadingCrops(false);
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
    setCropSearch('');
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

  const loadUnitsData = async () => {
    setLoadingUnits(true);
    try {
      const response = await getUnits();
      if (response.success) {
        setUnits(response.data);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoadingUnits(false);
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

      let response;
      if (isEditMode) {
        response = await updateShelfItem(itemId as string, itemData);
      } else {
        response = await addShelfItem(itemData);
      }

      if (response.success) {
        Alert.alert('Success', isEditMode ? 'Item updated successfully!' : 'Item added to shelf successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.message || `Failed to ${isEditMode ? 'update' : 'add'} item`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} item:`, error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} item to shelf`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-800 text-center">
          {isEditMode ? 'Edit Item' : 'Add New Item'}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View className="mt-6">
          <Text className="text-base font-semibold text-gray-800">Product Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {images.map((uri, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
                {index === 0 && (
                  <View className="absolute bottom-1 left-1 bg-green-500 px-1.5 py-0.5 rounded">
                    <Text className="text-xs text-white font-semibold">Primary</Text>
                  </View>
                )}
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity 
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center"
                onPress={pickImage}
              >
                <Camera size={24} color="#6B7280" />
                <Text className="text-xs text-gray-500 mt-1">Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Category Selection */}
        <View className="mt-6">
          <Text className="text-base font-semibold text-gray-800">Category *</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-lg p-3 mt-2 border border-gray-200"
            onPress={() => {
              setShowCategoryModal(true);
              setLoadingCategories(true);
              // Simulate loading delay for categories
              setTimeout(() => setLoadingCategories(false), 500);
            }}
          >
            <Text className={`text-base ${!formData.category ? 'text-gray-400' : 'text-gray-800'}`}>
              {formData.category || 'Select category'}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Crop Name */}
        <View className="mt-6">
          <Text className="text-base font-semibold text-gray-800">Crop Name *</Text>
          {formData.category && formData.category !== 'Other' ? (
            <TouchableOpacity
              className="flex-row items-center justify-between bg-white rounded-lg p-3 mt-2 border border-gray-200"
              onPress={() => setShowCropModal(true)}
            >
              <Text className={`text-base ${!formData.name ? 'text-gray-400' : 'text-gray-800'}`}>
                {formData.name || 'Select or search crop'}
              </Text>
              <Search size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : (
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="Enter crop name"
              value={formData.name}
              onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
          )}
        </View>

        {/* Description */}
        <View className="mt-6">
          <Text className="text-base font-semibold text-gray-800">Description</Text>
          <TextInput
            className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800 h-20"
            placeholder="Describe your product (quality, farming method, etc.)"
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Price and Quantity Row */}
        <View className="flex-row mt-6 gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Price per {formData.unit} *</Text>
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="0"
              value={formData.price}
              onChangeText={(value) => setFormData(prev => ({ ...prev, price: value }))}
              keyboardType="numeric"
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Quantity *</Text>
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="0"
              value={formData.quantity}
              onChangeText={(value) => setFormData(prev => ({ ...prev, quantity: value }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Unit Selection */}
        <View className="mt-6">
          <Text className="text-base font-semibold text-gray-800">Unit *</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-lg p-3 mt-2 border border-gray-200"
            onPress={() => {
              setShowUnitModal(true);
              if (units.length === 0) {
                loadUnitsData();
              }
            }}
          >
            <Text className="text-base text-gray-800">
              {units.find(u => u.value === formData.unit)?.label || formData.unit}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Additional Details */}
        <View className="flex-row mt-6 gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Min Order Qty</Text>
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="1"
              value={formData.minOrderQuantity}
              onChangeText={(value) => setFormData(prev => ({ ...prev, minOrderQuantity: value }))}
              keyboardType="numeric"
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Low Stock Alert</Text>
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="Auto"
              value={formData.lowStockThreshold}
              onChangeText={(value) => setFormData(prev => ({ ...prev, lowStockThreshold: value }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Quality and Organic */}
        <View className="flex-row mt-6 gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Quality Grade</Text>
            <View className="flex-row gap-2 mt-2">
              {['A', 'B', 'C'].map(grade => (
                <TouchableOpacity
                  key={grade}
                  className={`flex-1 items-center py-3 rounded-lg border ${
                    formData.qualityGrade === grade 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setFormData(prev => ({ ...prev, qualityGrade: grade }))}
                >
                  <Text className={`text-base font-semibold ${
                    formData.qualityGrade === grade ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Organic</Text>
            <TouchableOpacity
              className="flex-row items-center mt-5"
              onPress={() => setFormData(prev => ({ ...prev, organic: !prev.organic }))}
            >
              <View className={`w-12 h-6 rounded-full justify-center ${
                formData.organic ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                <View className={`w-5 h-5 rounded-full bg-white ${
                  formData.organic ? 'ml-6' : 'ml-1'
                }`} />
              </View>
              <Text className="text-sm text-gray-800 ml-3">
                {formData.organic ? 'Organic' : 'Conventional'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dates */}
        <View className="flex-row mt-6 gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Harvest Date</Text>
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="YYYY-MM-DD"
              value={formData.harvestDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, harvestDate: value }))}
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">Expiry Date</Text>
            <TextInput
              className="bg-white rounded-lg p-3 mt-2 border border-gray-200 text-base text-gray-800"
              placeholder="YYYY-MM-DD"
              value={formData.expiryDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, expiryDate: value }))}
            />
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-xl py-4 items-center mt-8 mb-10 ${
            loading ? 'bg-gray-400' : 'bg-green-500'
          }`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Item' : 'Add to Shelf')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-6 pt-16 pb-5 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {loadingCategories ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22C55E" />
              <Text className="text-gray-500 mt-2">Loading categories...</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 px-6">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className="flex-row justify-between items-center py-4 border-b border-gray-100"
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text className="text-base text-gray-800">{category}</Text>
                  {formData.category === category && (
                    <Check size={20} color="#22C55E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Crop Modal */}
      <Modal visible={showCropModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-6 pt-16 pb-5 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Select Crop</Text>
            <TouchableOpacity onPress={() => setShowCropModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 mx-6 my-4 border border-gray-200">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-800"
              placeholder="Search crops..."
              value={cropSearch}
              onChangeText={handleSearchCrops}
            />
          </View>

          <ScrollView className="flex-1 px-6">
            {/* Custom crop option */}
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Or enter custom crop name:</Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-white rounded px-3 py-2 border border-gray-200 text-sm"
                  placeholder="Enter crop name"
                  value={formData.customCropName}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, customCropName: value }))}
                />
                <TouchableOpacity
                  className="bg-green-500 px-4 py-2 rounded justify-center"
                  onPress={handleCustomCrop}
                  disabled={!formData.customCropName.trim()}
                >
                  <Text className="text-white text-sm font-semibold">Use</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loadingCrops ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#22C55E" />
                <Text className="text-gray-500 mt-2">Loading crops...</Text>
              </View>
            ) : (
              <>
                {filteredCrops.length === 0 && cropSearch.length >= 2 && (
                  <View className="py-10 items-center">
                    <Text className="text-gray-500">No crops found for "{cropSearch}"</Text>
                    <Text className="text-gray-400 text-sm mt-1">Try using the custom crop option above</Text>
                  </View>
                )}
                
                {filteredCrops.map((crop, index) => (
                  <TouchableOpacity
                    key={`${crop.name}-${index}`}
                    className="flex-row justify-between items-center py-4 border-b border-gray-100"
                    onPress={() => handleCropSelect(crop)}
                  >
                    <View>
                      <Text className="text-base text-gray-800">{crop.name}</Text>
                      <Text className="text-xs text-gray-500 mt-0.5">{crop.category}</Text>
                    </View>
                    {formData.name === crop.name && (
                      <Check size={20} color="#22C55E" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Unit Modal */}
      <Modal visible={showUnitModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center px-6 pt-16 pb-5 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Select Unit</Text>
            <TouchableOpacity onPress={() => setShowUnitModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {loadingUnits ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22C55E" />
              <Text className="text-gray-500 mt-2">Loading units...</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 px-6">
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  className="flex-row justify-between items-center py-4 border-b border-gray-100"
                  onPress={() => {
                    setFormData(prev => ({ ...prev, unit: unit.value }));
                    setShowUnitModal(false);
                  }}
                >
                  <Text className="text-base text-gray-800">{unit.label}</Text>
                  {formData.unit === unit.value && (
                    <Check size={20} color="#22C55E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}