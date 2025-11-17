import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { RatingStars } from './RatingStars';

interface Rating {
    userId: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

interface RatingsData {
    ratings: Rating[];
    averageRating: number;
    ratingCount: number;
}

interface RatingListProps {
    adId: string;
}

export const RatingList: React.FC<RatingListProps> = ({ adId }) => {
    const [ratingsData, setRatingsData] = useState<RatingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const fetchRatings = async () => {
        try {
            const response = await fetch(`http://10.226.241.139:3001/ads/${adId}/ratings`);
            if (response.ok) {
                const data = await response.json();
                setRatingsData(data);
            }
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, [adId]);



    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderRatingItem = ({ item }: { item: Rating }) => (
        <View style={styles.ratingItem}>
            <View style={styles.ratingHeader}>
                <RatingStars rating={item.rating} readonly size={16} />
                <Text style={styles.ratingDate}>{formatDate(item.createdAt)}</Text>
            </View>
            {item.comment && (
                <Text style={styles.ratingComment}>{item.comment}</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando avaliações...</Text>
            </View>
        );
    }

    if (!ratingsData || ratingsData.ratingCount === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Ainda não há avaliações para este anúncio</Text>
            </View>
        );
    }

    const displayedRatings = showAll ? ratingsData.ratings : ratingsData.ratings.slice(0, 3);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Avaliações ({ratingsData.ratingCount})</Text>
                <View style={styles.averageRating}>
                    <RatingStars rating={Math.round(ratingsData.averageRating)} readonly size={18} />
                    <Text style={styles.averageText}>{ratingsData.averageRating.toFixed(1)}</Text>
                </View>
            </View>

            <View>
                {displayedRatings.map((item, index) => (
                    <View key={`${item.userId}-${index}`}>
                        {renderRatingItem({ item })}
                    </View>
                ))}
            </View>

            {ratingsData.ratings.length > 3 && (
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAll(!showAll)}
                >
                    <Text style={styles.showMoreText}>
                        {showAll ? 'Mostrar menos' : `Ver todas (${ratingsData.ratingCount})`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    averageRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    averageText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    ratingItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    ratingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingDate: {
        fontSize: 12,
        color: '#666',
    },
    ratingComment: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    showMoreButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    showMoreText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});