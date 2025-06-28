// import { View, Text } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'

// const home = () => {
//   return (
//     <SafeAreaView>
//       <View style={styles.label}></View>
//     </SafeAreaView>
//   )
// }

// export default home

import colors from "@/assets/colors";
import placeholder from '../../assets/images/Avatar/man3.png'

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebaseconfig'; // your firebase config
// import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, moderateVerticalScale } from "react-native-size-matters";
import { Directions } from "react-native-gesture-handler";
import { setIn } from "formik";
import { reload } from "firebase/auth";
import { useFocusEffect } from '@react-navigation/native';
import { collectionGroup, query, orderBy, limit, getDocs, doc, getDoc ,collection} from 'firebase/firestore';
import { ScrollView } from 'react-native-virtualized-view';
const screenWidth = Dimensions.get('window').width;


const home = () => {
  // const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [dues, setDues] = useState(0);
  // const [month, setMonth] = useState('');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const month = monthNames[today.getMonth()];
    const [adminUID, setAdminUID] = useState("ecNCqm8PgxOEgG9S7puVpm2hVZn2");

    // Fetching Current Month Income and Dues

//     const fetchCurrentMonthSummary = async () => {
//   try {
//     const today = new Date();
//     const year = today.getFullYear().toString();      // e.g., "2025"
//     const month = String(today.getMonth() + 1).padStart(2, '0'); // "01" to "12"
//     // setMonth(month);
    
//     const summaryRef = doc(db, 'admin', adminUID, 'financialSummary', year);
//     const docSnap = await getDoc(summaryRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       const monthly = data.monthly || {};

//       const currentMonthData = monthly[month] || { income: 0, dues: 0 };
//       console.log(`✅ Income: ₹${currentMonthData.income}, Dues: ₹${currentMonthData.dues}`);
//         setIncome(currentMonthData.income);
//          setDues(currentMonthData.dues);
//       return currentMonthData;
//     } else {
//       console.log('📭 No financial summary document found.');
       
//       return { income: 0, dues: 0 };
//     }
//   } catch (error) {
//     console.error('❌ Error fetching current month summary:', error.message);
//     return { income: 0, dues: 0 };
//   }
// };


// const [summary, setSummary] = useState({ income: 0, dues: 0 });

// useEffect(() => {
//   const adminId = 'your_admin_uid_here';
//   const getSummary = async () => {
//     const currentMonthSummary = await fetchCurrentMonthSummary(adminId);
//     setSummary(currentMonthSummary);
//   };

//   getSummary();
//   setIncome(summary.income);
//   setDues(summary.dues);
// }, []);






const fetchCurrentMonthSummary = async () => {
  try {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // e.g. "06"

    const summaryRef = doc(db, 'admin', adminUID, 'financialSummary', year);
    const docSnap = await getDoc(summaryRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentMonthData = data.monthly?.[month] || { income: 0, dues: 0 };
      setIncome(currentMonthData.income);
      setDues(currentMonthData.dues);
    } else {
      setIncome(0);
      setDues(0);
    }
  } catch (err) {
    console.error("Error loading summary:", err.message);
    setIncome(0);
    setDues(0);
  }
};

useFocusEffect(
  useCallback(() => {
    fetchCurrentMonthSummary();
  }, [])
);





//  here fetching income and dues ends

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const querySnapshot = await getDocs(doc(db, 'admin', adminUID, 'financialSummary', String(year)));
  //     let incomeSum = 11000;
  //     let duesSum = 350;
  //     const data = querySnapshot.docs.map(doc => {
  //       const item = doc.data();
  //       if (item.type === 'income') incomeSum += item.amount;
  //       else duesSum += item.amount;
  //       return item;
  //     });
  //     setTransactions(data);
  //     setIncome(incomeSum);
  //     setDues(duesSum);
  //   };

  //   fetchData();
  // }, []);

  const chartData = [
    {
      name: 'Income',
      amount: income,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Dues',
      amount: dues,
      color: '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];


  
// const transactions= [
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
//   {
//     name: "John Doe",
//     time: "10:00 AM",
//     img: "",
//     amount: 500,
//     type: "income"
//   },
//   {
//     name: "Jane Smith",
//     time: "2:30 PM",
//     img: "",
//     amount: 300,
//     type: "dues"
//   },
// ];

// Fetching Transaction History of 30 members



const fetchRecentTransactions = async (adminId) => {
  try {
    const q = query(
      collectionGroup(db, 'transactions'),
      orderBy('paymentDate', 'desc'),
      limit(30)
    );

    const snapshot = await getDocs(q);
    console.log(`📦 Fetched ${snapshot.docs.length} transactions`);

    const transactions = [];

    for (const docSnap of snapshot.docs) {
      const txnData = docSnap.data();
      const pathSegments = docSnap.ref.path.split('/');
      const memberId = pathSegments[3];

      const memberRef = doc(db, 'admin', adminId, 'members', memberId);
      const memberSnap = await getDoc(memberRef);
      const memberData = memberSnap.exists() ? memberSnap.data() : {};

      transactions.push({
        id: docSnap.id,
        memberId,
        memberName: txnData.memberName || memberData.name || "Unknown",
        paymentDate: txnData.paymentDate,
        amountPaid: txnData.amountPaid,
        imageUrl: memberData.imageUrl || '',
      });
    }

    return transactions;
  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
    return [];
  }
};

const [transactions, setTransactions] = useState([]);

useFocusEffect(
  useCallback(() => {
  const adminId = adminUID; // your actual admin UID

  const loadTransactions = async () => {
    const data = await fetchRecentTransactions(adminId);
     console.log("🚀 Transactions:", data);
    setTransactions(data);
  };

  loadTransactions();
 // Optional cleanup function
    return () => {};
  }, [adminUID])
);






 
  return (
    <SafeAreaView style={styles.container}>
     
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, Admin</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={colors.gwhite} />
        </TouchableOpacity>
      </View>
       <ScrollView>
 <View style={styles.container2}>
      {/* Chart Name */}
      <View style={styles.finance_box}>
      <Text style={styles.chartTitle}>Revenue</Text>
      <View style={styles.finance_box_in}>
      <Text style={styles.chartdate}>{month}</Text>

      {/* Pie Chart */}
      <PieChart
        data={chartData}
        width={screenWidth}
        height={160}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        
      />

      {/* Income & Dues */}
      <View style={styles.amountInfo_box}>
      <View style={styles.amountInfo}>
        <Text style={styles.amountInfo_txt}>Total Income: ₹{income}</Text>
        <Text style={styles.amountInfo_txt}>Dues Amount: ₹{dues}</Text>
      </View>
      <View style={styles.amountInfo}>
        <TouchableOpacity style={styles.moreinfo}><Text style={styles.amountInfo_txt}>More</Text></TouchableOpacity>
      </View>
        </View>
        </View>
        </View>
      {/* Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <View style={styles.flatlisting}>
      {/* <FlatList
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      /> */}
      {transactions.length > 0 ? (
  <FlatList
    data={transactions}
    keyExtractor={(item) => item.id + item.paymentDate} 
    renderItem={({ item }) => (
      <View style={styles.card}>
        {item.imageUrl.data ? (
  <Image source={{ uri: item.imageUrl.data }} style={styles.image} />
) : (
  <View style={[styles.image, { backgroundColor: '#ccc' }]} />
)}
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>{item.memberName}</Text>
          <Text>Paid: ₹{item.amountPaid}</Text>
          <Text>
  Date: {new Date(item.paymentDate).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use true if you want AM/PM
  })}
</Text>
        </View>
      </View>
    )}
  />
) : (
  <Text style={{ textAlign: 'center', marginTop: 20, color: 'white'}}>
    💤 No recent transactions found.
  </Text>
)}

      </View>
      </View>
      <View style={styles.blankbox}>

      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    // backgroundColor: '#fff',
        backgroundColor : colors.dblack,

  },
  containe2: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dblack,
    paddingHorizontal : 20,
    height : moderateScale(50),
    // width : moderateVerticalScale(100),
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color : colors.gwhite,
  },
  finance_box: {
    backgroundColor : colors.dblack,
      width : '100%',
    height : moderateScale(360),
    justifyContent : 'center',
    alignItems : 'center',
  },
  finance_box_in: {
    backgroundColor : colors.wblack,
    width : moderateScale (280),
    height : moderateScale(280),
    borderRadius : moderateScale(13),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    marginVertical: 12,
    color : colors.gwhite,
    alignSelf : 'flex-start',
    paddingLeft : 30,
    // paddintop : 10,
  },
  chartdate: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginVertical: 12,
    paddingLeft : 12,
    color : colors.gwhite,
  },
  moreinfo: {
   
    alignItems: 'center',
    color : colors.gwhite,
    backgroundColor : '#808080',
    flexDirection : 'row',
    justifyContent : 'space-between',
    borderRadius : 12,
    paddingHorizontal: 8,
    paddingVertical : 2,
    // borderWidth : 1,
    bordercolor : colors.lgray,
  },
  amountInfo_box: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    color : colors.gwhite,
    // backgroundColor : 'green',
    flexDirection : 'row',
    justifyContent : 'space-between',
    paddingHorizontal : 20,
  },
  amountInfo: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    color : colors.gwhite,
  },
  amountInfo_txt: {
   textAlign: 'left',
    color : colors.gwhite,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color : colors.gwhite,
    paddingLeft: 30,
    // backgroundColor : 'green'
  },
  flatlisting: {
   
    // backgroundColor : 'green',
    // justifyContent : 'center',
    alignItems : 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: colors.wblack,
    padding: 10,
    borderRadius: 40,
    width : moderateScale(330),
    height : moderateScale(58),
    borderWidth : 0.4,
    bordercolor : colors.lgray,
  },
  transactionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  transactionText: {
    flex: 1,
  },
  name: {
    color : colors.twhite,
    fontSize: 16,
    fontWeight: '500',
  },
  time: {
    color: '#777',
  },
  amount: {
    fontWeight: '600',
    color: colors.mgreen,
    paddingRight : 10,
  },
   card: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    elevation: 3,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  blankbox: {
    width: 50,
    height: moderateScale(125),
    // borderRadius: 25,
  },
 
});

export default home;
