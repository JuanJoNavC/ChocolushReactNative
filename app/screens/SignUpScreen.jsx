import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Dimensions,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";
import LogInImage from "../../assets/images/LogInImg2.webp";

// Get screen dimensions for responsiveness
const { width } = Dimensions.get("window");

// Base URL for API calls
const API_BASE_URL = "https://backendchocolush.runasp.net";

// Function to validate Ecuadorian ID (Cedula)
const validateCedula = (cedula) => {
  if (!/^\d{10}$/.test(cedula)) {
    return "La cédula debe tener 10 dígitos.";
  }
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let digito = parseInt(cedula[i]) * coeficientes[i];
    if (digito >= 10) {
      digito -= 9;
    }
    suma += digito;
  }
  const ultimoDigito = parseInt(cedula[9]);
  const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  if (digitoVerificador !== ultimoDigito) {
    return "Cédula inválida.";
  }
  return "";
};

// Function to validate age (must be 18+)
const validateAge = (dob) => {
  if (!dob) return "La fecha de nacimiento es requerida.";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) {
    return "Debes ser mayor de 18 años para registrarte.";
  }
  return "";
};

const SignUpScreen = () => {
  const router = useRouter();
  const [client, setClient] = useState({
    CLI_NOMBRE: "",
    CLI_APELLIDO: "",
    CLI_FECHANACIMIENTO: "",
    CLI_CORREO: "",
    CLI_SEXO: "",
    CLI_DIRECCION: "",
    CLI_CLAVE: "",
    CLI_CEDULA: "",
    CLI_TELEFONO: "",
    CLI_SECTOR: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formMessage, setFormMessage] = useState({
    type: "",
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check screen dimensions for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(Dimensions.get("window").width <= 900);
    };
    updateDimensions();

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    return () => subscription?.remove();
  }, []);

  // Handle scroll for NavBarComponent effect
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100);
  }, []);

  // Update client state for a specific field
  const handleClientChange = (field, value) => {
    setClient((prevClient) => ({
      ...prevClient,
      [field]: value,
    }));
  };

  const registerClient = async () => {
    setIsSubmitting(true);
    setFormMessage({ type: "", text: "" });

    let validationErrors = [];

    // NEW: Check if the birth date is in the future
    const dobDate = new Date(client.CLI_FECHANACIMIENTO);
    const today = new Date();
    if (dobDate > today) {
      validationErrors.push(
        "La fecha de nacimiento no puede ser una fecha futura."
      );
    }

    // Existing validations
    const cedulaError = validateCedula(client.CLI_CEDULA);
    if (cedulaError) validationErrors.push(cedulaError);

    const ageError = validateAge(client.CLI_FECHANACIMIENTO);
    if (ageError) validationErrors.push(ageError);

    if (client.CLI_CLAVE !== confirmPassword) {
      validationErrors.push("Las contraseñas no coinciden.");
    }

    if (validationErrors.length > 0) {
      setFormMessage({ type: "error", text: validationErrors.join("\n") });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/Cliente`, client);

      if (response.status === 200 || response.status === 201) {
        setFormMessage({
          type: "success",
          text: "¡Registro exitoso! Ahora puedes iniciar sesión.",
        });
        Alert.alert("Registro Exitoso", "¡Ahora puedes iniciar sesión!");
        setTimeout(() => {
          router.push("/LogInScreen");
        }, 2000);
      }
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      let errorMessage = "No se pudo completar el registro.";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage += " " + err.response.data;
        } else if (err.response.data.Message) {
          errorMessage += " " + err.response.data.Message;
        } else if (typeof err.response.data === "object") {
          errorMessage += " Detalles: " + JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage += " " + err.message;
      }
      setFormMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.registrationPageWrapper}>
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
            styles.registrationContentArea,
            isMobile && styles.registrationContentAreaMobile,
          ]}
        >
          {!isMobile && (
            <View style={styles.registrationMediaSection}>
              <Image
                source={LogInImage}
                alt="Personaje Caminando"
                style={styles.mediaImage}
              />
            </View>
          )}

          <View style={styles.registrationFormSection}>
            <View style={styles.registrationContainer}>
              <Text style={styles.registrationTitle}>Registro de Cliente</Text>

              {/* FIXED: The layout is now explicitly defined in rows for reliability. */}
              <View style={isMobile ? styles.formRowMobile : styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nombre:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_NOMBRE}
                    onChangeText={(text) =>
                      handleClientChange("CLI_NOMBRE", text)
                    }
                    maxLength={30}
                    placeholder="Nombre"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Apellido:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_APELLIDO}
                    onChangeText={(text) =>
                      handleClientChange("CLI_APELLIDO", text)
                    }
                    maxLength={30}
                    placeholder="Apellido"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Cédula:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_CEDULA}
                    onChangeText={(text) =>
                      handleClientChange("CLI_CEDULA", text)
                    }
                    maxLength={10}
                    keyboardType="numeric"
                    placeholder="10 dígitos"
                  />
                </View>
              </View>

              <View style={isMobile ? styles.formRowMobile : styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Correo:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_CORREO}
                    onChangeText={(text) =>
                      handleClientChange("CLI_CORREO", text)
                    }
                    maxLength={50}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="ejemplo@correo.com"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Teléfono:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_TELEFONO}
                    onChangeText={(text) =>
                      handleClientChange("CLI_TELEFONO", text)
                    }
                    maxLength={15}
                    keyboardType="phone-pad"
                    placeholder="Teléfono"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Dirección:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_DIRECCION}
                    onChangeText={(text) =>
                      handleClientChange("CLI_DIRECCION", text)
                    }
                    maxLength={80}
                    placeholder="Dirección"
                  />
                </View>
              </View>

              <View style={isMobile ? styles.formRowMobile : styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Sector:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_SECTOR}
                    onChangeText={(text) =>
                      handleClientChange("CLI_SECTOR", text)
                    }
                    maxLength={50}
                    placeholder="Sector"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Fecha de Nacimiento:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_FECHANACIMIENTO}
                    onChangeText={(text) =>
                      handleClientChange("CLI_FECHANACIMIENTO", text)
                    }
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Sexo:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={client.CLI_SEXO}
                      onValueChange={(itemValue) =>
                        handleClientChange("CLI_SEXO", itemValue)
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecciona" value="" />
                      <Picker.Item label="Masculino" value="M" />
                      <Picker.Item label="Femenino" value="F" />
                      <Picker.Item label="Otro" value="O" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.fullWidth}>
                  <Text style={styles.formLabel}>Contraseña:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={client.CLI_CLAVE}
                    onChangeText={(text) =>
                      handleClientChange("CLI_CLAVE", text)
                    }
                    secureTextEntry={true}
                    maxLength={30}
                    minLength={6}
                    placeholder="Contraseña"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.fullWidth}>
                  <Text style={styles.formLabel}>Confirmar Contraseña:</Text>
                  <TextInput
                    style={styles.formControl}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    maxLength={30}
                    minLength={6}
                    placeholder="Confirmar"
                  />
                </View>
              </View>

              {formMessage.text ? (
                <View style={[styles.formMessage, styles[formMessage.type]]}>
                  <Text
                    style={[
                      formMessage.type === "success"
                        ? styles.successText
                        : styles.errorText,
                    ]}
                  >
                    {formMessage.text}
                  </Text>
                </View>
              ) : null}

              <View style={styles.formActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={registerClient}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>
                    {isSubmitting ? "Registrando..." : "Registrarse"}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => router.push("/screens/LogInScreen")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Ir a Login</Text>
                </Pressable>
              </View>

              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{" "}
                <Text
                  style={styles.loginLink}
                  onPress={() => router.push("/LogInScreen")}
                >
                  Inicia Sesión
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <FooterComponent />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  registrationPageWrapper: {
    flex: 1,
    backgroundColor: "#FFF2E0",
  },
  mainScrollContainer: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  navbarSpacer: {
    height: 80,
    backgroundColor: "transparent",
  },
  registrationContentArea: {
    flexDirection: "row",
    flex: 1,
  },
  registrationContentAreaMobile: {
    flexDirection: "column",
  },
  registrationMediaSection: {
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
  registrationFormSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  registrationContainer: {
    width: "100%",
    maxWidth: 550,
    alignItems: "center",
    padding: 20,
  },
  registrationTitle: {
    textAlign: "center",
    color: "#A63700",
    marginBottom: 25,
    fontSize: 32,
    fontWeight: "bold",
  },
  // NEW: Row layout for 3 columns
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  formRowMobile: {
    flexDirection: "column",
    width: "100%",
    marginBottom: 0,
  },
  formGroup: {
    width: "30%",
  },
  fullWidth: {
    width: "100%",
    marginBottom: 20, // Add margin to the full-width groups
  },
  formLabel: {
    marginBottom: 8,
    color: "#664400",
    fontWeight: "bold",
  },
  formControl: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    ...Platform.select({
      ios: { height: 120 },
      android: { height: 50 },
    }),
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 25,
  },
  registerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#A65300",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#DC3545",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formMessage: {
    width: "100%",
    padding: 15,
    marginTop: 15,
    borderRadius: 8,
    textAlign: "center",
  },
  success: {
    backgroundColor: "#D4EDDA",
    borderWidth: 1,
    borderColor: "#C3E6CB",
  },
  successText: {
    color: "#155724",
    textAlign: "center",
    fontWeight: "bold",
  },
  error: {
    backgroundColor: "#F8D7DA",
    borderWidth: 1,
    borderColor: "#F5C6CB",
  },
  errorText: {
    color: "#721C24",
    textAlign: "center",
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    marginTop: 25,
    color: "#664400",
  },
  loginLink: {
    color: "#A63700",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default SignUpScreen;
