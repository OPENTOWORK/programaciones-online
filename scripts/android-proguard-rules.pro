# React Native / Hermes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-worklets
-keep class com.swmansion.worklets.** { *; }

# AsyncStorage (sesión Supabase)
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# OkHttp / networking (Supabase REST)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# WebView (vídeos de ejercicios)
-keep class com.reactnativecommunity.webview.** { *; }

# Evitar warnings de serialización Kotlin usada por dependencias nativas
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
