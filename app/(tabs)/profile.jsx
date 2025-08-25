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


import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, signOut, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import placeholder from '../../assets/images/Avatar/man3.png';
import { auth, db } from '../../config/firebaseconfig';
import { useTheme } from '../../context/ThemeContext';
import { uploadFileToCloudinary } from '../../services/imageService';



export default function ProfileScreen() {
  // ...existing code...
  // For email update modal
  // Email update modal state
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdatePassword, setEmailUpdatePassword] = useState('');
  const [emailUpdateLoading, setEmailUpdateLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [adminDoc, setAdminDoc] = useState(null);
  // Animated value for theme transition
  const themeAnim = React.useRef(new Animated.Value(0)).current;
  const user = auth.currentUser;
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const [passwordPromptVisible, setPasswordPromptVisible] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPasswordInput, setNewPasswordInput] = React.useState('');

  // Use global theme context
  const { isDarkMode, toggleTheme } = useTheme();

  // Fetch admin profile (with image) on mount
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const ref = doc(db, 'admin', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAdminDoc(snap.data());
          setImage(snap.data().imageUrl || null);
        }
      } catch (e) {
        setAdminDoc(null);
      }
    };
    fetchAdmin();
  }, []);

  // Image picker logic (from addmember)
  const uploadImage = async (mode) => {
    try {
      let result = {};
      if (mode === 'gallery') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          await saveImage(result.assets[0].uri);
        }
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          await saveImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      alert('Error uploading image: ' + error.message);
      setOpenModal(false);
    }
  };

  const saveImage = async (imgUri) => {
    try {
      setLoadingImage(true);
      setImage({ uri: imgUri });
      // Upload to Cloudinary
      const uploadRes = await uploadFileToCloudinary({ uri: imgUri }, 'admin_profile');
      if (uploadRes.success && uploadRes.data) {
        // Save to Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          await setDoc(doc(db, 'admin', uid), { ...(adminDoc || {}), imageUrl: uploadRes.data }, { merge: true });
          setImage(uploadRes.data);
        }
      } else {
        Alert.alert('Image Upload Failed', uploadRes.msg || 'Try again.');
      }
      setLoadingImage(false);
      setOpenModal(false);
    } catch (error) {
      setLoadingImage(false);
      setOpenModal(false);
      Alert.alert('Error', error.message || 'Failed to save image');
    }
  };

  const removeImage = async () => {
    try {
      setImage(null);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await setDoc(doc(db, 'admin', uid), { ...(adminDoc || {}), imageUrl: null }, { merge: true });
      }
      setOpenModal(false);
    } catch (e) {
      setOpenModal(false);
    }
  };

  // Animate theme transition
  React.useEffect(() => {
    Animated.timing(themeAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  // Animated colors for smooth transition
  const bgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#181818']
  });
  const headerColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#181818', '#fff']
  });
  const cardBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f9f9f9', '#232323']
  });
  const labelColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#444', '#ccc']
  });
  const inputBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#eee', '#222']
  });
  const inputColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#181818', '#fff']
  });
  const btnBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2196F3', '#007AFF']
  });
  const optionTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff']
  });
  const emailRowBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f0f0f0', '#232323']
  });
  const emailTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff']
  });
  const modalCardBg = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#232323']
  });
  const modalTitleColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#181818', '#fff']
  });

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

  // Remove emailCredential logic, use password in email modal
  const verifyAdminPassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, adminPassword);
      await reauthenticateWithCredential(user, credential);
      setPasswordPromptVisible(false);
      setShowEmailModal(true);
      setAdminPassword('');
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

  // Completely new email update logic
  const handleUpdateEmail = async () => {
    setEmailUpdateLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, emailUpdatePassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      const uid = user?.uid;
      if (uid) {
        await setDoc(doc(db, 'admin', uid), { ...(adminDoc || {}), email: newEmail }, { merge: true });
      }
      await sendEmailVerification(auth.currentUser);
      Alert.alert('Success', 'Email updated! Please verify your new email before logging in.');
      setShowEmailModal(false);
      setAdminDoc((prev) => ({ ...(prev || {}), email: newEmail }));
      setEmailUpdatePassword('');
      setEmailUpdateLoading(false);
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Email update error:', error);
      Alert.alert('Email Update Error', error.message || 'Error updating email.');
      setEmailUpdateLoading(false);
    }
  };





  const navigation = useNavigation();
  const [email, setEmail] = React.useState(user?.email || '');
  const [password, setPassword] = React.useState('');

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
            <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Text style={{ fontSize: 16, color: 'grey' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Enter Current Password</Text>
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
            <TouchableOpacity onPress={() => setShowNewPasswordModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Text style={{ fontSize: 16, color: 'grey' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Enter New Password</Text>
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
            <TouchableOpacity onPress={() => setShowEmailModal(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Text style={{ fontSize: 16, color: 'grey' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>Update Email</Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="New Email"
              onChangeText={setNewEmail}
              value={newEmail}
            />
            <TextInput
              secureTextEntry
              style={styles.input}
              placeholder="Enter your password"
              value={emailUpdatePassword}
              onChangeText={setEmailUpdatePassword}
            />
            <TouchableOpacity style={styles.btn} onPress={handleUpdateEmail} disabled={emailUpdateLoading}>
              {emailUpdateLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Update Email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}> 
      <Animated.Text style={[styles.header, { color: headerColor }]}>Profile</Animated.Text>

      {/* Profile Image Section */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={
              image && typeof image === 'object' && image.uri
                ? { uri: image.uri }
                : typeof image === 'string'
                ? { uri: image }
                : placeholder
            }
            style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff', backgroundColor: '#e0f7fa' }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setOpenModal(true)}
            activeOpacity={0.7}
            style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 15, padding: 6, borderWidth: 2, borderColor: '#e0e0e0' }}
          >
            <FontAwesome name="camera" size={18} color={isDarkMode ? '#181818' : '#181818'} />
          </TouchableOpacity>
        </View>
        {loadingImage && <ActivityIndicator style={{ marginTop: 10 }} size="small" color="#2196F3" />}
      </View>

      {/* Image Picker Modal */}
      <Modal visible={openModal} animationType="fade" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ justifyContent: 'space-evenly', alignItems: 'center', height: 150, width: 300, backgroundColor: isDarkMode ? '#232323' : '#fff', borderRadius: 20 }} >
            <View style={{ width: '100%', height: 80, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
              <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage()} style={{ backgroundColor: '#fff', width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 15 }}>
                <SimpleLineIcons name="camera" size={30} color="black" />
                <Text style={{ fontSize: 10, fontWeight: '600' }}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage('gallery')} style={{ backgroundColor: '#fff', width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 15 }}>
                <AntDesign name="picture" size={30} color="black" />
                <Text style={{ fontSize: 10, fontWeight: '600' }}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={removeImage} style={{ backgroundColor: '#fff', width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 15 }}>
                <AntDesign name="delete" size={30} color="black" />
                <Text style={{ fontSize: 10, fontWeight: '600' }}>Remove</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => setOpenModal(false)}>
              <Text style={{ width: 80, textAlign: 'center', fontSize: 15, color: 'grey' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Email Update */}
      <Animated.View style={[styles.emailRow, { backgroundColor: emailRowBg }]}> 
        <FontAwesome name="envelope" size={20} color={isDarkMode ? '#fff' : '#333'} />
        <Animated.Text style={[styles.emailText, { color: emailTextColor }]}>{user?.email}</Animated.Text>
        {/* Send verification icon and check verification if not verified */}
        {!user?.emailVerified && (
          <>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await user.sendEmailVerification();
                  Alert.alert('Verification Email Sent', 'Please check your inbox.');
                } catch (e) {
                  Alert.alert('Error', e.message || 'Failed to send verification email.');
                }
              }}
              style={{ marginRight: 10 }}
              accessibilityLabel="Send verification email"
            >
              <MaterialIcons name="mark-email-unread" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await user.reload();
                  if (user.emailVerified) {
                    Alert.alert('Success', 'Your email is now verified!');
                  } else {
                    Alert.alert('Not Verified', 'Your email is still not verified. Please check your inbox and click the verification link.');
                  }
                } catch (e) {
                  Alert.alert('Error', e.message || 'Failed to check verification.');
                }
              }}
              style={{ marginRight: 10 }}
              accessibilityLabel="Check verification"
            >
              <MaterialIcons name="refresh" size={22} color="#007AFF" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={handleStartEmailEdit}>
          <Feather name="edit" size={20} color="#007AFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Password Change */}
      <TouchableOpacity style={styles.option} onPress={handleStartPasswordChange}>
        <Feather name="lock" size={24} color={isDarkMode ? '#fff' : '#555'} />
        <Animated.Text style={[styles.optionText, { color: optionTextColor }]}>Change Password</Animated.Text>
      </TouchableOpacity>

      {/* Plan Configuration */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../addplans')}>
        <FontAwesome name="cogs" size={24} color={isDarkMode ? '#fff' : '#555'} />
        <Animated.Text style={[styles.optionText, { color: optionTextColor }]}>Plan Configuration</Animated.Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push('../charts')}>
        <FontAwesome name="cogs" size={24} color={isDarkMode ? '#fff' : '#555'} />
        <Animated.Text style={[styles.optionText, { color: optionTextColor }]}>Charts</Animated.Text>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity style={styles.option}>
        <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#fff' : '#555'} />
        <Animated.Text style={[styles.optionText, { color: optionTextColor }]}>Notifications</Animated.Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Animated.Text style={{ color: headerColor, fontSize: 16, marginRight: 8 }}>Dark Mode</Animated.Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.option, { marginTop: 20 }]} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="red" />
        <Animated.Text style={[styles.optionText, { color: 'red' }]}>Logout</Animated.Text>
      </TouchableOpacity>
      {renderModel()}
      {renderModel1()}
      {renderPasswordVerifyModal()}
      {renderNewPasswordModal()}
    </Animated.View>
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
