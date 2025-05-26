import React,{ useEffect } from 'react';
// import { View, Text } from 'react-native';
import { auth} from '../../config/firebaseconfig';
import { View, Text } from 'react-native'
import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../firebase';
// import { SafeAreaView } from 'react-native-safe-area-context'

const dashboard = () => {
// App.js

// export default function App() {


  return (
    <View style={{ padding: 40 }}>
      <Text>Creating admin account...</Text>
    </View>
  );
}


export default dashboard




