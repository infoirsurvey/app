import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Assignment } from '@ir-political-strategies/shared';

export const SurveyForm = ({ route, navigation }: any) => {
  const { assignment } = route.params as { assignment: Assignment };
  const [male, setMale] = useState('');
  const [female, setFemale] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!male || !female) {
      Alert.alert('Error', 'Please fill demographics');
      return;
    }
    setIsSubmitting(true);
    try {
      // Create survey entry
      await addDoc(collection(db, 'surveys'), {
        assignmentId: assignment.id,
        surveyorId: auth.currentUser?.uid,
        locationData: assignment.location,
        sampleData: {
          gender: { male: parseInt(male), female: parseInt(female), other: 0 },
          totalSample: parseInt(male) + parseInt(female)
        },
        observations,
        locked: true, // Submitted survey is locked for Surveyor
        submittedAt: serverTimestamp(),
      });

      // Update assignment status
      await updateDoc(doc(db, 'assignments', assignment.id), {
        status: 'SUBMITTED'
      });

      Alert.alert('Success', 'Survey submitted successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{assignment.electionType} Survey</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demographics</Text>
        <Text>Male Count</Text>
        <TextInput value={male} onChangeText={setMale} keyboardType="numeric" style={styles.input} />
        <Text>Female Count</Text>
        <TextInput value={female} onChangeText={setFemale} keyboardType="numeric" style={styles.input} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observations</Text>
        <TextInput
          value={observations}
          onChangeText={setObservations}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />
      </View>
      <Button title={isSubmitting ? "Submitting..." : "Submit Survey"} onPress={handleSubmit} disabled={isSubmitting} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginTop: 5, backgroundColor: 'white' }
});
