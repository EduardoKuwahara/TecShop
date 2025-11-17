import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList, Modal } from 'react-native';
import { Search, Filter, Star, X, Calendar, Heart } from 'lucide-react-native';
import CategoryBar from '../components/Search/CategoryBar';
import AdCard from '../components/Home/AdCard';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../contexts/FavoritesContext';

const categories = ['Todas', 'Comida', 'Serviço', 'Livros/Materiais'];
const availabilityFilters = [
  'Todos os anúncios',
  'Apenas favoritos',
  'Expirados',
  'Disponíveis hoje',
  'Disponíveis até amanhã',
  'Disponíveis até 7 dias'
];

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

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState('Todos os anúncios');
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const categoryImages: Record<string, string> = {
    'Comida': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    'Serviço': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    'Livros/Materiais': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
  };

  function getImageUrl(category: string) {
    return categoryImages[category] || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80';
  }



  const fetchAds = async (query = '', category = '', availability = '') => {
    setLoading(true);
    console.log('Aplicando filtros:', { query, category, availability });
    try {
      let url = `http://${IP_DA_SUA_MAQUINA}:3001/ads`;
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('Dados recebidos do servidor:', data.length, 'anúncios');
      
      if (response.ok) {
        let filteredData = data;
   
        if (category && category !== 'Todas') {
          filteredData = filteredData.filter((ad: Ad) => ad.category === category);
        }
        
        if (availability && availability !== 'Todos os anúncios') {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const next7Days = new Date(now);
          next7Days.setDate(next7Days.getDate() + 7);
          
          console.log('Aplicando filtro de disponibilidade:', availability);
          console.log('Data atual:', now);
          console.log('Final de hoje:', today);
          console.log('Final de amanhã:', tomorrow);
          console.log('Em 7 dias:', next7Days);
          
          filteredData = filteredData.filter((ad: Ad) => {
            const availableUntil = new Date(ad.availableUntil);
            console.log(`Anúncio "${ad.title}" expira em:`, availableUntil);
            
            let result = false;
            switch (availability) {
              case 'Apenas favoritos':
                result = isFavorite(ad._id);
                break;
              case 'Expirados':
                result = availableUntil < now;
                break;
              case 'Disponíveis hoje':
                result = availableUntil >= now && availableUntil <= today;
                break;
              case 'Disponíveis até amanhã':
                result = availableUntil >= now && availableUntil <= tomorrow;
                break;
              case 'Disponíveis até 7 dias':
                result = availableUntil >= now && availableUntil <= next7Days;
                break;
              default:
                result = true;
            }
            
            console.log(`Resultado para "${ad.title}":`, result);
            return result;
          });
        }
        
        // Marcar anúncios favoritos
        const adsWithFavorites = filteredData.map((ad: Ad) => ({
          ...ad,
          isFavorite: isFavorite(ad._id)
        }));
        
        console.log('Após filtros aplicados:', adsWithFavorites.length, 'anúncios');
        setAds(adsWithFavorites);
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
    fetchAds(searchQuery, selectedCategory, selectedAvailability);
  }, [searchQuery, selectedCategory, selectedAvailability, favorites]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const openFilters = () => {
    setShowFilters(true);
  };

  const closeFilters = () => {
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todas');
    setSelectedAvailability('Todos os anúncios');
    setShowFilters(false);
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return searchQuery || selectedCategory !== 'Todas' || selectedAvailability !== 'Todos os anúncios';
  };

  return (
    <View style={styles.container}>
  
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍱</Text>
            </View>
          </View>
          <Text style={styles.logoText}>
            Tec<Text style={{ color: '#FFA800' }}>S</Text><Text style={{ color: '#22C55E' }}>hop</Text>
          </Text>
        </View>
        <TouchableOpacity>
          <Image source={{ uri: '' }} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>


      <View style={styles.content}>
        <View style={styles.searchBox}>
          <Search size={22} color="#A3A3A3" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar anúncios..."
            placeholderTextColor="#A3A3A3"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={openFilters}>
            <Filter size={22} color={hasActiveFilters() ? "#FFA800" : "#A3A3A3"} />
          </TouchableOpacity>
        </View>


        <CategoryBar categories={categories} selected={selectedCategory} onSelect={handleCategoryChange} />

        {(selectedAvailability !== 'Todos os anúncios' || searchQuery) && (
          <View style={styles.activeFiltersBar}>
            {searchQuery && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>🔍 "{searchQuery}"</Text>
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.activeFilterRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedAvailability !== 'Todos os anúncios' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>
                  {selectedAvailability === 'Apenas favoritos' ? '❤️' : '📅'} {selectedAvailability}
                </Text>
                <TouchableOpacity onPress={() => setSelectedAvailability('Todos os anúncios')}>
                  <Text style={styles.activeFilterRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {hasActiveFilters() 
              ? `Resultados filtrados (${ads.length})` 
              : `Todos os anúncios (${ads.length})`
            }
          </Text>
          {hasActiveFilters() && (
            <TouchableOpacity onPress={clearAllFilters} style={styles.quickClearButton}>
              <Text style={styles.quickClearText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Carregando anúncios...</Text>
        ) : (
          <FlatList
            data={ads}
            keyExtractor={(item) => item._id}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.gridCard}>
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
                
                {/* Botão de Favoritar */}
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(item._id)}
                >
                  <Heart 
                    size={20} 
                    color={item.isFavorite ? "#FF3B30" : "#A3A3A3"} 
                    fill={item.isFavorite ? "#FF3B30" : "transparent"}
                  />
                </TouchableOpacity>
              </View>
            )}
            style={styles.adsList}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 8 }}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `Nenhum anúncio encontrado para "${searchQuery}"` 
                  : 'Nenhum anúncio disponível.'
                }
              </Text>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={closeFilters}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros de Busca</Text>
              <TouchableOpacity onPress={closeFilters}>
                <X size={24} color="#71717A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterLabel}>Categoria</Text>
              <View style={styles.filterGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      selectedCategory === category && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={styles.categoryIcon}>
                      {category === 'Todas' ? '🔍' : 
                       category === 'Comida' ? '🍕' : 
                       category === 'Serviço' ? '🔧' : '📚'}
                    </Text>
                    <Text style={[
                      styles.filterOptionText,
                      selectedCategory === category && styles.filterOptionTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Disponibilidade dos Anúncios</Text>
              <View style={styles.filterGrid}>
                {availabilityFilters.map((availability) => (
                  <TouchableOpacity
                    key={availability}
                    style={[
                      styles.filterOption,
                      selectedAvailability === availability && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedAvailability(availability)}
                  >
                    {availability === 'Apenas favoritos' ? (
                      <Heart size={16} color={selectedAvailability === availability ? '#fff' : '#71717A'} 
                             fill={selectedAvailability === availability ? '#fff' : 'transparent'} />
                    ) : (
                      <Calendar size={16} color={selectedAvailability === availability ? '#fff' : '#71717A'} />
                    )}
                    <Text style={[
                      styles.filterOptionText,
                      selectedAvailability === availability && styles.filterOptionTextActive
                    ]}>
                      {availability}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {hasActiveFilters() && (
                <View style={styles.activeFiltersSection}>
                  <Text style={styles.activeFiltersTitle}>Filtros Ativos:</Text>
                  {searchQuery && (
                    <View style={styles.activeFilterTag}>
                      <Text style={styles.activeFilterText}>Busca: "{searchQuery}"</Text>
                    </View>
                  )}
                  {selectedCategory !== 'Todas' && (
                    <View style={styles.activeFilterTag}>
                      <Text style={styles.activeFilterText}>Categoria: {selectedCategory}</Text>
                    </View>
                  )}
                  {selectedAvailability !== 'Todos os anúncios' && (
                    <View style={styles.activeFilterTag}>
                      <Text style={styles.activeFilterText}>Disponibilidade: {selectedAvailability}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={applyFilters}>
                <Text style={styles.applyFiltersText}>Aplicar ({ads.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 6,
  },
  logoCircle: {
    backgroundColor: '#FFA800',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFA800',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFA800',
  },
  content: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#18181B',
  },
  clearButton: {
    color: '#A3A3A3',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181B',
    flex: 1,
  },
  quickClearButton: {
    backgroundColor: '#FFA800',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickClearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: '#E8F5FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  activeFilterChipText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  activeFilterRemove: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  adsList: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridCard: {
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#A3A3A3',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#A3A3A3',
  },
  // Estilos do Modal de Filtros
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18181B',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 12,
  },
  filterGrid: {
    gap: 12,
    marginBottom: 20,
  },
  filterOption: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionActive: {
    backgroundColor: '#FFA800',
    borderColor: '#FFA800',
  },
  filterOptionText: {
    color: '#18181B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  activeFiltersSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  activeFilterTag: {
    backgroundColor: '#FFA800',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#71717A',
    fontSize: 16,
    fontWeight: '500',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#FFA800',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default SearchScreen;