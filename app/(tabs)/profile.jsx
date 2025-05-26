// import { View, Text } from 'react-native'

// import { SafeAreaView } from 'react-native-safe-area-context'

// const profile = () => {
//   return (
//    <SafeAreaView>
//       <Text>Profile</Text>
//     </SafeAreaView>
//   )
// }

// export default profile

import React from 'react';
import { View, Button, Alert } from 'react-native';
import { auth } from '../../config/firebaseconfig';
import { signOut } from 'firebase/auth';

const profile = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Signed Out', 'You have been signed out.');
      navigation.replace('/(auth)/login'); // Or navigate to login screen
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

export default profile;
