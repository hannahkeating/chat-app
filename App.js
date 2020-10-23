// Importing dependencies
import React, { Component } from "react";
// Importing the screens we want to navigate
import SplashScreen from "./components/Start";
import Chat from "./components/Chat";
// Importing React Native Gesture Handler
import "react-native-gesture-handler";
// Importing React Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import MapView from "react-native-maps";

const firebase = require("firebase");
require("firebase/firestore");

// Creating the navigator
const Stack = createStackNavigator();

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          //First screen to load upon launching the app - value has to be one of the Stack.Screen-s
          initialRouteName="SplashScreen"
        >
          <Stack.Screen
            // Name doesn't have to match the component's name
            name="Home"
            component={SplashScreen}
          />
          <Stack.Screen name="Chat" component={Chat} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
