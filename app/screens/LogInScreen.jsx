import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

// Import the image from your assets folder
import LogInImage from "../../assets/images/LogInImg2.webp";

// Get screen dimensions for responsiveness
const { width } = Dimensions.get("window");

// Base URL for API calls
// IMPORTANT: Replace this with your actual environment variable or hardcoded string
const API_BASE_URL = "https://backendchocolush.runasp.net";

const LogInScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Function to check screen dimensions for responsiveness

  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(Dimensions.get("window").width <= 900);
    };
    updateDimensions(); // Initial check

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    return () => subscription?.remove();
  }, []); // Handle scroll for the NavBarComponent's effect

  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100);
  }, []); // Login function

  const login = async () => {
    setErrorMessage("");
    try {
      console.log("User data entered:", { email: email, password: password });

      const response = await axios.get(
        `${API_BASE_URL}/api/cliente/correo?correo=${email}`
      );
      console.log("Full API response:", response.data); // CORRECTED: The API returns the password as a string, not an object. // So we use response.data directly.

      const storedPasswordFromApi = response.data;
      console.log(
        "Expected password from API (for debugging):",
        storedPasswordFromApi
      );

      if (password === storedPasswordFromApi) {
        Alert.alert("Success", "¡Inicio de sesión exitoso!");

        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("isAuthenticated", "true");

        if (email === "admin@gmail.com" && password === "admin") {
          await AsyncStorage.setItem("userRole", "admin");
          router.push("/admin/clientes");
        } else {
          await AsyncStorage.setItem("userRole", "client");
          router.push("/");
        }
      } else {
        setErrorMessage("Correo electrónico o contraseña incorrectos.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("API response error data:", error.response.data);
        console.error("API response error status:", error.response.status);
        if (error.response.status === 404) {
          setErrorMessage("El correo electrónico no está registrado.");
        } else {
          setErrorMessage(
            "Hubo un problema al intentar iniciar sesión. Inténtalo de nuevo."
          );
        }
      } else if (error.request) {
        console.error("No response received from server:", error.request);
        setErrorMessage(
          "No se pudo conectar con el servidor. Verifica tu conexión."
        );
      } else {
        console.error("Error setting up the request:", error.message);
        setErrorMessage("Error desconocido al intentar iniciar sesión.");
      }
    }
  };

  return (
    <View style={styles.loginPageWrapper}>
      <NavBarComponent isScrolled={isScrolled} />
      <ScrollView
        style={styles.mainScrollContainer}
        contentContainerStyle={styles.mainScrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.navbarSpacer} />
        <View
          style={[
            styles.loginContentArea,
            isMobile && styles.loginContentAreaMobile,
          ]}
        >
          {!isMobile && (
            <View style={styles.loginMediaSection}>
              <Image
                source={LogInImage}
                alt="Personaje Caminando"
                style={styles.mediaImage}
              />
            </View>
          )}
          <View style={styles.loginFormSection}>
            <View style={styles.loginContainer}>
              <Text style={styles.loginTitle}>Iniciar Sesión</Text>
              <View style={styles.loginForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Correo electrónico:</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="tu.correo@ejemplo.com"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Contraseña:</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="••••••••"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed && styles.loginButtonPressed,
                  ]}
                  onPress={() => {
                    console.log("Button pressed! Calling login function...");
                    login();
                  }}
                >
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </Pressable>
                {errorMessage ? (
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                ) : null}
              </View>
              <Text style={styles.signupText}>
                ¿No tienes cuenta?
                <Text
                  style={styles.signupLink}
                  onPress={() => router.push("/screens/SignUpScreen")}
                >
                  Regístrate
                </Text>
              </Text>
            </View>
          </View>
        </View>
        {/* <FooterComponent /> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loginPageWrapper: {
    flex: 1,
    backgroundColor: "#FFF2E0",
  },
  mainScrollContainer: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    justifyContent: "center", // Center content vertically
  },
  navbarSpacer: {
    height: 80, // Same as NavBarComponent height
    backgroundColor: "transparent",
  },
  loginContentArea: {
    flexDirection: "row",
    flex: 1,
  },
  loginContentAreaMobile: {
    flexDirection: "column",
  },
  loginMediaSection: {
    flex: 1,
    backgroundColor: "#664400",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loginFormSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20, // Add padding to form section
  },
  loginContainer: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    padding: 20, // Add padding to inner container
  },
  loginTitle: {
    textAlign: "center",
    color: "#A63700",
    marginBottom: 25,
    fontSize: 32,
    fontWeight: "bold",
  },
  loginForm: {
    width: "100%",
  },
  formGroup: {
    marginBottom: 20,
    width: "100%",
  },
  formLabel: {
    marginBottom: 8,
    color: "#664400",
    fontWeight: "bold",
  },
  formInput: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#A65300",
    borderRadius: 8,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Added to prevent overlap issues
  },
  loginButtonPressed: {
    backgroundColor: "#8C4500",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#A60000",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
  signupText: {
    textAlign: "center",
    marginTop: 25,
    color: "#664400",
    fontSize: 15.2,
  },
  signupLink: {
    color: "#A63700",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default LogInScreen;
