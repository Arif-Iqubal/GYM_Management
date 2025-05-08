import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const onAgree = () => {
    router.push("/auth/login");
  };
export default function Index() {
  return (
    <SafeAreaView style={styles.mainbody} >
      <View style={styles.imgtxtbody}>
        <View style={styles.imagebody}>
          <Image source={require("@/assets/images/o2.png")} style={styles.welcome} resizeMode="contain" />
        </View>
        <View style={styles.txtbody}>
          <Text style={styles.maintxt}>Fuel your fire. Strengthen your mind. Transform your body.</Text>
        </View>
      </View>
      <View style={styles.buttonbody}>
        <TouchableOpacity  onPress={onAgree} activeOpacity={0.8} style={styles.button}>
          <Text style={styles.textbut}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  mainbody: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    // justifyContent:"center",

  },
  imgtxtbody: {
    // flex: 8,
    height : '90%',
    // backgroundColor: "blue",
    justifyContent: 'space-evenly',
    alignItems : 'center',

  },
  imagebody: {
    // flex : 1,
    width: "300",
    height: "300",
  },
  welcome: {
    // backgroundColor : "#fff",
    // color :"white",
    width: "300",
    height: "300",
  },
  txtbody: {
    // backgroundColor: "red",

  },
  maintxt: {
    // backgroundColor: "red",
    textAlign :'center',
    fontSize : 25

  },
  buttonbody: {
    // flex: 1,
    // backgroundColor: "green",
    width : "250",
    height : "50",
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