import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Heart } from 'lucide-react-native';
import { useFavorites } from '../contexts/FavoritesContext';

const IP_DA_SUA_MAQUINA = '10.226.241.139';

type Ad = {
  _id: string;
  title: string;
  price: string;
  description: string;
  location: string;
  availableUntil: string;
  category: string;
  authorDetails: {
    nome: string;
    curso: string;
  };
  isFavorite?: boolean;
};

const FavoritesScreen = () => {
  const navigation = useNavigation<any>();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [favoriteAds, setFavoriteAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryImages: Record<string, string> = {
    'Comida': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    'Serviço': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    'Livros/Materiais': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
  };

  function getImageUrl(category: string) {
    return categoryImages[category] || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80';
  }

  const fetchFavoriteAds = async () => {
    if (favorites.size === 0) {
      setFavoriteAds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/ads`);
      const data = await response.json();
      
      if (response.ok) {
        // Filtrar apenas os anúncios favoritos
        const filteredFavorites = data.filter((ad: Ad) => favorites.has(ad._id));
        const adsWithFavorites = filteredFavorites.map((ad: Ad) => ({
          ...ad,
          isFavorite: true
        }));
        
        setFavoriteAds(adsWithFavorites);
      } else {
        console.error('Erro ao carregar anúncios');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteAds();
  }, [favorites]);

  const renderFavoriteAd = ({ item }: { item: Ad }) => (
    <View style={styles.adCard}>
      <TouchableOpacity 
        style={styles.cardPressable}
        onPress={() => navigation.navigate('AdDetail', { ad: item })}
      >
        <Image 
          source={{ uri: getImageUrl(item.category) }} 
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.authorText}>Por {item.authorDetails?.nome}</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeIndicator} />
            <Text style={styles.timeText}>
              Até {new Date(item.availableUntil).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item._id)}
      >
        <Heart 
          size={20} 
          color="#FF3B30" 
          fill="#FF3B30"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#18181B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Favoritos</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
      ) : favoriteAds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptySubtitle}>
            Favorite anúncios para vê-los aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteAds}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={renderFavoriteAd}
          style={styles.adsList}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 8 }}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {favoriteAds.length} {favoriteAds.length === 1 ? 'anúncio favoritado' : 'anúncios favoritados'}
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18181B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181B',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  adsList: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardPressable: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181B',
    marginBottom: 4,
  },
  priceTag: {
    backgroundColor: '#FFA800',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardDescription: {
    color: '#52525B',
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  authorText: {
    color: '#A3A3A3',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  timeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '500',
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#A3A3A3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18181B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A3A3A3',
    textAlign: 'center',
  },
});

export default FavoritesScreen;