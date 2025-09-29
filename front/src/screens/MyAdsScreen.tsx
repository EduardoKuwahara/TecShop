import React, { useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, 
    Alert, FlatList, RefreshControl, ScrollView, Modal, TextInput, Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Plus, Calendar, MapPin } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useAuth } from '../contexts/AuthContext';

const IP_DA_SUA_MAQUINA = '192.168.15.5';

const categoryImages: Record<string, string> = {
  'Comida': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'Serviço': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  'Livros/Materiais': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
};

function getImageUrl(category: string): string {
  return categoryImages[category] || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80';
}

const statusTabs = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Vendidos', value: 'sold' },
  { label: 'Expirados', value: 'expired' },
];
const statusColors = {
  active: '#22C55E',
  sold: '#2563EB',
  expired: '#A3A3A3',
};
const statusLabels = {
  active: 'Ativo',
  sold: 'Vendido',
  expired: 'Expirado',
};

type Ad = {
  _id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  status: 'active' | 'sold' | 'expired';
  category: string;
  imageUrl?: string;
  availableUntil?: string;
};
type TabValue = 'all' | 'active' | 'sold' | 'expired';

export default function MyAdsScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabValue>('all');
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [adToEdit, setAdToEdit] = useState<Ad | null>(null);
  const [editFields, setEditFields] = useState({
    title: '', description: '', price: '', availableUntil: '', location: '',
  });

  const [modalDateObject, setModalDateObject] = useState(new Date());
  const [showModalPicker, setShowModalPicker] = useState(false);
  const [modalPickerMode, setModalPickerMode] = useState<'date' | 'time'>('date');

  const fetchMyAds = async () => {
    if (!token) { setLoading(false); setRefreshing(false); return; }
    try {
      const res = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/my-ads`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao buscar os anúncios');
      }
      const data = await res.json();
      setAds(data);
    } catch (e: any) {
      setAds([]);
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useFocusEffect(useCallback(() => { setLoading(true); fetchMyAds(); }, [token]));
  const onRefresh = useCallback(() => { setRefreshing(true); fetchMyAds(); }, [token]);

  const handleDelete = async (adId: string) => {
    Alert.alert(
      "Confirmar Exclusão", "Tem certeza que deseja excluir este anúncio?",
      [{ text: "Cancelar", style: "cancel" }, { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          if (!token) { Alert.alert('Erro', 'Sessão inválida.'); return; }
          const response = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/ads/${adId}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            setAds(currentAds => currentAds.filter(ad => ad._id !== adId));
            Alert.alert('Sucesso', 'Anúncio excluído!');
          } else {
            const data = await response.json();
            Alert.alert('Erro', data.error || 'Não foi possível excluir.');
          }
        } catch (e) { Alert.alert('Erro', 'Erro de conexão.'); }
      }}]
    );
  };
  
  // --- CORREÇÃO 1: Ajuste na abertura do modal ---
  const openEditModal = (ad: Ad) => {
    setAdToEdit(ad);

    // Garante que o seletor de data comece com a data atual do anúncio
    const initialDate = ad.availableUntil ? new Date(ad.availableUntil) : new Date();
    setModalDateObject(initialDate);

    setEditFields({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      // Usa a `initialDate` para garantir que o texto seja formatado corretamente
      availableUntil: ad.availableUntil ? initialDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '',
      location: ad.location || '',
    });
    setEditModalVisible(true);
  };

  const handleModalPriceChange = (text: string) => {
    const cleanedText = text.replace(/\D/g, '');
    if (cleanedText === '') { setEditFields(f => ({ ...f, price: '' })); return; }
    const numberValue = parseFloat(cleanedText);
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL',
    }).format(numberValue / 100);
    setEditFields(f => ({ ...f, price: formattedPrice }));
  };

  const onModalDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowModalPicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    setModalDateObject(selectedDate); // Atualiza o objeto Date
    if (Platform.OS === 'android') {
      if (modalPickerMode === 'date') {
        setModalPickerMode('time');
        setShowModalPicker(true);
      } else {
        formatAndSetModalDate(selectedDate);
        setModalPickerMode('date');
      }
    } else {
      formatAndSetModalDate(selectedDate);
    }
  };

  const formatAndSetModalDate = (dateToFormat: Date) => {
    const formattedString = dateToFormat.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    setEditFields(f => ({ ...f, availableUntil: formattedString })); // Atualiza o texto
  };
  
  // --- CORREÇÃO 2: Ajuste no envio dos dados para o servidor ---
  const handleEditSave = async () => {
    if (!adToEdit) return;
    try {
      if (!token) throw new Error('Sessão inválida.');
      const payload = {
        title: editFields.title,
        description: editFields.description,
        price: editFields.price,
        // Envia a data no formato ISO, que o servidor entende
        date: modalDateObject.toISOString(),
        location: editFields.location,
      };
      const response = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/ads/${adToEdit._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao editar anúncio');
      }
      const updatedAd = await response.json();
      setAds(currentAds => currentAds.map(ad => ad._id === adToEdit._id ? updatedAd : ad));
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Anúncio atualizado!');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar.');
    }
  };

  const filteredAds = ads.filter(ad => selectedTab === 'all' || ad.status === selectedTab);

  const renderAdCard = ({ item }: { item: Ad }) => {
    const formattedDate = item.availableUntil 
      ? new Date(item.availableUntil).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : '-';

    return (
      <View style={styles.card}>
        <Image source={{ uri: getImageUrl(item.category) }} style={styles.cardImage} />
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#A3A3A3' }]}>
          <Text style={styles.statusBadgeText}>{statusLabels[item.status] || 'Outro'}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.priceTag, { backgroundColor: item.status === 'active' ? '#FEF3C7' : item.status === 'sold' ? '#DBEAFE' : '#F3F4F6' }]}>
              <Text style={[styles.priceText, { color: item.status === 'active' ? '#F59E42' : item.status === 'sold' ? '#2563EB' : '#A3A3A3' }]}>
                {item.price}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.cardLocation}>Local: {item.location || '-'}</Text>
          <Text style={styles.cardDate}>Disponível até: {formattedDate}</Text>
          <View style={styles.actionsRow}>
            {item.status === 'active' && (
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Text style={styles.actionEdit}>Editar</Text>
              </TouchableOpacity>
            )}
            {item.status === 'expired' && (
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.actionRenew}>Renovar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.actionDelete}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft size={26} color="#18181B" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Anúncios</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Anunciar' })}><Plus size={26} color="#FFA800" /></TouchableOpacity>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {statusTabs.map(tab => (
            <TouchableOpacity key={tab.value} style={[styles.tabBtn, selectedTab === tab.value && styles.tabBtnActive]} onPress={() => setSelectedTab(tab.value as TabValue)}>
              <Text style={[styles.tabText, selectedTab === tab.value && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {loading ? <ActivityIndicator size="large" color="#FFA800" style={{ flex: 1 }} /> : (
        <FlatList
          data={filteredAds} renderItem={renderAdCard} keyExtractor={(item) => item._id} contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          ListEmptyComponent={<View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50}}><Text style={{ textAlign: 'center', fontSize: 16, color: '#A3A3A3' }}>Nenhum anúncio encontrado.</Text></View>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFA800"]} />}
        />
      )}
      
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <ScrollView>
                    <Text style={styles.modalTitle}>Editar Anúncio</Text>
                    <TextInput style={styles.input} placeholder="Título" value={editFields.title} onChangeText={text => setEditFields(f => ({ ...f, title: text }))} />
                    <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} placeholder="Descrição" value={editFields.description} onChangeText={text => setEditFields(f => ({ ...f, description: text }))} multiline />
                    <TextInput style={styles.input} placeholder="Preço" value={editFields.price} onChangeText={handleModalPriceChange} keyboardType="number-pad"/>
                    <View style={styles.inputRow}>
                        <MapPin size={20} color="#A3A3A3" style={styles.icon} />
                        <TextInput style={styles.inputWithIcon} placeholder="Localização" value={editFields.location} onChangeText={text => setEditFields(f => ({ ...f, location: text }))} />
                    </View>
                    <TouchableOpacity onPress={() => { setModalPickerMode('date'); setShowModalPicker(true); }} style={styles.inputRow}>
                        <Calendar size={20} color="#A3A3A3" style={styles.icon} />
                        <Text style={[styles.dateText, !editFields.availableUntil && styles.placeholderText]}>
                          {editFields.availableUntil || 'Selecione a data e hora'}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalButton}>
                          <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleEditSave} style={[styles.modalButton, styles.saveButton]}>
                          <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
      </Modal>

      {showModalPicker && (
        <DateTimePicker value={modalDateObject} mode={modalPickerMode} is24Hour={true} display="default" onChange={onModalDateChange} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#18181B' },
    tabsRow: { paddingLeft: 12, paddingVertical: 8 },
    tabBtn: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6, marginRight: 8 },
    tabBtnActive: { backgroundColor: '#FFA800' },
    tabText: { color: '#18181B', fontSize: 15 },
    tabTextActive: { color: '#fff', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
    cardImage: { width: '100%', height: 140 },
    statusBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, zIndex: 2 },
    statusBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    cardContent: { padding: 14 },
    cardTitle: { fontWeight: 'bold', fontSize: 17, color: '#18181B', flex: 1, marginRight: 8 },
    cardDesc: { color: '#52525B', fontSize: 14, marginTop: 2, marginBottom: 4 },
    cardLocation: { color: '#52525B', fontSize: 13, marginTop: 4 },
    cardDate: { color: '#52525B', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
    priceTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start' },
    priceText: { fontWeight: 'bold', fontSize: 15 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
    actionEdit: { color: '#FFA800', fontWeight: 'bold', marginRight: 16, fontSize: 15 },
    actionRenew: { color: '#FFA800', fontWeight: 'bold', marginRight: 16, fontSize: 15 },
    actionDelete: { color: '#EF4444', fontWeight: 'bold', marginLeft: 'auto', fontSize: 15 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontWeight: 'bold', fontSize: 20, marginBottom: 16, color: '#18181B', textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 16, backgroundColor: '#F9FAFB' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
    modalButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
    saveButton: { backgroundColor: '#FFA800' },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cancelButtonText: { color: '#52525B', fontWeight: 'bold', fontSize: 16 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', height: 44, marginBottom: 12 },
    icon: { marginLeft: 12, marginRight: 4 },
    inputWithIcon: { flex: 1, height: 44, paddingHorizontal: 10, fontSize: 16, color: '#18181B' },
    dateText: { flex: 1, height: 44, paddingHorizontal: 10, fontSize: 16, color: '#18181B', textAlignVertical: 'center' },
    placeholderText: { color: '#A3A3A3' },
});