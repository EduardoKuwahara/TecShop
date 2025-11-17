import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../src/contexts/AuthContext';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';
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