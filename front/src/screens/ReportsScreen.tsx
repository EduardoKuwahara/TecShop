import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Flag, AlertTriangle, CheckCircle2, Clock3, Trash2 } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

type ReportStatus = 'pending' | 'in_review' | 'resolved';

type Report = {
  _id: string;
  adId: string;
  adTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pendente',
  in_review: 'Em análise',
  resolved: 'Resolvido',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: '#F97316',
  in_review: '#3B82F6',
  resolved: '#16A34A',
};

export default function ReportsScreen() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports;
    return reports.filter(report => report.status === statusFilter);
  }, [reports, statusFilter]);

  const fetchReports = useCallback(async () => {
    if (!token || user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setReports(data);
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível carregar denúncias.');
      }
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
      Alert.alert('Erro', 'Falha de conexão ao carregar denúncias.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user?.role]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReports();
    }, [fetchReports])
  );

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setReports(prev =>
          prev.map(report => (report._id === reportId ? { ...report, ...data.report } : report))
        );
        Alert.alert('Sucesso', `Status atualizado para ${STATUS_LABELS[newStatus]}.`);
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível atualizar o status.');
      }
    } catch (error) {
      console.error('Erro ao atualizar denúncia:', error);
      Alert.alert('Erro', 'Falha de conexão ao atualizar denúncia.');
    }
  };

  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (!token) return;

    Alert.alert(
      'Excluir Anúncio',
      `Tem certeza que deseja excluir o anúncio "${adTitle}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/ads/${adId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                // Remove relatórios relacionados ao anúncio excluído
                setReports(prev => prev.filter(report => report.adId !== adId));
                Alert.alert('Sucesso', 'Anúncio excluído com sucesso.');
              } else {
                const data = await response.json();
                Alert.alert('Erro', data.error || 'Não foi possível excluir o anúncio.');
              }
            } catch (error) {
              console.error('Erro ao excluir anúncio:', error);
              Alert.alert('Erro', 'Falha de conexão ao excluir anúncio.');
            }
          },
        },
      ]
    );
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Flag size={18} color={STATUS_COLORS[item.status]} />
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.adTitle}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Motivo</Text>
      <Text style={styles.value}>{item.reason}</Text>

      {item.description ? (
        <>
          <Text style={styles.label}>Detalhes</Text>
          <Text style={styles.value}>{item.description}</Text>
        </>
      ) : null}

      <Text style={styles.label}>Denunciado por</Text>
      <Text style={styles.value}>
        {item.reporterName} • {item.reporterEmail}
      </Text>

      <Text style={styles.metaText}>
        Enviado em {new Date(item.createdAt).toLocaleString('pt-BR')}
      </Text>

      <View style={styles.actionsRow}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => handleStatusChange(item._id, 'in_review')}
          >
            <Clock3 size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Marcar em análise</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'resolved' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resolveButton]}
            onPress={() => handleStatusChange(item._id, 'resolved')}
          >
            <CheckCircle2 size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Marcar resolvido</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAd(item.adId, item.adTitle)}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Excluir Anúncio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFA800" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {['all', 'pending', 'in_review', 'resolved'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              statusFilter === status && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(status as 'all' | ReportStatus)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status && styles.filterTextActive,
              ]}
            >
              {status === 'all' ? 'Todos' : STATUS_LABELS[status as ReportStatus]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={item => item._id}
        renderItem={renderReport}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color="#D4D4D8" />
            <Text style={styles.emptyTitle}>Nenhuma denúncia encontrada</Text>
            <Text style={styles.emptySubtitle}>
              {statusFilter === 'all'
                ? 'Nenhum usuário fez denúncias até o momento.'
                : 'Não há denúncias com esse status.'}
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E4E4E7',
  },
  filterChipActive: {
    backgroundColor: '#18181B',
  },
  filterText: {
    color: '#3F3F46',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 6,
  },
  value: {
    fontSize: 15,
    color: '#18181B',
  },
  metaText: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  reviewButton: {
    backgroundColor: '#3B82F6',
  },
  resolveButton: {
    backgroundColor: '#16A34A',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});


