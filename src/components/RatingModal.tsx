import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { RatingStars } from './RatingStars';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    adId: string;
    adTitle: string;
    onRatingSubmitted: (rating: number, comment?: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
    visible,
    onClose,
    adId,
    adTitle,
    onRatingSubmitted
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token } = useAuth();

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Erro', 'Por favor, selecione uma avaliação.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado. Faça login novamente.');
                setIsSubmitting(false);
                return;
            }

            console.log('Enviando avaliação com token:', token.substring(0, 20) + '...');
            console.log('URL da requisição:', `${API_BASE_URL}/ads/${adId}/ratings`);

            const response = await fetch(`${API_BASE_URL}/ads/${adId}/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating,
                    comment: comment.trim()
                }),
            });

            if (response.ok) {
                onRatingSubmitted(rating, comment.trim());
                resetForm();
                onClose();
                Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
            } else {
                const errorData = await response.json();
                console.log('Erro do servidor:', errorData);
                console.log('Status da resposta:', response.status);
                Alert.alert('Erro', `${errorData.error || 'Erro ao enviar avaliação.'} (Status: ${response.status})`);
            }
        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
            Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setComment('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.title}>Avaliar Anúncio</Text>
                            <Text style={styles.adTitle} numberOfLines={2}>
                                {adTitle}
                            </Text>

                            <View style={styles.ratingSection}>
                                <Text style={styles.sectionTitle}>Sua avaliação:</Text>
                                <RatingStars
                                    rating={rating}
                                    onRatingPress={setRating}
                                    size={32}
                                />
                                <Text style={styles.ratingText}>
                                    {rating > 0 ? `${rating} de 5 estrelas` : 'Toque nas estrelas para avaliar'}
                                </Text>
                            </View>

                            <View style={styles.commentSection}>
                                <Text style={styles.sectionTitle}>Comentário (opcional):</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    multiline
                                    numberOfLines={4}
                                    maxLength={200}
                                    placeholder="Deixe um comentário sobre este anúncio..."
                                    value={comment}
                                    onChangeText={setComment}
                                    textAlignVertical="top"
                                />
                                <Text style={styles.charCount}>{comment.length}/200</Text>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleClose}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardAvoid: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    adTitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    commentSection: {
        marginBottom: 20,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
    },
    charCount: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#007AFF',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#B0B0B0',
    },
});