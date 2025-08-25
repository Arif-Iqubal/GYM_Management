import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { reload } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';

const FILTERS = ['all', 'active', 'expired', 'dues', 'paid'];

export default function App() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Summary counts
  const totalCount = members.length;
  const activeCount = members.filter(m => m.activemember).length;
  const expiredCount = members.filter(m => m.expiredmember).length;
  const newCount = members.filter(m => m.newmember).length;

  const fetchMembers = async () => {
    try {
      const user = auth.currentUser;
      await reload(user);
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      let q = collection(db, 'admin', adminId, 'members');
      if (selectedFilter === 'active') {
        q = query(q, where('activemember', '==', true));
      } else if (selectedFilter === 'expired') {
        q = query(q, where('expiredmember', '==', true));
      } else if (selectedFilter === 'new') {
        q = query(q, where('newmember', '==', true));
      } else if (selectedFilter === 'dues') {
        // Dues: fetch all, filter in JS for dues > 0
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(data.filter(m => parseFloat(m.dues) > 0));
        return;
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [selectedFilter]);

  useEffect(() => {
    const results = members.filter(member =>
      member && member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(results);
  }, [searchQuery, members]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMembers();
    } catch (error) {
      console.error('Error refreshing members:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderMemberCard = (member) => {
    if (!member || !member.name) return <View style={{ ...styles.card, backgroundColor: isDarkMode ? '#232323' : '#f5f5f5', borderColor: isDarkMode ? '#333' : '#eee' }} />;
    // Card color logic
    let cardBg = '#fff';
    let textColor = '#181818';
    if (isDarkMode) {
      if (member.expiredmember) { cardBg = '#181818'; textColor = '#fff'; }
      else if (member.newmember) { cardBg = '#232323'; textColor = '#fff'; }
      else if (member.activemember) { cardBg = '#232323'; textColor = '#fff'; }
    } else {
      if (member.expiredmember) { cardBg = '#fff'; textColor = '#181818'; }
      else if (member.newmember) { cardBg = '#fff'; textColor = '#181818'; }
      else if (member.activemember) { cardBg = '#f5f5f5'; textColor = '#181818'; }
    }

    // Calculate remaining days: (plan purchase date + plan duration) - today
    let remainingDays = 'N/A';
    if (member.joiningDate && member.gymPlanduration) {
      try {
        const joinDate = new Date(member.joiningDate);
        const duration = parseInt(member.gymPlanduration);
        const expiryDate = new Date(joinDate);
        expiryDate.setDate(joinDate.getDate() + duration);
        const now = new Date();
        const diff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        remainingDays = diff > 0 ? diff + ' D' : '0 D';
      } catch (e) {
        remainingDays = 'N/A';
      }
    }

    // Avatar border color logic
  let avatarBorder = '#14A166'; // active: green (matches summary card)
  if (member.expiredmember) avatarBorder = '#e53935'; // expired: red (matches summary card)
  else if (member.newmember) avatarBorder = '#bdbdbd'; // new: gray

    return (
      <TouchableOpacity
        style={{ ...styles.card, backgroundColor: cardBg, borderColor: isDarkMode ? '#333' : '#e0e0e0' }}
        key={member.id || Math.random()}
        onPress={() => {
          router.push({
            pathname: '/(screens)/memberDetails',
            params: { memberId: member.id, memberData: JSON.stringify(member) }
          });
        }}
        onLongPress={() => {
          setMemberToDelete(member);
          setDeleteModalVisible(true);
        }}
      >
        <View style={{ flex: 1, width: '100%', justifyContent: 'space-between' }}>
          {/* Top row: avatar and info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <Image
              source={
                member.imageUrl?.data
                  ? { uri: member.imageUrl?.data }
                  : require('../../assets/images/Avatar/man3.png')
              }
              style={[
                styles.avatar,
                {
                  marginRight: 10,
                  width: 32,
                  height: 32,
                  borderWidth: 2,
                  borderColor: avatarBorder,
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ ...styles.name, color: textColor, fontSize: 13, marginBottom: 2 }}>{member.name || 'Unknown'}</Text>
              <Text style={{ fontSize: 9, color: textColor, opacity: 0.7 }}>+91 {member.mobile || ''}</Text>
            </View>
          </View>
          {/* Bottom row: Remaining and Due Amount */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: textColor, opacity: 0.7, marginBottom: 2 }}>Remaining</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: textColor }}>{remainingDays}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9, color: textColor, opacity: 0.7, marginBottom: 2 }}>Due Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: textColor }}>₹{member.dues || '0'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const groupIntoPairs = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];
    const pairs = [];
    for (let i = 0; i < arr.length; i += 2) {
      pairs.push([arr[i], arr[i + 1]]);
    }
    return pairs;
  };

  // Delete member from Firebase
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
      // Delete from Firestore
      await deleteDoc(doc(db, 'admin', adminId, 'members', memberToDelete.id));

      // Delete from Cloudinary if image exists
      if (memberToDelete.imageUrl && memberToDelete.imageUrl.public_id) {
        try {
          // You need a backend endpoint or a secure function to delete from Cloudinary
          await fetch('https://your-backend-endpoint/delete-cloudinary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: memberToDelete.imageUrl.public_id })
          });
        } catch (cloudErr) {
          console.error('Error deleting image from Cloudinary:', cloudErr);
        }
      }

      setDeleteModalVisible(false);
      setMemberToDelete(null);
      await fetchMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#181818' : '#fff' }}>
      {/* Delete confirmation modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: isDarkMode ? '#232323' : '#fff', padding: 24, borderRadius: 16, alignItems: 'center', width: 280 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818', marginBottom: 12 }}>Delete this person?</Text>
            <Text style={{ color: isDarkMode ? '#fff' : '#181818', marginBottom: 24 }}>Are you sure you want to delete {memberToDelete?.name}?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Pressable onPress={() => setDeleteModalVisible(false)} style={{ flex: 1, marginRight: 8, padding: 10, borderRadius: 8, backgroundColor: '#ccc', alignItems: 'center' }}>
                <Text style={{ color: '#181818', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDeleteMember} style={{ flex: 1, marginLeft: 8, padding: 10, borderRadius: 8, backgroundColor: '#e53935', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10, padding: 4 }}>
          <Ionicons name="chevron-back" size={26} color={isDarkMode ? '#fff' : '#181818'} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#181818' }}>Members</Text>
      </View>
      {/* Search bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#232323' : '#f0f0f0', borderRadius: 8, paddingHorizontal: 10 }}>
          <Ionicons name="search" size={18} color={isDarkMode ? '#aaa' : '#888'} style={{ marginRight: 6 }} />
          <TextInput
            style={{ flex: 1, color: isDarkMode ? '#fff' : '#181818', height: 36 }}
            placeholder="Search"
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={{ marginLeft: 10, backgroundColor: isDarkMode ? '#232323' : '#fff', borderRadius: 8, padding: 8 }}>
          <Ionicons name="options-outline" size={20} color={isDarkMode ? '#fff' : '#181818'} />
        </TouchableOpacity>
      </View>
      {/* Filter bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'new', label: 'New' },
          { key: 'expired', label: 'Expired' },
          { key: 'dues', label: 'Dues' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 16,
              backgroundColor: selectedFilter === f.key ? (isDarkMode ? '#14A166' : '#e0e0e0') : (isDarkMode ? '#232323' : '#f5f5f5'),
              marginRight: 6,
            }}
            onPress={() => setSelectedFilter(f.key)}
          >
            <Text style={{ fontSize: 12, color: selectedFilter === f.key ? (isDarkMode ? '#fff' : '#181818') : (isDarkMode ? '#fff' : '#181818') }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Scrollable content below search */}
      <View style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 }}>
              <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#181818' : '#222' }]}> 
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Total</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 28 }}>{totalCount}</Text>
                <Text style={{ color: '#fff', fontSize: 12 }}>-0.03%</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#fff', borderColor: '#e0e0e0', borderWidth: 1 }]}> 
                <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 18 }}>Expire</Text>
                <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 28 }}>{expiredCount}</Text>
                <Text style={{ color: '#e53935', fontSize: 12 }}>-0.03%</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#232323' : '#fff', borderColor: isDarkMode ? '#232323' : '#e0e0e0', borderWidth: 1 }]}> 
                <Text style={{ color: '#14A166', fontWeight: 'bold', fontSize: 18 }}>Active</Text>
                <Text style={{ color: '#14A166', fontWeight: 'bold', fontSize: 28 }}>{activeCount}</Text>
                <Text style={{ color: '#14A166', fontSize: 12 }}>-0.03%</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#fff', borderColor: '#e0e0e0', borderWidth: 1 }]}> 
                <Text style={{ color: '#181818', fontWeight: 'bold', fontSize: 18 }}>New</Text>
                <Text style={{ color: '#181818', fontWeight: 'bold', fontSize: 28 }}>{newCount}</Text>
                <Text style={{ color: '#181818', fontSize: 12 }}>-0.03%</Text>
              </View>
            </View>
          }
          data={groupIntoPairs(filteredMembers)}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDarkMode ? '#fff' : '#2196F3']}
              tintColor={isDarkMode ? '#fff' : '#2196F3'}
              title="Pull to refresh"
              titleColor={isDarkMode ? '#fff' : '#2196F3'}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {renderMemberCard(item && item[0])}
              {renderMemberCard(item && item[1])}
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: isDarkMode ? '#fff' : '#181818' }}>No members found.</Text>}
        />
      </View>
      <View style={{ height: 80 }}></View>
    </SafeAreaView>
  );
 
}

const styles = StyleSheet.create({
   summaryCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'flex-start',
    elevation: 2
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#181818',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 12,
    color: '#181818',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 0.4,
    borderColor: '#e0e0e0',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 0,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    color: '#181818',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  left: { fontSize: 12, color: '#181818' },
  right: { fontSize: 12, color: '#c0392b' },
});
