// apiKey: "AIzaSyBehgmN78z9Ca2NDZDynlHrla9qFyhsHRQ",
// authDomain: "chat-app-37bf7.firebaseapp.com",
// databaseURL: "https://chat-app-37bf7.firebaseio.com",
// projectId: "chat-app-37bf7",
// storageBucket: "chat-app-37bf7.appspot.com",
// messagingSenderId: "843640091738",
// appId: "1:843640091738:web:15c4fb69b2ebd671119463",
// measurementId: "G-9SGVVLQJQ9",

// Importing dependencies
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  AsyncStorage,
  YellowBox,
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
// NetInfo checks user's network status
import NetInfo from "@react-native-community/netinfo";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

// Importing Firebase
const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor() {
    super();

    // Referencing the Firestore database
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyBehgmN78z9Ca2NDZDynlHrla9qFyhsHRQ",
        authDomain: "chat-app-37bf7.firebaseapp.com",
        databaseURL: "https://chat-app-37bf7.firebaseio.com",
        projectId: "chat-app-37bf7",
        storageBucket: "chat-app-37bf7.appspot.com",
        messagingSenderId: "843640091738",
        appId: "1:843640091738:web:15c4fb69b2ebd671119463",
        measurementId: "G-9SGVVLQJQ9",
      });
    }

    // Referencing the "messages" collection of the database
    this.referenceMessages = firebase.firestore().collection("messages");

    // Initializing state for messages, user, user ID, image and location
    this.state = {
      messages: [],
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      uid: 0,
      isConnected: false,
    };
  }

  // Writes chat messages to state messages
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Maps through all documents for data
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        //user: data.user,
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || "",
        location: data.location || "",
      });
    });
    this.setState({
      messages,
    });
  };

  // Adding the message object to the collection
  addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      uid: this.state.uid,
      image: message.image || "",
      location: message.location || "",
    });
  }

  // Function called upon sending a message
  onSend(messages = []) {
    // "previousState" references the component's state at the time the change is applied
    this.setState(
      (previousState) => ({
        // Appends the new messages to the messages object/state
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }

  // Async functions
  // Retrieves messages from AsyncStorage
  getMessages = async () => {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Saves messages to AsyncStorage
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  // Deletes messages from AsyncStorage
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  };

  // Upon loading the app
  componentDidMount() {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              try {
                await firebase.auth().signInAnonymously();
              } catch (error) {
                console.log(error.message);
              }
            }
            //console.log("props: ", this.props);
            this.setState({
              isConnected: true,
              user: {
                _id: user.uid,
                name: this.props.route.params.user,
              },
              loggedInText:
                this.props.route.params.user + " has entered the chat",
              messages: [],
            });
            this.unsubscribe = this.referenceMessages
              .orderBy("createdAt", "desc")
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        this.setState({
          isConnected: false,
        });
        this.getMessages();
      }
    });
    // Resolves timer-related warnings
    YellowBox.ignoreWarnings(["Setting a timer", "Animated"]);
  }

  // Stop listening to authentication and collection changes
  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  // 'Render' functions
  // Changing the color of the chat bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#008B8B",
          },
          left: {
            backgroundColor: "white",
          },
        }}
      />
    );
  }

  // Disables InputToolbar if user is offline
  renderInputToolbar = (props) => {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  };

  // Rendering the '+' button
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    //const { messages, uid } = this.state;

    // Defining variables from SplashScreen
    let { user, backgroundColor } = this.props.route.params;

    // Setting default username in case the user didn't enter one
    if (!user || user === "") user = "User";

    // Displaying username on the navbar in place of the title
    this.props.navigation.setOptions({ title: user });

    return (
      // Rendering chat layout
      <View
        style={[styles.chatBackground, { backgroundColor: backgroundColor }]}
      >
        {this.state.image && (
          <Image
            source={{ uri: this.state.image.uri }}
            style={{ width: 200, height: 200 }}
          />
        )}

        <GiftedChat
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderBubble={this.renderBubble.bind(this)}
          renderActions={this.renderCustomActions.bind(this)}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={this.state.user}
        />
        {/* If the device OS is Android, adjust height when the keyboard pops up */}
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}

// Creating styling
const styles = StyleSheet.create({
  chatBackground: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
