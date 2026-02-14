import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const ClientReportList = ({ navigation }: any) => {
  const [assignedReports, setAssignedReports] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const now = new Date();
    const q = query(
      collection(db, 'clientAssignments'),
      where('clientId', '==', auth.currentUser.uid),
      where('expiryDate', '>', now)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const r: any[] = [];
      snap.forEach(doc => r.push({ id: doc.id, ...doc.data() }));
      setAssignedReports(r);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Reports</Text>
      <FlatList
        data={assignedReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ReportViewer', { reportId: item.reportId })}
          >
            <Text style={styles.reportId}>Report Access: {item.reportId.substring(0, 8)}...</Text>
            <Text style={styles.expiry}>Expires: {new Date(item.expiryDate?.seconds * 1000).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1a365d' },
  item: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#3182ce' },
  reportId: { fontSize: 16, fontWeight: 'bold' },
  expiry: { color: '#718096', marginTop: 5 }
});
