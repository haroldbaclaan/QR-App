import { StyleSheet, Text, View } from "react-native";

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        QR Scanner
      </Text>

      <Text>
        The QR Scanner will be implemented in Phase 2.
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