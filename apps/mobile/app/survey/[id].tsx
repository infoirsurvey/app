import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
  const [partySupport, setPartySupport] = useState<Record<string, string>>({});
  const [parties, setParties] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      const snap = await getDoc(doc(db, 'assignments', id as string));
      if (snap.exists()) setAssignment({ id: snap.id, ...snap.data() } as Assignment);
    };
    fetchAssignment();

    const unsubParties = onSnapshot(collection(db, 'parties'), (snap) => {
        const p: any[] = [];
        snap.forEach(d => p.push({ id: d.id, ...d.data() }));
        setParties(p);
    });

    return unsubParties;
  }, [id]);

  const handlePartySupportChange = (partyName: string, value: string) => {
      setPartySupport(prev => ({ ...prev, [partyName]: value }));
  };

  const handleSubmit = async () => {
    if (!male || !female || !assignment) {
      Alert.alert('Error', 'Please fill demographics');
      return;
    }

    const totalSupport = Object.values(partySupport).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    if (Math.abs(totalSupport - 100) > 0.1) {
        Alert.alert('Error', `Party support total must be 100%. Current total: ${totalSupport}%`);
        return;
    }

    setIsSubmitting(true);
    try {
      const partySupportNumeric: Record<string, number> = {};
      Object.entries(partySupport).forEach(([name, val]) => {
          partySupportNumeric[name] = parseFloat(val) || 0;
      });

      await addDoc(collection(db, 'surveys'), {
        assignmentId: assignment.id,
        surveyorId: auth.currentUser?.uid,
        locationData: assignment.location,
        sampleData: {
          gender: { male: parseInt(male) || 0, female: parseInt(female) || 0, other: 0 },
          categories: { sc: parseInt(sc) || 0, st: parseInt(st) || 0, bc: parseInt(bc) || 0 },
          totalSample: (parseInt(male) || 0) + (parseInt(female) || 0)
        },
        partySupport: partySupportNumeric,
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

  if (!assignment) return <View style={styles.loading}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{assignment.electionType} Survey</Text>

      {/* Info Box */}
      <View style={styles.infoBox}>
          <Text style={styles.infoText}>Target Area: {assignment.location.constituencyId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Demographics (Gender)</Text>
        <View style={styles.row}>
            <View style={styles.col}>
                <Text style={styles.label}>Male Count</Text>
                <TextInput value={male} onChangeText={setMale} keyboardType="numeric" style={styles.input} />
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>Female Count</Text>
                <TextInput value={female} onChangeText={setFemale} keyboardType="numeric" style={styles.input} />
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Categories (Caste)</Text>
        <View style={styles.row}>
            <View style={styles.col}>
                <Text style={styles.label}>SC</Text>
                <TextInput value={sc} onChangeText={setSc} keyboardType="numeric" style={styles.input} />
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>ST</Text>
                <TextInput value={st} onChangeText={setSt} keyboardType="numeric" style={styles.input} />
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>BC</Text>
                <TextInput value={bc} onChangeText={setBc} keyboardType="numeric" style={styles.input} />
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Party Support Analysis (%)</Text>
        <View style={styles.card}>
            {parties.map(party => (
                <View key={party.id} style={styles.partyRow}>
                    <Text style={styles.partyName}>{party.name}</Text>
                    <TextInput
                        placeholder="0"
                        keyboardType="numeric"
                        style={styles.partyInput}
                        value={partySupport[party.name] || ''}
                        onChangeText={(val) => handlePartySupportChange(party.name, val)}
                    />
                    <Text>%</Text>
                </View>
            ))}
            <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total: {Object.values(partySupport).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)}%</Text>
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Observations</Text>
        <TextInput
          value={observations}
          onChangeText={setObservations}
          multiline
          placeholder="Enter field observations and voter sentiment..."
          numberOfLines={4}
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Survey"}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontVariant: ['small-caps'], fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
  infoBox: { backgroundColor: '#dbeafe', padding: 15, borderRadius: 10, marginBottom: 25, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  infoText: { color: '#1e40af', fontSize: 14, fontWeight: 'bold' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, color: '#475569', textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, backgroundColor: 'white', fontSize: 16 },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  partyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  partyName: { flex: 1, fontWeight: '600', color: '#334155' },
  partyInput: { width: 60, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 5, padding: 5, marginRight: 10, textAlign: 'center', backgroundColor: '#f8fafc' },
  totalRow: { marginTop: 15, alignItems: 'flex-end' },
  totalText: { fontWeight: 'bold', color: '#2563eb' },
  submitButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  disabledButton: { opacity: 0.5 }
});
