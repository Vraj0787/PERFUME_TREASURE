import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const FAQScreen = () => {
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
    },
    {
      question: "Can I request a specific perfume if it’s not listed on your website?",
      answer: "We always strive to expand our collection! If you're looking for a specific perfume, feel free to email us at Info@perfumetreasure.net, and we will do our best to source it for you."
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>

      {faqs.map((item, index) => (
        <View key={index}>
          <TouchableOpacity onPress={() => toggleFAQ(index)} style={styles.questionBox}>
            <Text style={styles.question}>{item.question}</Text>
          </TouchableOpacity>

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
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  questionBox: {
    backgroundColor: '#ddd',
    padding: 10,
    marginTop: 8
  },
  question: {
    fontWeight: 'bold'
  },
  answer: {
    padding: 10
  }
});

