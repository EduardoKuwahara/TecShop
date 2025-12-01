import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Search } from 'lucide-react-native';
import ChatCard from '../components/Chat/ChatCard';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍱</Text>
            </View>
          </View>
          <Text style={styles.logoText}>
            Tec<Text style={{ color: '#FFA800' }}>S</Text><Text style={{ color: '#22C55E' }}>hop</Text>
          </Text>
        </View>
        <TouchableOpacity>
          <X size={28} color="#18181B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBox}>
        <Search size={22} color="#A3A3A3" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversas..."
          placeholderTextColor="#A3A3A3"
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
        <ChatCard
          avatar="https://randomuser.me/api/portraits/women/44.jpg"
          name="Maria Souza"
          message="Olá, o sanduíche ainda está disponível?"
          time="10:30"
          tag="Lanche da Tarde"
          tagColor="#FACC15"
          unread
        />
        <ChatCard
          avatar="https://randomuser.me/api/portraits/men/45.jpg"
          name="Carlos Oliveira"
          message="Podemos marcar a monitoria para sexta?"
          time="Ontem"
          tag="Monitoria de Cálculo"
          tagColor="#22C55E"
        />
        <ChatCard
          avatar="https://randomuser.me/api/portraits/women/46.jpg"
          name="Ana Beatriz"
          message="Vou querer 2 fatias do bolo!"
          time="Seg"
          tag="Bolo de Chocolate"
          tagColor="#FACC15"
        />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 6,
  },
  logoCircle: {
    backgroundColor: '#FFA800',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFA800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#18181B',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
});
