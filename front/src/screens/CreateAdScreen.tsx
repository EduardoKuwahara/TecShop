import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PhotoCard from '../components/Ads/PhotoCard';
import DetailsCard from '../components/Ads/DetailsCard';
import PriceLocationCard from '../components/Ads/PriceLocationCard';


import { useAuth } from '../contexts/AuthContext';

export default function AnnounceScreen() {
  const navigation = useNavigation<any>();


  const { token, user } = useAuth();


  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const IP_DA_SUA_MAQUINA = '192.168.15.5';

  const handlePublish = async () => {
    if (!title || !category || !description || !price || !location || !date) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos do anúncio.');
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Sua sessão parece ter expirado. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title,
          category,
          description,
          price,
          location,
          date
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso!', 'Seu anúncio foi publicado!');
        setTitle(''); setCategory(''); setDescription(''); setPrice(''); setLocation(''); setDate('');
        navigation.navigate('Início');
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível publicar o anúncio.');
      }

    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua rede e o IP configurado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoCircle}><Text style={styles.logoEmoji}>🍱</Text></View>
          </View>
          <Text style={styles.logoText}>Tec<Text style={{ color: '#FFA800' }}>S</Text><Text style={{ color: '#22C55E' }}>hop</Text></Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}><X size={28} color="#18181B" /></TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.title}>Criar novo anúncio</Text>
        <DetailsCard
          title={title} setTitle={setTitle}
          category={category} setCategory={setCategory}
          description={description} setDescription={setDescription}
        />
        <PriceLocationCard
          price={price} setPrice={setPrice}
          location={location} setLocation={setLocation}
          date={date} setDate={setDate}
        />
        <TouchableOpacity style={styles.button} onPress={handlePublish} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Publicar anúncio</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { marginRight: 6 },
  logoCircle: { backgroundColor: '#FFA800', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#FFA800' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#18181B', marginVertical: 16 },
  button: { backgroundColor: '#FFA800', borderRadius: 24, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});