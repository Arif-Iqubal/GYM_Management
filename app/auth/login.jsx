import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { router } from "expo-router";
import { moderateScale } from 'react-native-size-matters';


const onAgree = () => {
    router.push("/(tabs)/home");
  };

const login = () => {
  return (
    <View style={styles.body}>
            <View style={styles.buttonbody}>
              <TouchableOpacity  onPress={onAgree} activeOpacity={0.8} style={styles.button}>
                <Text style={styles.textbut}>LOG IN</Text>
              </TouchableOpacity>
            </View>
      
    
    </View>
  )
}

export default login

const styles = StyleSheet.create({
    body:{
        flex : 1,
        justifyContent : 'center',
        alignItems : 'center',
    },

     buttonbody: {
    // flex: 1,
    // backgroundColor: "green",
    width : moderateScale(200),
    height : moderateScale(30),
    justifyContent : 'center',
    borderRadius : 20,
    borderColor : 'black',
    borderWidth : 2,
  },
  textbut: {
    // flex: 1,
    // backgroundColor: "green",
    textAlign : 'center',
    fontWeight : 700,
  }

})