import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {palette} from '../theme';

const FAQScreen = ({navigation}) => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Are your perfumes authentic?",
      answer: "Yes, at Perfume Treasure, we only sell 100% authentic, high-quality perfumes sourced from reputable brands and suppliers."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we primarily ship within [your country or regions you ship to], but we are working on expanding our services. Please check our shipping policy for updates."
    },
    {
      question: "How long does shipping take?",
      answer: "Orders are typically processed within a couple of business days and delivered within 5-10 business days, depending on your location. You will receive a tracking number once your order is shipped."
    },
    {
      question: "What is your return and refund policy?",
      answer: "We accept returns on unopened and unused perfumes within [X] days of delivery. If you receive a damaged or incorrect item, please contact us at Info@perfumetreasure.net for assistance."
    },
    {
      question: "Do you offer discounts or promotions?",
      answer: "Yes! We regularly offer discounts, promotions, and special deals. Sign up for our newsletter or follow us on social media to stay updated."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, once your order is shipped, we will provide you with a tracking number via email so you can monitor your package’s status."
    },
    {
      question: "Do you offer gift wrapping or personalized messages?",
      answer: "Yes! We offer gift wrapping and personalized messages for special occasions. You can select this option at checkout."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team via email at Info@perfumetreasure.net. We aim to respond within 24-48 hours."
    },
    {
      question: "Are your perfumes long-lasting?",
      answer: "Yes, our collection includes high-quality perfumes with long-lasting fragrances. However, longevity may vary depending on skin type and application."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.eyebrow}>PERFUME TREASURE</Text>
      <Text style={styles.title}>Frequently Asked Questions</Text>

      {faqs.map((item, index) => (
        <View key={index} style={styles.itemWrap}>
          <Pressable onPress={() => toggleFAQ(index)} style={styles.questionBox}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.chevron}>{openIndex === index ? '-' : '+'}</Text>
          </Pressable>

          {openIndex === index && (
            <Text style={styles.answer}>{item.answer}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory,
    paddingHorizontal: 18,
    paddingTop: 46,
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
    fontSize: 32,
    fontWeight: '700',
    color: palette.charcoal,
    marginBottom: 16,
  },
  itemWrap: {
    marginBottom: 10,
  },
  questionBox: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontWeight: '700',
    color: palette.charcoal,
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    color: palette.gold,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
  answer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#7b6b51',
    fontSize: 14,
    lineHeight: 22,
    backgroundColor: palette.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
});
