import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';


export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'user' | 'admin';
  curso?: string;
  periodo?: string;
  contato?: string;
  sala?: string;
}


interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { user: User; token: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
  
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem('@TecShop:token');
      const storedUser = await AsyncStorage.getItem('@TecShop:user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const login = async (data: { user: User; token: string }) => {
    setUser(data.user);
    setToken(data.token);


    await AsyncStorage.setItem('@TecShop:token', data.token);
    await AsyncStorage.setItem('@TecShop:user', JSON.stringify(data.user));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('@TecShop:token');
    await AsyncStorage.removeItem('@TecShop:user');
  };

  const updateUser = async (data: User) => {
    setUser(data);
    await AsyncStorage.setItem('@TecShop:user', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  return context;
}