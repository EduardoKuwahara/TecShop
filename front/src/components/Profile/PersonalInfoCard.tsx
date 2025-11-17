import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { User as UserIcon, Pencil } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../contexts/AuthContext';

export type PersonalInfoCardProps = {
  user: User;
  onProfileUpdate?: (data: User) => void | Promise<void>;
};

const IP_DA_SUA_MAQUINA = '10.226.241.139';

export default function PersonalInfoCard({ user, onProfileUpdate }: PersonalInfoCardProps) {
  const { token } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nome: user.nome || '',
    email: user.email || '',
    contato: user.contato || '',
    curso: user.curso || '',
    periodo: user.periodo || '',
    sala: user.sala || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      nome: user.nome,
      email: user.email,
      contato: user.contato || '',
      curso: user.curso || '',
      periodo: user.periodo || '',
      sala: user.sala || '',
    });
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {

      if (!token) {
        Alert.alert('Erro', 'Sua sessão expirou. Faça login novamente.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://${IP_DA_SUA_MAQUINA}:3001/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          nome: form.nome,
          curso: form.curso,
          periodo: form.periodo,
          contato: form.contato,
          sala: form.sala,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setEditMode(false);
  if (onProfileUpdate) await onProfileUpdate(data.user);
        Alert.alert('Sucesso', 'Informações atualizadas!');
      } else {
        Alert.alert('Erro', data.error || 'Erro ao atualizar perfil.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <UserIcon color="#FFA800" size={22} />
        <Text style={styles.headerText}>Informações Pessoais</Text>
        <TouchableOpacity onPress={() => setEditMode(e => !e)} style={{ marginLeft: 'auto' }}>
          <Pencil color="#FFA800" size={20} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.label}>Nome</Text>
      {editMode ? (
        <TextInput style={styles.input} value={form.nome} onChangeText={t => handleChange('nome', t)} placeholder="Nome" />
      ) : (
        <Text style={styles.value}>{user.nome}</Text>
      )}

      <Text style={styles.label}>E-mail</Text>
      <Text style={styles.value}>{user.email}</Text>

      <Text style={styles.label}>Telefone</Text>
      {editMode ? (
        <TextInput style={styles.input} value={form.contato} onChangeText={t => handleChange('contato', t)} placeholder="Telefone" keyboardType="phone-pad" />
      ) : (
        <Text style={styles.value}>{user.contato}</Text>
      )}

      <Text style={styles.label}>Curso</Text>
      {editMode ? (
        <TextInput style={styles.input} value={form.curso} onChangeText={t => handleChange('curso', t)} placeholder="Curso" />
      ) : (
        <Text style={styles.value}>{user.curso}</Text>
      )}

      <Text style={styles.label}>Período</Text>
      {editMode ? (
        <TextInput style={styles.input} value={form.periodo} onChangeText={t => handleChange('periodo', t)} placeholder="Período" />
      ) : (
        <Text style={styles.value}>{user.periodo}</Text>
      )}

      <Text style={styles.label}>Sala</Text>
      {editMode ? (
        <TextInput style={styles.input} value={form.sala} onChangeText={t => handleChange('sala', t)} placeholder="Sala" />
      ) : (
        <Text style={styles.value}>{user.sala || 'Não informado'}</Text>
      )}

      {editMode && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Salvar Alterações</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 18, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  headerText: { fontWeight: 'bold', fontSize: 17, marginLeft: 8, color: '#18181B' },
  label: { color: '#A3A3A3', fontSize: 13, marginTop: 10 },
  value: { color: '#18181B', fontSize: 16, marginBottom: 2, paddingVertical: 9 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, fontSize: 16, marginBottom: 2, color: '#18181B', backgroundColor: '#F9FAFB' },
  saveBtn: { backgroundColor: '#FFA800', borderRadius: 8, paddingVertical: 12, marginTop: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});