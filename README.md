# Speciate (Version 2)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

A beautifully minimal, incredibly fast, and 100% offline open-source habit, goal, and daily journal tracker built with React Native and Expo. 

Small steps every day lead to big changes. This app is designed to get out of your way and help you build consistency without subscriptions, cloud sync issues, or clutter.

<p align="center">
  <img src="./assets/images/welcome-image.png" width="300" />
</p>

---

## 🔥 New in Version 2
- **🎯 Goals System**: Set, track, and crush your Weekly, Monthly, and Long-Term goals!
- **📔 Daily Journal**: A dedicated space to reflect on "What did I learn today?" featuring a seamless, zero-distraction Auto-Save engine and an endless timeline of your past learnings.
- **🚀 Ultra-Optimized**: Fully rewritten rendering engine powered by `@shopify/flash-list` for a locked 60fps experience, even with thousands of habits and journal entries.

## ✨ Core Features
- **🔒 Offline First**: Uses robust local SQLite storage. Your data never leaves your device.
- **🔥 Streaks & Gamification**: Automatically calculates your Current and Longest streaks to keep you motivated.
- **📊 Advanced Analytics**: Custom built SVG line charts to visualize your 7-day completion trends.
- **💾 Backup & Restore**: Full JSON export and import capabilities so you can safely backup your data to Google Drive or iCloud.
- **🤌 Satisfying UX**: Premium haptics and spring animations using `react-native-reanimated` make checking off habits incredibly rewarding.
- **🌙 True Dark Mode**: A deep, OLED-friendly dark theme that is easy on the eyes.

---

## 🛠 Tech Stack

- **Framework**: React Native & Expo (SDK 54)
- **Language**: TypeScript
- **Database**: `expo-sqlite`
- **Animations**: `react-native-reanimated`
- **Lists**: `@shopify/flash-list`
- **Testing**: Jest & React Native Testing Library

---

## 🚀 Getting Started (Local Development)

To run this project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbirpandA/Speciate.git
   cd Speciate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Expo server**
   ```bash
   npx expo start -c
   ```

4. **Run on your device**
   - Download the **Expo Go** app on your iOS or Android device.
   - Scan the QR code in your terminal.

---

## 📦 Creating a Production Release (APK / IPA)

Since this app uses native modules, if you want to install the standalone app on your phone (without Expo Go), you can use EAS Build:

1. Install the EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Build the Android APK (so you can install it directly):
   ```bash
   eas build -p android --profile preview
   ```
4. *Follow the terminal link to download your `.apk` and install it on your phone!*

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the issues page.

---

## 📧 Contact & Custom Work

If you’re interested in customizing this app for your product, startup, or building an app from scratch, you can reach out at:

📧 **<abirpanda335@gmail.com>**

I’m open to collaborations and long-term projects.
