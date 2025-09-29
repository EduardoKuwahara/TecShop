import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ClipboardList } from 'lucide-react-native';

export type MyAdsCardProps = {
  activeCount: number;
  soldCount: number;
  onViewAll?: () => void;
};


export default function MyAdsCard({ activeCount, soldCount, onViewAll }: MyAdsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
  <ClipboardList color="#FFA800" size={22} />
        <Text style={styles.headerText}>Meus Anúncios</Text>
      </View>
      <View style={styles.countRow}>
        { /* <Text style={styles.countText}>Ativos: <Text style={styles.bold}>{activeCount}</Text></Text>
        <Text style={styles.countText}>Vendidos: <Text style={styles.bold}>{soldCount}</Text></Text> */}
      </View>
      <TouchableOpacity style={styles.button} onPress={onViewAll}>
        <Text style={styles.buttonText}>Ver todos meus anúncios</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
    color: '#18181B',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countText: {
    color: '#18181B',
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFA800',
    borderRadius: 24,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
