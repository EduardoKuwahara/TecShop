import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import React from 'react';
import AppNavigator from './navigation/AppNavigator';


export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <FavoritesProvider>
          <AppNavigator />
        </FavoritesProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}