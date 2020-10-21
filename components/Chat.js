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
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
// NetInfo checks user's network status
import NetInfo from "@react-native-community/netinfo";

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

    // Initializing state for messages and user + user ID
    this.state = {
      messages: [],
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      uid: 0,
    };
  }

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

  componentDidMount() {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            // console.log("user is :", user);
            if (!user) {
              try {
                await firebase.auth().signInAnonymously();
              } catch (error) {
                console.log(error.message);
              }
            }
            console.log("props: ", this.props);
            this.setState({
              isConnected: true,
              user: {
                _id: user.uid,
                name: this.props.route.params.userName,
              },
              loggedInText:
                this.props.route.params.userName + " has entered the chat",
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
  }

  // Writes chat messages to state messages
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages,
    });
  };

  // Adding the message object to the collection
  addMessages() {
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text,
      createdAt: this.state.messages[0].createdAt,
      user: this.state.messages[0].user,
      uid: this.state.uid,
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
        this.addMessages();
        this.saveMessages();
      }
    );
  }

  // Changing the color of the right side chat bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "grey",
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

  // Stop listening to authentication and collection changes
  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  render() {
    // Defining variables from SplashScreen
    let { userName, backgroundColor } = this.props.route.params;

    // Setting default username in case the user didn't enter one
    if (!userName || userName === "") userName = "User";

    // Displaying username on the navbar in place of the title
    this.props.navigation.setOptions({ title: userName });

    return (
      // Rendering chat layout
      <View
        style={[styles.chatBackground, { backgroundColor: backgroundColor }]}
      >
        <GiftedChat
          renderInputToolbar={this.renderInputToolbar}
          renderBubble={this.renderBubble}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
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
