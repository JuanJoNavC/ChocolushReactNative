import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

// Base URL for API calls
const API_BASE_URL = "https://backendchocolush.runasp.net";
const APIClienteDTO = `${API_BASE_URL}/api/DTOCliente/correo`;
const APICompra = `${API_BASE_URL}/api/integracion/compra`;
const APICompraInterna = `${API_BASE_URL}/api/integracion/confirmarCompraInterna`;
const APIUltimaFactura = `${API_BASE_URL}/api/Factura/ultimaFactura`;
const IVA_RATE = 0.12;

// Import a placeholder image to use if a product image fails to load
import PlaceholderImage from "../../assets/images/LogInImg2.webp";

const PaymentsScreen = () => {
  const router = useRouter();
  const [carrito, setCarrito] = useState([]);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [usarDireccionRegistrada, setUsarDireccionRegistrada] = useState(true);
  const [direccionEspecifica, setDireccionEspecifica] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Estados para el formulario, pre-llenados desde el clienteInfo
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccionRegistrada, setDireccionRegistrada] = useState("");

  // Responsive design check
  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(Dimensions.get("window").width <= 768);
    };
    updateDimensions();

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    return () => subscription?.remove();
  }, []);

  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100);
  }, []);

  // Compute totals
  const subtotal = useMemo(() => {
    return carrito.reduce(
      (sum, item) => sum + (item.precio || 0) * (item.cantidad || 0),
      0
    );
  }, [carrito]);

  const iva = useMemo(() => subtotal * IVA_RATE, [subtotal]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  // Load data from AsyncStorage and API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCarrito = await AsyncStorage.getItem("carrito");

        // LÍNEAS DE DEPURACIÓN (AHORA SABEMOS QUÉ MIRAR)
        console.log(
          "Valor leído de AsyncStorage para 'carrito':",
          storedCarrito
        );

        if (storedCarrito) {
          const parsedCarrito = JSON.parse(storedCarrito);

          console.log("Carrito parseado:", parsedCarrito);

          // --- AQUÍ ESTÁ LA CORRECCIÓN ---
          // Usar las propiedades "price" y "quantity" del objeto original
          const sanitizedCarrito = parsedCarrito.map((item) => ({
            ...item,
            precio: Number(item.price),
            cantidad: Number(item.quantity),
          }));

          setCarrito(sanitizedCarrito);

          console.log(
            "Carrito establecido en el estado (CORREGIDO):",
            sanitizedCarrito
          );
        } else {
          console.warn("No se encontró un carrito en AsyncStorage.");
          Alert.alert(
            "Carrito Vacío",
            "Tu carrito está vacío. Redirigiendo a la página de productos."
          );
          router.push("/products");
          return;
        }

        let userEmailForAPI = null;
        const storedUserEmail = await AsyncStorage.getItem("userEmail");
        const storedDireccion = await AsyncStorage.getItem("userAddress");

        if (storedUserEmail) {
          userEmailForAPI = storedUserEmail;
        } else {
          const storedCliente = await AsyncStorage.getItem("cliente");
          if (storedCliente) {
            try {
              const clienteData = JSON.parse(storedCliente);
              if (clienteData.email) {
                userEmailForAPI = clienteData.email;
              }
            } catch (e) {
              console.error(
                "Error al parsear 'cliente' desde AsyncStorage:",
                e
              );
            }
          }
        }

        if (storedDireccion) {
          setDireccionRegistrada(storedDireccion);
          setUsarDireccionRegistrada(true);
        } else {
          setUsarDireccionRegistrada(false);
        }

        if (userEmailForAPI) {
          try {
            const response = await axios.get(
              `${APIClienteDTO}?correo=${userEmailForAPI}`
            );
            setClienteInfo(response.data);

            if (!response.data || !response.data.cliCedula) {
              Alert.alert(
                "Error",
                "No se pudo cargar la información completa del cliente. Por favor, verifica tu perfil o inicia sesión nuevamente."
              );
              await AsyncStorage.clear();
              router.push("/login");
              return;
            }
          } catch (apiError) {
            console.error("Error al obtener DTOCliente de la API:", apiError);
            Alert.alert(
              "Error",
              "Hubo un error al obtener tu información de cliente. Por favor, intenta de nuevo o inicia sesión."
            );
            await AsyncStorage.clear();
            router.push("/login");
            return;
          }
        } else {
          Alert.alert(
            "Error",
            "No se encontró información de usuario. Por favor, inicia sesión."
          );
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error general al cargar datos:", error);
        Alert.alert(
          "Error",
          "Hubo un error al cargar los datos del carrito o del cliente."
        );
        router.push("/ordenar");
      }
    };
    loadData();
  }, []);

  // Use another useEffect to populate form fields once clienteInfo is available
  useEffect(() => {
    if (clienteInfo) {
      setCedula(clienteInfo.cliCedula || "");
      setNombre(clienteInfo.cliNombre || "");
      setApellido(clienteInfo.cliApellido || "");
      setTelefono(clienteInfo.cliTelefono || "");
      setDireccionRegistrada(clienteInfo.cliDireccion || "");
    }
  }, [clienteInfo]);

  const procesarPago = async () => {
    if (carrito.length === 0) {
      Alert.alert(
        "Error",
        "El carrito está vacío. Por favor, agrega productos antes de continuar."
      );
      router.push("/ordenar");
      return;
    }
    if (!clienteInfo) {
      Alert.alert("Error", "No se pudo cargar la información del cliente.");
      return;
    }
    if (!numeroCuenta.trim()) {
      Alert.alert("Error", "Por favor, ingresa el número de cuenta.");
      return;
    }
    if (!usarDireccionRegistrada && !direccionEspecifica.trim()) {
      Alert.alert(
        "Error",
        "Por favor, ingresa una dirección de entrega si no deseas usar la registrada."
      );
      return;
    }

    try {
      setLoading(true);
      const direccionFinal = usarDireccionRegistrada
        ? direccionRegistrada
        : direccionEspecifica.trim();

      const compraPayload = {
        carrito: {
          productos: carrito.map((item) => ({
            idProducto: item.id,
            cantidad: item.cantidad,
          })),
        },
        direccion: direccionFinal,
        metodoPago: "Transferencia Bancaria",
        cliente: {
          cliCedula: cedula,
          cliNombre: nombre,
          cliApellido: apellido,
          cliTelefono: telefono,
          cliDireccion: direccionFinal,
        },
      };

      const compraResponse = await axios.post(APICompra, compraPayload);
      Alert.alert(
        "Procesando Pago",
        "¡Estamos procesando su pago, la factura ya fue generada!"
      );

      await AsyncStorage.removeItem("carrito");
      setCarrito([]);

      let ultimaFacturaId;
      try {
        const ultimaFacturaResponse = await axios.get(APIUltimaFactura);
        ultimaFacturaId = ultimaFacturaResponse.data;
      } catch (error) {
        console.error("Error al obtener la última factura:", error);
        Alert.alert(
          "Error",
          "Compra generada pero hubo un error al obtener el ID de la factura. Contacta a soporte."
        );
        return;
      }

      const infoCompraInterna = {
        idFactura: ultimaFacturaId,
        cuenta: numeroCuenta.trim(),
      };

      const confirmacionResponse = await axios.post(
        APICompraInterna,
        infoCompraInterna
      );
      Alert.alert(
        "Pago Exitoso",
        "Compra interna pagada exitosamente. ¡Gracias por tu dinero!"
      );
      router.push("/products");
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      let errorMessage =
        "Hubo un error al procesar el pago. Por favor, intenta nuevamente.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.Message
      ) {
        errorMessage = "Error: " + error.response.data.Message;
      } else if (error.message) {
        errorMessage = "Error: " + error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pagosPageWrapper}>
      <NavBarComponent isScrolled={isScrolled} />
      <ScrollView
        style={styles.mainScrollContainer}
        contentContainerStyle={styles.mainScrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.navbarSpacer} />
        <View style={styles.pagosContainer}>
          <View style={isMobile ? styles.mainPagoMobile : styles.mainPago}>
            {/* Section 1: Cart Summary */}
            <View style={styles.datosPago1}>
              <Text style={styles.sectionTitle}>Resumen del Carrito</Text>
              <View style={styles.productosCarrito}>
                {carrito.length === 0 ? (
                  <Text style={styles.carritoVacioMensaje}>
                    Tu carrito está vacío. Agrega productos para continuar.
                  </Text>
                ) : (
                  carrito.map((item) => (
                    <View key={item.id} style={styles.productoItem}>
                      <Image
                        source={
                          item.image ? { uri: item.image } : PlaceholderImage
                        }
                        style={styles.productoImagen}
                      />
                      <View style={styles.productoInfo}>
                        <Text style={styles.productoNombre}>{item.name}</Text>
                        <Text style={styles.productoDetalle}>
                          Cantidad: {item.cantidad}
                        </Text>
                        <Text style={styles.productoDetalle}>
                          P. Unitario: ${item.precio.toFixed(2)}
                        </Text>
                        <Text style={styles.productoTotal}>
                          Total: ${(item.precio * item.cantidad).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
              <View style={styles.resumen}>
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Subtotal</Text>
                  <Text style={styles.resumenValue}>
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>
                    IVA ({IVA_RATE * 100}%)
                  </Text>
                  <Text style={styles.resumenValue}>${iva.toFixed(2)}</Text>
                </View>
                <View style={[styles.resumenRow, styles.totalRow]}>
                  <Text style={[styles.resumenLabel, styles.totalLabel]}>
                    Total
                  </Text>
                  <Text style={[styles.resumenValue, styles.totalValue]}>
                    ${total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 2: Payment Details */}
            <View style={styles.datosPago}>
              <Text style={styles.sectionTitle}>Datos de Pago</Text>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cédula</Text>
                  <TextInput
                    style={styles.campoTextoPago}
                    onChangeText={setCedula}
                    value={cedula}
                    placeholder="Número de cédula"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombres</Text>
                  <TextInput
                    style={styles.campoTextoPago}
                    onChangeText={setNombre}
                    value={nombre}
                    placeholder="Nombres del cliente"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Apellidos</Text>
                  <TextInput
                    style={styles.campoTextoPago}
                    onChangeText={setApellido}
                    value={apellido}
                    placeholder="Apellidos del cliente"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.campoTextoPago}
                    onChangeText={setTelefono}
                    value={telefono}
                    placeholder="Teléfono de contacto"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número de Cuenta</Text>
                  <TextInput
                    style={styles.campoTextoPago}
                    onChangeText={setNumeroCuenta}
                    value={numeroCuenta}
                    keyboardType="numeric"
                    placeholder="Ingrese la cuenta con la que desea pagar"
                  />
                </View>

                {/* Checkbox for registered address */}
                {direccionRegistrada ? (
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() =>
                      setUsarDireccionRegistrada(!usarDireccionRegistrada)
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        usarDireccionRegistrada && styles.checkboxChecked,
                      ]}
                    />
                    <Text style={styles.label}>
                      Usar dirección de entrega registrada
                    </Text>
                  </Pressable>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dirección de entrega:</Text>
                  <TextInput
                    style={styles.campoTextoPago}
                    onChangeText={setDireccionEspecifica}
                    value={
                      usarDireccionRegistrada
                        ? direccionRegistrada
                        : direccionEspecifica
                    }
                    placeholder="Ingresa tu dirección de entrega"
                    editable={!usarDireccionRegistrada}
                  />
                </View>

                <View style={styles.centeredButtonContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.btnContinuar,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={procesarPago}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "Procesando..." : "Pagar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
        <FooterComponent />
      </ScrollView>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#664400" />
          <Text style={styles.loadingMessage}>Procesando su pago...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pagosPageWrapper: {
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
  pagosContainer: {
    flex: 1,
  },
  mainPago: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    padding: 20,
    maxWidth: 1200,
    marginHorizontal: "auto",
  },
  mainPagoMobile: {
    flexDirection: "column",
    padding: 10,
    margin: 10,
  },
  datosPago1: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 20,
  },
  datosPago: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 20,
  },
  sectionTitle: {
    textAlign: "center",
    color: "#A63700",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  productosCarrito: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
    marginTop: 10,
    maxHeight: 400,
  },
  carritoVacioMensaje: {
    textAlign: "center",
    padding: 10,
    color: "#666",
    fontStyle: "italic",
  },
  productoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productoImagen: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  productoInfo: {
    flexDirection: "column",
    flex: 1,
  },
  productoNombre: {
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  productoDetalle: {
    fontSize: 12,
    color: "#666",
  },
  productoTotal: {
    fontWeight: "bold",
    color: "#333333",
    marginTop: 5,
  },
  resumen: {
    borderTopWidth: 2,
    borderTopColor: "#A63700",
    paddingTop: 15,
    marginTop: 15,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  resumenLabel: {
    fontSize: 16,
    color: "#333333",
  },
  resumenValue: {
    fontSize: 16,
    color: "#333333",
  },
  totalRow: {
    marginTop: 10,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#A63700",
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#A63700",
  },
  form: {
    flexDirection: "column",
    gap: 15,
  },
  inputGroup: {
    flexDirection: "column",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333333",
  },
  campoTextoPago: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    color: "#333333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#A63700",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#A63700",
  },
  centeredButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  btnContinuar: {
    backgroundColor: "#A63700",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  loadingMessage: {
    fontSize: 18,
    color: "#664400",
    marginTop: 20,
  },
});

export default PaymentsScreen;
