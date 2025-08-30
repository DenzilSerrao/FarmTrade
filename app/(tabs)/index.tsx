import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Bell, Search, TrendingUp, MapPin, Filter, Newspaper, ChartBar as BarChart3, Map } from 'lucide-react-native';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const newsItems = [
    {
      id: 1,
      title: 'Wheat Prices Rising Due to Weather Conditions',
      summary: 'Market analysts predict 15% increase in wheat prices this quarter.',
      time: '2 hours ago',
    },
    {
      id: 2,
      title: 'New Government Subsidies for Organic Farming',
      summary: 'Eligible farmers can now apply for up to $5,000 in organic certification support.',
      time: '5 hours ago',
    },
    {
      id: 3,
      title: 'Corn Harvest Season Outlook',
      summary: 'Early predictions show promising yields across the midwest region.',
      time: '1 day ago',
    },
  ];

  const marketData = [
    { crop: 'Wheat', price: '$245/ton', change: '+12%', trend: 'up' },
    { crop: 'Corn', price: '$198/ton', change: '+8%', trend: 'up' },
    { crop: 'Rice', price: '$312/ton', change: '-3%', trend: 'down' },
    { crop: 'Soybeans', price: '$425/ton', change: '+15%', trend: 'up' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.userName}>John Farmer</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color="#1F2937" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops, farmers, or locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#22C55E" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Map size={24} color="#22C55E" />
              <Text style={styles.actionText}>Find Nearby</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <BarChart3 size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Price Trends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Best Deals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Analytics</Text>
          <View style={styles.marketGrid}>
            {marketData.map((item, index) => (
              <View key={index} style={styles.marketCard}>
                <Text style={styles.cropName}>{item.crop}</Text>
                <Text style={styles.cropPrice}>{item.price}</Text>
                <Text style={[
                  styles.cropChange,
                  item.trend === 'up' ? styles.priceUp : styles.priceDown
                ]}>
                  {item.change}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Marketplace */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Marketplace</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cropCard}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/568381/pexels-photo-568381.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                style={styles.cropImage}
              />
              <Text style={styles.cropCardTitle}>Fresh Tomatoes</Text>
              <Text style={styles.cropCardPrice}>$45/crate</Text>
              <Text style={styles.cropCardLocation}>
                <MapPin size={12} color="#6B7280" /> 2.5 km away
              </Text>
            </View>
            <View style={styles.cropCard}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                style={styles.cropImage}
              />
              <Text style={styles.cropCardTitle}>Organic Lettuce</Text>
              <Text style={styles.cropCardPrice}>$28/box</Text>
              <Text style={styles.cropCardLocation}>
                <MapPin size={12} color="#6B7280" /> 5.1 km away
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Latest News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            <Newspaper size={20} color="#6B7280" />
          </View>
          {newsItems.map((news) => (
            <TouchableOpacity key={news.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{news.title}</Text>
              <Text style={styles.newsSummary}>{news.summary}</Text>
              <Text style={styles.newsTime}>{news.time}</Text>
            </TouchableOpacity>
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
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    padding: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  marketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cropName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cropPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  cropChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  priceUp: {
    color: '#22C55E',
  },
  priceDown: {
    color: '#EF4444',
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    width: 160,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cropImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  cropCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cropCardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
    marginTop: 4,
  },
  cropCardLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  newsTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
});