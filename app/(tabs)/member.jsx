// MemberForm.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, ToastAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../config/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';

const MemberForm = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    gender: 'Male',
    trainingType: '',
    email: '',
    dob: new Date(),
    gymPlan: '1 Month',
    admissionFee: '',
    joiningDate: new Date(),
    paidAmount: '',
    paymentMethod: 'Cash',
    dues: '',
    comments: '',
    address: '',
  });

  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showJoinPicker, setShowJoinPicker] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const memberId = uuid.v4().slice(0, 8); // short unique ID

    try {
      await addDoc(collection(db, 'members'), {
        ...form,
        memberId,
        dob: form.dob.toISOString(),
        joiningDate: form.joiningDate.toISOString(),
        createdAt: new Date().toISOString(),
      });

      ToastAndroid.show('Member added successfully!', ToastAndroid.LONG);
      setForm({
        name: '',
        mobile: '',
        gender: 'Male',
        trainingType: '',
        email: '',
        dob: new Date(),
        gymPlan: '1 Month',
        admissionFee: '',
        joiningDate: new Date(),
        paidAmount: '',
        paymentMethod: 'Cash',
        dues: '',
        comments: '',
        address: '',
      });
    } catch (error) {
      console.error('Error adding member:', error);
      ToastAndroid.show('Error adding member', ToastAndroid.LONG);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Gym Member</Text>

      <TextInput placeholder="Name" value={form.name} onChangeText={text => handleChange('name', text)} style={styles.input} />
      <TextInput placeholder="Mobile Number" keyboardType="phone-pad" value={form.mobile} onChangeText={text => handleChange('mobile', text)} style={styles.input} />
      <TextInput placeholder="Email" value={form.email} onChangeText={text => handleChange('email', text)} style={styles.input} />
      <TextInput placeholder="Training Type" value={form.trainingType} onChangeText={text => handleChange('trainingType', text)} style={styles.input} />

      <Text style={styles.label}>Gender</Text>
      <Picker selectedValue={form.gender} onValueChange={value => handleChange('gender', value)} style={styles.picker}>
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <Text style={styles.label}>Date of Birth</Text>
      <Button title={form.dob.toDateString()} onPress={() => setShowDOBPicker(true)} />
      {showDOBPicker && (
        <DateTimePicker
          value={form.dob}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDOBPicker(false);
            if (date) handleChange('dob', date);
          }}
        />
      )}

      <Text style={styles.label}>Select Gym Plan</Text>
      <Picker selectedValue={form.gymPlan} onValueChange={value => handleChange('gymPlan', value)} style={styles.picker}>
        <Picker.Item label="1 Month" value="1000" />
        <Picker.Item label="3 Months" value="2000" />
        <Picker.Item label="6 Months" value="3000" />
      </Picker>

      <TextInput placeholder="Admission Fees" keyboardType="numeric" value={form.admissionFee} onChangeText={text => handleChange('admissionFee', text)} style={styles.input} />
      <TextInput placeholder="Paid Amount" keyboardType="numeric" value={form.paidAmount} onChangeText={text => handleChange('paidAmount', text)} style={styles.input} />
      <TextInput placeholder="Dues" keyboardType="numeric" value={form.dues} onChangeText={text => handleChange('dues', text)} style={styles.input} />

      <Text style={styles.label}>Select Joining Date</Text>
      <Button title={form.joiningDate.toDateString()} onPress={() => setShowJoinPicker(true)} />
      {showJoinPicker && (
        <DateTimePicker
          value={form.joiningDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowJoinPicker(false);
            if (date) handleChange('joiningDate', date);
          }}
        />
      )}

      <Text style={styles.label}>Payment Method</Text>
      <Picker selectedValue={form.paymentMethod} onValueChange={value => handleChange('paymentMethod', value)} style={styles.picker}>
        <Picker.Item label="Cash" value="Cash" />
        <Picker.Item label="UPI" value="UPI" />
        <Picker.Item label="Card" value="Card" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <TextInput placeholder="Address" value={form.address} onChangeText={text => handleChange('address', text)} style={styles.input} />
      <TextInput placeholder="Comments" value={form.comments} onChangeText={text => handleChange('comments', text)} style={styles.input} />

      <Button title="Submit" onPress={handleSubmit} color="#6200ee" />
    </ScrollView>
  );
};

export default MemberForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
});
