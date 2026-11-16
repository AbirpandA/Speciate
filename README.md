# Speciate (Version 3)

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

## 🌱 New in Version 3
- **✓ / ✕ Build and break habits**: Track the things you want to do *and* the things you want to stop. Habits you're breaking show a days-clean counter with milestone celebrations.
- **🌊 Urge surfing**: Rate an urge, name the trigger, and ride it out with a 2-minute guided breathing timer that shows your reason for quitting.
- **🗓 A schedule you can follow**: Every day, specific weekdays, or X times per week; Morning / Afternoon / Evening sections; count goals (e.g. 8 glasses); skip days that don't break your streak.
- **🧠 Built on habit psychology**: "After I…" cues (implementation intentions), your personal *why*, "never miss twice" streak grace, and compassionate slip logging.
- **📈 Insights**: Weekly score, a consistency heatmap, per-habit completion, best and toughest weekdays, top triggers, and mood vs. completion.
- **📝 Weekly review & mood journal**: A start-of-week reflection saved to your journal, daily mood check-ins, and rotating prompts.
- **👋 Personal onboarding**: Pick your focus areas and what you want to quit; get small starter habits from a template library.
- **🔎 Habit detail**: Streaks, completion rates, a month calendar where you can fix past days, and notes.

## 🔥 New in Version 2
- **🎯 Goals System**: Set, track, and crush your Weekly, Monthly, and Long-Term goals!
- **📔 Daily Journal**: A dedicated space to reflect on "What did I learn today?" featuring a seamless, zero-distraction Auto-Save engine and an endless timeline of your past learnings.
- **🚀 Ultra-Optimized**: Fully rewritten rendering engine powered by `@shopify/flash-list` for a locked 60fps experience, even with thousands of habits and journal entries.

## ✨ Core Features
- **🔒 Offline First**: Uses robust local SQLite storage. Your data never leaves your device.
- **🔥 Streaks & Gamification**: Automatically calculates your Current and Longest streaks to keep you motivated.
- **💾 Backup & Restore**: Full JSON export and import capabilities so you can safely backup your data to Google Drive or iCloud.
- **🤌 Satisfying UX**: Premium haptics and spring animations using `react-native-reanimated` make checking off habits incredibly rewarding.
- **🌙 True Dark Mode**: A deep, OLED-friendly dark theme that is easy on the eyes.

---

## 🛠 Tech Stack

- **Framework**: React Native 0.88 & Expo (SDK 58)
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
   - Download the **Expo Go** app (it must support SDK 58) on your iOS or Android device.
   - Scan the QR code in your terminal.
   - If your phone can't reach your computer over Wi-Fi, use a tunnel instead:
     ```bash
     npx expo start --tunnel ngrok
     ```
     (Expo's default tunnel currently fails on Node 26; ngrok is included as a dev dependency.)

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
