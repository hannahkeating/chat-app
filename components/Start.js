// Importing dependencies
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

// Importing the background image from the assets folder
const backgroundImage = require("../assets/Background_Image.png");

// Array of background colors with HEX codes to choose from
const backgroundColorOptions = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

export default class SplashScreen extends React.Component {
  constructor() {
    super();

    // Initializing the state of the app
    this.state = {
      name: "",
      // Setting a default background color in case the user doesn't select one - can overwrite it by tapping on a color
      backgroundColor: backgroundColorOptions[2],
    };
  }

  render() {
    return (
      // Setting background image to cover the whole screen
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        {/* Wrapping children in a view for KeyboardAvoidingView */}
        <View style={{ flex: 1 }}>
          {/* App title */}
          <Text style={styles.title}>Hello World!</Text>

          {/* Login box */}
          <View style={styles.loginBox}>
            {/* Input field for username */}
            <TextInput
              style={styles.input}
              // Updating username based on user's input
              onChangeText={(name) => this.setState({ name })}
              // Displaying user's input as it's being typed
              value={this.state.name}
              // Displaying what to input
              placeholder="Your Name"
            />

            {/* Choose background color */}
            <View style={styles.chooseColorBox}>
              <Text style={styles.chooseColor}>Choose Background Color:</Text>
            </View>

            {/* Displaying background color options (circles) */}
            <View style={styles.backgroundColorOptions}>
              <TouchableOpacity
                // Changing the background color to this if user taps on it - position: 0 from the array defined above
                onPress={() =>
                  this.setState({ backgroundColor: backgroundColorOptions[0] })
                }
                // Displaying the color (circle) itself
                style={[
                  styles.colorSelector,
                  { backgroundColor: backgroundColorOptions[0] },
                ]}
              />

              <TouchableOpacity
                // Changing the background color to this if user taps on it - position: 1 from the array defined above
                onPress={() =>
                  this.setState({ backgroundColor: backgroundColorOptions[1] })
                }
                // Displaying the color (circle) itself
                style={[
                  styles.colorSelector,
                  { backgroundColor: backgroundColorOptions[1] },
                ]}
              />

              <TouchableOpacity
                // Changing the background color to this if user taps on it - position: 2 from the array defined above
                onPress={() =>
                  this.setState({ backgroundColor: backgroundColorOptions[2] })
                }
                // Displaying the color (circle) itself
                style={[
                  styles.colorSelector,
                  { backgroundColor: backgroundColorOptions[2] },
                ]}
              />

              <TouchableOpacity
                // Changing the background color to this if user taps on it - position: 3 from the array defined above
                onPress={() =>
                  this.setState({ backgroundColor: backgroundColorOptions[3] })
                }
                // Displaying the color (circle) itself
                style={[
                  styles.colorSelector,
                  { backgroundColor: backgroundColorOptions[3] },
                ]}
              />
            </View>

            {/* Start Chatting button*/}
            <View style={styles.startButton}>
              <TouchableOpacity
                // Navigates to Chat view when the user taps on it
                onPress={() =>
                  this.props.navigation.navigate("Chat", {
                    // Updates the username as per user's input
                    user: this.state.name,
                    // Updates the background color as per user's choice (circle)
                    backgroundColor: this.state.backgroundColor,
                  })
                }
              >
                {/* Text on the button */}
                <Text style={styles.buttonText}>Start Chatting</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* If the device OS is Android, adjust height when the keyboard pops up */}
          {Platform.OS === "android" ? (
            <KeyboardAvoidingView behavior="height" />
          ) : null}
        </View>
      </ImageBackground>
    );
  }
}

// Creating styling
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 45,
    fontWeight: "700",
    color: "#FFFFFF",
    alignSelf: "center",
    marginTop: 44,
  },
  loginBox: {
    flex: 1,
    backgroundColor: "white",
    height: "44%",
    width: "88%",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: "2%",
  },
  input: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 50,
    borderWidth: 1.5,
    borderColor: "#757083",
    borderRadius: 3,
    width: "88%",
    height: "21%",
    marginBottom: "5%",
    marginTop: "5%",
    paddingLeft: 30,
  },
  chooseColorBox: {
    alignSelf: "flex-start",
    flex: 1,
    width: "88%",
    paddingLeft: 24,
    paddingBottom: "2%",
  },
  chooseColor: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 100,
  },
  backgroundColorOptions: {
    flex: 4,
    flexDirection: "row",
    alignSelf: "flex-start",
    width: "80%",
    justifyContent: "space-around",
    paddingLeft: 16,
    marginTop: "2%",
  },
  colorSelector: {
    position: "relative",
    height: 40,
    width: 40,
    borderRadius: 50,
    margin: 2,
    borderColor: "white",
  },
  startButton: {
    backgroundColor: "#757083",
    alignItems: "center",
    width: "88%",
    height: "18%",
    marginBottom: "5%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
  },
});
