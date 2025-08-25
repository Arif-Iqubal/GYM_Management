import colors from '@/assets/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebaseconfig';

export default function MemberDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState({});
  const [saving, setSaving] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isRenewalModalVisible, setIsRenewalModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [renewalPlan, setRenewalPlan] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingRenewal, setProcessingRenewal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [renewalPaymentAmount, setRenewalPaymentAmount] = useState('');
  const [showRenewalPaymentModal, setShowRenewalPaymentModal] = useState(false);
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] = useState(null);

  // Parse member data from params
  const memberData = params.memberData ? JSON.parse(params.memberData) : null;
  const memberId = params.memberId;

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      
      // Get member details
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        const m = { id: memberSnap.id, ...memberSnap.data() };
        // Check expiry and update status if needed
        if (m.planExpiryDate && new Date(m.planExpiryDate) < new Date()) {
          // Plan expired, update status if not already
          if (m.activemember !== false || m.expiredmember !== true) {
            await updateDoc(memberRef, {
              activemember: false,
              expiredmember: true,
            });
            m.activemember = false;
            m.expiredmember = true;
          }
        }
        setMember(m);
      } else {
        setMember(memberData); // Fallback to passed data
      }

      // Get member transactions
      const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
      const transactionsQuery = query(transactionsRef, orderBy('paymentDate', 'desc'));
      const transactionsSnap = await getDocs(transactionsQuery);
      
      const transactionsData = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching member details:', error);
      Alert.alert('Error', 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const plansRef = collection(db, 'admin', adminId, 'plans');
      const plansSnap = await getDocs(plansRef);
      
      const plansData = plansSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMemberDetails();
    setRefreshing(false);
  };

  const openEditModal = () => {
    setEditingMember({
      name: member.name || '',
      mobile: member.mobile || '',
      trainingType: member.trainingType || '',
      address: member.address || '',
      gender: member.gender || '',
      batchName: member.batchName || '',
      batchTime: member.batchTime || '',
    });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingMember({});
  };

  const saveMemberChanges = async () => {
    try {
      setSaving(true);
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);

      // Prepare update data (only allowed fields)
      const updateData = {
        name: editingMember.name.trim(),
        mobile: editingMember.mobile.trim(),
        trainingType: editingMember.trainingType.trim(),
        address: editingMember.address.trim(),
        gender: editingMember.gender.trim(),
        batchName: editingMember.batchName.trim(),
        batchTime: editingMember.batchTime.trim(),
        updatedAt: new Date()
      };

      // Validate required fields
      if (!updateData.name) {
        Alert.alert('Error', 'Name is required');
        return;
      }

      await updateDoc(memberRef, updateData);

      // Update local state
      setMember(prev => ({ ...prev, ...updateData }));

      Alert.alert('Success', 'Member details updated successfully');
      closeEditModal();
    } catch (error) {
      console.error('Error updating member:', error);
      Alert.alert('Error', 'Failed to update member details');
    } finally {
      setSaving(false);
    }
  };

  // Payment Functions
  const openPaymentModal = () => {
    setPaymentAmount(member.dues?.toString() || '0');
    setIsPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalVisible(false);
    setPaymentAmount('');
  };

  const processPayment = async () => {
    try {
      setProcessingPayment(true);
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        Alert.alert('Error', 'Please enter a valid payment amount');
        return;
      }

      // Create transaction record
      const transactionData = {
        amountPaid: amount,
        paymentDate: new Date(),
        paymentMethod: 'Cash',
        status: 'completed'
      };

      // Add transaction to member's transactions collection
      const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
      await addDoc(transactionsRef, transactionData);

      // Update member's dues
      const newDues = Math.max(0, (member.dues || 0) - amount);
      await updateDoc(memberRef, {
        dues: newDues,
        lastPaymentDate: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setMember(prev => ({ ...prev, dues: newDues }));
      setTransactions(prev => [transactionData, ...prev]);

      Alert.alert('Success', `Payment of ₹${amount} recorded successfully`);
      closePaymentModal();
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Renewal Functions
  const openRenewalModal = () => {
    setIsRenewalModalVisible(true);
  };

  const closeRenewalModal = () => {
    setIsRenewalModalVisible(false);
    setRenewalPlan('');
  };

  const processRenewal = async () => {
    try {
      setProcessingRenewal(true);
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      
      if (!renewalPlan) {
        Alert.alert('Error', 'Please select a renewal plan');
        return;
      }

      // Find the selected plan
      const selectedPlan = plans.find(plan => plan.id === renewalPlan);
      if (!selectedPlan) {
        Alert.alert('Error', 'Selected plan not found');
        return;
      }

      // Set selected plan and show payment modal
      setSelectedPlanForRenewal(selectedPlan);
      setRenewalPaymentAmount(selectedPlan.price.toString());
      setShowRenewalPaymentModal(true);
      setProcessingRenewal(false);
    } catch (error) {
      console.error('Error processing renewal:', error);
      Alert.alert('Error', 'Failed to process renewal');
      setProcessingRenewal(false);
    }
  };

  const processRenewalPayment = async () => {
    try {
      setProcessingRenewal(true);
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      
      const paymentAmount = parseFloat(renewalPaymentAmount);
      if (!paymentAmount || paymentAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid payment amount');
        return;
      }

      // Calculate new expiry date based on plan duration
      const currentDate = new Date();
      const newExpiryDate = new Date(currentDate.getTime() + (selectedPlanForRenewal.duration * 24 * 60 * 60 * 1000));

      // Create transaction record for renewal payment
      const transactionData = {
        amountPaid: paymentAmount,
        paymentDate: new Date(),
        paymentMethod: 'Cash',
        status: 'completed',
        type: 'renewal',
        planName: selectedPlanForRenewal.name,
        planDuration: selectedPlanForRenewal.duration
      };

      // Add transaction to member's transactions collection
      const transactionsRef = collection(db, 'admin', adminId, 'members', memberId, 'transactions');
      await addDoc(transactionsRef, transactionData);

             // Calculate new dues based on payment vs plan price
       let newDues = member.dues || 0;
       
       if (paymentAmount >= selectedPlanForRenewal.price) {
         // Full payment - subtract plan price from dues
         newDues = Math.max(0, newDues - selectedPlanForRenewal.price);
       } else {
         // Partial payment - add remaining plan cost to dues
         const remainingPlanCost = selectedPlanForRenewal.price - paymentAmount;
         newDues = newDues + remainingPlanCost;
       }

      // Update member's plan details, dues, and status booleans
      await updateDoc(memberRef, {
        planExpiryDate: newExpiryDate,
        planType: selectedPlanForRenewal.name,
        planId: selectedPlanForRenewal.id,
        status: 'active',
        lastRenewalDate: new Date(),
        dues: newDues,
        updatedAt: new Date(),
        newmember: false,
        activemember: true,
        expiredmember: false,
      });

      // Update local state
      setMember(prev => ({ 
        ...prev, 
        planExpiryDate: newExpiryDate,
        planType: selectedPlanForRenewal.name,
        planId: selectedPlanForRenewal.id,
        status: 'active',
        dues: newDues,
        newmember: false,
        activemember: true,
        expiredmember: false,
      }));

      // Update transactions list
      setTransactions(prev => [transactionData, ...prev]);

             const duesMessage = paymentAmount >= selectedPlanForRenewal.price 
         ? `Remaining Dues: ₹${newDues}`
         : `Updated Dues: ₹${newDues} (includes remaining plan cost)`;
         
       Alert.alert('Success', `Plan renewed successfully until ${newExpiryDate.toLocaleDateString()}\nPayment: ₹${paymentAmount}\n${duesMessage}`);
      setShowRenewalPaymentModal(false);
      closeRenewalModal();
    } catch (error) {
      console.error('Error processing renewal payment:', error);
      Alert.alert('Error', 'Failed to process renewal payment');
    } finally {
      setProcessingRenewal(false);
    }
  };

  const closeRenewalPaymentModal = () => {
    setShowRenewalPaymentModal(false);
    setRenewalPaymentAmount('');
    setSelectedPlanForRenewal(null);
  };

  useEffect(() => {
    fetchMemberDetails();
    fetchPlans();
  }, [memberId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading member details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Member not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ededed' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#222', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Member Detail</Text>
        <Ionicons name="notifications-outline" size={26} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, position: 'relative' }}>
          {/* Edit Icon at top right */}
          <View style={{ position: 'absolute', top: 10, right: 16, zIndex: 2 }}>
            <TouchableOpacity onPress={openEditModal} style={{ padding: 2 }}>
              <Ionicons name="pencil" size={18} color="#222" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', minHeight: 120 }}>
            <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: '#e0e0e0', marginRight: 18, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <Image
                source={member.imageUrl?.data ? { uri: member.imageUrl.data } : require('../../assets/images/Avatar/man3.png')}
                style={{ width: 70, height: 70, borderRadius: 10 }}
              />
              <TouchableOpacity
                onPress={() => {/* TODO: implement image update logic here, e.g. open image picker */}}
                style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: '#fff', borderRadius: 12, padding: 3, elevation: 2 }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={18} color="#222" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, height: 100, justifyContent: 'space-between', paddingVertical: 2 }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{member.name || 'Unknown'}</Text>
                <Text style={{ color: '#444', fontSize: 14, marginTop: 2 }}>+91 {member.mobile || ''}</Text>
              </View>
              {/* <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={{ color: '#888', fontSize: 13 }}>Batch Time </Text>
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.batchTime || 'N/A'}</Text>
                <Text style={{ color: '#888', fontSize: 13, marginLeft: 12 }}>ID </Text>
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.memberid || member.id || 'N/A'}</Text>
              </View> */}
            </View>
          </View>
          {/* Details below image, aligned left */}
           <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Gender: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.gender || 'N/A'}</Text>
              <Text style={{ color: '#888', fontSize: 13,marginLeft: 100 }}>ID: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13, }}>{member.memberid || member.id || 'N/A'}</Text>
            </View>
          <View style={{ flexDirection: 'column', flexWrap: 'wrap', marginLeft: 2 }}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Training Type: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.trainingType || 'General Training'}</Text>
            </View>
           
            <View style={{ flexDirection: 'row', marginBottom: 4  }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Address: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.address || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Batch Name: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.batchName || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Batch Time: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.batchTime || 'N/A'}</Text>
            </View>
            {/* <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>ID: </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{member.memberid || member.id || 'N/A'}</Text>
            </View> */}
          </View>
          <View style={{ borderBottomWidth: 1, borderColor: '#eee', marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 }}>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Ionicons name="checkmark-done-circle-outline" size={28} color="#222" />
              <Text style={{ fontSize: 12, color: '#222', marginTop: 2 }}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Ionicons name="refresh-circle-outline" size={28} color="#222" />
              <Text style={{ fontSize: 12, color: '#222', marginTop: 2 }}>Renew</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => {
                if (member.mobile) {
                  Linking.openURL(`tel:${member.mobile}`);
                } else {
                  Alert.alert('No mobile number', 'This member does not have a mobile number.');
                }
              }}
            >
              <Ionicons name="call-outline" size={28} color="#222" />
              <Text style={{ fontSize: 12, color: '#222', marginTop: 2 }}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Ionicons name="remove-circle-outline" size={28} color="#222" />
              <Text style={{ fontSize: 12, color: '#222', marginTop: 2 }}>Block</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Packages Section */}
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, marginLeft: 2 }}>Packages</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}>
          <Text style={{ color: '#f7b500', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>6 Month Plan</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Total Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>$50000</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Discount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>0%</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Purchase Date</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>DD/MM/YYYY</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Paid</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>$150</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Due Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>$48580</Text>
            </View>
            <View style={{ width: '50%', marginBottom: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Day Remaining</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>1000</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Member Modal */}
       <Modal
         visible={isEditModalVisible}
         animationType="slide"
         transparent={true}
         onRequestClose={closeEditModal}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Edit Member</Text>
               <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                 <Ionicons name="close" size={24} color={colors.gwhite} />
               </TouchableOpacity>
             </View>

             <ScrollView style={styles.modalScrollView}>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Name *</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.name}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, name: text }))}
                   placeholder="Enter member name"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Mobile Number</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.mobile}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, mobile: text }))}
                   placeholder="Enter mobile number"
                   placeholderTextColor={colors.twhite}
                   keyboardType="phone-pad"
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Training Type</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.trainingType}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, trainingType: text }))}
                   placeholder="Enter training type"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Address</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.address}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, address: text }))}
                   placeholder="Enter address"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Gender</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.gender}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, gender: text }))}
                   placeholder="Enter gender"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Batch Name</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.batchName}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, batchName: text }))}
                   placeholder="Enter batch name"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Batch Time</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editingMember.batchTime}
                   onChangeText={(text) => setEditingMember(prev => ({ ...prev, batchTime: text }))}
                   placeholder="Enter batch time"
                   placeholderTextColor={colors.twhite}
                 />
               </View>
             </ScrollView>

             <View style={styles.modalFooter}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={closeEditModal}
               >
                 <Text style={styles.cancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={[styles.modalButton, styles.saveButton]}
                 onPress={saveMemberChanges}
                 disabled={saving}
               >
                 <Text style={styles.saveButtonText}>
                   {saving ? 'Saving...' : 'Save Changes'}
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

      {/* Payment Modal */}
      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={closePaymentModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.gwhite} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="Enter payment amount"
                  placeholderTextColor={colors.twhite}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoText}>
                  Current Dues: ₹{member.dues || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Remaining after payment: ₹{Math.max(0, (member.dues || 0) - parseFloat(paymentAmount || 0))}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePaymentModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={processPayment}
                disabled={processingPayment}
              >
                <Text style={styles.saveButtonText}>
                  {processingPayment ? 'Processing...' : 'Record Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Renewal Modal */}
      <Modal
        visible={isRenewalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRenewalModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Renew Plan</Text>
              <TouchableOpacity onPress={closeRenewalModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.gwhite} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Renewal Plan</Text>
                {plans.length > 0 ? (
                  <View style={styles.planContainer}>
                    {plans.map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        style={[
                          styles.planButton,
                          renewalPlan === plan.id && styles.planButtonActive
                        ]}
                        onPress={() => setRenewalPlan(plan.id)}
                      >
                        <Text style={[
                          styles.planButtonText,
                          renewalPlan === plan.id && styles.planButtonTextActive
                        ]}>
                          {plan.name}
                        </Text>
                        <Text style={[
                          styles.planPriceText,
                          renewalPlan === plan.id && styles.planPriceTextActive
                        ]}>
                          ₹{plan.price}
                        </Text>
                        <Text style={[
                          styles.planDurationText,
                          renewalPlan === plan.id && styles.planDurationTextActive
                        ]}>
                          {plan.duration} Days
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noPlansContainer}>
                    <Text style={styles.noPlansText}>No plans available</Text>
                    <Text style={styles.noPlansSubText}>Please add plans in the Plans section</Text>
                  </View>
                )}
              </View>

              <View style={styles.renewalInfo}>
                <Text style={styles.renewalInfoText}>
                  Current Status: {member.status || 'Active'}
                </Text>
                <Text style={styles.renewalInfoText}>
                  Current Plan: {member.planType || 'No Plan'}
                </Text>
                {member.planExpiryDate && (
                  <Text style={styles.renewalInfoText}>
                    Current Expiry: {new Date(member.planExpiryDate).toLocaleDateString()}
                  </Text>
                )}
                {member.planExpiryDate && new Date(member.planExpiryDate) < new Date() && (
                  <Text style={[styles.renewalInfoText, styles.expiredText]}>
                    ⚠️ Plan Expired
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRenewalModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={processRenewal}
                disabled={processingRenewal}
              >
                <Text style={styles.saveButtonText}>
                  {processingRenewal ? 'Processing...' : 'Renew Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Renewal Payment Modal */}
      <Modal
        visible={showRenewalPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRenewalPaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Renewal Payment</Text>
              <TouchableOpacity onPress={closeRenewalPaymentModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.gwhite} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScrollView}>
              {selectedPlanForRenewal && (
                <View style={styles.planInfo}>
                  <Text style={styles.planInfoTitle}>Selected Plan</Text>
                  <Text style={styles.planInfoText}>Name: {selectedPlanForRenewal.name}</Text>
                  <Text style={styles.planInfoText}>Duration: {selectedPlanForRenewal.duration} Days</Text>
                  <Text style={styles.planInfoText}>Price: ₹{selectedPlanForRenewal.price}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={renewalPaymentAmount}
                  onChangeText={setRenewalPaymentAmount}
                  placeholder="Enter payment amount"
                  placeholderTextColor={colors.twhite}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoText}>
                  Current Dues: ₹{member.dues || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Plan Price: ₹{selectedPlanForRenewal?.price || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Plan Cost: ₹{selectedPlanForRenewal?.price || '0'}
                </Text>
                <Text style={styles.paymentInfoText}>
                  {parseFloat(renewalPaymentAmount || 0) >= (selectedPlanForRenewal?.price || 0) 
                    ? `Remaining dues after full payment: ₹${Math.max(0, (member.dues || 0) - (selectedPlanForRenewal?.price || 0))}`
                    : `Dues after partial payment: ₹${(member.dues || 0) + ((selectedPlanForRenewal?.price || 0) - parseFloat(renewalPaymentAmount || 0))}`
                  }
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRenewalPaymentModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={processRenewalPayment}
                disabled={processingRenewal}
              >
                <Text style={styles.saveButtonText}>
                  {processingRenewal ? 'Processing...' : 'Confirm Renewal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dblack,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.wblack,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gwhite,
  },
  editButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gwhite,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.gwhite,
    fontSize: 16,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.wblack,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gwhite,
    marginBottom: 5,
  },
  memberStatus: {
    fontSize: 16,
    color: colors.twhite,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.wblack,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.twhite,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gwhite,
  },
  paymentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gwhite,
    marginBottom: 15,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.wblack,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gwhite,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.twhite,
    marginTop: 2,
  },
  transactionStatus: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTransactionsText: {
    color: colors.twhite,
    fontSize: 16,
    marginTop: 10,
  },
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gwhite,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gwhite,
  },
     actionButtonText: {
     color: colors.dblack,
     fontSize: 16,
     fontWeight: '600',
     marginLeft: 10,
   },
   // Modal Styles
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalContent: {
     backgroundColor: colors.dblack,
     borderRadius: 15,
     width: '90%',
     maxHeight: '80%',
     borderWidth: 1,
     borderColor: colors.wblack,
   },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 20,
     borderBottomWidth: 1,
     borderBottomColor: colors.wblack,
   },
   modalTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: colors.gwhite,
   },
   closeButton: {
     padding: 5,
   },
   modalScrollView: {
     padding: 20,
   },
   inputGroup: {
     marginBottom: 20,
   },
   inputLabel: {
     fontSize: 14,
     color: colors.twhite,
     marginBottom: 8,
     fontWeight: '500',
   },
   textInput: {
     backgroundColor: colors.wblack,
     borderRadius: 8,
     padding: 12,
     fontSize: 16,
     color: colors.gwhite,
     borderWidth: 1,
     borderColor: colors.twhite,
   },
   statusContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
   },
   statusButton: {
     flex: 1,
     paddingVertical: 10,
     paddingHorizontal: 15,
     borderRadius: 8,
     borderWidth: 1,
     borderColor: colors.twhite,
     marginHorizontal: 5,
     alignItems: 'center',
   },
   statusButtonActive: {
     backgroundColor: colors.gwhite,
     borderColor: colors.gwhite,
   },
   statusButtonText: {
     color: colors.twhite,
     fontSize: 14,
     fontWeight: '500',
   },
   statusButtonTextActive: {
     color: colors.dblack,
   },
   modalFooter: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     padding: 20,
     borderTopWidth: 1,
     borderTopColor: colors.wblack,
   },
   modalButton: {
     flex: 1,
     paddingVertical: 12,
     borderRadius: 8,
     alignItems: 'center',
     marginHorizontal: 5,
   },
   cancelButton: {
     backgroundColor: 'transparent',
     borderWidth: 1,
     borderColor: colors.twhite,
   },
   saveButton: {
     backgroundColor: colors.gwhite,
   },
   cancelButtonText: {
     color: colors.twhite,
     fontSize: 16,
     fontWeight: '600',
   },
       saveButtonText: {
      color: colors.dblack,
      fontSize: 16,
      fontWeight: '600',
    },
    // Payment Modal Styles
    paymentInfo: {
      backgroundColor: colors.wblack,
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
    },
    paymentInfoText: {
      color: colors.twhite,
      fontSize: 14,
      marginBottom: 5,
    },
    // Renewal Modal Styles
    planContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    planButton: {
      width: '48%',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.twhite,
      marginBottom: 10,
      alignItems: 'center',
    },
    planButtonActive: {
      backgroundColor: colors.gwhite,
      borderColor: colors.gwhite,
    },
    planButtonText: {
      color: colors.twhite,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
    },
    planButtonTextActive: {
      color: colors.dblack,
    },
    planPriceText: {
      color: colors.twhite,
      fontSize: 12,
    },
    planPriceTextActive: {
      color: colors.dblack,
    },
    renewalInfo: {
      backgroundColor: colors.wblack,
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
    },
         renewalInfoText: {
       color: colors.twhite,
       fontSize: 14,
       marginBottom: 5,
     },
     // Additional Plan Styles
     planDurationText: {
       color: colors.twhite,
       fontSize: 10,
       marginTop: 2,
     },
     planDurationTextActive: {
       color: colors.dblack,
     },
     noPlansContainer: {
       alignItems: 'center',
       paddingVertical: 20,
     },
     noPlansText: {
       color: colors.twhite,
       fontSize: 16,
       fontWeight: '600',
       marginBottom: 5,
     },
     noPlansSubText: {
       color: colors.twhite,
       fontSize: 12,
       opacity: 0.7,
     },
     expiredText: {
       color: '#ff6b6b',
       fontWeight: 'bold',
     },
     expiredStatus: {
       color: '#ff6b6b',
       fontWeight: 'bold',
     },
     // Renewal Payment Modal Styles
     planInfo: {
       backgroundColor: colors.wblack,
       padding: 15,
       borderRadius: 8,
       marginBottom: 15,
     },
     planInfoTitle: {
       color: colors.gwhite,
       fontSize: 16,
       fontWeight: 'bold',
       marginBottom: 8,
     },
     planInfoText: {
       color: colors.twhite,
       fontSize: 14,
       marginBottom: 3,
     },
   }); 