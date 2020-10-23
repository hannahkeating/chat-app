// Importing dependencies
import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// For asking the user for permission
import * as Permissions from "expo-permissions";
// For accessing the device's camera/camera roll
import * as ImagePicker from "expo-image-picker";
// For accessing the user's location
import * as Location from "expo-location";
// Storage for images
const firebase = require("firebase");
require("firebase/firestore");

export default class CustomActions extends React.Component {
  // Defining the functionality for the '+' button
  onActionPress = () => {
    const options = [
      "Choose Image From Library",
      "Take Picture",
      "Share Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            return this.pickImage();
          case 1:
            return this.takePhoto();
          case 2:
            return this.getLocation();
          default:
        }
      }
    );
  };

  // For choosing a picture from the device's library (camera roll)
  pickImage = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      // Only grant access if user accepts
      if (status === "granted") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          this.storeImage(result.uri);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // For taking a new image with the device's camera
  takePhoto = async () => {
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.CAMERA_ROLL
    );
    // Only access if user grants permission
    if (status === "granted") {
      try {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: "Images",
        });
      } catch (err) {
        console.log(err);
      }

      if (!result.cancelled) {
        this.storeImage(result.uri);
      }
    }
  };
  catch(error) {
    console.log(error);
  }

  // Converts and uploads an image as Blob to Firebase storage
  storeImage = async (uri) => {
    try {
      const { props } = this.props;
      const blob = await new Promise((resolve, reject) => {
        // Creates new XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        // Setting response type to blob
        xhr.responseType = "blob";
        // Open connection + GET method
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      // Creating new name for image files
      const uriParse = uri.split("/");
      const uriName = uriParse[uriParse.length - 1];

      const promise = [];
      const ref = firebase.storage().ref();
      const uploadTask = ref.child(`${uriName}`).put(blob);
      promise.push(uploadTask);

      Promise.all(promise).then(async (tasks) => {
        blob.close();
        const imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
        this.props.onSend({ image: imageUrl });
      });
    } catch (error) {
      console.log(error);
    }
  };

  // For accessing the user's location data
  getLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    // Only access location if user allows
    if (status === "granted") {
      let result = await Location.getCurrentPositionAsync({});

      if (result) {
        this.props.onSend({
          location: {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
          },
        });
      }
    }
  };

  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Click here for more options"
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
