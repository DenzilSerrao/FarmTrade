import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MessageCircle, CircleHelp as HelpCircle, Users, Phone, Mail, Globe, Star } from 'lucide-react-native';

export default function CommunityScreen() {
  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      lastMessage: 'Is the organic lettuce still available?',
      time: '2 min ago',
      unread: true,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 2,
      name: 'Mike Chen',
      lastMessage: 'Thank you for the quick delivery!',
      time: '1 hour ago',
      unread: false,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 3,
      name: 'Green Valley Co-op',
      lastMessage: 'Your order has been confirmed',
      time: '3 hours ago',
      unread: false,
      avatar: 'https://images.pexels.com/photos/1108092/pexels-photo-1108092.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
  ];

  const supportOptions = [
    {
      title: 'FAQ',
      description: 'Common questions and answers',
      icon: <HelpCircle size={24} color="#22C55E" />,
    },
    {
      title: 'Call Support',
      description: '24/7 phone assistance',
      icon: <Phone size={24} color="#3B82F6" />,
    },
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: <Mail size={24} color="#F59E0B" />,
    },
    {
      title: 'Community Forum',
      description: 'Connect with other farmers',
      icon: <Users size={24} color="#8B5A2B" />,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Chat & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageCircle size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Recent Messages</Text>
          </View>

          {conversations.map((conversation) => (
            <TouchableOpacity key={conversation.id} style={styles.conversationCard}>
              <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
              
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{conversation.name}</Text>
                  <Text style={styles.conversationTime}>{conversation.time}</Text>
                </View>
                <Text style={[
                  styles.lastMessage,
                  conversation.unread && styles.unreadMessage
                ]}>
                  {conversation.lastMessage}
                </Text>
              </View>

              {conversation.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Conversations</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Help & Support</Text>
          </View>

          <View style={styles.supportGrid}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.supportCard}>
                <View style={styles.supportIcon}>
                  {option.icon}
                </View>
                <Text style={styles.supportTitle}>{option.title}</Text>
                <Text style={styles.supportDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Community Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#8B5A2B" />
            <Text style={styles.sectionTitle}>Community Stats</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>Active Farmers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>856</Text>
              <Text style={styles.statLabel}>Monthly Trades</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#F59E0B" />
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Phone size={18} color="#22C55E" />
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={18} color="#22C55E" />
              <Text style={styles.contactText}>support@farmtrade.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Globe size={18} color="#22C55E" />
              <Text style={styles.contactText}>www.farmtrade.com</Text>
            </View>
          </View>
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
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  unreadMessage: {
    fontWeight: '500',
    color: '#1F2937',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginLeft: 8,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  supportIcon: {
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
});