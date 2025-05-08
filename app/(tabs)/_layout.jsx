import { Stack, Tabs } from 'expo-router';
import { ScreenStack } from 'react-native-screens';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Foundation from '@expo/vector-icons/Foundation';

export default function Layout() {
  return (
   <Tabs screenOptions={{headerShown:false}}>
    <Tabs.Screen name='Home' options={{tabBarIcon : ()=> <Entypo name="home" size={24} color="black" />}}/>
    <Tabs.Screen name='Member' options={{tabBarIcon : ()=> <MaterialIcons name="people" size={24} color="black" />}}/>
    <Tabs.Screen name='Addmember' options={{tabBarIcon : ()=> <Feather name="plus" size={24} color="black" />}}/>
    <Tabs.Screen name='Dashboard' options={{tabBarIcon : ()=> <Foundation name="graph-pie" size={24} color="black" />}}/>
    <Tabs.Screen name='Profile' options={{tabBarIcon : ()=> <Feather name="user" size={24} color="black" />}}/>
   </Tabs>
  );
}
