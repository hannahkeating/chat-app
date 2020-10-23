// apiKey: "AIzaSyBehgmN78z9Ca2NDZDynlHrla9qFyhsHRQ",
// authDomain: "chat-app-37bf7.firebaseapp.com",
// databaseURL: "https://chat-app-37bf7.firebaseio.com",
// projectId: "chat-app-37bf7",
// storageBucket: "chat-app-37bf7.appspot.com",
// messagingSenderId: "843640091738",
// appId: "1:843640091738:web:15c4fb69b2ebd671119463",
// measurementId: "G-9SGVVLQJQ9",

// Importing dependencies
import React from "react";
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
  constructor(props) {
    super(props);

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
      user: {},
      uid: 0,
      isConnected: false,
      image: null,
      location: null,
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
      // Checking user's network status
      var isConnected = state.isConnected;
      this.setState({
        isConnected,
      });
      this.getMessages();
      if (isConnected) {
        // Firebase auth
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              user = await firebase.auth().signInAnonymously();
            }
            this.setState({
              uid: user.uid,
            });
          });
        // Updates collection with new messages
        this.unsubscribe = this.referenceMessages
          // Fixes the order or messages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate);
      }
    });
    this.setState({
      messages: [
        {
          _id: 1,
          text: this.props.route.params.userName + " has joined the chat.",
          createdAt: new Date(),
          system: true,
        },
      ],
    });
    // Resolves timer-related warnings
    YellowBox.ignoreWarnings(["Setting a timer"]);
  }

  // Writes chat messages to state messages
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Maps through all documents for data
    querySnapshot.forEach((doc) => {
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image,
        location: data.location,
      });
    });
    this.setState({
      messages,
    });
  };

  // Adding the message object to the collection
  addMessage(message) {
    const { _id, createdAt, text, user, image, location } = message[0];
    this.referenceMessages.add({
      _id: _id,
      text: text || null,
      createdAt: createdAt,
      user: {
        _id: user._id,
        name: user.name,
      },
      image: image || null,
      location: location || null,
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
        this.saveMessages();
      }
    );
    this.addMessage();
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

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      const longitude = parseInt(currentMessage.location.longitude);
      const latitude = parseInt(currentMessage.location.latitude);
      return (
        <View>
          <MapView
            style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
            region={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      );
    }
    return null;
  }

  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  // Stop listening to authentication and collection changes
  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  render() {
    const { messages, uid } = this.state;

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
        {this.state.image && (
          <Image
            source={{ uri: this.state.image.uri }}
            style={{ width: 200, height: 200 }}
          />
        )}

        <GiftedChat
          renderInputToolbar={this.renderInputToolbar}
          renderBubble={this.renderBubble.bind(this)}
          messages={messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
            userName: userName,
          }}
          // image={this.state.image}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
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
