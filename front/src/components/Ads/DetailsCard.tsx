import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export type DetailsCardProps = {
  title: string;
  setTitle: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
};

export default function DetailsCard({ title, setTitle, category, setCategory, description, setDescription }: DetailsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Detalhes do anúncio</Text>
      
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Sanduíche natural caseiro"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma categoria..." value="" style={{ color: '#888' }} />
          <Picker.Item label="Comida" value="Comida" />
          <Picker.Item label="Serviço" value="Serviço" />
          <Picker.Item label="Livros/Materiais" value="Livros/Materiais" />
        </Picker>
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Descreva seu produto ou serviço"
        value={description}
        onChangeText={setDescription}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#18181B',
    marginBottom: 10,
  },
  label: {
    color: '#18181B',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4, 
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    marginBottom: 6,
    color: '#18181B',
  },

  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
    height: 44,
    justifyContent: 'center',  
  },
  picker: {

    width: '100%',
    color: '#18181B', 
  },

  textarea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingTop: 10, 
    height: 90, 
    fontSize: 15,
    marginBottom: 6,
    color: '#18181B',
    textAlignVertical: 'top',
  },
});