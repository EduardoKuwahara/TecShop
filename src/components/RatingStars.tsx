import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
    rating: number;
    onRatingPress?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
    color?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    onRatingPress,
    size = 20,
    readonly = false,
    color = '#FFD700'
}) => {
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= rating;
            const isHalfFilled = i - 0.5 === rating;
            
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => !readonly && onRatingPress?.(i)}
                    disabled={readonly}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={isFilled ? 'star' : isHalfFilled ? 'star-half' : 'star-outline'}
                        size={size}
                        color={isFilled || isHalfFilled ? color : '#E0E0E0'}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            {renderStars()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starButton: {
        padding: 2,
    },
});