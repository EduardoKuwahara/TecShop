import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Clock, MapPin, Mail, Phone, ArrowLeft, Star, Share2, Flag } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RatingModal } from '../components/RatingModal';
import { RatingList } from '../components/RatingList';
import { ShareModal } from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';
import { ReportModal } from '../components/ReportModal';


type Seller = {
    nome: string;
    curso: string;
    email: string;
    contato: string;
};

function SellerCard({ seller }: { seller: Seller }) {
    return (
        <View style={styles.sellerCard}>
            <Text style={styles.sellerTitle}>Sobre o vendedor</Text>
            <View style={styles.sellerRow}>
                <Image source={{ uri: `https://ui-avatars.com/api/?name=${seller.nome}&background=E5E7EB&color=18181B` }} style={styles.sellerAvatar} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.sellerName}>{seller.nome}</Text>
                    <Text style={styles.sellerCourse}>{seller.curso}</Text>
                </View>
            </View>
            <View style={styles.sellerContactContainer}>
                <View style={styles.sellerContactRow}>
                    <Mail size={18} color="#71717A" />
                    <Text style={styles.sellerContactText}>{seller.email}</Text>
                </View>
                <View style={styles.sellerContactRow}>
                    <Phone size={18} color="#71717A" />
                    <Text style={styles.sellerContactText}>{seller.contato}</Text>
                </View>
            </View>
        </View>
    );
}

export default function AdDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { ad } = route.params;
    const { user } = useAuth();
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [refreshRatings, setRefreshRatings] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const categoryImages: Record<string, string> = {
        'Comida': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        'Serviço': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
        'Livros/Materiais': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
    };
    function getImageUrl(category: string) {
        return categoryImages[category] || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80';
    }
    const imageUrl = ad.imageUrl && ad.imageUrl.trim() !== '' ? ad.imageUrl : getImageUrl(ad.category);

    const formattedTime = new Date(ad.availableUntil).toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });

    const handleRatePress = () => {
        if (!user) {
            Alert.alert('Login necessário', 'Você precisa estar logado para avaliar anúncios.');
            return;
        }
        
        console.log('Usuário logado:', user);
        console.log('ID do autor do anúncio:', ad.authorId);
        
        if (user.id === ad.authorId) {
            Alert.alert('Não permitido', 'Você não pode avaliar seu próprio anúncio.');
            return;
        }

        setShowRatingModal(true);
    };

    const handleRatingSubmitted = (rating: number, comment?: string) => {
        // Força a atualização da lista de avaliações
        setRefreshRatings(prev => prev + 1);
    };

    const handleReportPress = () => {
        if (!user) {
            Alert.alert('Login necessário', 'Você precisa estar logado para denunciar um anúncio.');
            return;
        }
        if (user.id === ad.authorId) {
            Alert.alert('Não permitido', 'Você não pode denunciar seu próprio anúncio.');
            return;
        }
        setShowReportModal(true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Força a atualização das avaliações
        setRefreshRatings(prev => prev + 1);
        // Simula um delay para o refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#18181B" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Detalhes do Anúncio</Text>

                {/* Botão de Compartilhar */}
                <TouchableOpacity onPress={() => setShowShareModal(true)}>
                    <Share2 size={24} color="#18181B" />
                </TouchableOpacity>

            </View>

            <Image
                source={{ uri: imageUrl }}
                style={styles.adImage}
            />

            <View style={styles.adInfoBox}>
                <View style={styles.adInfoHeader}>
                    <Text style={styles.adTitle}>{ad.title}</Text>
                    <View style={styles.priceTag}><Text style={styles.priceText}>{ad.price}</Text></View>
                </View>
                <View style={styles.adInfoRowDisponibilidade}>
                    <Clock size={16} color="#A3A3A3" style={{ marginRight: 4, marginTop: 1 }} />
                    <Text style={styles.adAvailable}>Disponível até {formattedTime}</Text>
                </View>
                <Text style={styles.adDesc}>{ad.description}</Text>
                <View style={styles.adLocationRow}>
                    <MapPin size={16} color="#A3A3A3" style={{ marginRight: 4 }} />
                    <Text style={styles.adLocation}>{ad.location}</Text>
                </View>
            </View>

            <View style={styles.actionButtonsContainer}>
                {user && user.id !== ad.authorId && (
                    <TouchableOpacity style={styles.ratingButton} onPress={handleRatePress}>
                        <Star size={20} color="#FFF" />
                        <Text style={styles.ratingButtonText}>Avaliar este anúncio</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.reportButton} onPress={handleReportPress}>
                    <Flag size={18} color="#FFF" />
                    <Text style={styles.reportButtonText}>Denunciar</Text>
                </TouchableOpacity>
            </View>

            <SellerCard seller={ad.authorDetails} />
            
            {/* Lista de Avaliações */}
            <RatingList adId={ad._id} key={refreshRatings} />

            {/* Modal de Avaliação */}
            <RatingModal
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                adId={ad._id}
                adTitle={ad.title}
                onRatingSubmitted={handleRatingSubmitted}
            />

            {/* Modal de Compartilhamento */}
            <ShareModal
                visible={showShareModal}
                onClose={() => setShowShareModal(false)}
                adId={ad._id}
                adTitle={ad.title}
                adPrice={ad.price}
            />
            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                adId={ad._id}
                adTitle={ad.title}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#F3F4F6'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#18181B'
    },
    adImage: { width: '100%', height: 220, resizeMode: 'cover' },
    adInfoBox: { backgroundColor: '#fff', padding: 18, marginBottom: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
    adInfoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 4,
        gap: 8,
    },
    adTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#18181B',
        flex: 1,
        marginRight: 8,
        textAlignVertical: 'top',
        textAlign: 'left',
    },
    priceTag: { backgroundColor: '#FFA800', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
    priceText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.2 },
    adInfoRowDisponibilidade: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 2 },
    adAvailable: { color: '#A3A3A3', fontSize: 16, fontWeight: '400', marginLeft: 0, paddingLeft: 0 },
    adDesc: { color: '#3F3F46', fontSize: 15, marginBottom: 16, marginTop: 0, lineHeight: 22 },
    adLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 0, borderTopWidth: 0, paddingTop: 0 },
    adLocation: { color: '#A3A3A3', fontSize: 15, marginLeft: 0 },

    sellerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 16, marginTop: 0 },
    sellerTitle: { fontWeight: 'bold', fontSize: 16, color: '#18181B', marginBottom: 12 },
    sellerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sellerAvatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
    sellerName: { fontWeight: 'bold', fontSize: 16, color: '#18181B' },
    sellerCourse: { color: '#71717A', fontSize: 14 },
    sellerContactContainer: { borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 8 },
    sellerContactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    sellerContactText: { color: '#3F3F46', fontSize: 14, marginLeft: 8 },
    
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    ratingButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    ratingButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    reportButton: {
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        gap: 6,
    },
    reportButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
});