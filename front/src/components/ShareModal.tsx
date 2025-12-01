import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Share,
    ActivityIndicator,
} from 'react-native';
import { X, Share2, MessageCircle, Mail, Copy, ExternalLink } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { API_BASE_URL } from '../config';

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
    adId: string;
    adTitle: string;
    adPrice: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    visible,
    onClose,
    adId,
    adTitle,
    adPrice
}) => {
    const [shareUrl, setShareUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [shareText, setShareText] = useState<string>('');
    
    useEffect(() => {
        if (visible) {
            generateShareLink();
        }
    }, [visible, adId]);

    const generateShareLink = async () => {
        setLoading(true);
        try {
            // Remove /api from API_BASE_URL since it's already included in config
            const apiUrl = API_BASE_URL.replace('/api', '');
            const response = await fetch(`${apiUrl}/api/share/generate-link/${adId}`);
            
            // Verificar se a resposta é JSON válido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta não é JSON válido');
            }
            
            const data = await response.json();
            
            if (response.ok && data.shareUrl) {
                setShareUrl(data.shareUrl);
                setShareText(`Confira este anúncio: ${adTitle} - ${adPrice}\n\n${data.shareUrl}`);
            } else {
                throw new Error(data.error || 'Erro ao gerar link');
            }
        } catch (error) {
            console.error('Erro ao gerar link de compartilhamento:', error);
            // Fallback para URL local
            const fallbackSlug = createSlug(adTitle) + '-' + adId;
            const baseUrl = API_BASE_URL.replace('/api', '');
            const fallbackUrl = `${baseUrl}/share/ad/${fallbackSlug}`;
            setShareUrl(fallbackUrl);
            setShareText(`Confira este anúncio: ${adTitle} - ${adPrice}\n\n${fallbackUrl}`);
        } finally {
            setLoading(false);
        }
    };
        } finally {
            setLoading(false);
        }
    };

    const createSlug = (title: string): string => {
        return title
            .toLowerCase()
            .normalize('NFD') 
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '') 
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleNativeShare = async () => {
        if (loading || !shareUrl) return;
        
        try {
            await Share.share({
                message: shareText,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            Alert.alert('Erro', 'Não foi possível compartilhar o anúncio.');
        }
    };

    const handleWhatsAppShare = () => {
        if (loading || !shareUrl) return;
        
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        Linking.openURL(whatsappUrl).catch(() => {
            Alert.alert('Erro', 'WhatsApp não está instalado neste dispositivo.');
        });
    };

    const handleEmailShare = () => {
        if (loading || !shareUrl) return;
        
        const subject = encodeURIComponent(`Anúncio TecShop: ${adTitle}`);
        const body = encodeURIComponent(shareText);
        const emailUrl = `mailto:?subject=${subject}&body=${body}`;
        Linking.openURL(emailUrl);
    };

    const handleCopyLink = async () => {
        if (loading || !shareUrl) return;
        
        try {
            await Clipboard.setStringAsync(shareUrl);
            Alert.alert('Sucesso', 'Link copiado para a área de transferência!');
            onClose();
        } catch (error) {
            console.error('Erro ao copiar link:', error);
            Alert.alert('Erro', 'Não foi possível copiar o link.');
        }
    };

    const handleOpenBrowser = () => {
        if (loading || !shareUrl) return;
        
        Linking.openURL(shareUrl);
    };

    const shareOptions = [
        {
            icon: Share2,
            title: 'Compartilhar',
            subtitle: 'Usar menu do sistema',
            onPress: handleNativeShare,
            color: '#007AFF'
        },
        {
            icon: MessageCircle,
            title: 'WhatsApp',
            subtitle: 'Enviar no WhatsApp',
            onPress: handleWhatsAppShare,
            color: '#25D366'
        },
        {
            icon: Mail,
            title: 'E-mail',
            subtitle: 'Enviar por e-mail',
            onPress: handleEmailShare,
            color: '#FF3B30'
        },
        {
            icon: Copy,
            title: 'Copiar Link',
            subtitle: 'Copiar para área de transferência',
            onPress: handleCopyLink,
            color: '#8E8E93'
        },
        {
            icon: ExternalLink,
            title: 'Abrir no Navegador',
            subtitle: 'Visualizar no navegador',
            onPress: handleOpenBrowser,
            color: '#34C759'
        }
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Compartilhar Anúncio</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.adInfo}>
                        <Text style={styles.adTitle} numberOfLines={2}>{adTitle}</Text>
                        <Text style={styles.adPrice}>{adPrice}</Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Gerando link de compartilhamento...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.optionsContainer}>
                                {shareOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionButton}
                                        onPress={option.onPress}
                                        disabled={loading}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: option.color + '15' }]}>
                                            <option.icon size={24} color={option.color} />
                                        </View>
                                        <View style={styles.optionText}>
                                            <Text style={styles.optionTitle}>{option.title}</Text>
                                            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {shareUrl ? (
                                <View style={styles.linkContainer}>
                                    <Text style={styles.linkLabel}>Link do anúncio:</Text>
                                    <TouchableOpacity 
                                        style={styles.linkButton}
                                        onPress={handleOpenBrowser}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.linkText} numberOfLines={2}>{shareUrl}</Text>
                                        <ExternalLink size={16} color="#007AFF" style={styles.linkIcon} />
                                    </TouchableOpacity>
                                    <Text style={styles.linkHint}>Toque para abrir o link</Text>
                                </View>
                            ) : null}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    adInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    adTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    adPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFA800',
    },
    optionsContainer: {
        padding: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    linkContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    linkLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    linkButton: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    linkText: {
        fontSize: 12,
        color: '#007AFF',
        fontFamily: 'monospace',
        flex: 1,
        marginRight: 8,
    },
    linkIcon: {
        marginLeft: 4,
    },
    linkHint: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});