import React, {useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {palette} from '../theme';

const sampleProduct = {
  name: 'Midnight Oud',
  category: 'Men',
  price: 96,
  image: 'https://via.placeholder.com/400x400.png?text=Midnight+Oud',
};

function ReviewScreen({navigation}) {
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = () => {
    if (!reviewTitle.trim() || !reviewText.trim() || !displayName.trim()) {
      Alert.alert('Missing Fields', 'Please complete all review fields before submitting.');
      return;
    }

    Alert.alert(
      'Review Submitted',
      `Thanks for reviewing ${sampleProduct.name}. Your feedback helps other fragrance lovers shop with confidence.`,
    );
    setSelectedRating(5);
    setReviewTitle('');
    setReviewText('');
    setDisplayName('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>PRODUCT REVIEW</Text>
        <Text style={styles.title}>Share Your Fragrance Experience</Text>
        <Text style={styles.subtitle}>
          Tell future customers how this scent wears, feels, and lasts on you.
        </Text>

        <View style={styles.productCard}>
          <Image source={{uri: sampleProduct.image}} style={styles.productImage} />
          <View style={styles.productCopy}>
            <Text style={styles.productCategory}>{sampleProduct.category}</Text>
            <Text style={styles.productName}>{sampleProduct.name}</Text>
            <Text style={styles.productPrice}>${sampleProduct.price.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
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
            onPress={handleSubmit}
            style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <Text style={styles.buttonText}>Submit Product Review</Text>
          </Pressable>
        </View>
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
  },
  sectionTitle: {
    color: palette.charcoal,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 2,
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
    paddingVertical: 14,
    color: palette.charcoal,
    fontSize: 15,
    marginBottom: 18,
  },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReviewScreen;
