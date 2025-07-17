import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
// Cambiamos la URL base para apuntar a la nueva API de productos
const API_BASE_URL = "https://backendchocolush.runasp.net";

// --- NUEVO COMPONENTE DE CARRUSEL DE IMÁGENES ---
const ProductImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Define un tamaño fijo y consistente para las imágenes del carrusel.
  // Este tamaño debe coincidir con el del contenedor (productImageContainer).
  const imageStyle = {
    width: 120,
    height: 120,
  };

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // Si no hay imágenes o el array está vacío, muestra un placeholder.
  if (!images || images.length === 0) {
    return (
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // Placeholder
          style={styles.productImage}
        />
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.carouselScrollView}
      >
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={imageStyle} // Usamos el estilo con tamaño fijo.
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};
// --- FIN DEL NUEVO COMPONENTE ---

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showCartWindow, setShowCartWindow] = useState(false);
  const [showMobileBubble, setShowMobileBubble] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const localSearchParams = useLocalSearchParams();
  // Mantenemos 'brand' aquí si lo vas a usar para filtrar con la nueva API
  // Aunque en el ejemplo de la API que quieres usar, no se ve un endpoint para filtrar por marca directamente.
  // Si necesitas filtrar por marca, tendrías que hacerlo del lado del cliente después de cargar todos los productos.
  const { brand } = localSearchParams;

  const cartWindowAnim = useRef(new Animated.Value(width)).current;

  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100);
  }, []);

  // --- FUNCIÓN DE FETCH MODIFICADA ---
  const fetchAllOrBrandProducts = useCallback(async () => {
    setLoading(true);
    const apiUrl = `${API_BASE_URL}/api/Producto`; // Nuevo endpoint

    try {
      const response = await axios.get(apiUrl);
      // Mapeamos la respuesta de la nueva API a la estructura que el componente espera
      const mappedProducts = response.data.map((p) => {
        // PROD_IMG es una cadena, la convertimos a un array de strings si hay múltiples URLs
        const imageUrls = p.PROD_IMG ? p.PROD_IMG.split(',') : [];
        return {
          PROD_ID: p.PROD_ID,
          PROD_NOMBRE: p.PROD_NOMBRE,
          PROD_DESCCORTA: p.PROD_DESCCORTA || p.PROD_DESC, // Usamos DESCCORTA si existe, sino DESC
          PROD_DESC: p.PROD_DESC,
          PROD_PRECIO: p.PROD_PRECIO,
          PROD_STOCK: p.PROD_STOCK,
          PROD_IMG: imageUrls.map(url => url.trim()), // Trim para limpiar espacios en blanco
          PROD_BRAND: p.PROD_BRAND, // Agregamos PROD_BRAND
        };
      });

      // Si 'brand' está presente en los parámetros locales, filtramos por marca
      if (brand) {
        const filteredByBrand = mappedProducts.filter(
          (p) => p.PROD_BRAND && p.PROD_BRAND.toLowerCase() === brand.toLowerCase()
        );
        setProducts(filteredByBrand);
      } else {
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar los productos. Intenta de nuevo más tarde."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [brand]); // 'brand' se agrega como dependencia para que se refetch si cambia

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((prod) =>
      prod.PROD_NOMBRE.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const saveCart = useCallback(async (currentCart) => {
    try {
      await AsyncStorage.setItem("carrito", JSON.stringify(currentCart));
    } catch (e) {
      console.error("Error saving cart to AsyncStorage:", e);
      Alert.alert("Error", "No se pudo guardar el carrito.");
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const savedCart = await AsyncStorage.getItem("carrito");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error("Error loading cart from AsyncStorage:", e);
    }
  }, []);

  // --- FUNCIÓN addToCart MODIFICADA ---
  const addToCart = useCallback(
    (id, name, price, images, quantity = 1) => { // 'images' ahora es un array
      const numericPrice = parseFloat(price);
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.name === name);
        let newCart;
        if (existingProduct) {
          newCart = prevCart.map((item) =>
            item.name === name
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [
            ...prevCart,
            // Guardamos solo la primera imagen para mostrar en el carrito, o un placeholder
            { id, name, price: numericPrice, quantity, image: images.length > 0 ? images[0] : "https://via.placeholder.com/60" },
          ];
        }
        saveCart(newCart);
        if (isMobile) {
          setShowCartWindow(true);
          Animated.timing(cartWindowAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start();
        }
        return newCart;
      });
    },
    [isMobile, saveCart, cartWindowAnim]
  );
    
  const changeQuantity = useCallback((index, change) => {
    setCart((prevCart) => {
        let newCart = [...prevCart];
        if (newCart[index]) {
        newCart[index].quantity += change;
        if (newCart[index].quantity <= 0) {
            newCart.splice(index, 1);
        }
        }
        saveCart(newCart);
        return newCart;
    });
    }, [saveCart]);

  const removeItem = useCallback((index) => {
    setCart((prevCart) => {
        const newCart = [...prevCart];
        newCart.splice(index, 1);
        saveCart(newCart);
        return newCart;
    });
    }, [saveCart]);
    
  const subtotal = useMemo(() => cart.reduce((total, p) => total + p.price * p.quantity, 0), [cart]);
  const iva = useMemo(() => subtotal * 0.15, [subtotal]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  const continueCheckout = useCallback(async () => {
    if (cart.length === 0) {
      Alert.alert("Carrito Vacío", "El carrito está vacío.");
      return;
    }

    setLoading(true);
    try {
      // Validamos stock con la nueva API. Asumimos que podemos obtener todos los productos
      // para validar stock, ya que no hay un endpoint específico de validación de stock.
      const response = await axios.get(`${API_BASE_URL}/api/Producto`);
      const apiProducts = response.data;
      let errors = [];

      for (const cartItem of cart) {
        // Buscamos por el nombre del producto en el carrito (PROD_NOMBRE)
        const apiProduct = apiProducts.find(p => p.PROD_NOMBRE === cartItem.name);
        if (!apiProduct) {
          errors.push({ product: cartItem.name, message: "Producto no encontrado." });
        } else if (cartItem.quantity > apiProduct.PROD_STOCK) {
          errors.push({
            product: cartItem.name,
            message: `Stock insuficiente. Disponible: ${apiProduct.PROD_STOCK}.`,
          });
        }
      }

      if (errors.length > 0) {
        let errorMessage = "Errores en tu carrito:\n" + errors.map(e => `- ${e.product}: ${e.message}`).join("\n");
        Alert.alert("Error de Stock", errorMessage);
        return;
      }

      const isAuthenticated = (await AsyncStorage.getItem("isAuthenticated")) === "true";
      if (isAuthenticated) {
        router.push("/screens/PaymentsScreen");
      } else {
        Alert.alert("Iniciar Sesión Requerido", "Debes iniciar sesión para continuar.");
        router.push("/screens/LogInScreen");
      }
    } catch (error) {
      console.error("Error en continueCheckout:", error);
      Alert.alert("Error", "No se pudo validar el stock. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [cart, router]);

  const totalCartQuantity = useMemo(() => cart.reduce((total, p) => total + p.quantity, 0), [cart]);

  const toggleCartWindow = useCallback(() => {
    setShowCartWindow((prev) => {
      const newState = !prev;
      Animated.timing(cartWindowAnim, {
        toValue: newState ? 0 : width,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      return newState;
    });
  }, [cartWindowAnim, width]);

  useEffect(() => {
    loadCart();
    fetchAllOrBrandProducts();
  }, [loadCart, fetchAllOrBrandProducts]);

  useEffect(() => {
    const updateDimensions = () => setIsMobile(Dimensions.get("window").width <= 768);
    updateDimensions();
    const subscription = Dimensions.addEventListener("change", updateDimensions);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowCartWindow(false);
      Animated.timing(cartWindowAnim, { toValue: width, duration: 0, useNativeDriver: true }).start();
    }
  }, [isMobile, cartWindowAnim, width]);

  useEffect(() => {
    setShowMobileBubble(isMobile && totalCartQuantity > 0 && !showCartWindow);
  }, [isMobile, totalCartQuantity, showCartWindow]);

  const responsiveContainerStyle = width > 768 ? styles.mainContainerDesktop : styles.mainContainerMobile;
  const responsiveProductGridStyle = width > 768 ? styles.productsGridDesktop : styles.productsGridMobile;
  const responsiveProductCardWidth = width > 768 ? (width * 0.7 - 60 - 20 * 2) / 3 : width > 480 ? (width - 40 - 20) / 2 : "95%";

  return (
    <View style={styles.productsPageWrapper}>
      <NavBarComponent isScrolled={isScrolled} />
      <ScrollView
        style={styles.mainContentScrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.mainContentContainer}
      >
        <View style={styles.navbarSpacer} />
        <View style={[styles.mainContainer, responsiveContainerStyle]}>
          <View style={[styles.searchBarContainer, isMobile && styles.searchBarContainerMobile]}>
            <TextInput
              style={[styles.productSearchInput, isMobile && styles.productSearchInputMobile]}
              placeholder="Buscar productos por nombre..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888"
            />
            {isMobile && (
              <Pressable style={styles.inlineCartButton} onPress={toggleCartWindow}>
                <FontAwesome name="shopping-cart" size={24} color="#ffffff" />
                {totalCartQuantity > 0 && (
                  <Text style={styles.inlineCartQuantity}>{totalCartQuantity}</Text>
                )}
              </Pressable>
            )}
          </View>

          <View style={[styles.productsGrid, responsiveProductGridStyle]}>
            {loading && !products.length ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#A63700" />
                <Text style={styles.loadingMessage}>Cargando productos...</Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <Text style={styles.noProductsMessage}>
                No se encontraron productos que coincidan con "{searchQuery}".
              </Text>
            ) : (
              filteredProducts.map((prod) => (
                <View key={prod.PROD_ID} style={[styles.productCard, { width: responsiveProductCardWidth }]}>
                  <View style={styles.productContent}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{prod.PROD_NOMBRE}</Text>
                      <Text style={styles.description}>{prod.PROD_DESCCORTA || prod.PROD_DESC}</Text>
                      <Text style={styles.price}>${parseFloat(prod.PROD_PRECIO).toFixed(2)}</Text>
                    </View>
                    {/* --- INTEGRACIÓN DEL CARRUSEL --- */}
                    <View style={styles.productImageContainer}>
                       <ProductImageCarousel images={prod.PROD_IMG} />
                    </View>
                  </View>
                  <Pressable
                    style={styles.addToCartButton}
                    onPress={() =>
                      addToCart(
                        prod.PROD_ID,
                        prod.PROD_NOMBRE,
                        parseFloat(prod.PROD_PRECIO).toFixed(2),
                        prod.PROD_IMG // Se envía el array completo de imágenes al carrito
                      )
                    }
                  >
                    <FontAwesome name="plus" size={24} color="#ffffff" />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {/* Carrito de escritorio (sin cambios) */}
          {!isMobile && (
            <View style={styles.cartSidebar}>
                <View style={styles.cartHeader}><Text style={styles.cartTitle}>Carrito</Text></View>
                <ScrollView style={styles.productsInCart}>
                {cart.length === 0 ? (<Text style={styles.cartEmptyText}>El carrito está vacío...</Text>) : (
                    cart.map((product, index) => (
                    <View key={product.id} style={styles.productInCart}>
                        <View style={styles.productCartImageWrapper}><Image source={{ uri: product.image }} alt={product.name} style={styles.productCartImage} /></View>
                        <View style={styles.productDetails}>
                        <Text style={styles.productNameInCart}>{product.name}</Text>
                        <Text>${(product.price * product.quantity).toFixed(2)}</Text>
                        <View style={styles.itemActions}>
                            <Pressable style={styles.deleteItem} onPress={() => removeItem(index)}><FontAwesome name="trash-o" size={18} color="#A60000" /></Pressable>
                            <View style={styles.quantityControls}>
                            <Pressable style={styles.decreaseQuantity} onPress={() => changeQuantity(index, -1)}><Text style={styles.quantityControlText}>-</Text></Pressable>
                            <Text style={styles.quantityDisplay}>{product.quantity}</Text>
                            <Pressable style={styles.increaseQuantity} onPress={() => changeQuantity(index, 1)}><Text style={styles.quantityControlText}>+</Text></Pressable>
                            </View>
                        </View>
                        </View>
                    </View>
                    ))
                )}
                </ScrollView>
                <View style={styles.summary}>
                    <View style={styles.summaryRow}><Text>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text></View>
                    <View style={styles.summaryRow}><Text>IVA</Text><Text>${iva.toFixed(2)}</Text></View>
                    <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalText}>Total</Text><Text style={styles.totalText}>${total.toFixed(2)}</Text></View>
                    <Pressable style={({ pressed }) => [styles.continueButton, cart.length === 0 && styles.continueButtonDisabled, pressed && styles.continueButtonPressed,]} onPress={continueCheckout} disabled={cart.length === 0}><Text style={styles.continueButtonText}>Continuar</Text></Pressable>
                </View>
            </View>
          )}
        </View>
        <FooterComponent />
      </ScrollView>

      {showMobileBubble && (
        <Pressable style={styles.cartBubble} onPress={toggleCartWindow}>
          <FontAwesome name="shopping-cart" size={28} color="#ffffff" />
          <Text style={styles.cartQuantity}>{totalCartQuantity}</Text>
        </Pressable>
      )}

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#A63700" />
          <Text style={styles.loadingMessage}>Validando...</Text>
        </View>
      )}

      {/* Carrito móvil (sin cambios) */}
      {isMobile && showCartWindow && (
        <Animated.View style={[styles.cartWindowOverlay, { opacity: cartWindowAnim.interpolate({ inputRange: [0, width], outputRange: [1, 0], }) }]} onStartShouldSetResponder={() => true} onResponderRelease={() => {}}>
          <Pressable style={styles.cartWindowBackdrop} onPress={toggleCartWindow} />
          <Animated.View style={[ styles.cartWindowContent, { transform: [{ translateX: cartWindowAnim }] },]}>
            <View style={styles.cartWindowHeader}>
              <Text style={styles.cartWindowTitle}>Tu Carrito</Text>
              <Pressable style={styles.closeButton} onPress={toggleCartWindow}><FontAwesome name="times" size={28} color="#664400" /></Pressable>
            </View>
            <ScrollView style={styles.productsInCartPopup} contentContainerStyle={styles.productsInCartPopupContent}>
              {cart.length === 0 ? (<Text style={styles.cartEmptyText}>El carrito está vacío...</Text>) : (
                cart.map((product, index) => (
                    <View key={product.id} style={styles.productInCart}>
                        <View style={styles.productCartImageWrapper}><Image source={{ uri: product.image }} alt={product.name} style={styles.productCartImage} /></View>
                        <View style={styles.productDetails}>
                        <Text style={styles.productNameInCart}>{product.name}</Text>
                        <Text>${(product.price * product.quantity).toFixed(2)}</Text>
                        <View style={styles.itemActions}>
                            <Pressable style={styles.deleteItem} onPress={() => removeItem(index)}><FontAwesome name="trash-o" size={18} color="#A60000" /></Pressable>
                            <View style={styles.quantityControls}>
                            <Pressable style={styles.decreaseQuantity} onPress={() => changeQuantity(index, -1)}><Text style={styles.quantityControlText}>-</Text></Pressable>
                            <Text style={styles.quantityDisplay}>{product.quantity}</Text>
                            <Pressable style={styles.increaseQuantity} onPress={() => changeQuantity(index, 1)}><Text style={styles.quantityControlText}>+</Text></Pressable>
                            </View>
                        </View>
                        </View>
                    </View>
                ))
              )}
            </ScrollView>
            <View style={styles.summary}>
                <View style={styles.summaryRow}><Text>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text></View>
                <View style={styles.summaryRow}><Text>IVA</Text><Text>${iva.toFixed(2)}</Text></View>
                <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalText}>Total</Text><Text style={styles.totalText}>${total.toFixed(2)}</Text></View>
                <Pressable style={({ pressed }) => [styles.continueButton, cart.length === 0 && styles.continueButtonDisabled, pressed && styles.continueButtonPressed,]} onPress={continueCheckout} disabled={cart.length === 0}><Text style={styles.continueButtonText}>Continuar</Text></Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

// --- ESTILOS: AGREGAR ESTILOS PARA EL CARRUSEL ---
const styles = StyleSheet.create({
  // ... (Tus estilos existentes van aquí, no los borres)
  productsPageWrapper: { flex: 1, backgroundColor: "#FFFBF5" },
  mainContentScrollView: { flex: 1 },
  mainContentContainer: { alignItems: "center" },
  navbarSpacer: { height: 80 },
  mainContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    maxWidth: 1400,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainContainerDesktop: { padding: 30 },
  mainContainerMobile: { flexDirection: "column", padding: 10 },
  searchBarContainer: {
    width: "100%",
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarContainerMobile: { paddingVertical: 10 },
  productSearchInput: {
    flex: 1,
    height: 45,
    borderColor: "#D3C3A2",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  productSearchInputMobile: { height: 50 },
  inlineCartButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#A63700",
    borderRadius: 25,
    position: "relative",
  },
  inlineCartQuantity: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    color: '#A63700',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: 'bold',
    fontSize: 12,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 20,
  },
  productsGridDesktop: { flex: 0.7, paddingRight: 30 },
  productsGridMobile: { width: "100%", justifyContent: "center" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 300,
  },
  loadingMessage: { marginTop: 10, fontSize: 16, color: "#664400" },
  noProductsMessage: {
    width: "100%",
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#888",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  productContent: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
    flex: 1,
  },
  productInfo: { flex: 1, marginRight: 10 },
  productName: { fontSize: 18, fontWeight: "bold", color: "#664400" },
  description: { fontSize: 14, color: "#777", marginVertical: 5 },
  price: { fontSize: 18, fontWeight: "bold", color: "#A63700", marginTop: "auto" },
  productImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" }, // Este estilo lo usa ProductImageCarousel para el placeholder
  addToCartButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#A63700",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartSidebar: {
    flex: 0.3,
    backgroundColor: "#FFFDF9",
    borderRadius: 15,
    padding: 20,
    height: "fit-content",
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  cartHeader: { borderBottomWidth: 1, borderBottomColor: "#E0D6C3", paddingBottom: 10, marginBottom: 10 },
  cartTitle: { fontSize: 22, fontWeight: "bold", color: "#664400" },
  productsInCart: { flex: 1 },
  cartEmptyText: { textAlign: "center", color: "#888", marginTop: 20 },
  productInCart: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  productCartImageWrapper: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', marginRight: 10 },
  productCartImage: { width: "100%", height: "100%" },
  productDetails: { flex: 1, justifyContent: "center" },
  productNameInCart: { fontWeight: "bold", color: "#664400" },
  itemActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 },
  deleteItem: { padding: 5 },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0D6C3",
    borderRadius: 15,
  },
  decreaseQuantity: { paddingHorizontal: 10, paddingVertical: 2 },
  increaseQuantity: { paddingHorizontal: 10, paddingVertical: 2 },
  quantityControlText: { fontSize: 18, color: "#A63700" },
  quantityDisplay: { paddingHorizontal: 12, fontSize: 16, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#E0D6C3"},
  summary: { marginTop: "auto", borderTopWidth: 1, borderTopColor: "#E0D6C3", paddingTop: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  totalRow: { borderTopWidth: 1, borderTopColor: "#E0D6C3", paddingTop: 5, marginTop: 5 },
  totalText: { fontWeight: "bold", fontSize: 18 },
  continueButton: {
    backgroundColor: "#A63700",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  continueButtonDisabled: { backgroundColor: "#C8A68F" },
  continueButtonPressed: { backgroundColor: "#852b00" },
  continueButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cartBubble: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#A63700",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  cartQuantity: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#fff",
    color: "#A63700",
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "bold",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cartWindowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  cartWindowBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cartWindowContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 350,
    backgroundColor: "#FFFDF9",
    flexDirection: "column",
  },
  cartWindowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D6C3',
  },
  cartWindowTitle: { fontSize: 20, fontWeight: 'bold', color: '#664400' },
  closeButton: { padding: 5 },
  productsInCartPopup: { flex: 1, padding: 15 },
  productsInCartPopupContent: { paddingBottom: 20 },
  
  // --- NUEVOS ESTILOS PARA EL CARRUSEL ---
  carouselContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  carouselScrollView: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#ffffff',
  },
});

export default ProductsScreen;