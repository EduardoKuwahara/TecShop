import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export type RecentCardProps = {
  image: string;
  title: string;
  desc: string;
  price: string;
  originalPrice?: string;
  isPromoted?: boolean;
  promotionLabel?: string;
};

export default function RecentCard({ 
  image, 
  title, 
  desc, 
  price, 
  originalPrice,
  isPromoted = false,
  promotionLabel 
}: RecentCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
        {isPromoted && originalPrice && (
          <Text style={styles.originalPrice}>{originalPrice}</Text>
        )}
      </View>
      <View style={styles.priceContainer}>
        {isPromoted && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>{promotionLabel || 'PROMO'}</Text>
          </View>
        )}
        <Text style={[styles.price, isPromoted && styles.pricePromoted]}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#18181B',
  },
  desc: {
    color: '#52525B',
    fontSize: 13,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  promoBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  promoText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  price: {
    color: '#FFA800',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  pricePromoted: {
    color: '#DC2626',
  },
});
