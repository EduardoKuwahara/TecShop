import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export type RecommendationCardProps = {
  image: string;
  title: string;
  desc: string;
  price: string;
  favorite?: boolean;
  onFavoritePress?: () => void;
};

export default function RecommendationCard({ image, title, desc, price, favorite, onFavoritePress }: RecommendationCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{price}</Text>
          <TouchableOpacity onPress={onFavoritePress}>
            <Text style={styles.heart}>{favorite ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: 170,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#18181B',
  },
  desc: {
    color: '#52525B',
    fontSize: 13,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    color: '#FFA800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  heart: {
    color: '#A3A3A3',
    fontSize: 18,
  },
});
