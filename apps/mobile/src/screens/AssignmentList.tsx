import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Assignment } from '@ir-political-strategies/shared';

export const AssignmentList = ({ navigation }: any) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

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
      <Text style={styles.title}>My Assignments</Text>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('SurveyForm', { assignment: item })}
          >
            <Text style={styles.electionType}>{item.electionType}</Text>
            <Text style={styles.deadline}>Deadline: {new Date(item.deadline?.seconds * 1000).toDateString()}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 15, elevation: 2 },
  electionType: { fontSize: 18, fontWeight: 'bold' },
  deadline: { color: '#666', marginTop: 5 },
  status: { color: 'blue', marginTop: 5, fontWeight: 'bold' }
});
