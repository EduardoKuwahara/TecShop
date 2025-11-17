import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth, User } from '../contexts/AuthContext';

import PersonalInfoCard from '../components/Profile/PersonalInfoCard';
import MyAdsCard from '../components/Profile/MyAdsCard';
import FavoritesCard from '../components/Profile/FavoritesCard';
import SettingsCard from '../components/Profile/SettingsCard';
import LogoutCard from '../components/Profile/LogoutCard';
import { useFavorites } from '../contexts/FavoritesContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuth();
  const { favorites } = useFavorites();

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
        </View>

        <View style={styles.cardsContainer}>
          {user && (
            <>
              <PersonalInfoCard
                user={user}
                onProfileUpdate={updateUser}
              />
              <MyAdsCard
                activeCount={3}
                soldCount={12}
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
    header: { alignItems: 'center', paddingTop: 32, paddingBottom: 16, backgroundColor: '#fff' },
    avatarContainer: { position: 'relative', marginBottom: 8 },
    avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#FFA800' },
    editIcon: { position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#18181B', marginTop: 4 },
    course: { color: '#52525B', fontSize: 15, marginTop: 2 },
    periodo: { color: '#A3A3A3', fontSize: 13, marginTop: 2 },
    cardsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});