import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const { width, height } = Dimensions.get('window');

export const ReportViewer = ({ route }: any) => {
  const { reportId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      const docSnap = await getDoc(doc(db, 'reports', reportId));
      if (docSnap.exists()) setReport(docSnap.data());

      if (auth.currentUser) {
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userSnap.exists()) setClientName(userSnap.data().name);
      }
    };
    fetchReport();
  }, [reportId]);

  if (!report) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {/* Watermark Overlay */}
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
        <Text style={styles.date}>Generated: {new Date(report.generatedAt?.seconds * 1000).toLocaleString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.body}>This report contains sensitive political data regarding constituency analysis and voter sentiment.</Text>
        </View>

        {/* Dynamic content would be mapped here */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observations</Text>
          <Text style={styles.body}>{report.editNotes || 'Initial analysis completed.'}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© IR Political Strategies - Proprietary and Confidential</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  watermarkContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
    justifyContent: 'space-around',
    alignItems: 'center',
    opacity: 0.1,
    transform: [{ rotate: '-45deg' }],
  },
  watermarkText: { fontSize: 24, fontWeight: 'bold', color: 'black', textAlign: 'center' },
  content: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#1a365d' },
  version: { textAlign: 'center', color: '#718096', marginBottom: 5 },
  date: { textAlign: 'center', color: '#a0aec0', fontSize: 12, marginBottom: 30 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 5, marginBottom: 10, color: '#2d3748' },
  body: { fontSize: 14, lineHeight: 22, color: '#4a5568' },
  footer: { marginTop: 50, borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 20 },
  footerText: { textAlign: 'center', fontSize: 10, color: '#cbd5e0' }
});
