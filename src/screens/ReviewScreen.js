import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {
  fetchProductReviews,
  fetchRecentReviews,
  submitProductReview,
} from '../services/api';
import {palette} from '../theme';

function ReviewScreen({navigation, route}) {
  const product = route.params?.product || null;
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const screenTitle = useMemo(
    () => (product ? 'Share Your Fragrance Experience' : 'Customer Reviews'),
    [product],
  );

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      if (product?.slug) {
        const response = await fetchProductReviews(product.slug);
        setReviews(response.reviews || []);
      } else {
        const response = await fetchRecentReviews();
        setReviews(response || []);
      }
    } catch (error) {
      setReviews([]);
      setErrorMessage(error.message || 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [product]);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews]),
  );

  const handleSubmit = async () => {
    if (!product?.slug) {
      Alert.alert('Open a Product', 'Choose a specific fragrance to submit a review.');
      return;
    }

    if (!reviewTitle.trim() || !reviewText.trim() || !displayName.trim()) {
      Alert.alert('Missing Fields', 'Please complete all review fields before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      await submitProductReview(product.slug, {
        rating: selectedRating,
        title: reviewTitle,
        content: reviewText,
        display_name: displayName,
      });
      await loadReviews();
      Alert.alert(
        'Review Submitted',
        `Thanks for reviewing ${product.name}. Your feedback helps other fragrance lovers shop with confidence.`,
      );
      setSelectedRating(5);
      setReviewTitle('');
      setReviewText('');
      setDisplayName('');
    } catch (error) {
      Alert.alert('Review Error', error.message || 'Unable to submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>{product ? 'PRODUCT REVIEW' : 'COMMUNITY REVIEWS'}</Text>
        <Text style={styles.title}>{screenTitle}</Text>
        <Text style={styles.subtitle}>
          {product
            ? 'Tell future customers how this scent wears, feels, and lasts on you.'
            : 'Browse real customer feedback from the Perfume Treasure community.'}
        </Text>

        {product ? (
          <View style={styles.productCard}>
            <Image source={{uri: product.image}} style={styles.productImage} />
            <View style={styles.productCopy}>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {product ? 'Existing Reviews' : 'Latest Reviews'}
          </Text>
          {loading ? (
            <View style={styles.stateWrap}>
              <ActivityIndicator color={palette.gold} />
            </View>
          ) : errorMessage ? (
            <Text style={styles.stateText}>{errorMessage}</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.stateText}>
              {product
                ? 'No reviews yet. Be the first to share your experience.'
                : 'Customer reviews will appear here as they come in.'}
            </Text>
          ) : (
            reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.display_name}</Text>
                  <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                </View>
                {!product && review.product ? (
                  <Text style={styles.reviewProduct}>{review.product.name}</Text>
                ) : null}
                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewBody}>{review.content}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

        {product ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Leave a Review</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(rating => {
                const active = rating <= selectedRating;
                return (
                  <Pressable
                    key={rating}
                    onPress={() => setSelectedRating(rating)}
                    style={({pressed}) => [
                      styles.starButton,
                      pressed ? styles.starButtonPressed : null,
                    ]}>
                    <Text style={[styles.starText, active ? styles.starTextActive : null]}>
                      ★
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.ratingCaption}>
              {selectedRating === 5
                ? 'Excellent scent and experience'
                : selectedRating === 4
                  ? 'Very good overall'
                  : selectedRating === 3
                    ? 'Good, with some room to improve'
                    : selectedRating === 2
                      ? 'Below expectations'
                      : 'Not satisfied'}
            </Text>

            <Text style={styles.sectionTitle}>Review Title</Text>
            <TextInput
              onChangeText={setReviewTitle}
              placeholder="Example: Elegant, long-lasting, and worth it"
              placeholderTextColor={palette.textMuted}
              style={styles.singleLineInput}
              value={reviewTitle}
            />

            <Text style={styles.sectionTitle}>Your Review</Text>
            <TextInput
              multiline
              onChangeText={setReviewText}
              placeholder="Describe the scent profile, projection, longevity, packaging, and whether you would buy it again."
              placeholderTextColor={palette.textMuted}
              style={styles.textArea}
              textAlignVertical="top"
              value={reviewText}
            />

            <Text style={styles.sectionTitle}>Display Name</Text>
            <TextInput
              onChangeText={setDisplayName}
              placeholder="How your name should appear"
              placeholderTextColor={palette.textMuted}
              style={styles.singleLineInput}
              value={displayName}
            />

            <Pressable
              disabled={submitting}
              onPress={handleSubmit}
              style={({pressed}) => [
                styles.button,
                pressed ? styles.buttonPressed : null,
                submitting ? styles.buttonDisabled : null,
              ]}>
              {submitting ? (
                <ActivityIndicator color={palette.black} />
              ) : (
                <Text style={styles.buttonText}>Submit Product Review</Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 46,
    paddingBottom: 28,
  },
  backText: {
    color: palette.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  eyebrow: {
    color: palette.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: palette.charcoal,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#7b6b51',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  productCard: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 82,
    height: 82,
    borderRadius: 14,
    backgroundColor: palette.cream,
    marginRight: 14,
  },
  productCopy: {
    flex: 1,
  },
  productCategory: {
    color: '#8e7a53',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    color: palette.charcoal,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  productPrice: {
    color: palette.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    color: palette.charcoal,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 2,
  },
  stateWrap: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  stateText: {
    color: '#7b6b51',
    fontSize: 14,
    lineHeight: 22,
  },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 14,
    marginTop: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    color: palette.charcoal,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewRating: {
    color: palette.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewProduct: {
    color: '#8e7a53',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reviewTitle: {
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  reviewBody: {
    color: '#6d5f49',
    fontSize: 14,
    lineHeight: 22,
  },
  reviewDate: {
    color: '#9a8a72',
    fontSize: 12,
    marginTop: 8,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    marginRight: 10,
  },
  starButtonPressed: {
    opacity: 0.85,
  },
  starText: {
    fontSize: 34,
    color: '#d5c8aa',
  },
  starTextActive: {
    color: palette.gold,
  },
  ratingCaption: {
    color: '#7b6b51',
    fontSize: 14,
    marginBottom: 18,
  },
  singleLineInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    color: palette.charcoal,
    fontSize: 15,
    marginBottom: 18,
  },
  textArea: {
    minHeight: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    color: palette.charcoal,
    fontSize: 15,
    marginBottom: 18,
  },
  button: {
    backgroundColor: palette.goldSoft,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: palette.black,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ReviewScreen;
