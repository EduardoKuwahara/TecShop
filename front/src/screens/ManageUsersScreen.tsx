import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Trash2, Edit2, Shield, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

type User = {
  _id: string;
  nome: string;
  curso: string;
  periodo: string;
  contato: string;
  sala?: string;
  status: 'active' | 'inactive';
  role: 'user' | 'admin';
};

const IP_DA_SUA_MAQUINA = '192.168.15.5';

export default function AdminManageScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editFields, setEditFields] = useState<Partial<User>>({});

  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      if (!token) throw new Error('Sessão inválida. Faça login novamente.');
      const res = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else Alert.alert('Erro', data.error || 'Erro ao buscar usuários');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
        setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchUsers();
  }, []));

  const handleDelete = async (id: string) => {
    Alert.alert('Excluir usuário', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            if (!token) throw new Error('Sessão inválida.');
            const res = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/admin/users/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                Alert.alert('Sucesso', 'Usuário excluído.');
                fetchUsers();
            } else {
                const data = await res.json();
                Alert.alert('Erro', data.error || 'Não foi possível excluir.');
            }
          } catch (e: any) { Alert.alert('Erro', e.message); }
      }}
    ]);
  };
  
  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setEditFields({
        nome: user.nome,
        curso: user.curso,
        periodo: user.periodo,
        contato: user.contato,
        sala: user.sala,
        role: user.role,
        status: user.status,
    });
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!userToEdit) return;
    try {
        if (!token) throw new Error('Sessão inválida.');
        const res = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/admin/users/${userToEdit._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(editFields),
        });
        const data = await res.json();
        if (res.ok) {
            Alert.alert('Sucesso', 'Usuário atualizado!');
            setModalVisible(false);
            fetchUsers();
        } else {
            Alert.alert('Erro', data.error);
        }
    } catch (e: any) {
        Alert.alert('Erro', e.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filter === 'Todos') return true;
    if (filter === 'Ativos') return u.status === 'active';
    if (filter === 'Inativos') return u.status === 'inactive';
    if (filter === 'Admins') return u.role === 'admin';
    return true;
  }).filter((u) => u.nome.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <ActivityIndicator style={{flex: 1}} size="large" color="#FFA800" />;

  return (
    <View style={styles.container}>
      {/* Cabeçalho e Filtros */}
      <View style={{ padding: 18, paddingBottom: 0 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#18181B' }}>Gerenciar Usuários</Text>
        <TextInput style={styles.search} placeholder="Buscar usuários..." value={search} onChangeText={setSearch} />
        <View style={styles.filters}>
          {['Todos', 'Ativos', 'Inativos', 'Admins'].map(f => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Lista de Usuários */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
  <View style={styles.userRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <View style={[styles.avatar, item.role === 'admin' && {backgroundColor: '#FEF3C7'}]}>
        {item.role === 'admin' ? <Shield size={20} color="#F59E0B"/> : <UserIcon size={20} color="#71717A"/>}
      </View>
      
 
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text 
          style={styles.userName} 
          numberOfLines={1}
          ellipsizeMode="tail" 
        >
          {item.nome}
        </Text>
        <Text style={styles.userInfo}>{item.curso} - {item.periodo}</Text>
      </View>
    </View>

    <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {item.role === 'admin' && <Text style={styles.adminBadge}>Admin</Text>}
        {item.status === 'inactive' && <Text style={styles.inactiveBadge}>Inativo</Text>}
        <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginHorizontal: 16 }}>
            <Edit2 size={20} color="#A1A1AA" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
    </View>
  </View>
)}
        contentContainerStyle={{ padding: 18, paddingTop: 10 }}
      />

      {/* Modal de Edição */}
      {userToEdit && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Editar Usuário</Text>
                <Text style={styles.label}>Nome</Text>
                <TextInput style={styles.input} value={editFields.nome} onChangeText={t => setEditFields(f=>({...f, nome: t}))}/>
                <Text style={styles.label}>Curso</Text>
                <TextInput style={styles.input} value={editFields.curso} onChangeText={t => setEditFields(f=>({...f, curso: t}))}/>
                {/* Outros campos de texto... */}
                <Text style={styles.label}>Permissão (Role)</Text>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={editFields.role} onValueChange={v => setEditFields(f=>({...f, role: v}))}>
                        <Picker.Item label="Usuário Padrão" value="user" />
                        <Picker.Item label="Administrador" value="admin" />
                    </Picker>
                </View>
                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={editFields.status} onValueChange={v => setEditFields(f=>({...f, status: v}))}>
                        <Picker.Item label="Ativo" value="active" />
                        <Picker.Item label="Inativo" value="inactive" />
                    </Picker>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20}}>
                    <TouchableOpacity onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveEdit} style={{marginLeft: 20}}><Text style={{fontWeight: 'bold', color: '#FFA800'}}>Salvar</Text></TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  search: { backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 16, height: 44, fontSize: 15, marginTop: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6'},
  filters: { flexDirection: 'row', marginBottom: 8 },
  filterBtn: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  filterBtnActive: { backgroundColor: '#FFA800' },
  filterText: { color: '#52525B', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6'},
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center'},
  userName: { fontWeight: 'bold', fontSize: 15, color: '#18181B'},
  userInfo: { color: '#71717A', fontSize: 13 },
  adminBadge: { backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 11, fontWeight: 'bold', marginRight: 8 },
  inactiveBadge: { backgroundColor: '#E5E7EB', color: '#374151', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 11, fontWeight: 'bold', marginRight: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#3F3F46', marginBottom: 4, marginTop: 10},
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16 },
  pickerWrapper: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8},
});