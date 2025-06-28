import { View, Text, ScrollView, ToastAndroid, TextInput, StyleSheet, TouchableOpacity, Button, Image, ImageBackground, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from "@/assets/colors";
import { moderateScale } from 'react-native-size-matters';
import { router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { uploadFileToCloudinary } from '../../services/imageService'

import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

import * as ImagePicker from 'expo-image-picker';
import placeholder from '../../assets/images/Avatar/man3.png'
import React, { useEffect, useState } from 'react';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../config/firebaseconfig';
import { collection, addDoc, onSnapshot,doc, setDoc,getDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';
// import { format } from 'date-fns';

const onAgree = () => {
  router.push("/home");
};


const addmember = () => {




  const [image, setImage] = useState(null);
  const [modelvisible, setModalVisible] = useState();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    gender: 'Male',
    trainingType: '',
    email: '',
    dob: new Date(),
    gymPlan: '1 Month',
    admissionFee: '',
    joiningDate: new Date(),
    paidAmount: '',
    paymentMethod: 'Cash',
    dues: '',
    comments: '',
    address: '',
  });

  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showJoinPicker, setShowJoinPicker] = useState(false);
  const [adminUID, setAdminUID] = useState("ecNCqm8PgxOEgG9S7puVpm2hVZn2");


  //  const [image, setImage] = useState(null);


  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const memberId = uuid.v4().slice(0, 8); // short unique ID
    const uid = adminUID || auth.currentUser?.uid;
    console.log(uid);
      const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const planDuration = parseInt(form.gymPlanduration) || 30;


  
  // Calculate expiry date
  const joinDateObj = new Date(form.joiningDate);
  const planExpireDate = new Date(joinDateObj);
  planExpireDate.setDate(joinDateObj.getDate() + planDuration);

    try {
      // const imageUrl = await uploadFileToCloudinary(image);
      const imageUrl = await uploadFileToCloudinary(image, "member_images");
      // console.log(imageUrl);
      const memberRef = await addDoc(collection(db, 'admin', uid, 'members'), {
        ...form,
        memberId,
        imageUrl,
        dob: form.dob.toISOString(),
        joiningDate: form.joiningDate.toISOString(),
           planExpireDate: planExpireDate.toISOString(), // ✅ store expiry
        createdAt: new Date().toISOString(),
      });



      // Step 2: Add initial transaction inside the member document

       const today = new Date();
// const paymentDate = today.toISOString().split('T')[0];
const monthId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;


      // await addDoc(collection(db, 'admin', uid, 'members', memberRef.id, 'transactions',monthId), {
      //   memberName: form.name,
      //   paymentDate: new Date().toISOString(),
      //   amountpaid: parseFloat(form.paidAmount) || 0,
      //   paymentMethod: form.paymentMethod,
      //   dues: form.dues,
      //   plandetail: form.gymPlan,
      //   planduration : form.gymPlanduration,
      // });

//       const transactionRef = doc(
//   db,
//   'admin',
//   uid,
//   'members',
//   memberRef.id,
//   'transactions',
//   monthId  // <- this is a DOCUMENT ID
// );


 await addDoc(
      collection(db, 'admin', uid, 'members', memberRef.id, 'transactions'),
      {
        memberName: form.name,
        paymentDate: today.toISOString(),
        amountPaid: parseFloat(form.paidAmount) || 0,
        paymentMethod: form.paymentMethod,
        dues: parseFloat(form.dues) || 0,
        planDetail: form.gymPlan,
        planDuration: planDuration,
        planExpireDate: planExpireDate.toISOString(),
        receiptId: `TXN${Date.now()}`
      }
    );


// await setDoc(transactionRef, {
//   memberName: form.name,
//   paymentDate: new Date().toISOString(),
//   amountPaid: parseFloat(form.paidAmount) || 0,
//   paymentMethod: form.paymentMethod,
//   dues: form.dues,
//   planDetail: form.gymPlan,
//   planDuration: form.gymPlanduration,
// });

//updating financialyear summary

const updateFinancialSummary = async (
  adminId,
  amountPaid,
  dues,
  monthIndex,
  year
) => {
  const month = String(monthIndex + 1).padStart(2, '0'); // "01"–"12"
  const summaryRef = doc(db, 'admin', adminId, 'financialSummary', String(year));

  try {
    const docSnap = await getDoc(summaryRef);

    let monthly = {};
    let yearlyTotal = { income: 0, dues: 0 };

    if (docSnap.exists()) {
      const data = docSnap.data();
      monthly = data.monthly || {};
      yearlyTotal = data.yearlyTotal || {};
    }

    const currentMonthData = monthly[month] || { income: 0, dues: 0 };
    currentMonthData.income += amountPaid;
    currentMonthData.dues += dues;
    monthly[month] = currentMonthData;

    // Recalculate yearly total
    const allMonths = Object.values(monthly);
    yearlyTotal.income = allMonths.reduce((sum, m) => sum + (m.income || 0), 0);
    yearlyTotal.dues = allMonths.reduce((sum, m) => sum + (m.dues || 0), 0);

    await setDoc(summaryRef, {
      monthly,
      yearlyTotal,
    });
  } catch (err) {
    console.error('Error updating financial summary:', err.message);
  }
};

// await setDoc(transactionRef, {
//   memberName: form.name,
//   paymentDate: new Date().toISOString(),
//   amountPaid: parseFloat(form.paidAmount) || 0,
//   paymentMethod: form.paymentMethod,
//   dues: parseFloat(form.dues) || 0,
//   planDetail: form.gymPlan,
//   planDuration: form.gymPlanduration,
// });

// ✅ Update Financial Summary
await updateFinancialSummary(
  uid,
  parseFloat(form.paidAmount) || 0,
  parseFloat(form.dues) || 0,
  today.getMonth(), // month index (0 for Jan)
  today.getFullYear()
);


// Update financial summary
await updateFinancialSummary(
  uid,
  parseFloat(form.paidAmount) || 0,
  parseFloat(form.dues) || 0,
  today.getMonth(), // 0–11
  today.getFullYear()
);


      ToastAndroid.show('Member and transaction added successfully!', ToastAndroid.LONG);

      // ToastAndroid.show('Member added successfully!', ToastAndroid.LONG);
      setForm({
        name: '',
        mobile: '',
        gender: 'Male',
        trainingType: '',
        email: '',
        dob: new Date(),
        gymPlan: '1 Month',
        gymPlanduration: 30,
        admissionFee: '',
        joiningDate: new Date(),
        paidAmount: '',
        paymentMethod: 'Cash',
        dues: '',
        comments: '',
        address: '',

      });
      setImage(null);
      router.push("/home");
    } catch (error) {
      console.error('Error adding member:', error);
      ToastAndroid.show('Error adding member', ToastAndroid.LONG);
    }
  };





  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    const adminId = 'ecNCqm8PgxOEgG9S7puVpm2hVZn2';
    // let q = collection(db, 'admin', adminId, 'members');
    const unsub = onSnapshot(collection(db, 'admin', adminId, 'plans'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(list);
    });

    return () => unsub();
  }, []);


  const uploadImage = async (mode) => {
    try {
      let result = {};
      if (mode === 'gallery') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          // mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          //
          await saveImage(result.assets[0].uri);
        }
      }
      else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.
          launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,


          });
        if (!result.canceled) {
          //
          await saveImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      alert("Error uploading image : " + error.message);
      setOpenModal(false);
    }

  };
  const saveImage = async (image) => {
    try {
      console.log(image)
      setImage({ uri: image });
      setOpenModal(false);
    } catch (error) {
      throw error;
    }
  };


  // Remove Image
  const removeImage = async () => {
    try {
      setImage(null);
      setOpenModal(false);
    } catch ({ message }) {
      alert(message);
      setOpenModal(false);

    }
  }



  useEffect(() => {
    const planPrice = parseFloat(selectedPlan?.price || 0);
    const admission = parseFloat(form.admissionFee || 0);
    const paid = parseFloat(form.paidAmount || 0);
    const dues = planPrice + admission - paid;

    handleChange('dues', dues > 0 ? dues.toFixed(2) : '0');
  }, [selectedPlan, form.admissionFee, form.paidAmount]);



  const [openModal, setOpenModal] = useState(false);
  const transparent = 'rgba(0,0,0,0.2)';

  function renderModel() {
    return (
      <Modal visible={openModal} animationType="fade" transparent={true}>
        <View style={{
          // flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: transparent,
          marginTop: 40,
          paddingBottom: 40,
          height: '90%'
        }}>
          <View style={{
            // flex : 1,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: moderateScale(150),
            width: moderateScale(300),
            backgroundColor: colors.lblack,
            borderRadius: 20,
          }} >
            <View
              style={{
                // backgroundColor: 'green',
                width: "100%",
                height: moderateScale(80),
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage()}
                style={{
                  backgroundColor: colors.twhite,
                  width: moderateScale(60),
                  height: moderateScale(60),
                  // flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}
              >
                <SimpleLineIcons name="camera" size={30} color="black" />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={() => uploadImage('gallery')}
                style={{
                  backgroundColor: colors.twhite,
                  width: moderateScale(60),
                  height: moderateScale(60),
                  // flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}
              >
                <AntDesign name="picture" size={30} color="black" />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={() => removeImage()}
                style={{
                  backgroundColor: colors.twhite,
                  width: moderateScale(60),
                  height: moderateScale(60),
                  // flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}
              >
                <AntDesign name="delete" size={30} color="black" />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >Remove</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => setOpenModal(false)}>
              <Text
                style={{
                  width: moderateScale(80),
                  // height: moderateScale(30),
                  // backgroundColor : 'blue',
                  textAlign: 'center',
                  fontSize: moderateScale(15),
                  color: 'grey'
                  // alignContent : 'center'
                }}
              >Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }



  return (
    <SafeAreaView style={styles.mainbody}>
      <View style={styles.headerbox}>
        <View style={styles.leftnav}>
          <TouchableOpacity onPress={onAgree} activeOpacity={0.8}><Ionicons name="chevron-back-sharp" size={26} color="white" /></TouchableOpacity>
          <Text style={styles.navtext}>Add Members</Text>
        </View>
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={styles.savebox}><Text style={styles.savetext}>Save</Text></TouchableOpacity>
      </View>
      {/* <ScrollView >
        <View style={styles.Scrollbody}>
          <View style={styles.imgboxout}>
            <View style={styles.imgboxin}><Ionicons name="person-sharp" size={150} color="grey" /></View>
            <View style={styles.clickicon}><Entypo name="images" size={24} color="black" /></View>
          </View>
          <View style={styles.inputbodym}>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey}  placeholder='Enter Your Name' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='+91 ' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Gender' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Training Type' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='546' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Email' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='DOB' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Select Gym Plan' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Admission Fees' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Discount' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Select joining Date' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Paid Amount' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Select Payment Method' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Dues' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Comments' style={styles.inputval}></TextInput></View>
            </View>
            <View style={styles.inputbody}>
              <View style={styles.inputval}><TextInput placeholderTextColor={colors.dgrey} placeholder='Address' style={styles.inputval}></TextInput></View>
            </View>
          </View>
        </View>
      </ScrollView> */}








      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.profileimgcontmain}>
          <View style={styles.bg}>
            <View style={styles.profileimgcont}>
              <View style={styles.profileimgin} >
                {/* <Image style={styles.profileimg} resizeMode="contain" source={image ? { uri: image } : placeholder} />
                 */}
                <Image
                resizeMode="contain"
                  source={
                    image && typeof image === 'object' && image.uri
                      ? { uri: image.uri }
                      : typeof image === 'string'
                        ? { uri: image }
                        : placeholder
                  }
                  style={styles.profileimg}
                />
              </View>

              <TouchableOpacity onPress={() => setOpenModal(true)} activeOpacity={0.5} style={styles.profileimgcam}><FontAwesome name="camera" size={18} color={colors.cwhite} /></ TouchableOpacity>
            </View>
          </View>
        </View>


        {/* <Text style={styles.title}>Add Gym Member</Text> */}
        <Text style={styles.label}>Personal Detail</Text>
        <TextInput placeholder="Name" placeholderTextColor={colors.pholder} value={form.name} onChangeText={text => handleChange('name', text)} style={styles.input} />
        <TextInput placeholder="Mobile Number" placeholderTextColor={colors.pholder} keyboardType="phone-pad" value={form.mobile} onChangeText={text => handleChange('mobile', text)} style={styles.input} />
        <TextInput placeholder="Email" placeholderTextColor={colors.pholder} value={form.email} onChangeText={text => handleChange('email', text)} style={styles.input} />
        <TextInput placeholder="Training Type" placeholderTextColor={colors.pholder} value={form.trainingType} onChangeText={text => handleChange('trainingType', text)} style={styles.input} />

        <Text style={styles.label}>Gender</Text>
        <Picker selectedValue={form.gender} onValueChange={value => handleChange('gender', value)} style={styles.picker}>
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        <Text style={styles.label}>Date of Birth</Text>
        <Button style={styles.pickstyle} title={form.dob.toDateString()} onPress={() => setShowDOBPicker(true)} />
        {showDOBPicker && (
          <DateTimePicker
            value={form.dob}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDOBPicker(false);
              if (date) handleChange('dob', date);
            }}
          />
        )}

        <Text style={styles.label}>Select Gym Plan</Text>

        {/* <Picker selectedValue={form.gymPlan} onValueChange={value => handleChange('gymPlan', value)} style={styles.picker}>
          <Picker.Item label="1 Month" value="1000" />
          <Picker.Item label="3 Months" value="2000" />
          <Picker.Item label="6 Months" value="3000" />
        </Picker> */}


        {/* <Picker
        selectedValue={selectedPlan}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPlan(itemValue)}
      >
        <Picker.Item label="-- Select Plan --" value="" />
        {plans.map((plan) => (
          <Picker.Item
            key={plan.id}
            label={`${plan.name} - ₹${plan.price}`}
            value={plan.id}
          />

           ))}
      </Picker> */}


        <Picker
          selectedValue={selectedPlan?.id || ''}
          style={styles.picker}
          onValueChange={(itemValue) => {
            const plan = plans.find(p => p.id === itemValue);
            setSelectedPlan(plan);
            handleChange('gymPlan', plan?.name || ''); // Save plan name in form
            handleChange('gymPlanduration', plan?.duration || ''); // Save plan name in form
          }}
        >
          <Picker.Item label="-- Select Plan --" value="" />
          {plans.map((plan) => (
            <Picker.Item
              key={plan.id}
              label={`${plan.name} - ₹${plan.price}`}
              value={plan.id}
            />
          ))}
        </Picker>


        <TextInput placeholder="Admission Fees" placeholderTextColor={colors.pholder} keyboardType="numeric" value={form.admissionFee} onChangeText={text => handleChange('admissionFee', text)} style={styles.input} />
        <TextInput placeholder="Paid Amount" placeholderTextColor={colors.pholder} keyboardType="numeric" value={form.paidAmount} onChangeText={text => handleChange('paidAmount', text)} style={styles.input} />
        {/* <TextInput placeholder="Dues" placeholderTextColor={colors.pholder} keyboardType="numeric" value={form.dues} onChangeText={text => handleChange('dues', text)} style={styles.input} /> */}
        <Text style={styles.label}>Dues Amount</Text>
        <TextInput
          placeholder="Dues"
          placeholderTextColor={colors.pholder}
          keyboardType="numeric"
          value={form.dues}
          editable={false}
          style={[styles.input]}
        />


        <Text style={styles.label}>Select Joining Date</Text>
        <Button backgroundColor={colors.gwhite} color={colors.lgrey} style={styles.pickstyle} title={form.joiningDate.toDateString()} onPress={() => setShowJoinPicker(true)} />
        {showJoinPicker && (
          <DateTimePicker
            value={form.joiningDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowJoinPicker(false);
              if (date) handleChange('joiningDate', date);
            }}
          />
        )}

        <Text style={styles.label}>Payment Method</Text>
        <Picker selectedValue={form.paymentMethod} onValueChange={value => handleChange('paymentMethod', value)} style={styles.picker}>
          <Picker.Item label="Cash" value="Cash" />
          <Picker.Item label="UPI" value="UPI" />
          <Picker.Item label="Card" value="Card" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        <TextInput placeholder="Address" placeholderTextColor={colors.pholder} value={form.address} onChangeText={text => handleChange('address', text)} style={styles.input} />
        <TextInput placeholder="Comments" placeholderTextColor={colors.pholder} value={form.comments} onChangeText={text => handleChange('comments', text)} style={styles.input} />

        {/* <TouchableOpacity title="Submit" onPress={handleSubmit} color="#6200ee" /> */}
        <View style={styles.filler}></View>
      </ScrollView>
      {renderModel()}
    </SafeAreaView>
  )
}

export default addmember

const styles = StyleSheet.create({
  mainbody: {
    flex: 1,
    // justifyContent : 'center',
    backgroundColor: colors.dblack,
    alignItems: 'center',
    // gap: 20,
  },
  headerbox: {
    // flex : 1,
    justifyContent: 'space-between',
    height: moderateScale(60),
    width: '100%',
    backgroundColor: colors.wblack,
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftnav: {
    // flex : 1,
    // justifyContent : 'center',
    height: '100%',
    width: moderateScale(200),
    // backgroundColor: 'green',
    alignItems: 'center',
    flexDirection: 'row',
    gap: moderateScale(10),
    paddingLeft: moderateScale(10),
  },
  navtext: {
    fontSize: moderateScale(18),
    fontWeight: 600,
    color: colors.gwhite,

  },
  savebox: {

    backgroundColor: colors.gwhite,
    // paddingRight : moderateScale(10),
    marginRight: moderateScale(10),
    width: moderateScale(60),
    height: moderateScale(26),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',

  },
  savetext: {
    fontSize: moderateScale(14),
    fontWeight: 600,
    textAlign: 'center',
    // color : colors.gwhite,

  },
  Scrollbody: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  imgboxout: {
    backgroundColor: colors.wblack,
    width: moderateScale(150),
    height: moderateScale(150),
    alignItems: 'center',
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    position: 'relative',
    // marginTop : moderateScale(30),
    // color : colors.gwhite,

  },
  inputbodym: {
    backgroundColor: 'yellow',
    // width: moderateScale(300),
    // height : moderateScale(45),
    // borderRadius : moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  inputbody: {
    backgroundColor: colors.wblack,
    width: moderateScale(300),
    height: moderateScale(45),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // borderColor : 'grey',
  },
  inputval: {
    width: '95%',
  },
  filler: {
    width: '100%',
    height: moderateScale(80),
  },




  container: {
    // flex : 1,
    width: moderateScale(320),
    // height: '100%',
    // padding: 16,
    color: colors.lgrey,
    backgroundColor: colors.dblack,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.gwhite,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 15,
    marginBottom: 12,
    color: colors.gwhite,
    backgroundColor: colors.wblack,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    color: colors.gwhite,
    // width : moderateScale(100),
  },
  picker: {
    backgroundColor: colors.wblack,
    marginBottom: 12,
    color: colors.pholder,
    borderRadius: 17,
  },
  pickstyle: {
    backgroundColor: colors.wblack,
    marginBottom: 12,
    color: colors.pholder,
    borderRadius: 17,
  },




  profileimgcontmain: {
    width: "100%",
    height: moderateScale(150),
    justifyContent: 'center',
    alignItems: "center",

    // backgroundColor: "red",


    // borderRadius : moderateScale(50),

  },
  profileimgcont: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: colors.pgreenl,
    justifyContent: 'flex-end',
    alignItems: 'center',



    // zIndex : 2,



  },
  profileimg: {
    width: moderateScale(120),
    height: moderateScale(120),
    backgroundColor: colors.pgreenl,
    borderRadius: moderateScale(60),
    zIndex: 2,
    borderWidth: 3,
    borderColor: colors.cwhite,



  },
  profileimgcam: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(10),
    position: 'absolute',
    // alignContent : "baseline",
    justifyContent: 'center',
    alignItems: "center",
    zIndex: 2,
    backgroundColor: colors.twhite,
    borderWidth: 2,
    borderColor: colors.cwhite,
    // marginLeft: 100,
    // marginLeft : 10,


  },
  bg: {
    // width: '100%',
    // height: '100%',
    justifyContent: 'center',
    alignItems: "center",
    // borderBottomLeftRadius : moderateScale(50),
  },
})