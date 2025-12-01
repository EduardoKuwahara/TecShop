import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ChatDetailScreen() {
  const navigation = useNavigation<any>();

  const messages = [
    { id: 1, text: 'Olá, o sanduíche ainda está disponível?', time: '10:30', sent: false },
    { id: 2, text: 'Sim, está disponível!! Posso deixar na cantina às 15h', time: '10:32', sent: true },
    { id: 3, text: 'Perfeito! Vou buscar lá. Obrigada!', time: '10:33', sent: false },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <ArrowLeft color="#18181B" size={24} />
        </TouchableOpacity>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Maria Souza</Text>
          <Text style={styles.status}>Online</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <MoreVertical color="#18181B" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.productBar}>
        <Text style={styles.productText}>Lanche da Tarde - R$ 12,00</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingVertical: 12 }}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.sent ? styles.msgRowSent : styles.msgRowRecv]}> 
            <View style={[styles.msgBubble, msg.sent ? styles.msgBubbleSent : styles.msgBubbleRecv]}>
              <Text style={[styles.msgText, msg.sent && { color: '#fff' }]}>{msg.text}</Text>
            </View>
            <Text style={styles.msgTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerIcon: {
    padding: 4,
    marginRight: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#18181B',
  },
  status: {
    color: '#22C55E',
    fontSize: 13,
  },
  productBar: {
    backgroundColor: '#FDE68A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  productText: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 15,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  msgRow: {
    marginBottom: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  msgRowSent: {
    alignItems: 'flex-end',
  },
  msgRowRecv: {
    alignItems: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 2,
  },
  msgBubbleSent: {
    backgroundColor: '#FFA800',
    alignSelf: 'flex-end',
  },
  msgBubbleRecv: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  msgText: {
    color: '#18181B',
    fontSize: 15,
  },
  msgTime: {
    color: '#A3A3A3',
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 2,
  },
});