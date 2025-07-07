import configs from "@/configs";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from "react";
import {
  AppState,
  Dimensions,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");
const WEBVIEW_RESOLUTION = { width: 930, height: 786 };
const webViewHeight = width / (WEBVIEW_RESOLUTION.width / WEBVIEW_RESOLUTION.height);

interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}

export default function App() {
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [gameUrl, setGameUrl] = useState("");

  useEffect(() => {
    const hideNavigationBar = async () => {
      if (Platform.OS === 'android') {
        StatusBar.setHidden(false);
        StatusBar.setBarStyle('light-content');
        StatusBar.setTranslucent(true);
        
        await SystemUI.setBackgroundColorAsync('transparent');
      }
    };

    hideNavigationBar();
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        hideNavigationBar();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const hideNavBar = async () => {
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false);
          StatusBar.setBarStyle('light-content');
          StatusBar.setTranslucent(true);
          await SystemUI.setBackgroundColorAsync('transparent');
        }
      };
      hideNavBar();
    }, [])
  );

  const handleOpenWebView = () => {
    setGameUrl(configs.simulatorUrl);
    setIsWebViewVisible(true);
  };

  const handleCloseWebView = () => {
    setIsWebViewVisible(false);
    setIsMinimized(false);
    setGameUrl("");
  };

  const handleMinimizeWebView = () => {
    setIsMinimized(true);
  };

  const handleMaximizeWebView = () => {
    setIsMinimized(false);
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === "CLOSE_IFRAME") {
        setIsWebViewVisible(false);
      }
    } catch (error) {
      console.log("WebView message:", event.nativeEvent.data, "Error: ", error);
    }
  };

  const renderCloseButton = () => (
    <TouchableOpacity
      onPress={handleCloseWebView}
      style={styles.closeButtonWrapper}
    >
      <LinearGradient
        colors={["#ef4444", "#facc15"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.floatingCloseButton}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMinimizeButton = () => (
    <TouchableOpacity
      onPress={handleMinimizeWebView}
      style={styles.minimizeButtonWrapper}
    >
      <LinearGradient
        colors={["#3b82f6", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.floatingMinimizeButton}
      >
        <Text style={styles.minimizeButtonText}>−</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderWebView = () => (
    <WebView
      style={styles.webView}
      source={{ uri: gameUrl }}
      // Prevent open new tab in android
      setSupportMultipleWindows={false}
    />
  );

  const renderOpenButton = () => (
    <TouchableOpacity style={styles.openButton} onPress={handleOpenWebView}>
      <Text style={styles.buttonText}>Open Demo</Text>
    </TouchableOpacity>
  );

  if (isWebViewVisible && !isMinimized) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ImageBackground
          source={require("../../assets/images/lang-live-demo-bg.webp")}
          style={styles.container}
          resizeMode="cover"
        >
          <View style={styles.overlayContainer}>
            {renderCloseButton()}
            {renderMinimizeButton()}
            {renderWebView()}
          </View>
        </ImageBackground>
      </View>
    );
  }

  if (isWebViewVisible && isMinimized) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ImageBackground
          source={require("../../assets/images/lang-live-demo-bg.webp")}
          style={styles.container}
          resizeMode="cover"
        >
          <TouchableOpacity 
            style={styles.minimizedContainer}
            onPress={handleMaximizeWebView}
          >
            <View style={styles.minimizedWebView}>
              {renderWebView()}
            </View>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <ImageBackground
        source={require("../../assets/images/lang-live-demo-bg.webp")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.openButtonContainer}>
          {renderOpenButton()}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: "100%",
  },
  openButtonContainer: {
    position: "absolute",
    bottom: 30,
    right: 16,
  },
  openButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(34,197,94,0.5)",
    borderRadius: 9999,
    backdropFilter: "blur(4px)",
    zIndex: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  hiddenButton: {
    opacity: 0,
    pointerEvents: "none",
  },
  overlayContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: webViewHeight,
  },
  closeButtonWrapper: {
    position: "absolute",
    top: -35,
    left: 16,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 20,
    shadowColor: "#f87171",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  floatingCloseButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  minimizeButtonWrapper: {
    position: "absolute",
    top: -35,
    right: 16,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  floatingMinimizeButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  minimizeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },

  webView: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  minimizedWebView: {
    width: 120,
    height: 80,
    backgroundColor: "transparent",
    borderRadius: 12,
    overflow: "hidden",
  },
  minimizedContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
});
