# Phone Info App

A React Native bare app that displays detailed phone information for Android devices, including IMEI, network status, signal strength, and more.

## Features

- Display IMEI and phone number
- Show current network carrier and type
- Display signal strength and bandwidth
- Show 5G/NR network information
- Network registration states
- Data service status
- And much more!

## Prerequisites

- Node.js installed
- Android Studio installed with Android SDK
- An Android device or emulator
- Java Development Kit (JDK) 17 or higher

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the Android app:
```bash
npm run android
```

This will build and install the app on your connected Android device or emulator.

## Permissions

The app requires the following Android permissions to access phone information:
- READ_PHONE_STATE
- READ_PHONE_NUMBERS
- READ_SMS
- ACCESS_NETWORK_STATE

These permissions will be requested at runtime when the app starts.

## Important Notes

- This app only works on **real Android devices**, not emulators, as emulators don't have actual phone hardware.
- You must grant the requested permissions for the app to display accurate phone information.
- Some information (like IMEI) may not be available on all devices or Android versions due to privacy restrictions.

## Development

To start the development server:
```bash
npm start
```

Then press 'a' to open on Android.

## Troubleshooting

If you encounter build issues:
1. Clean the build: `cd android && ./gradlew clean && cd ..`
2. Rebuild: `npm run android`

If permissions are not working:
- Go to Settings > Apps > Phone Info > Permissions
- Manually grant Phone and SMS permissions
