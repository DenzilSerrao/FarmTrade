import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Search, MessageCircle, Send } from 'lucide-react-native';
import { getConversations } from '@/lib/api';
import { Conversation } from '@/types/payment';

export default function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantDetails.some(participant =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const openChat = (conversationId: string, participantName: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: conversationId, name: participantName },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Chat with farmers and buyers</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start trading to connect with farmers and buyers
            </Text>
          </View>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participantDetails.find(
              p => p.id !== 'current_user_id' // Replace with actual current user ID
            ) || conversation.participantDetails[0];

            return (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationItem}
                onPress={() => openChat(conversation.id, otherParticipant.name)}
              >
                <Image
                  source={{
                    uri: otherParticipant.avatar || 
                         'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
                  }}
                  style={styles.avatar}
                />

                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.participantName}>
                      {otherParticipant.name}
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatTime(conversation.lastMessage.timestamp)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.lastMessage,
                      conversation.unreadCount > 0 && styles.unreadMessage,
                    ]}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage.messageType === 'order_update'
                      ? '📦 Order update'
                      : conversation.lastMessage.message
                    }
                  </Text>

                  {conversation.lastMessage.messageType === 'order_update' && (
                    <Text style={styles.orderReference}>
                      Order #{conversation.lastMessage.orderReference}
                    </Text>
                  )}
                </View>

                {conversation.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
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
    textAlign: 'center',
    marginTop: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
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
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#1F2937',
  },
  orderReference: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});