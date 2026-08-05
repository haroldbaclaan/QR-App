import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My Profile
      </Text>

      <Text>
        Profile management will be available in a future phase.
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