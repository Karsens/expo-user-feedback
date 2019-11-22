import React from "react";
import { Text, View, Alert, Linking, Platform } from "react-native";

import * as MailComposer from "expo-mail-composer";
import * as StoreReview from "expo-store-review";

import Button from "./pure.button";

const storeReview = () => {
  StoreReview.requestReview();
};

const askMailFeedback = ({ name, email }) => {
  Alert.alert(
    "Give feedback",
    `Would you like to let us know what you think about ${name}?`,
    [
      {
        text: "Yes",
        onPress: () => {
          MailComposer.composeAsync({
            subject: "Feedback",
            recipients: [email]
          });
        }
      },

      {
        text: "No"
      }
    ]
  );
};

export const reviewOrMail = Config =>
  Alert.alert(`Do you enjoy ${Config.name}?`, null, [
    { text: "Yes", onPress: storeReview },
    { text: "No", onPress: Config.email ? () => askMailFeedback(Config) : null }
  ]);

export class ReviewBox extends React.Component<{
  appleID: string,
  androidPackage: string,
  setReviewed: () => void,
  handleFeedback: () => void,
  showAlways: boolean,
  shouldShow: boolean,
  language: Object
}> {
  handleReview() {
    const { appleID, androidPackage } = this.props;

    if (StoreReview.isSupported()) {
      StoreReview.requestReview();
    } else {
      let link: string;
      if (Platform.OS === "ios") {
        link = `itms-apps://itunes.apple.com/us/apps/_currentle-store/${appleID}?mt=8`;
      } else {
        link = `market://details?id=${androidPackage}`;
      }

      Linking.canOpenURL(link)
        .then(res => {
          console.log(res);

          Linking.openURL(link)
            .then(res => {
              console.log(res);
              this.props.setReviewed();
            })
            .catch(e => console.log(e));
        })
        .catch(e => console.log(e));
      //should lead to store review page for android and iOS. and then set reviewed to true
    }
  }

  async handleFeedback() {
    await this.props.handleFeedback();
    this.props.setReviewed();
  }

  handleDismiss() {
    Alert.alert("Okay, another time maybe.");
    this.props.setReviewed();
  }

  render() {
    const { language } = this.props;

    return this.props.showAlways || this.props.shouldShow ? (
      <View
        style={{
          backgroundColor: "#DDD",
          borderRadius: 10,
          margin: 10,
          padding: 10
        }}
      >
        {!this.props.showAlways ? (
          <Text style={{ fontWeight: "600", fontSize: 20 }}>
            You're up for review! 😁
          </Text>
        ) : (
          undefined
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>{language?.likeText || "Do you like the app?"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={language?.likeButton || "Write a review"}
              onPress={() => this.handleReview()}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>{language?.improveText || "Can we improve something?"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={language?.improveButton || "Give feedback"}
              onPress={() => this.handleFeedback()}
            />
          </View>
        </View>

        {this.props.showAlways ? (
          undefined
        ) : (
          <View
            style={{
              alignItems: "flex-end"
            }}
          >
            <Button
              title="Close"
              color="#999"
              onPress={() => this.handleDismiss()}
            />
          </View>
        )}
      </View>
    ) : null;
  }
}

export class DefaultReviewBox extends React.Component {
  render() {
    const { Config } = this.props;
    return (
      <ReviewBox
        appleID={Config.manifest.ios?.bundleIdentifier}
        androidPackage={Config.manifest.android?.package}
        setReviewed={() => null}
        handleFeedback={() =>
          Linking.openURL(
            `mailto:${Config.email}?subject=My feedback&body=Dear creator of ${Config.name},\n\nI have some feedback for you:\n\n`
          )
        }
        showAlways={true}
        shouldShow={true}
      />
    );
  }
}
