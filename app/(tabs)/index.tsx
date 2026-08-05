import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.iconCircle}>
        <FontAwesome
          name="graduation-cap"
          size={45}
          color="#1565C0"
        />
      </View>

      <Text style={styles.title}>
        QR Attendance
      </Text>

      <Text style={styles.subtitle}>
        School Event Attendance
      </Text>

      <Text style={styles.description}>
        Scan QR Codes to record attendance during school activities.
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Scan QR Code
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.history}>
        <Text style={styles.historyText}>
          Attendance History
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#EEF3FB",
    padding:20,
  },

  iconCircle:{
    width:90,
    height:90,
    borderRadius:45,
    backgroundColor:"#D9ECFF",
    justifyContent:"center",
    alignItems:"center",
    marginBottom:20,
  },

  title:{
    fontSize:34,
    fontWeight:"bold",
    marginBottom:60,
  },

  subtitle:{
    fontSize:24,
    fontWeight:"600",
    color:"#1565C0",
  },

  description:{
    color:"gray",
    textAlign:"center",
    marginTop:10,
    marginBottom:35,
  },

  button:{
    width:"100%",
    backgroundColor:"#1565C0",
    padding:18,
    borderRadius:12,
    alignItems:"center",
    marginBottom:15,
  },

  buttonText:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold",
  },

  history:{
    width:"100%",
    backgroundColor:"#fff",
    padding:18,
    borderRadius:12,
    alignItems:"center",
  },

  historyText:{
    fontSize:18,
    fontWeight:"600",
  },

});