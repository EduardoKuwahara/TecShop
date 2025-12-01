import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Flag, X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
};

const REASONS = [
  'Conteúdo impróprio',
  'Informações falsas',
  'Suspeita de golpe',
  'Spam / repetido',
  'Outro',
];

export const ReportModal: React.FC<ReportModalProps> = ({ visible, onClose, adId, adTitle }) => {
  const { token } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setSelectedReason('');
    setDescription('');
  };

  const handleClose = () => {
    if (!submitting) {
      resetState();
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Login necessário', 'Faça login para denunciar um anúncio.');
      return;
    }
    if (!selectedReason) {
      Alert.alert('Campo obrigatório', 'Escolha um motivo para a denúncia.');
      return;
    }

    setSubmitting(true);
    try {
      const url = `${API_BASE_URL}/ads/${adId}/report`;
      console.log('Enviando denúncia para URL:', url);
      console.log('Token presente:', token ? 'sim' : 'não');
      console.log('Dados da denúncia:', { reason: selectedReason, description: description.trim() });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: selectedReason,
          description: description.trim(),
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Resposta não JSON:', textResponse.substring(0, 200));
        throw new Error('Resposta não é JSON válido');
      }

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Denúncia enviada', 'Os administradores analisarão este anúncio.');
        resetState();
        onClose();
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível enviar a denúncia.');
      }
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
      Alert.alert('Erro', 'Falha de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Flag color="#EF4444" size={22} />
              <Text style={styles.title}>Denunciar Anúncio</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={submitting}>
              <X size={22} color="#71717A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>Anúncio: {adTitle}</Text>

            <Text style={styles.sectionLabel}>Motivo da denúncia</Text>
            <View style={styles.reasonContainer}>
              {REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.reasonButtonActive,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Detalhes (opcional)</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Descreva o que há de errado com este anúncio..."
              placeholderTextColor="#A1A1AA"
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Enviar denúncia</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181B',
  },
  subtitle: {
    fontSize: 14,
    color: '#52525B',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 8,
  },
  reasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  reasonButton: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  reasonButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  reasonText: {
    color: '#3F3F46',
    fontSize: 14,
  },
  reasonTextActive: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#18181B',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


