import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../contexts/AuthContext';
import { Home, Search, PlusCircle, MessageCircle, User as UserIcon, Shield } from 'lucide-react-native';


import AdDetailScreen from '../screens/AdDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MyAdsScreen from '../screens/MyAdsScreen';
import CreateAdScreen from '../screens/CreateAdScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManageUsersScreen from '../screens/ManageUsersScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainAppTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#FFA800',
        tabBarInactiveTintColor: 'gray',
      }}
    >
     <Tab.Screen name="Início" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
  <Tab.Screen name="Buscar" component={SearchScreen} options={{ tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }} />
      <Tab.Screen name="Anunciar" component={CreateAdScreen} options={{ tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} /> }} />
  <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFA800" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          {/* A tela principal agora é o conjunto de abas */}
          <Stack.Screen name="Main" component={MainAppTabs} options={{ headerShown: false }} />
          
          {/* Telas que são abertas POR CIMA das abas */}
          <Stack.Screen name="MyAds" component={MyAdsScreen} options={{ headerShown: true, title: 'Meus Anúncios' }} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: true, title: 'Conversa' }} />
          <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ headerShown: true, title: 'Gerenciar Usuários' }} />
          <Stack.Screen name="AdDetail" component={AdDetailScreen} options={{ headerShown: true, title: '', headerBackVisible: false }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
      )}
    </Stack.Navigator>
  );
}