import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../src/firebase';
import { Assignment } from '@ir-political-strategies/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SurveyFormScreen() {
  const { id } = useLocalSearchParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [male, setMale] = useState('');
  const [female, setFemale] = useState('');
  const [sc, setSc] = useState('');
  const [st, setSt] = useState('');
  const [bc, setBc] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      const snap = await getDoc(doc(db, 'assignments', id as string));
      if (snap.exists()) setAssignment({ id: snap.id, ...snap.data() } as Assignment);
    };
    fetchAssignment();
  }, [id]);

  const handleSubmit = async () => {
    if (!male || !female || !assignment) {
      Alert.alert('Error', 'Please fill demographics');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'surveys'), {
        assignmentId: assignment.id,
        surveyorId: auth.currentUser?.uid,
        locationData: assignment.location,
        sampleData: {
          gender: { male: parseInt(male), female: parseInt(female), other: 0 },
          categories: { sc: parseInt(sc) || 0, st: parseInt(st) || 0, bc: parseInt(bc) || 0 },
          totalSample: parseInt(male) + parseInt(female)
        },
        observations,
        locked: true,
        submittedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'assignments', assignment.id), { status: 'SUBMITTED' });

      Alert.alert('Success', 'Survey submitted successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{assignment.electionType} Survey</Text>

      {/* Conditional Rendering based on Election Type */}
      {assignment.electionType === 'MLA' && (
        <View style={styles.infoBox}>
            <Text style={styles.infoText}>Performing Assembly Constituency Level Survey</Text>
        </View>
      )}

      {assignment.electionType === 'MP' && (
        <View style={styles.infoBox}>
            <Text style={styles.infoText}>Performing Parliamentary Constituency Level Survey</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demographics</Text>
        <Text>Male Count</Text>
        <TextInput value={male} onChangeText={setMale} keyboardType="numeric" style={styles.input} />
        <Text>Female Count</Text>
        <TextInput value={female} onChangeText={setFemale} keyboardType="numeric" style={styles.input} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories (Caste)</Text>
        <Text>SC Count</Text>
        <TextInput value={sc} onChangeText={setSc} keyboardType="numeric" style={styles.input} />
        <Text>ST Count</Text>
        <TextInput value={st} onChangeText={setSt} keyboardType="numeric" style={styles.input} />
        <Text>BC Count</Text>
        <TextInput value={bc} onChangeText={setBc} keyboardType="numeric" style={styles.input} />
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
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginTop: 5, backgroundColor: 'white' },
  infoBox: { backgroundColor: '#e3f2fd', padding: 10, borderRadius: 5, marginBottom: 20 },
  infoText: { color: '#0d47a1', fontSize: 14, fontWeight: 'bold' },
});
