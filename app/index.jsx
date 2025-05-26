import { useEffect, useContext, useState } from "react";
import React, { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { router, SplashScreen, useRouter } from "expo-router";
import { Text, TouchableOpacity, View, StyleSheet, Image, ActivityIndicator, ToastAndroid , Dimensions, FlatList} from "react-native";
// import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';

import { onAuthStateChanged , signOut } from "firebase/auth";
import { auth, db } from "../config/firebaseconfig";
import { userDetailContext } from "../context/userDetailContext";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import colors from "@/assets/colors";


const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    source: require('../assets/images/o1.png'),
    title: 'Welcome to Gym Manager',
    description: 'Easily manage gym members, payments, and attendance.',
  },
  {
    key: '2',
    source: require('../assets/images/o2.png'),
    title: 'Track Payments',
    description: 'Visualize income, dues, and financial insights.',
  },
  {
    key: '3',
    source: require('../assets/images/o1.png'),
    title: 'Smart Notifications',
    description: 'Get alerts for dues, renewals, and more.',
  },
];


// export default function index() {
const index = () => {

  const [loading,setLoading] = useState(true);

  const { userDetail, setUserDetail } = useContext(userDetailContext);
  // const router = useRouter(); // Define the router correctly
  
 





  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        console.log("not a user");
        // router.replace('/auth/signIn'); // 🚀 Redirect to sign-in if no user
        // router.replace('/index'); // 🚀 Redirect to sign-in if no user
        return;
      }
  
      await user.reload(); // 🔄 Refresh user data
  console.log(user.email);
      if (!user.emailVerified) {
        ToastAndroid.show('Please verify your email before logging in.', ToastAndroid.LONG);
        await signOut(auth); // 🚀 Sign out if email not verified
        router.replace('/auth/signIn');
        return;
      }
  
      // ✅ Ensure Firestore document exists
      try {
        const userRef = doc(db, "users", user.email);
        const result = await getDoc(userRef);
        console.log("Checking Firestore for user:", user.email); // Debugging
        console.log("Checking Firestore for user:", result); // Debugging

        if (user.email) {
          setUserDetail(result.data());
          setLoading(false);
          router.replace("/(tabs)/home"); // ✅ Navigate only when user data exists
        } else {
          console.log("⚠ No user data found in Firestore");
          ToastAndroid.show("No user data found, please contact support.", ToastAndroid.LONG);
          setLoading(false);
          await signOut(auth); // 🚀 Sign out if no Firestore data found
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error("❌ Error fetching user details:", error);
        setLoading(false);
        await signOut(auth); // Sign out in case of error
        router.replace('/(auth)/login');
      }
    });
  
    return () => unsubscribe();
  }, []);
  





  const onAgree = () => {
    router.push("/login");
  };


   const router = useRouter();

  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image style={styles.img} source={item.source}/>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentSlide + 1 });
    } else {
     router.replace('/login');
    }
  };






  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index && { backgroundColor: '#6200ee' },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}
export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  img: {
    width: moderateScale(200),
    height : moderateScale(200),
   
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 15,
    textAlign : 'center',
  },
  desc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    height: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 5,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: colors.pgreen,
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   paddingVertical: 60,
  // },
  // body: {},
  // footer: {
  //   height: moderateScale(200),
  //   width: moderateScale(300),
  //   gap: verticalScale(100),
  // },
  // welcome: {
  //   height: scale(300),
  //   width: scale(300),
  //   borderRadius: moderateScale(200),
  //   borderColor: "#000",
  //   backgroundColor: "#f0f0f0",
  // },
  // welcomeText: {
  //   textAlign: "center",
  //   fontStyle: "italic",
  //   fontFamily: "poppinsLI",
  //   fontWeight: "600",
  //   fontSize: moderateScale(16),
  // },
  // clicktext: {
  //   paddingHorizontal: 10,
  //   color: "#fcfffc",
  //   fontWeight: "600",
  //   fontSize: moderateScale(20),
  // },
  // head: {
  //   backgroundColor: "#2d3a3a",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   flexDirection: "row",
  //   paddingVertical: moderateScale(10),
  //   borderRadius: moderateScale(30),
  // },
  // splash: {
  //   // backgroundColor: "#2d3a3a",
  //   flex :1,
  //   alignItems: 'center',
  //   justifyContent: 'center'
    
  // },
  // splashtext: {
  //   // backgroundColor: "#2d3a3a",
  //   fontSize : moderateScale(40),
  //   // alignItems: 'center',
  //   // justifyContent: 'center'
  //   color: 'white',
  //   fontWeight: 700,
  //   // fontFamily : 
    
  // },
});
