import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../src/firebase';
import { useLocalSearchParams } from 'expo-router';

export default function ReportViewerScreen() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState<any>(null);
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      const docSnap = await getDoc(doc(db, 'reports', id as string));
      if (docSnap.exists()) setReport(docSnap.data());

      if (auth.currentUser) {
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userSnap.exists()) setClientName(userSnap.data().name);
      }
    };
    fetchReport();
  }, [id]);

  if (!report) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.watermarkContainer} pointerEvents="none">
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={styles.watermarkText}>
            CONFIDENTIAL - {clientName} - {new Date().toLocaleDateString()}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>POLITICAL INTELLIGENCE REPORT</Text>
        <Text style={styles.version}>Version: v{report.version}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observations</Text>
          <Text style={styles.body}>{report.editNotes || 'Initial analysis completed.'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  watermarkContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999, justifyContent: 'space-around', alignItems: 'center',
    opacity: 0.1, transform: [{ rotate: '-45deg' }],
  },
  watermarkText: { fontSize: 24, fontWeight: 'bold', color: 'black', textAlign: 'center' },
  content: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#1a365d' },
  version: { textAlign: 'center', color: '#718096', marginBottom: 30 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 5, marginBottom: 10, color: '#2d3748' },
  body: { fontSize: 14, lineHeight: 22, color: '#4a5568' }
});
