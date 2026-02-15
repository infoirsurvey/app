import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../src/firebase';
import { useRouter } from 'expo-router';

export default function ClientReportListScreen() {
  const [assignedReports, setAssignedReports] = useState<any[]>([]);
  const router = useRouter();

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
      <FlatList
        data={assignedReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push({ pathname: '/report/[id]', params: { id: item.reportId } })}
          >
            <Text style={styles.reportId}>Report Access: {item.reportId.substring(0, 8)}...</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  item: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#3182ce' },
  reportId: { fontSize: 16, fontWeight: 'bold' }
});
