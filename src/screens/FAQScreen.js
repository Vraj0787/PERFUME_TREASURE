import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const FAQScreen = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is your return policy?",
      answer: "You can return any perfume within 30 days of purchase."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide. Shipping fees may vary."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery usually takes 3-7 business days."
    }
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

