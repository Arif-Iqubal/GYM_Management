// // import { View, Text } from 'react-native'

// // import { SafeAreaView } from 'react-native-safe-area-context'

// // const profile = () => {
// //   return (
// //    <SafeAreaView>
// //       <Text>Profile</Text>
// //     </SafeAreaView>
// //   )
// // }

// // export default profile

// import React from 'react';
// import { View, Button, Alert } from 'react-native';
// import { auth } from '../../config/firebaseconfig';
// import { signOut } from 'firebase/auth';
// import { router } from 'expo-router';

// const profile = ({ navigation }) => {



// const onAgree = () => {
//     router.push("@/addplans")
//   }

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       Alert.alert('Signed Out', 'You have been signed out.');
//       navigation.replace('../(auth)/login'); // Or navigate to login screen
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }
//   };

//   return (
//     <View style={{ marginTop: 20 }}>
//       <Button title="Sign Out" onPress={handleSignOut} />
//       <Button title="add plans" onPress={onAgree} />
//     </View>
//   );
// };

// export default profile;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, Modal, Button } from 'react-native';
import { auth } from '../../config/firebaseconfig'; // Your Firebase config
import { updateEmail, updatePassword, signOut } from 'firebase/auth';
import { router, useNavigation } from 'expo-router';
import { FontAwesome, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { reload } from 'firebase/auth';


import { reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from 'firebase/auth';
// import { Modal, Alert } from 'react-native';

export default function ProfileScreen() {

  const user = auth.currentUser;

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [passwordPromptVisible, setPasswordPromptVisible] = useState(false);



  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');


  const handleStartPasswordChange = () => {
    setShowPasswordModal(true);
  };



  const verifyCurrentPassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      setShowPasswordModal(false);
      setShowNewPasswordModal(true);
    } catch (error) {
      Alert.alert("Auth Failed", "Incorrect current password.");
    }
  };




  const handleUpdatePassword = async () => {
    try {
      await updatePassword(user, newPasswordInput);
      Alert.alert("Success", "Password changed successfully.");
      setShowNewPasswordModal(false);
      signOut(auth);
      router.replace("../login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  const handleStartEmailEdit = () => {
    setPasswordPromptVisible(true);
  };

  const verifyAdminPassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, adminPassword);
      await reauthenticateWithCredential(user, credential);
      setPasswordPromptVisible(false);
      setShowEmailModal(true);
    } catch (error) {
      Alert.alert("Auth Failed", "Incorrect password. Try again.");
    }
  };

  // const handleUpdateEmail = async () => {
  //   try {
  //     console.log(newEmail);
  //     const user = auth.currentUser;
  //     await sendEmailVerification(user);
  //     await reload(user); // Refresh user state

  //     if (!user.emailVerified) {
  //       Alert.alert(
  //         "Email Not Verified",
  //         "Please verify your current email before changing it."
  //       );
  //       console.log(newEmail);
  //       await sendEmailVerification(user);
  //       return;

  // }

  //     await updateEmail(user, newEmail);
  //     // await sendEmailVerification(user);
  //         await sendEmailVerification(auth.currentUser); // Send verification to new email

  //     Alert.alert("Verification Email Sent", "Check your inbox to verify your new email.");
  //     signOut(auth);
  //     setShowEmailModal(false);
  //         router.replace('../login');

  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   }
  // };

  const handleUpdateEmail = async () => {
    try {
      const user = auth.currentUser;
      await reload(user); // Always reload user state

      // Ensure the current email is verified
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        Alert.alert("Current Email Not Verified", "We've sent you a verification email. Please verify your current email first.");
        return;
      }
      console.log("running");
      // Step 1: Update email
      await updateEmail(user, newEmail);
      console.log("still_running");

      // Step 2: Send verification email to new email
      await sendEmailVerification(user);

      Alert.alert(
        "Email Changed",
        "A verification email has been sent to your new address. Please verify it and log in again."
      );

      await signOut(auth);
      router.replace("../login");
      setShowEmailModal(false);


    } catch (error) {
      console.log("Not running");
      switch (error.code) {
        case "auth/requires-recent-login":
          console.error(
            "Recent login required. Please reauthenticate the user before updating the email."
          );
          break;

        case "auth/invalid-email":
          console.error("The provided email is invalid.");
          break;

        case "auth/email-already-in-use":
          console.error("The email is already in use by another account.");
          break;

        default:
          console.error("Error updating email:", error.message);
          setShowEmailModal(false);
          break;
      }
    }
  };




  const navigation = useNavigation();

  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [themeDark, setThemeDark] = useState(false);

  // const handleUpdateEmail = async () => {
  //   try {
  //     await updateEmail(user, email);
  //     Alert.alert('Success', 'Email updated!');
  //   } catch (error) {
  //     Alert.alert('Error', error.message);
  //   }
  // };

  const handleChangePassword = async () => {
    try {
      await updatePassword(user, password);
      Alert.alert('Success', 'Password changed!');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    router.replace('../login'); // Or wherever your login screen is
  };



  function renderPasswordVerifyModal() {
    return (
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Current Password</Text>
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity style={styles.btn} onPress={verifyCurrentPassword}>
              <Text style={styles.btnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function renderNewPasswordModal() {
    return (
      <Modal visible={showNewPasswordModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter New Password</Text>
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="New Password"
              value={newPasswordInput}
              onChangeText={setNewPasswordInput}
            />
            <TouchableOpacity style={styles.btn} onPress={handleUpdatePassword}>
              <Text style={styles.btnText}>Update Password</Text>
            </TouchableOpacity>
                        <Button title="Cancel" color="gray" onPress={() => renderNewPasswordModal(false)} />

          </View>
        </View>
      </Modal>
    );
  }


  function renderModel() {
    return (
      <Modal visible={passwordPromptVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Admin Password</Text>
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="Password"
              onChangeText={setAdminPassword}
              value={adminPassword}
            />
            <TouchableOpacity style={styles.btn} onPress={verifyAdminPassword}>
              <Text style={styles.btnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    )
  }

  function renderModel1() {
    return (

      <Modal visible={showEmailModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter New Email</Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="New Email"
              onChangeText={setNewEmail}
              value={newEmail}
            />
            <TouchableOpacity style={styles.btn} onPress={handleUpdateEmail}>
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Email Update */}
      {/* <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.btn} onPress={handleUpdateEmail}>
          <Text style={styles.btnText}>Update Email</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.emailRow}>
        <FontAwesome name="envelope" size={20} color="#333" />
        <Text style={styles.emailText}>{user?.email}</Text>
        <TouchableOpacity onPress={handleStartEmailEdit}>
          <Feather name="edit" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>


      {/* Password Change */}
      <TouchableOpacity style={styles.option} onPress={handleStartPasswordChange}>
        <Feather name="lock" size={24} color="#555" />
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>


      {/* Plan Configuration */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../addplans')}>
        <FontAwesome name="cogs" size={24} color="#555" />
        <Text style={styles.optionText}>Plan Configuration</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../charts')}>
        <FontAwesome name="cogs" size={24} color="#555" />
        <Text style={styles.optionText}>Charts</Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <View style={styles.option}>
        <Feather name="sun" size={24} color="#555" />
        <Text style={styles.optionText}>Dark Mode</Text>
        <Switch value={themeDark} onValueChange={setThemeDark} />
      </View>

      {/* Notifications */}
      <TouchableOpacity style={styles.option}>
        <Ionicons name="notifications-outline" size={24} color="#555" />
        <Text style={styles.optionText}>Notifications</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={[styles.option, { marginTop: 20 }]} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="red" />
        <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
      </TouchableOpacity>
      {renderModel()}
      {renderModel1()}
      {renderPasswordVerifyModal()}
{renderNewPasswordModal()}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  emailText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    margin: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },

});
