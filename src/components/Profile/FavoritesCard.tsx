import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';

export type FavoritesCardProps = {
  savedCount: number;
  onViewFavorites?: () => void;
};

export default function FavoritesCard({ savedCount, onViewFavorites }: FavoritesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Heart color="#FF3B30" size={22} fill="#FF3B30" />
        <Text style={styles.headerText}>Meus Favoritos</Text>
      </View>
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {savedCount === 0 
            ? 'Nenhum anúncio favoritado' 
            : `${savedCount} ${savedCount === 1 ? 'anúncio favoritado' : 'anúncios favoritados'}`
          }
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.button, savedCount === 0 && styles.buttonDisabled]} 
        onPress={onViewFavorites}
        disabled={savedCount === 0}
      >
        <Text style={[styles.buttonText, savedCount === 0 && styles.buttonTextDisabled]}>
          {savedCount === 0 ? 'Nenhum favorito' : 'Ver meus favoritos'}
        </Text>
      </TouchableOpacity>
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
  countRow: {
    marginBottom: 12,
  },
  countText: {
    color: '#52525B',
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  buttonTextDisabled: {
    color: '#A3A3A3',
  },
});
