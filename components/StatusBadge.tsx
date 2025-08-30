import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'pending' | 'accepted' | 'shipped' | 'delivered';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#F59E0B',
          textColor: '#92400E',
        };
      case 'accepted':
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#3B82F6',
          textColor: '#1E40AF',
        };
      case 'shipped':
        return {
          backgroundColor: '#F3E8FF',
          borderColor: '#8B5A2B',
          textColor: '#5B2C05',
        };
      case 'delivered':
        return {
          backgroundColor: '#D1FAE5',
          borderColor: '#22C55E',
          textColor: '#065F46',
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          borderColor: '#D1D5DB',
          textColor: '#374151',
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: statusStyle.backgroundColor,
        borderColor: statusStyle.borderColor,
      }
    ]}>
      <Text style={[styles.badgeText, { color: statusStyle.textColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});