import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Clock, Heart, Star } from 'lucide-react-native';
import { RatingStars } from '../RatingStars';

export type AdCardProps = {
  imageUrl: string;
  title: string;
  price: string;
  description: string;
  time: string; 
  author: string;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  averageRating?: number;
  ratingCount?: number;
};

export default function AdCard({ 
  imageUrl, 
  title, 
  price, 
  description, 
  time, 
  author, 
  onPress, 
  isFavorite = false, 
  onToggleFavorite,
  averageRating = 0,
  ratingCount = 0
}: AdCardProps) {

  const formattedTime = new Date(time).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardPressable}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          <View style={styles.priceTag}><Text style={styles.priceText}>{price}</Text></View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{description}</Text>
        
        {/* Seção de Avaliações */}
        {ratingCount > 0 && (
          <View style={styles.ratingRow}>
            <RatingStars rating={Math.round(averageRating)} readonly size={14} />
            <Text style={styles.ratingText}>
              {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'})
            </Text>
          </View>
        )}
        
        <Text style={styles.authorText}>Por {author}</Text>
          <View style={styles.cardRow}>
            <View style={styles.timeRow}>
              <Clock size={16} color="#22C55E" />
              <Text style={styles.timeText}>Até {formattedTime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Botão de Favoritar */}
      {onToggleFavorite && (
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
        >
          <Heart 
            size={20} 
            color={isFavorite ? "#FF3B30" : "#A3A3A3"} 
            fill={isFavorite ? "#FF3B30" : "transparent"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181B',
    flex: 1,
    marginRight: 8,
  },
  priceTag: {
    backgroundColor: '#FFA800',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardDesc: {
    color: '#52525B',
    fontSize: 14,
    marginBottom: 6,
    minHeight: 38,
  },
  authorText: {
    color: '#A3A3A3',
    fontSize: 13,
    marginBottom: 8, 
    fontStyle: 'italic',
    borderTopWidth: 1, 
    borderColor: '#F3F4F6',
    paddingTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#22C55E',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  cardPressable: {
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});