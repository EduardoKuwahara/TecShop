import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';

export type FavoritesCardProps = {
  savedCount: number;
};

export default function FavoritesCard({ savedCount }: FavoritesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Heart color="#FFA800" size={22} />
        <Text style={styles.headerText}>Favoritos</Text>
      </View>
      <Text style={styles.countText}>Itens salvos: <Text style={styles.bold}>{savedCount}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
    color: '#18181B',
  },
  countText: {
    color: '#18181B',
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
});
