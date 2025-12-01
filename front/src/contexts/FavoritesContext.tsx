import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (adId: string) => Promise<void>;
  isFavorite: (adId: string) => boolean;
  loadFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro do FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user, token } = useAuth();

  const getFavoritesKey = () => {
    return user ? `@favorites_${user.id}` : '@favorites_guest';
  };

  const loadFavorites = async () => {
    try {
      if (user) {
        const response = await fetch(`${API_BASE_URL}/user/favorites`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
          },
        });
        
        if (response.ok) {
          const serverFavorites = await response.json();
          setFavorites(new Set(serverFavorites));
          
          // Salva no AsyncStorage como backup
          const favoritesKey = getFavoritesKey();
          await AsyncStorage.setItem(favoritesKey, JSON.stringify(serverFavorites));
        } else {
          // Fallback para AsyncStorage se houver erro no servidor
          const favoritesKey = getFavoritesKey();
          const savedFavorites = await AsyncStorage.getItem(favoritesKey);
          if (savedFavorites) {
            setFavorites(new Set(JSON.parse(savedFavorites)));
          } else {
            setFavorites(new Set());
          }
        }
      } else {
        // Se não há usuário logado, carrega apenas do AsyncStorage
        const favoritesKey = getFavoritesKey();
        const savedFavorites = await AsyncStorage.getItem(favoritesKey);
        if (savedFavorites) {
          setFavorites(new Set(JSON.parse(savedFavorites)));
        } else {
          setFavorites(new Set());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      
      // Fallback para AsyncStorage em caso de erro
      try {
        const favoritesKey = getFavoritesKey();
        const savedFavorites = await AsyncStorage.getItem(favoritesKey);
        if (savedFavorites) {
          setFavorites(new Set(JSON.parse(savedFavorites)));
        } else {
          setFavorites(new Set());
        }
      } catch (storageError) {
        console.error('Erro ao carregar favoritos do AsyncStorage:', storageError);
      }
    }
  };

  const saveFavorites = async (newFavorites: Set<string>) => {
    try {
      const favoritesKey = getFavoritesKey();
      await AsyncStorage.setItem(favoritesKey, JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const toggleFavorite = async (adId: string) => {
    const newFavorites = new Set(favorites);
    const isRemoving = newFavorites.has(adId);
    
    if (isRemoving) {
      newFavorites.delete(adId);
    } else {
      newFavorites.add(adId);
    }
    
    // Atualiza localmente primeiro para responsividade
    setFavorites(newFavorites);
    
    if (user && token) {
      try {
        const endpoint = `${API_BASE_URL}/user/favorites/${adId}`;
        const method = isRemoving ? 'DELETE' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Se falhou no servidor, reverte a mudança local
          if (isRemoving) {
            newFavorites.add(adId);
          } else {
            newFavorites.delete(adId);
          }
          setFavorites(newFavorites);
          console.error('Erro ao sincronizar favorito com o servidor');
        }
      } catch (error) {
        // Se falhou no servidor, reverte a mudança local
        if (isRemoving) {
          newFavorites.add(adId);
        } else {
          newFavorites.delete(adId);
        }
        setFavorites(newFavorites);
        console.error('Erro ao conectar com servidor:', error);
      }
    }
    
    // Salva no AsyncStorage como backup
    await saveFavorites(newFavorites);
  };

  const isFavorite = (adId: string) => {
    return favorites.has(adId);
  };

  const clearFavorites = () => {
    setFavorites(new Set());
    // Limpar também do AsyncStorage
    if (user) {
      const favoritesKey = getFavoritesKey();
      AsyncStorage.removeItem(favoritesKey).catch(console.error);
    }
  };

  // Carregar favoritos quando o componente for montado ou quando o usuário mudar
  useEffect(() => {
    loadFavorites();
  }, [user?.id]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loadFavorites, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};