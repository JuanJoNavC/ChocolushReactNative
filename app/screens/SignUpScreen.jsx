import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker"; // For dropdown
import DateTimePicker from "@react-native-community/datetimepicker"; // For date picker
import NavBarComponent from "../components/NavBarComponent"; // Assuming you have a NavBarComponent for React Native
import FooterComponent from "../components/FooterComponent"; // Assuming you have a FooterComponent for React Native

// You'll need to set your API_BASE_URL.
// For React Native, you might use an environment file or directly define it.
const API_BASE_URL = "https://backendchocolush.runasp.net"; // Replace with your actual API base URL
const router = useRouter();

const RegisterClientScreen = ({ navigation }) => {
  const [client, setClient] = useState({
    CLI_NOMBRE: "",
    CLI_APELLIDO: "",
    CLI_FECHANACIMIENTO: "", // YYYY-MM-DD
    CLI_CORREO: "",
    CLI_SEXO: "", // 'M', 'F', 'O'
    CLI_DIRECCION: "",
    CLI_CLAVE: "",
    CLI_CEDULA: "",
    CLI_TELEFONO: "",
    CLI_SECTOR: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [formMessage, setFormMessage] = useState({
    type: "", // 'success' or 'error'
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validation functions
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

  const validateEmail = (email) => {
    // Expresión regular para validar formato de email: algo@algo.algo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Formato de correo electrónico inválido (ej. usuario@dominio.com).";
    }
    return "";
  };

  const registerClient = async () => {
    setIsSubmitting(true);
    setFormMessage({ type: "", text: "" });

    let validationErrors = [];

    const cedulaError = validateCedula(client.CLI_CEDULA);
    if (cedulaError) validationErrors.push(cedulaError);

    const ageError = validateAge(client.CLI_FECHANACIMIENTO);
    if (ageError) validationErrors.push(ageError);
      // NUEVO: Validación de Correo Electrónico
    const emailError = validateEmail(client.CLI_CORREO);
    if (emailError) validationErrors.push(emailError);

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
        setTimeout(() => {
          router.push("/screens/LogInScreen");
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

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setClient({ ...client, CLI_FECHANACIMIENTO: formattedDate });
    }
  };

  return (
    <View style={styles.registrationPageWrapper}>
      <NavBarComponent />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.registrationFormSection}>
          <View style={styles.registrationContainer}>
            <Text style={styles.registrationTitle}>Registro de Cliente</Text>
            <View style={styles.formGrid}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_NOMBRE}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_NOMBRE: text })
                  }
                  placeholder="Nombre"
                  maxLength={30}
                  keyboardType="default"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Apellido:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_APELLIDO}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_APELLIDO: text })
                  }
                  placeholder="Apellido"
                  maxLength={30}
                  keyboardType="default"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cédula:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_CEDULA}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_CEDULA: text })
                  }
                  placeholder="Cédula"
                  maxLength={10}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Correo:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_CORREO}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_CORREO: text })
                  }
                  placeholder="Correo Electrónico"
                  maxLength={50}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Teléfono:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_TELEFONO}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_TELEFONO: text })
                  }
                  placeholder="Teléfono"
                  maxLength={15}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dirección:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_DIRECCION}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_DIRECCION: text })
                  }
                  placeholder="Dirección"
                  maxLength={80}
                  keyboardType="default"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sector:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_SECTOR}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_SECTOR: text })
                  }
                  placeholder="Sector"
                  maxLength={50}
                  keyboardType="default"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Fecha de Nacimiento:</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>
                    {client.CLI_FECHANACIMIENTO || "Seleccionar Fecha"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={
                      client.CLI_FECHANACIMIENTO
                        ? new Date(client.CLI_FECHANACIMIENTO)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                  />
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sexo:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={client.CLI_SEXO}
                    onValueChange={(itemValue) =>
                      setClient({ ...client, CLI_SEXO: itemValue })
                    }
                    style={styles.formControlPicker}
                  >
                    <Picker.Item label="Selecciona tu sexo" value="" />
                    <Picker.Item label="Masculino" value="M" />
                    <Picker.Item label="Femenino" value="F" />
                    <Picker.Item label="Otro" value="O" />
                  </Picker>
                </View>
              </View>
              <View style={[styles.formGroup, styles.fullWidth]}>
                <Text style={styles.formLabel}>Contraseña:</Text>
                <TextInput
                  style={styles.formControl}
                  value={client.CLI_CLAVE}
                  onChangeText={(text) =>
                    setClient({ ...client, CLI_CLAVE: text })
                  }
                  placeholder="Contraseña"
                  secureTextEntry
                  minLength={6}
                  maxLength={30}
                />
              </View>
              <View style={[styles.formGroup, styles.fullWidth]}>
                <Text style={styles.formLabel}>Confirmar Contraseña:</Text>
                <TextInput
                  style={styles.formControl}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmar Contraseña"
                  secureTextEntry
                  minLength={6}
                  maxLength={30}
                />
              </View>

              {formMessage.text ? (
                <View
                  style={[
                    styles.formMessage,
                    formMessage.type === "success"
                      ? styles.formMessageSuccess
                      : styles.formMessageError,
                  ]}
                >
                  <Text
                    style={
                      formMessage.type === "success"
                        ? styles.formMessageSuccessText
                        : styles.formMessageErrorText
                    }
                  >
                    {formMessage.text}
                  </Text>
                </View>
              ) : null}

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={registerClient}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Registrarse</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.push("/screens/LogInScreen")}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Ir a Login</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => router.push("/screens/LogInScreen")}
              >
                Inicia Sesión
              </Text>
            </Text>
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
    paddingTop: 60, // Space for the NavBar (adjust as needed)
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  registrationFormSection: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 20,
  },
  registrationContainer: {
    width: "90%",
    maxWidth: 550,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  registrationTitle: {
    textAlign: "center",
    color: "#A63700",
    marginBottom: 30,
    fontSize: 28,
    fontWeight: "bold",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  formGroup: {
    width: "48%", // Two columns
    marginBottom: 15,
  },
  fullWidth: {
    width: "100%",
  },
  formLabel: {
    marginBottom: 8,
    color: "#664400",
    fontWeight: "bold",
    fontSize: 16,
  },
  formControl: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    overflow: "hidden", // Ensures picker stays within bounds
  },
  formControlPicker: {
    height: 50, // Standard height for pickers
    width: "100%",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    height: 50,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#000", // Or a lighter color if it's a placeholder
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
    width: "100%",
  },
  registerButton: {
    backgroundColor: "#A65300",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // For icon and text
    gap: 8, // Space between icon and text
    flex: 1, // Distribute space
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // For icon and text
    gap: 8, // Space between icon and text
    flex: 1, // Distribute space
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formMessage: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  formMessageSuccess: {
    backgroundColor: "#D4EDDA",
    borderColor: "#C3E6CB",
    borderWidth: 1,
  },
  formMessageSuccessText: {
    color: "#155724",
    fontWeight: "bold",
    textAlign: "center",
  },
  formMessageError: {
    backgroundColor: "#F8D7DA",
    borderColor: "#F5C6CB",
    borderWidth: 1,
  },
  formMessageErrorText: {
    color: "#721C24",
    fontWeight: "bold",
    textAlign: "center",
  },
  loginText: {
    textAlign: "center",
    marginTop: 25,
    color: "#664400",
    fontSize: 15,
  },
  loginLink: {
    color: "#A63700",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  // Responsive adjustments for smaller screens
  "@media (max-width: 600px)": {
    formGroup: {
      width: "100%", // Single column on small screens
    },
    registrationTitle: {
      fontSize: 24,
    },
    formActions: {
      flexDirection: "column",
    },
    registerButton: {
      marginHorizontal: 0,
      marginBottom: 10,
    },
    cancelButton: {
      marginHorizontal: 0,
    },
  },
});

export default RegisterClientScreen;
