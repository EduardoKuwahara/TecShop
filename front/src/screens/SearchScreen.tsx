import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { Search, Filter, Star } from 'lucide-react-native';
import FooterNav from '../components/FooterNav';
import CategoryBar from '../components/Search/CategoryBar';
import RecommendationCard from '../components/Search/RecommendationCard';
import AdCard from '../components/Home/AdCard';
import RecentCard from '../components/Search/RecentCard';
import { useNavigation } from '@react-navigation/native';

const categories = ['Comida', 'Serviços', 'Livros', 'Monitorias', 'Prédios'];

const IP_DA_SUA_MAQUINA = '192.168.15.5';

const recent = [
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    title: 'Bolo de Chocolate',
    desc: 'Fatias de bolo caseiro',
    price: 'R$ 8,00',
  },
  {
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    title: 'Revisão de Prova',
    desc: 'Ajuda com trabalhos',
    price: 'R$ 25/h',
  },
];

const SearchScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Comida');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/ads`);
        const data = await res.json();
        setAds(data);
      } catch (e) {
     
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

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


      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.searchBox}>
          <Search size={22} color="#A3A3A3" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar comida, serviços..."
            placeholderTextColor="#A3A3A3"
          />
          <TouchableOpacity>
            <Filter size={22} color="#FFA800" />
          </TouchableOpacity>
        </View>


        <CategoryBar categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

  
        <View style={styles.sectionRow}>
          <Star size={20} color="#FACC15" style={{ marginRight: 4 }} />
          <Text style={styles.sectionTitle}>Recomendados para você</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendScroll}>
          {loading ? (
            <Text style={{ marginLeft: 16, color: '#A3A3A3' }}>Carregando anúncios...</Text>
          ) : (
            ads.length > 0 ? (
              ads.map((ad, idx) => (
                <RecommendationCard
                  key={ad._id || idx}
                  image={ad.imageUrl || 'https://placehold.co/170x140'}
                  title={ad.title}
                  desc={ad.description}
                  price={ad.price}
                  favorite={false}
                />
              ))
            ) : (
              <Text style={{ marginLeft: 16, color: '#A3A3A3' }}>Nenhum anúncio encontrado.</Text>
            )
          )}
        </ScrollView>

        {/* Recent results */}
        <Text style={styles.sectionTitle2}>Resultados recentes</Text>
        <View style={{ marginBottom: 12 }}>
          {recent.map((item, idx) => (
            <RecentCard
              key={idx}
              image={item.image}
              title={item.title}
              desc={item.desc}
              price={item.price}
            />
          ))}
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  categories: {
    flexGrow: 0,
    marginLeft: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  categoryBtn: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#FACC15',
  },
  categoryText: {
    color: '#18181B',
    fontSize: 15,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181B',
  },
  recommendScroll: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  recommendCard: {
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
  recommendImage: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recommendContent: {
    padding: 10,
  },
  recommendTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#18181B',
  },
  recommendDesc: {
    color: '#52525B',
    fontSize: 13,
    marginBottom: 2,
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  recommendPrice: {
    color: '#FFA800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  heart: {
    color: '#A3A3A3',
    fontSize: 18,
  },
  sectionTitle2: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#18181B',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  recentCard: {
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
  recentImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#18181B',
  },
  recentDesc: {
    color: '#52525B',
    fontSize: 13,
  },
  recentPrice: {
    color: '#FFA800',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default SearchScreen;