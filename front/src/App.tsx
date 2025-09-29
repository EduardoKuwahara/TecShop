import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../src/contexts/AuthContext';
import React from 'react';
import AppNavigator from './navigation/AppNavigator';


export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}