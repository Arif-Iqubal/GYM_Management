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

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebaseconfig'; // your firebase config
import { collection, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, moderateVerticalScale } from "react-native-size-matters";
import { Directions } from "react-native-gesture-handler";

const screenWidth = Dimensions.get('window').width;

const home = () => {
  // const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [dues, setDues] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      let incomeSum = 11000;
      let duesSum = 350;
      const data = querySnapshot.docs.map(doc => {
        const item = doc.data();
        if (item.type === 'income') incomeSum += item.amount;
        else duesSum += item.amount;
        return item;
      });
      setTransactions(data);
      setIncome(incomeSum);
      setDues(duesSum);
    };

    fetchData();
  }, []);

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


  
const transactions= [
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
  {
    name: "John Doe",
    time: "10:00 AM",
    img: "",
    amount: 500,
    type: "income"
  },
  {
    name: "Jane Smith",
    time: "2:30 PM",
    img: "",
    amount: 300,
    type: "dues"
  },
];

  const renderItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <Image source={item.img ? { uri: item.img } : placeholder} style={styles.transactionImage} />
      <View style={styles.transactionText}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.amount}>₹{item.amount}</Text>
    </View>
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
 <View style={styles.container2}>
      {/* Chart Name */}
      <View style={styles.finance_box}>
      <Text style={styles.chartTitle}>Revenue</Text>
      <View style={styles.finance_box_in}>
      <Text style={styles.chartdate}>Aug</Text>

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
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      </View>
      </View>
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
});

export default home;
