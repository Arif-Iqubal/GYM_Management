import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from "@/assets/colors";
import { moderateScale } from 'react-native-size-matters';
import { router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

const onAgree = () => {
  router.push("/home");
};

const addmember = () => {
  return (
    <SafeAreaView style={styles.mainbody}>
      <View style={styles.headerbox}>
        <View style={styles.leftnav}>
          <TouchableOpacity onPress={onAgree} activeOpacity={0.8}><Ionicons name="chevron-back-sharp" size={26} color="white" /></TouchableOpacity>
          <Text style={styles.navtext}>Add Members</Text>
        </View>
        <TouchableOpacity onPress={onAgree} activeOpacity={0.8} style={styles.savebox}><Text style={styles.savetext}>Save</Text></TouchableOpacity>
      </View>
      <ScrollView >
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
      </ScrollView>
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
    gap: 20,
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
    // backgroundColor: 'yellow',
    width: moderateScale(300),
    // height : moderateScale(45),
    // borderRadius : moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    gap : moderateScale(8),
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
})