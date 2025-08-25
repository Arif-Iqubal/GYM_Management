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



import colors from '@/assets/colors';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { db } from '../../config/firebaseconfig'; // your firebase config
// import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { collectionGroup, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from "react-native-size-matters";
import { ScrollView } from 'react-native-virtualized-view';
const screenWidth = Dimensions.get('window').width;




function DonutChart({ data, total, label, isDarkMode }) {
  // data: [{ value, color, label }]
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  let startAngle = 0;
  // Helper to describe arc
  function describeArc(cx, cy, r, startAngle, endAngle) {
    const polarToCartesian = (cx, cy, r, angle) => {
      const a = (angle - 90) * Math.PI / 180.0;
      return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a)
      };
    };
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const arcSweep = endAngle - startAngle > 180 ? 1 : 0;
    return [
      "M", start.x, start.y,
      "A", r, r, 0, arcSweep, 1, end.x, end.y
    ].join(" ");
  }
  // Draw arcs for each segment
  let arcs = [];
  let currentAngle = 0;
  data.forEach((segment, i) => {
    const angle = (segment.value / total) * 360;
    const endAngle = currentAngle + angle;
    if (segment.value > 0) {
      arcs.push(
        <Path
          key={i}
          d={describeArc(cx, cy, radius, currentAngle, endAngle)}
          stroke={segment.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    currentAngle = endAngle;
  });
  // Center label color
  const labelColor = isDarkMode ? '#fff' : '#181818';
  const subLabelColor = isDarkMode ? '#aaa' : '#555';
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {/* Donut arcs */}
          {arcs}
          {/* Center total label */}
          <SvgText
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            fontWeight="bold"
            fontSize="26"
            fill={labelColor}
          >
            {total.toLocaleString()}
          </SvgText>
          <SvgText
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fontSize="14"
            fill={subLabelColor}
          >
            {label}
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}

const home = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [income, setIncome] = useState(0);
  const [dues, setDues] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
      color: isDarkMode ? '#222' : '#181818', // dark/light black
      legendFontColor: isDarkMode ? '#fff' : '#181818',
      legendFontSize: 15,
    },
    {
      name: 'Dues',
      amount: dues,
      color: isDarkMode ? '#444' : '#333', // lighter black for contrast
      legendFontColor: isDarkMode ? '#fff' : '#181818',
      legendFontSize: 15,
    },
  ];



 



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

  // Manual refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh both summary and transactions
      await Promise.all([
        fetchCurrentMonthSummary(),
        fetchRecentTransactions(adminUID).then(setTransactions)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [adminUID]);

  // Initial load on component mount
  React.useEffect(() => {
    onRefresh();
  }, []);







  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#181818' : '#fff' }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}>
        <Text style={[styles.greeting, { color: isDarkMode ? '#fff' : '#222' }]}>Hi, Admin</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
            <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={24} color={isDarkMode ? '#fff' : '#222'} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#fff' : colors.gwhite} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#fff' : colors.wblack]}
            tintColor={isDarkMode ? '#fff' : colors.wblack}
            title="Pull to refresh"
            titleColor={isDarkMode ? '#fff' : colors.wblack}
          />
        }
      >
        <View style={styles.container2}>
          {/* Chart Name */}
          <View style={[styles.finance_box, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}>
            <Text style={[styles.chartTitle, { color: isDarkMode ? '#fff' : '#181818' }]}>Revenue</Text>
            <View style={[styles.finance_box_in, { backgroundColor: isDarkMode ? '#181818' : '#fff', borderColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
              <Text style={[styles.chartdate, { color: isDarkMode ? '#fff' : '#181818' }]}>{month}</Text>
              {/* Pie Chart */}
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', height: 200, width: screenWidth * 0.8 }}>
                <DonutChart
                  data={[
                    { value: income, color: isDarkMode ? '#fff' : '#181818', label: 'Paid' },
                    { value: dues, color: isDarkMode ? '#888' : '#bbb', label: 'Unpaid' },
                    { value: Math.max(0,income ), color: isDarkMode ? '#444' : '#e0e0e0', label: 'New' },
                  ]}
                  total={income + dues + Math.max(0, (income + dues) * 0.3)}
                  label={"Total Revenue"}
                  isDarkMode={isDarkMode}
                />
                {/* Legend */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isDarkMode ? '#fff' : '#181818', marginRight: 6 }} />
                    <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontSize: 13 }}>Paid {Math.round((income / (income + dues + Math.max(0, (income + dues) * 0.3))) * 100) || 0}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isDarkMode ? '#888' : '#bbb', marginRight: 6 }} />
                    <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontSize: 13 }}>Unpaid {Math.round((dues / (income + dues + Math.max(0, (income + dues) * 0.3))) * 100) || 0}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isDarkMode ? '#444' : '#e0e0e0', marginRight: 6 }} />
                    <Text style={{ color: isDarkMode ? '#fff' : '#181818', fontSize: 13 }}>New 30%</Text>
                  </View>
                </View>
              </View>
              {/* Income & Dues */}
              {/* <View style={styles.amountInfo_box}>
                <View style={styles.amountInfo}>
                  <Text style={[styles.amountInfo_txt, { color: isDarkMode ? '#fff' : '#181818' }]}>Total Income: ₹{income}</Text>
                  <Text style={[styles.amountInfo_txt, { color: isDarkMode ? '#fff' : '#181818' }]}>Dues Amount: ₹{dues}</Text>
                </View>
                <View style={styles.amountInfo}>
                  <TouchableOpacity style={[styles.moreinfo, { backgroundColor: isDarkMode ? '#333' : '#808080' }]}><Text style={[styles.amountInfo_txt, { color: isDarkMode ? '#fff' : '#181818' }]}>More</Text></TouchableOpacity>
                </View>
              </View> */}
            </View>
          </View>
          {/* Transactions */}
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#181818' }]}>Recent Transactions</Text>
          <View style={styles.flatlisting}>
            {transactions.length > 0 ? (
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id + item.paymentDate}
                renderItem={({ item }) => (
                  <View style={[styles.card, { backgroundColor: isDarkMode ? '#232323' : '#fff' }]}>
                    <Image
                      source={
                        item.imageUrl?.data
                          ? { uri: item.imageUrl?.data }
                          : require('../../assets/images/Avatar/man3.png')
                      }
                      style={styles.image}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#181818' }]}>{item.memberName}</Text>
                      <Text style={{ color: isDarkMode ? '#fff' : '#181818' }}>Paid: ₹{item.amountPaid}</Text>
                      <Text style={{ color: isDarkMode ? '#fff' : '#181818' }}>
                        Date: {new Date(item.paymentDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20, color: isDarkMode ? '#fff' : '#181818', height: 150 }}>
                💤 No recent transactions found.
              </Text>
            )}
          </View>
        </View>
        <View style={styles.blankbox}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    backgroundColor: '#fff',
  },
  containe2: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    height: moderateScale(50),
    // width : moderateVerticalScale(100),
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  finance_box: {
    backgroundColor: '#fff',
    width: '100%',
    height: moderateScale(360),
    justifyContent: 'center',
    alignItems: 'center',
  },
  finance_box_in: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: moderateScale(280),
    height: moderateScale(280),
    borderRadius: moderateScale(13),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    marginVertical: 12,
    color: '#181818',
    alignSelf: 'flex-start',
    paddingLeft: 30,
    // paddintop : 10,
  },
  chartdate: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginVertical: 12,
    paddingLeft: 12,
    color: '#181818',
  },
  moreinfo: {

    alignItems: 'center',
    color: colors.gwhite,
    backgroundColor: '#808080',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    // borderWidth : 1,
    bordercolor: colors.lgray,
  },
  amountInfo_box: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    color: colors.gwhite,
    // backgroundColor : 'green',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  amountInfo: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    color: colors.gwhite,
  },
  amountInfo_txt: {
    textAlign: 'left',
    color: '#181818',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#181818',
    paddingLeft: 30,
    // backgroundColor : 'green'
  },
  flatlisting: {

    // backgroundColor : 'green',
    // justifyContent : 'center',
    alignItems: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: colors.wblack,
    padding: 10,
    borderRadius: 40,
    width: moderateScale(330),
    height: moderateScale(58),
    borderWidth: 0.4,
    bordercolor: colors.lgray,
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
    color: '#181818',
    fontSize: 16,
    fontWeight: '500',
  },
  time: {
    color: '#777',
  },
  amount: {
    fontWeight: '600',
    color: colors.mgreen,
    paddingRight: 10,
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
  donutCenterOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

});

export default home;
