import { StyleSheet, Text, View } from "react-native";

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Attendance History
      </Text>

      <Text>
        Your past attendance records will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#EEF3FB",
  },

  title:{
    fontSize:30,
    fontWeight:"bold",
    marginBottom:15,
  },

});