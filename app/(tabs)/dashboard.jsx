import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { db } from '../../config/firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

const FILTERS = ['all', 'active', 'expired', 'dues', 'paid'];

export default function App() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = async () => {
    try {
      const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2'; 
           let q = collection(db, 'admin', adminId, 'members');
      if (selectedFilter !== 'all') {
        q = query(q, where('status', '==', selectedFilter));
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
  }, [selectedFilter]);

  useEffect(() => {
    const results = members.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(results);
  }, [searchQuery, members]);

  const renderMemberCard = (member) => (
    <View style={styles.card} key={member.id}>
      <Image
              source={
                member.imageUrl?.data
                  ? { uri: member.imageUrl?.data }
                  : require('../../assets/images/Avatar/man3.png') // ✅ your local fallback image
              } style={styles.avatar} />
      <Text style={styles.name}>{member.name}</Text>
      <View style={styles.details}>
        <Text style={styles.left}>Days: {member.remainingDays}</Text>
        <Text style={styles.right}>₹{member.duesAmount}</Text>
      </View>
    </View>
  );

  const groupIntoPairs = (arr) => {
    const pairs = [];
    for (let i = 0; i < arr.length; i += 2) {
      pairs.push([arr[i], arr[i + 1]]);
    }
    return pairs;
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter bar */}
      <View style={styles.filterBar}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilter
            ]}
            onPress={() => {
              setSelectedFilter(filter);
              setSearchQuery('');
            }}
          >
            <Text style={styles.filterText}>{filter.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Member list */}
      <FlatList
        data={groupIntoPairs(filteredMembers)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {renderMemberCard(item[0])}
            {item[1] ? renderMemberCard(item[1]) : <View style={styles.card} />}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No members found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center'
  },
  filterButton: {
    backgroundColor: '#eee',
    padding: 8,
    margin: 5,
    borderRadius: 10
  },
  activeFilter: {
    backgroundColor: '#1e90ff'
  },
  filterText: {
    fontSize: 12,
    color: '#000'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    alignItems: 'center',
    elevation: 2
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 6
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  left: { fontSize: 12, color: '#333' },
  right: { fontSize: 12, color: '#e74c3c' }
});
