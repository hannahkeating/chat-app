// Importing dependencies
import React from "react";
import { StyleSheet, View, Text } from "react-native";

export default class Chat extends React.Component {
  render() {
    // Defining variables from SplashScreen
    let { userName, backgroundColor } = this.props.route.params;

    // Setting default username in case the user didn't enter one
    if (!userName || userName === "") userName = "User";

    // Displaying username on the navbar in place of the title
    this.props.navigation.setOptions({ title: userName });

    return (
      // Setting background to the color chosen by the user on SplashScreen
      <View
        style={[styles.chatBackground, { backgroundColor: backgroundColor }]}
      >
        {/* Displaying placeholder text until chat is properly implemented */}
        <Text style={{ color: "#FFFFFF" }}>This chat is currently empty.</Text>
      </View>
    );
  }
}

// Creating styling
const styles = StyleSheet.create({
  chatBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
