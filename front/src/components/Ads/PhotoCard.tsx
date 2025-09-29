import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UploadCloud } from 'lucide-react-native';

export default function PhotoCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Fotos do produto</Text>
      <TouchableOpacity style={styles.photoBox}>
        <UploadCloud size={40} color="#A3A3A3" />
        <Text style={styles.photoText}>Clique para adicionar fotos</Text>
      </TouchableOpacity>
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
  photoBox: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  photoText: {
    color: '#A3A3A3',
    fontSize: 15,
    marginTop: 8,
  },
});
