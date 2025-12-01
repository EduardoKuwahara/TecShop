import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react-native';

type FooterNavProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export default function FooterNav({ activeTab, onTabPress }: FooterNavProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress('Home')}>
        <Home color={activeTab === 'Home' ? '#FFA800' : '#A3A3A3'} size={24} />
        <Text style={[styles.label, activeTab === 'Home' && styles.activeLabel]}>Início</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress('Search')}>
        <Search color={activeTab === 'Search' ? '#FFA800' : '#A3A3A3'} size={24} />
        <Text style={[styles.label, activeTab === 'Search' && styles.activeLabel]}>Buscar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress('Announce')}>
        <PlusCircle color={activeTab === 'Announce' ? '#FFA800' : '#A3A3A3'} size={24} />
        <Text style={[styles.label, activeTab === 'Announce' && styles.activeLabel]}>Anunciar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress('Chat')}>
        <MessageCircle color={activeTab === 'Chat' ? '#FFA800' : '#A3A3A3'} size={24} />
        <Text style={[styles.label, activeTab === 'Chat' && styles.activeLabel]}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress('Profile')}>
        <User color={activeTab === 'Profile' ? '#FFA800' : '#A3A3A3'} size={24} />
        <Text style={[styles.label, activeTab === 'Profile' && styles.activeLabel]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    height: 64,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#A3A3A3',
    marginTop: 2,
  },
  activeLabel: {
    color: '#FFA800',
    fontWeight: 'bold',
  },
});
