// app/_layout.js or app/(tabs)/_layout.js

import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Foundation from '@expo/vector-icons/Foundation';
import colors from "@/assets/colors";
import { View } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.wblack,
        tabBarInactiveTintColor: colors.lgrey,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.wblack,
          position: 'absolute',
          bottom: 60,
          // justifyContent: 'center',
          alignSelf: 'center',
          height: 55,
          marginHorizontal: 10,
          paddingHorizontal: 10,
          paddingVertical: 8,
          // paddingBottom: 1,
          borderRadius: 50,
          // flex : 1,
          flexDirection: 'row',
          alignItems: 'center',
          color:'white',
          alignContent : 'center',
          paddingTop: 10,
          borderWidth : 0.4,
          // borderColor : colors.gwhite,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                // padding:12,
                justifyContent: 'center',
                borderRadius: 30,
                backgroundColor: focused ? colors.gwhite : colors.wblack,
                width: 35,
                height: 35,
                alignItems: 'center',
                
                // alignSelf : 'center',
              }}
             
            >
              <Entypo name="home" size={24} color={color} />
            </View >

          ),
          
        }}
      />
      <Tabs.Screen
        name="member"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                // padding:12,
                justifyContent: 'center',
                borderRadius: 30,
                backgroundColor: focused ? colors.gwhite : colors.wblack,
                width: 35,
                height: 35,
                alignItems: 'center',
                // alignSelf : 'center',
              }}
            >
              <MaterialIcons name="people" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="addmember"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                // padding:12,
                justifyContent: 'center',
                borderRadius: 30,
                backgroundColor: focused ? colors.gwhite : colors.wblack,
                width: 35,
                height: 35,
                alignItems: 'center',
                // alignSelf : 'center',
              }}
            >
              <Feather name="plus" size={24} color={color} />
            </View >

          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                // padding:12,
                justifyContent: 'center',
                borderRadius: 30,
                backgroundColor: focused ? colors.gwhite : colors.wblack,
                width: 35,
                height: 35,
                alignItems: 'center',
                // alignSelf : 'center',
              }}
            >
              <Foundation name="graph-pie" size={24} color={color} />                    
                      </View >

          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                // padding:12,
                justifyContent: 'center',
                borderRadius: 30,
                backgroundColor: focused ? colors.gwhite : colors.wblack,
                width: 35,
                height: 35,
                alignItems: 'center',
                // alignSelf : 'center',
              }}
            >
              <Feather name="user" size={24} color={color} />
              </View >

          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
