# Waypoint Mobile App Setup Guide

This guide covers setting up Capacitor for iOS and Android deployment with Firebase push notifications.

## Prerequisites

- Node.js 18+
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 33+
- Firebase account (free tier works)
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android

## Step 1: Install Dependencies

```bash
# Core Capacitor packages
npm install @capacitor/core @capacitor/cli

# Platform packages
npm install @capacitor/android @capacitor/ios

# Push notifications
npm install @capacitor/push-notifications

# Google Auth (native)
npm install @codetrix-studio/capacitor-google-auth

# Optional: Splash screen, status bar
npm install @capacitor/splash-screen @capacitor/status-bar

# Firebase Admin SDK (server-side, for sending notifications)
npm install firebase-admin
```

## Step 2: Add Build Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:mobile": "cp next.config.mobile.ts next.config.ts.bak && cp next.config.mobile.ts next.config.ts && next build && mv next.config.ts.bak next.config.ts",
    "cap:sync": "npx cap sync",
    "cap:android": "npx cap open android",
    "cap:ios": "npx cap open ios",
    "mobile:android": "npm run build:mobile && npm run cap:sync && npm run cap:android",
    "mobile:ios": "npm run build:mobile && npm run cap:sync && npm run cap:ios"
  }
}
```

## Step 3: Initialize Capacitor

```bash
# Initialize (already done - capacitor.config.ts exists)
npx cap init "Waypoint" "gy.waypoint.app"

# Add platforms
npx cap add android
npx cap add ios
```

## Step 4: Firebase Setup

### Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project: "Waypoint"
3. Enable Cloud Messaging

### Add Android App

1. Click "Add app" > Android
2. Package name: `gy.waypoint.app`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

### Add iOS App

1. Click "Add app" > iOS
2. Bundle ID: `gy.waypoint.app`
3. Download `GoogleService-Info.plist`
4. Add to iOS project via Xcode

### Get Server Credentials

1. Project Settings > Service Accounts
2. Generate new private key
3. Add to `.env.local`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Step 5: Android Configuration

### Edit `android/app/build.gradle`

Add Google Services plugin:

```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services' // Add this line
}

dependencies {
    // Add Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### Edit `android/build.gradle`

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### Configure Notification Channels

Edit `android/app/src/main/java/gy/waypoint/app/MainActivity.java`:

```java
package gy.waypoint.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);

            NotificationChannel defaultChannel = new NotificationChannel(
                "default",
                "General Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            defaultChannel.setDescription("General updates from Waypoint");
            manager.createNotificationChannel(defaultChannel);

            NotificationChannel highChannel = new NotificationChannel(
                "high_priority",
                "Important Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            highChannel.setDescription("Time-sensitive updates");
            manager.createNotificationChannel(highChannel);
        }
    }
}
```

### Update Digital Asset Links

Get your SHA256 fingerprint:

```bash
cd android
./gradlew signingReport
```

Copy the SHA256 fingerprint and update `public/.well-known/assetlinks.json`.

## Step 6: iOS Configuration

### Open Xcode

```bash
npx cap open ios
```

### Configure Signing

1. Select "App" target
2. Signing & Capabilities tab
3. Select your Apple Developer team
4. Enable "Automatically manage signing"

### Add Capabilities

1. Click "+ Capability"
2. Add "Push Notifications"
3. Add "Background Modes" > Check "Remote notifications"

### Configure APNs in Firebase

1. Apple Developer Portal > Certificates > Create APNs Key
2. Download the .p8 file
3. Firebase Console > Project Settings > Cloud Messaging
4. Upload APNs key under "Apple app configuration"

### Add GoogleService-Info.plist

1. Drag `GoogleService-Info.plist` into Xcode
2. Add to "App" target

## Step 7: Build and Test

### Android

```bash
# Build and open in Android Studio
npm run mobile:android

# In Android Studio:
# - Connect device or start emulator
# - Click Run (green play button)
```

### iOS

```bash
# Build and open in Xcode
npm run mobile:ios

# In Xcode:
# - Select your device/simulator
# - Click Run (play button)
```

## Step 8: Generate Release Builds

### Android APK/AAB

```bash
cd android

# Debug APK
./gradlew assembleDebug

# Release AAB (for Play Store)
./gradlew bundleRelease
```

Output: `android/app/build/outputs/`

### iOS Archive

1. In Xcode: Product > Archive
2. Window > Organizer
3. Distribute App > App Store Connect

## Step 9: App Store Submission

### Google Play Store

1. Create developer account: https://play.google.com/console ($25)
2. Create new app
3. Fill in store listing details
4. Upload AAB file
5. Complete content rating questionnaire
6. Complete data safety form
7. Submit for review

### Apple App Store

1. Create developer account: https://developer.apple.com ($99/year)
2. App Store Connect > New App
3. Fill in app information
4. Upload screenshots
5. Submit for review

## Environment Variables Summary

Add these to `.env.local`:

```env
# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional: Web Push (for PWA users)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## Updating the App

### Web Code Changes Only

```bash
# Rebuild and sync
npm run build:mobile
npx cap sync

# Open IDE and run
npx cap open android  # or ios
```

### Live Updates (Optional)

For instant updates without app store review, consider:
- [Capgo](https://capgo.app) - Free tier available
- [Ionic Appflow](https://ionic.io/appflow)

These services push web code updates directly to users' devices.

## Troubleshooting

### Push notifications not working

1. Check Firebase configuration files are in place
2. Verify environment variables are set
3. Test on a real device (emulators don't receive FCM)
4. Check Firebase Console > Cloud Messaging for errors

### Build fails on Android

1. Ensure `google-services.json` is in `android/app/`
2. Check Gradle version compatibility
3. Run `npx cap sync` after any native changes

### Build fails on iOS

1. Ensure `GoogleService-Info.plist` is added via Xcode
2. Check signing configuration
3. Verify Push Notifications capability is enabled

## Cost Summary

| Item | Cost |
|------|------|
| Google Play Developer | $25 (one-time) |
| Apple Developer | $99/year |
| Firebase | Free (Spark plan) |
| **Total Year 1** | **$124** |
| **Total Year 2+** | **$99/year** |
