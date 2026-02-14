import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../src/firebase';
import { Assignment } from '@ir-political-strategies/shared';
import { useRouter } from 'expo-router';

export default function AssignmentListScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'assignments'),
      where('surveyorId', '==', auth.currentUser.uid),
      where('status', 'in', ['PENDING', 'IN_PROGRESS'])
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const a: Assignment[] = [];
      snap.forEach(doc => a.push({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(a);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push({ pathname: '/survey/[id]', params: { id: item.id } })}
          >
            <Text style={styles.electionType}>{item.electionType}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  item: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 15, elevation: 2 },
  electionType: { fontSize: 18, fontWeight: 'bold' },
  status: { color: 'blue', marginTop: 5, fontWeight: 'bold' }
});
