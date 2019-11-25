# expo-user-feedback

ReviewBox and Alert API to provide proper questioning for feedback.

## Installation

`yarn add expo-user-feedback`

## Usage

Use the Alert flow like this:

```jsx
import { reviewOrMail } from "expo-user-feedback";

if (device.hasDoneThisAndThat >= SOME_NUMBER && !device.hasReviewed) {
  const { name, email } = Config;
  reviewOrMail({ name, email });
  dispatch({ type: "SET_DEVICE", device: { hasReviewed: true } });
}
```

Use the ReviewBox like this:

```jsx
import { ReviewBox } from "expo-user-feedback";

const { Config } = { name: "Name of your app", email: "email@email.email" }; // your configfile
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
```

or simply use the default:

```jsx
import { ReviewBox } from "expo-user-feedback";

<DefaultReviewBox language={LANGUAGE_STRING} Config={YOUR_CONFIG} />;
```
