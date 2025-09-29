import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

export type CategoryBarProps = {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
};

export default function CategoryBar({ categories, selected, onSelect }: CategoryBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat}
          style={[styles.categoryBtn, selected === cat && styles.categoryBtnActive]}
          onPress={() => onSelect(cat)}
        >
          <Text style={[styles.categoryText, selected === cat && styles.categoryTextActive]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categories: {
    flexGrow: 0,
    marginLeft: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  categoryBtn: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#FACC15',
  },
  categoryText: {
    color: '#18181B',
    fontSize: 15,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
