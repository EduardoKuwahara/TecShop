
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';
import AdCard from '../components/Home/AdCard';
import { useFavorites } from '../contexts/FavoritesContext';

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
  averageRating?: number;
  ratingCount?: number;
};

const IP_DA_SUA_MAQUINA = '10.226.241.139';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const fetchAds = async (query = '') => {
    setLoading(true);
    try {
      const url = `http://${IP_DA_SUA_MAQUINA}:3001/ads${query ? `?search=${query}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        // Marcar anúncios favoritos
        const adsWithFavorites = data.map((ad: Ad) => ({
          ...ad,
          isFavorite: isFavorite(ad._id)
        }));
        setAds(adsWithFavorites);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os anúncios.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAds(searchQuery);
    }, [searchQuery, favorites])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAds(searchQuery);
  };

  const handleCancelSearch = () => {
    setSearchVisible(false);
    setSearchQuery('');
  };



  const categoryImages: Record<string, string> = {
    'Comida': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    'Serviço': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    'Livros/Materiais': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
  };

  function getImageUrl(category: string) {
    return categoryImages[category] || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80';
  }

  const renderHeader = () => {
    if (searchVisible) {
      return (
        <View style={styles.searchHeader}>
          <Search size={22} color="#A3A3A3" style={{marginLeft: 8}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título ou descrição..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={handleCancelSearch} style={{padding: 8}}>
            <X size={24} color="#18181B" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.header}>
        <View style={styles.logoRow}>
            <View style={styles.logoIcon}><View style={styles.logoCircle}><Text style={styles.logoEmoji}>🍱</Text></View></View>
            <Text style={styles.logoText}>Tec<Text style={{ color: '#FFA800' }}>S</Text><Text style={{ color: '#22C55E' }}>hop</Text></Text>
        </View>
        <TouchableOpacity onPress={() => setSearchVisible(true)}>
          <Search size={28} color="#18181B" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {loading && !refreshing ? (
         <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color="#FFA800" />
      ) : (
        <FlatList
          data={ads}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AdCard
              imageUrl={getImageUrl(item.category)}
              title={item.title}
              price={item.price}
              description={`${item.description} / ${item.location}`}
              time={item.availableUntil}
              author={item.authorDetails?.nome || 'Autor desconhecido'}
              onPress={() => navigation.navigate('AdDetail', { ad: item })}
              isFavorite={item.isFavorite}
              onToggleFavorite={() => toggleFavorite(item._id)}
              averageRating={item.averageRating || 0}
              ratingCount={item.ratingCount || 0}
            />
          )}
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Anúncios Recentes</Text>}
          ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum anúncio encontrado para "{searchQuery}"</Text>
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' }, 
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { marginRight: 6 },
  logoCircle: { backgroundColor: '#FFA800', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#FFA800' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#18181B', marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#A3A3A3' },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 18, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  searchInput: { flex: 1, height: 40, fontSize: 16, marginLeft: 8 },
});