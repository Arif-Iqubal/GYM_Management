import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebaseconfig';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

export default function ViewPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [editingId, setEditingId] = useState(null);

  const uid = auth.currentUser?.uid || 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'admin', uid, 'plans'));
      const plansList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlans(plansList);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

 const handleDelete = (id) => {
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete this plan?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'admin', uid, 'plans', id));
            fetchPlans();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please enter both name and price.');
      return;
    }

    try {
      const planRef = collection(db, 'admin', uid, 'plans');
      if (editingId) {
        await updateDoc(doc(planRef, editingId), {
          name,
          price: parseFloat(price),
          duration,
        });
      } else {
        await addDoc(planRef, {
          name,
          price: parseFloat(price),
          duration,
        });
      }

      setName('');
      setPrice('');
      setDuration('');
      setEditingId(null);
      setModalVisible(false);
      fetchPlans();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEdit = (plan) => {
    setName(plan.name);
    setPrice(String(plan.price));
    setDuration(String(plan.duration));
    setEditingId(plan.id);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planPrice}>₹{item.price}</Text>
        <Text style={styles.planPrice}>Days - {item.duration}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Feather name="edit" size={22} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 15 }}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Plans</Text>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchPlans}
        ListEmptyComponent={<Text>No plans found.</Text>}
      />

      {/* Floating + Button */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => {
          setName('');
          setPrice('');
          setDuration('');
          setEditingId(null);
          setModalVisible(true);
        }}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Plan' : 'Add New Plan'}</Text>
            <TextInput
              placeholder="Plan Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Plan Duration"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Plan Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button title={editingId ? 'Update' : 'Add'} onPress={handleSave} />
            <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingBtn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    margin: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
