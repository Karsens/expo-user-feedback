import React from "react";
import { Button, TouchableOpacity, Text, Platform } from "react-native";
/**
 *
 * MyButton: RN iOS Button Fake for Android
 */
const PureButton = props =>
  Platform.OS === "ios" ? (
    <Button {...props} />
  ) : (
    <TouchableOpacity onPress={props.onPress}>
      <Text
        style={[
          {
            color: "#177ffb",
            textAlign: "center",
            margin: 8,
            fontSize: 18
          },
          props.style
        ]}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );

export default PureButton;
