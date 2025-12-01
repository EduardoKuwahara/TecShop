import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TrendingUp, Heart, Star, Package } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth, User } from '../contexts/AuthContext';

import PersonalInfoCard from '../components/Profile/PersonalInfoCard';
import MyAdsCard from '../components/Profile/MyAdsCard';
import FavoritesCard from '../components/Profile/FavoritesCard';
import SettingsCard from '../components/Profile/SettingsCard';
import LogoutCard from '../components/Profile/LogoutCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { API_BASE_URL } from '../config';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuth();
  const { favorites } = useFavorites();

  // Estados para as estatísticas
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalRatings: 0,
    averageRating: 0,
    loading: true
  });

  // Buscar estatísticas do usuário
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    try {
      // Buscar token do AsyncStorage
      const token = await AsyncStorage.getItem('@TecShop:token');
      if (!token) {
        console.log('Token não encontrado');
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Buscar anúncios do usuário usando o endpoint correto
      const adsResponse = await fetch(`${API_BASE_URL}/my-ads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const adsData = await adsResponse.json();
      
      let totalRatings = 0;
      let totalRatingSum = 0;
      let activeAds = 0;
      
      if (adsResponse.ok && Array.isArray(adsData)) {
        // Contar anúncios ativos (não expirados)
        const now = new Date();
        activeAds = adsData.filter(ad => new Date(ad.availableUntil) > now).length;
        
        // Somar avaliações de todos os anúncios
        adsData.forEach(ad => {
          if (ad.ratingCount && ad.ratingCount > 0) {
            totalRatings += ad.ratingCount;
            totalRatingSum += (ad.averageRating || 0) * ad.ratingCount;
          }
        });
      }
      
      setStats({
        totalAds: adsData.length || 0,
        activeAds,
        totalRatings,
        averageRating: totalRatings > 0 ? totalRatingSum / totalRatings : 0,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user?.id]);

  console.log('ProfileScreen user:', user);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user?.nome || 'U'}&background=FFA800&color=fff` }}
              style={styles.avatar}
            />
            <View style={styles.editIcon} />
          </View>
          <Text style={styles.name}>{user?.nome || 'Carregando...'}</Text>
          <Text style={styles.course}>{user?.curso || ' '}</Text>
          <Text style={styles.periodo}>{user?.periodo || ' '}</Text>
          
          {/* Seção de Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Package size={20} color="#FFA800" />
              </View>
              <Text style={styles.statNumber}>{stats.loading ? '...' : stats.totalAds}</Text>
              <Text style={styles.statLabel}>Anúncios</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Star size={20} color="#22C55E" fill="#22C55E" />
              </View>
              <Text style={styles.statNumber}>{stats.loading ? '...' : stats.totalRatings}</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Heart size={20} color="#FF3B30" fill="#FF3B30" />
              </View>
              <Text style={styles.statNumber}>{stats.loading ? '...' : favorites.size}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            
            {stats.averageRating > 0 && (
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <TrendingUp size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Média</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {user && (
            <>
              <PersonalInfoCard
                user={user}
                onProfileUpdate={updateUser}
              />
              <MyAdsCard
                activeCount={stats.activeAds}
                soldCount={stats.totalAds - stats.activeAds}
                onViewAll={() => navigation.navigate('MyAds')}
              />
              <FavoritesCard
                savedCount={favorites.size}
                onViewFavorites={() => navigation.navigate('Favorites')}
              />
              <SettingsCard
                onNotifications={() => {}}
                onPrivacy={() => {}}
                onHelp={() => {}}
                isAdmin={user.role === 'admin'}
                onManageUsers={() => navigation.navigate('ManageUsers')}
                onManageReports={() => navigation.navigate('Reports')}
              />
            </>
          )}
          <LogoutCard onLogout={logout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { 
        alignItems: 'center', 
        paddingTop: 32, 
        paddingBottom: 20, 
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    avatarContainer: { position: 'relative', marginBottom: 8 },
    avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#FFA800' },
    editIcon: { position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#18181B', marginTop: 4 },
    course: { color: '#52525B', fontSize: 15, marginTop: 2 },
    periodo: { color: '#A3A3A3', fontSize: 13, marginTop: 2, marginBottom: 16 },
    
    // Estilos das Estatísticas
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 12,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#18181B',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        textAlign: 'center',
    },
    
    cardsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
});