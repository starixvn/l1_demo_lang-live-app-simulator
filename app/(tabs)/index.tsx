import configs from "@/configs";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SystemUI from "expo-system-ui";
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
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { ASPECT_RATIO, WEBVIEW_MESSAGE_TYPES } from "@/constants/constants";
import GameLoadedDialog from "../../components/GameLoadedDialog";
import TopUpDialog from "../../components/TopUpDialog";

const { width, height } = Dimensions.get("window");

const calculateWebViewHeight = () => {
  return height * ASPECT_RATIO;
};

const webViewHeight = calculateWebViewHeight();

interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}

export default function App() {
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [gameUrl, setGameUrl] = useState("");
  const [isTopUpDialogVisible, setIsTopUpDialogVisible] = useState(false);
  const [isGameLoadedDialogVisible, setIsGameLoadedDialogVisible] =
    useState(false);

  useEffect(() => {
    const hideNavigationBar = async () => {
      if (Platform.OS === "android") {
        StatusBar.setHidden(false);
        StatusBar.setBarStyle("light-content");
        StatusBar.setTranslucent(true);

        await SystemUI.setBackgroundColorAsync("transparent");
      }
    };

    hideNavigationBar();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
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
        if (Platform.OS === "android") {
          StatusBar.setHidden(false);
          StatusBar.setBarStyle("light-content");
          StatusBar.setTranslucent(true);
          await SystemUI.setBackgroundColorAsync("transparent");
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

      switch (data?.type) {
        case WEBVIEW_MESSAGE_TYPES.OPEN_RECHARGE_PANEL:
          setIsTopUpDialogVisible(true);
          break;
        case WEBVIEW_MESSAGE_TYPES.GAME_LOADED:
          setIsGameLoadedDialogVisible(true);
          break;
        case WEBVIEW_MESSAGE_TYPES.CLOSE:
          handleCloseWebView();
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("WebView message:", event.nativeEvent.data, "Error: ", error);
    }
  };

  const handleTopUp = () => {
    setIsTopUpDialogVisible(false);
  };

  const handleCloseTopUpDialog = () => {
    setIsTopUpDialogVisible(false);
  };

  const handleCloseGameLoadedDialog = () => {
    setIsGameLoadedDialogVisible(false);
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

  const renderOpenButton = () => (
    <TouchableOpacity style={styles.openButton} onPress={handleOpenWebView}>
      <Text style={styles.buttonText}>Open Demo</Text>
    </TouchableOpacity>
  );

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
        {isWebViewVisible && (
          <>
            {!isMinimized && renderCloseButton()}
            {!isMinimized && renderMinimizeButton()}
          </>
        )}

        {/* WebView Container */}
        {isWebViewVisible && (
          <View
            style={
              isMinimized ? styles.minimizedContainer : styles.overlayContainer
            }
          >
            <TouchableOpacity
              style={
                isMinimized ? styles.minimizedTouchable : styles.normalTouchable
              }
              onPress={isMinimized ? handleMaximizeWebView : undefined}
              activeOpacity={isMinimized ? 0.8 : 1}
            >
              <WebView
                style={isMinimized ? styles.minimizedWebView : styles.webView}
                source={{ uri: gameUrl }}
                setSupportMultipleWindows={false}
                onMessage={handleWebViewMessage}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                javaScriptEnabled={true}
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
              />
            </TouchableOpacity>
          </View>
        )}

        {!isWebViewVisible && (
          <View style={styles.openButtonContainer}>{renderOpenButton()}</View>
        )}
      </ImageBackground>

      <TopUpDialog
        visible={isTopUpDialogVisible}
        onClose={handleCloseTopUpDialog}
        onTopUp={handleTopUp}
      />
      <GameLoadedDialog
        visible={isGameLoadedDialogVisible}
        onClose={handleCloseGameLoadedDialog}
      />
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
    top: 0,
    bottom: 0,
    height: "100%",
    zIndex: 1,
  },
  closeButtonWrapper: {
    position: "absolute",
    top: 300, 
    left: 16,
    zIndex: 1000, 
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
    top: 300,
    right: 16,
    zIndex: 1000, // Higher z-index to stay on top
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
  minimizedTouchable: {
    flex: 1,
  },
  normalTouchable: {
    flex: 1,
  },
});
