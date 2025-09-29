import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export type ChatCardProps = {
  avatar: string;
  name: string;
  message: string;
  time: string;
  tag: string;
  tagColor?: string; 
  unread?: boolean; 
};


const ChatCard: React.FC<ChatCardProps> = ({
  avatar,
  name,
  message,
  time,
  tag,
  tagColor = '#A3A3A3', 
  unread,
}) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChatDetail')}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>{message}</Text>
        <View style={styles.row}>
          <View style={[styles.tag, { backgroundColor: tagColor }]}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>

          {unread && <View style={styles.dot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center', 
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#18181B',
  },
  time: {
    color: '#A3A3A3',
    fontSize: 13,
  },
  message: {
    color: '#18181B',
    fontSize: 14,
    marginVertical: 2,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12, 
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FACC15',
    marginLeft: 8,
    marginTop: 4,
  },
});

export default ChatCard;