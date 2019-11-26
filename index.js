import React from "react";
import { Text, View, Alert, Linking, Platform } from "react-native";

import * as MailComposer from "expo-mail-composer";
import * as StoreReview from "expo-store-review";

import i18n from "i18n-js";

import Button from "./pure.button";

const en = {
  reviewOrMailTitle: "Do you enjoy {{name}}?",
  yes: "Yes",
  no: "No",
  giveFeedback: "Give feedback",
  giveFeedbackText:
    "Would you like to let us know what you think about {{name}}?",

  box: {
    title: "You're up for review! 😁",
    likeText: "Do you like the app?",
    otherTimeAlert: "Okay, another time maybe.",
    likeButton: "Review us",
    improveText: "Can we improve something?",
    improveButton: "Give feedback"
  }
};
const nl = {
  reviewOrMailTitle: "Vind je {{name}} leuk?",
  yes: "Ja",
  no: "Nee",
  giveFeedback: "Geef feedback",
  giveFeedbackText: "Wil je ons laten weten wat je vind van {{name}}?",

  box: {
    title: "Je mag ons reviewen!",
    likeText: "Vind je onze app leuk?",
    otherTimeAlert: "Oke, een andere keer misschien",
    likeButton: "Review ons",
    improveText: "Kunnen we wat verbeteren?",
    improveButton: "Geef feedback"
  }
};

i18n.fallbacks = true;
i18n.translations = { en, nl };

const askMailFeedback = ({ name, email }, language: string) => {
  Alert.alert(i18n.t("giveFeedback"), i18n.t("giveFeedbackText", { name }), [
    {
      text: i18n.t("yes"),
      onPress: () => {
        MailComposer.composeAsync({
          subject: "Feedback",
          recipients: [email]
        });
      }
    },

    {
      text: i18n.t("no")
    }
  ]);
};

export const reviewOrMail = (Config, language: string) => {
  i18n.locale = language || "en"; //defaults to en

  Alert.alert(i18n.t("reviewOrMailTitle", { name: Config.name }), null, [
    { text: i18n.t("yes"), onPress: () => StoreReview.requestReview() },
    {
      text: i18n.t("no"),
      onPress: Config.email ? () => askMailFeedback(Config, language) : null
    }
  ]);
};

export class ReviewBox extends React.Component<{
  appleID: string,
  androidPackage: string,
  setReviewed: () => void,
  handleFeedback: () => void,
  showAlways: boolean,
  shouldShow: boolean,
  language: string
}> {
  constructor(props) {
    super(props);
    const { language } = props;

    i18n.locale = language || "en"; //defaults to en
  }

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
    Alert.alert(i18n.t("box.otherTimeAlert"));
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
            {i18n.t("box.title")}
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
            <Text>{i18n.t("box.likeText")}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={i18n.t("box.likeButton")}
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
            <Text>{i18n.t("box.improveText")}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={i18n.t("box.improveButton")}
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
    const { Config, language } = this.props;
    return (
      <ReviewBox
        language={language}
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
