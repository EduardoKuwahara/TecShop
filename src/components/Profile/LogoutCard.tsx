import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';

export type LogoutCardProps = {
  onLogout?: () => void;
};

export default function LogoutCard({ onLogout }: LogoutCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onLogout}>
      <View style={styles.row}>
        <LogOut color="#FFA800" size={22} />
        <Text style={styles.text}>Sair da conta</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEE2E2',
    borderRadius: 24,
    marginBottom: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#B91C1C',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
