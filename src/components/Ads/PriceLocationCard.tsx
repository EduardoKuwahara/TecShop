import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Calendar, MapPin } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type PriceLocationCardProps = {
  price: string;
  setPrice: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  date: string;  
  setDate: (v: string) => void;
};

export default function PriceLocationCard({ price, setPrice, location, setLocation, date, setDate }: PriceLocationCardProps) {
  

  const [dateObject, setDateObject] = useState(date ? new Date(date) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const handlePriceChange = (text: string) => {
    const cleanedText = text.replace(/\D/g, '');
    if (cleanedText === '') {
      setPrice('');
      return;
    }
    const numberValue = parseFloat(cleanedText);
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue / 100);
    setPrice(formattedPrice);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    
    const currentDate = selectedDate || dateObject;
    setDateObject(currentDate);

    if (Platform.OS === 'android') {
      if (pickerMode === 'date') {
        setPickerMode('time');
        setShowPicker(true); 
      } else {
        setDate(currentDate.toISOString());
        setPickerMode('date');
      }
    } else {
  
      setDate(currentDate.toISOString());
    }
  };

  const showDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const getFormattedDate = (isoDate: string) => {
    if (!isoDate) return 'Selecione a data e hora';
    return new Date(isoDate).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Preço e localização</Text>
      
      <Text style={styles.label}>Preço</Text>
      <TextInput
        style={styles.input}
        placeholder="R$ 0,00"
        value={price}
        onChangeText={handlePriceChange}
        keyboardType="number-pad"
      />
      
      <Text style={styles.label}>Localização</Text>
      <View style={styles.inputIconRow}>
        <MapPin size={20} color="#A3A3A3" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="Ex: Prédio B, Cantina"
          value={location}
          onChangeText={setLocation}
        />
      </View>
      
      <Text style={styles.label}>Disponível até</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.inputIconRow}>
        <Calendar size={20} color="#A3A3A3" style={styles.icon} />
        <Text style={[styles.dateText, !date && styles.placeholderText]}>
          {getFormattedDate(date)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateObject}
          mode={pickerMode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
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
      color: '#18181B',
    },
    inputIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      height: 44,
    },
    icon: {
      marginLeft: 12,
      marginRight: 4,
    },
    inputWithIcon: {
      flex: 1,
      height: 44,
      paddingHorizontal: 10,
      fontSize: 15,
      color: '#18181B',
    },
    dateText: {
      flex: 1,
      height: 44,
      paddingHorizontal: 10,
      fontSize: 15,
      color: '#18181B',
      textAlignVertical: 'center',
    },
    placeholderText: {
      color: '#A3A3A3',
    },
});