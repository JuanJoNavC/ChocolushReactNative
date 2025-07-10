import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator, // For the loader
  Alert, // For showing alerts to the user
  TextInput, // For the search input
  Animated, // For cart window animation
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // For navigation and URL params

// Import your shared components
import NavBarComponent from '../components/NavBarComponent';
import FooterComponent from '../components/FooterComponent';

// Import Axios for API calls
import axios from 'axios';

// Import AsyncStorage for persistent cart storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import FontAwesome for icons
import { FontAwesome } from '@expo/vector-icons';

// Get screen dimensions for responsiveness
const { width } = Dimensions.get('window');

// Base URL for API calls
const API_BASE_URL = 'https://backendchocolush.runasp.net';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showCartWindow, setShowCartWindow] = useState(false);
  const [showMobileBubble, setShowMobileBubble] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();
  const localSearchParams = useLocalSearchParams();
  const { brand } = localSearchParams;

  const cartWindowAnim = React.useRef(new Animated.Value(width)).current;

  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100);
  }, []);

  const fetchAllOrBrandProducts = useCallback(async () => {
    setLoading(true);
    const apiUrl = brand
      ? `${API_BASE_URL}/api/Producto/brand?brand=${encodeURIComponent(brand)}`
      : `${API_BASE_URL}/api/Producto`;

    try {
      const response = await axios.get(apiUrl);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos. Intenta de nuevo más tarde.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [brand]);

  const saveCart = useCallback(async (currentCart) => {
    try {
      await AsyncStorage.setItem('carrito', JSON.stringify(currentCart));
    } catch (e) {
      console.error('Error saving cart to AsyncStorage:', e);
      Alert.alert('Error', 'No se pudo guardar el carrito.');
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const savedCart = await AsyncStorage.getItem('carrito');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error loading cart from AsyncStorage:', e);
    }
  }, []);

  // Corrected addToCart to save price as a number and image as a full URL
  const addToCart = useCallback((id, name, price, image, quantity = 1) => {
    // Correctly get the numeric price
    const numericPrice = parseFloat(price);
    // Construct the full image URL from the base URL and the relative path
    const fullImageUrl = image ? `${API_BASE_URL}${image}` : null;
    
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.name === name);
      let newCart;
      if (existingProduct) {
        newCart = prevCart.map((item) =>
          item.name === name ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [
          ...prevCart,
          {
            id: id,
            name: name,
            price: numericPrice, // Save as a number
            quantity: quantity,
            image: fullImageUrl, // Save as a full URL
          },
        ];
      }
      saveCart(newCart);
      if (isMobile) {
        setShowCartWindow(true);
        Animated.timing(cartWindowAnim, {
          toValue: 0,
          duration: 300,
          // Easing is no longer imported, use an alternative or remove if not needed
          useNativeDriver: true,
        }).start();
      }
      return newCart;
    });
  }, [isMobile, saveCart, cartWindowAnim]);

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

  const subtotal = useMemo(() => {
    return cart.reduce((totalVal, product) => totalVal + product.price * product.quantity, 0);
  }, [cart]);

  const iva = useMemo(() => {
    return subtotal * 0.15;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + iva;
  }, [subtotal, iva]);

  const continueCheckout = useCallback(async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito Vacío', 'El carrito está vacío. Por favor, agrega productos antes de continuar.');
      return;
    }

    setLoading(true);
    console.log('--- Iniciando validación de stock ---');
    console.log('Carrito actual:', JSON.parse(JSON.stringify(cart)));

    try {
      const response = await axios.get(`${API_BASE_URL}/api/Producto`);
      const apiProducts = response.data;
      console.log('Productos obtenidos de la API (para validación de stock):', apiProducts);

      let errors = [];
      for (const cartItem of cart) {
        console.log(`Validando producto en carrito: ${cartItem.name}, Cantidad: ${cartItem.quantity}`);

        const apiProduct = apiProducts.find(p => p.PROD_NOMBRE === cartItem.name);

        if (!apiProduct) {
          console.warn(`Producto no encontrado en la API: ${cartItem.name}`);
          errors.push({
            product: cartItem.name,
            message: 'Producto no encontrado en el inventario de la tienda.'
          });
        } else {
          console.log(`Producto API encontrado: ${apiProduct.PROD_NOMBRE}, Stock en API: ${apiProduct.PROD_STOCK}`);
          const availableStock = parseInt(apiProduct.PROD_STOCK);

          if (isNaN(availableStock) || availableStock < 0) {
            console.error(`Stock inválido para ${cartItem.name}: ${apiProduct.PROD_STOCK}`);
            errors.push({
              product: cartItem.name,
              message: `El stock disponible del producto no es válido. Stock: ${apiProduct.PROD_STOCK}.`
            });
          } else if (cartItem.quantity > availableStock) {
            console.warn(`Stock insuficiente para ${cartItem.name}. Solicitado: ${cartItem.quantity}, Disponible: ${availableStock}`);
            errors.push({
              product: cartItem.name,
              message: `Stock insuficiente. Disponible: ${availableStock}, solicitado: ${cartItem.quantity}.`
            });
          } else {
            console.log(`Stock OK para ${cartItem.name}.`);
          }
        }
      }

      if (errors.length > 0) {
        let errorMessage = 'Errores detectados en tu carrito:\n';
        errors.forEach(error => {
          errorMessage += `- ${error.product}: ${error.message}\n`;
        });
        Alert.alert('Error de Stock', errorMessage);
        console.log('--- Validación de stock terminada con errores ---');
        return;
      }

      console.log('--- Validación de stock exitosa ---');
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated') === 'true';

      if (isAuthenticated) {
        console.log('Usuario logueado. Redirigiendo a /screens/PaymentsScreen');
        router.push('/screens/PaymentsScreen');
      } else {
        Alert.alert('Iniciar Sesión Requerido', 'Debes iniciar sesión para continuar.');
        console.log('Usuario no logueado. Redirigiendo a /screens/LogInScreen');
        router.push('/screens/LogInScreen');
      }

    } catch (error) {
      console.error('Error general en continueCheckout:', error);
      if (error.response) {
        Alert.alert('Error del Servidor', `Error del servidor al validar stock: ${error.response.status} - ${error.response.data.Message || 'Mensaje desconocido'}`);
      } else if (error.request) {
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor para validar el stock. Por favor, revisa tu conexión a internet.');
      } else {
        Alert.alert('Error', 'Error inesperado al preparar la validación de stock. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [cart, router]);

  const totalCartQuantity = useMemo(() => {
    return cart.reduce((totalVal, product) => totalVal + product.quantity, 0);
  }, [cart]);

  const toggleCartWindow = useCallback(() => {
    setShowCartWindow((prev) => {
      const newState = !prev;
      Animated.timing(cartWindowAnim, {
        toValue: newState ? 0 : width,
        duration: 300,
        // Easing is no longer imported, use an alternative or remove if not needed
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
    const updateDimensions = () => {
      setIsMobile(Dimensions.get('window').width <= 768);
    };
    updateDimensions();

    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowCartWindow(false);
      Animated.timing(cartWindowAnim, {
        toValue: width,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [isMobile, cartWindowAnim, width]);

  useEffect(() => {
    setShowMobileBubble(isMobile && totalCartQuantity > 0 && !showCartWindow);
  }, [isMobile, totalCartQuantity, showCartWindow]);

  const responsiveContainerStyle = width > 768 ? styles.mainContainerDesktop : styles.mainContainerMobile;
  const responsiveProductGridStyle = width > 768 ? styles.productsGridDesktop : styles.productsGridMobile;
  const responsiveProductCardWidth = (width > 768) ? ((width * 0.7) - 60 - 20 * 2) / 3
    : (width > 480) ? (width - 40 - 20) / 2
    : '95%';

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
            {filteredProducts.length === 0 && !loading ? (
              <Text style={styles.noProductsMessage}>
                No se encontraron productos que coincidan con "{searchQuery}".
              </Text>
            ) : (
              filteredProducts.map((prod) => (
                <View key={prod.PROD_ID} style={[styles.productCard, { width: responsiveProductCardWidth }]}>
                  <View style={styles.productContent}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{prod.PROD_NOMBRE}</Text>
                      <Text style={styles.description}>
                        {prod.PROD_DESCCORTA || prod.PROD_DESC}
                      </Text>
                      <Text style={styles.price}>
                        ${parseFloat(prod.PROD_PRECIO).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.productImageContainer}>
                      <Image
                        source={{ uri: prod.PROD_IMG }}
                        alt={prod.PROD_NOMBRE}
                        style={styles.productImage}
                      />
                    </View>
                  </View>
                  <Pressable
                    style={styles.addToCartButton}
                    onPress={() =>
                      addToCart(
                        prod.PROD_ID,
                        prod.PROD_NOMBRE,
                        prod.PROD_PRECIO, // Pass raw price to addToCart
                        prod.PROD_IMG
                      )
                    }
                  >
                    <FontAwesome name="plus" size={24} color="#ffffff" />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {!isMobile && (
            <View style={styles.cartSidebar}>
              <View style={styles.cartHeader}>
                <Text style={styles.cartTitle}>Carrito</Text>
              </View>
              <ScrollView style={styles.productsInCart}>
                {cart.length === 0 ? (
                  <Text style={styles.cartEmptyText}>El carrito está vacío...</Text>
                ) : (
                  cart.map((product, index) => (
                    <View key={product.id} style={styles.productInCart}>
                      <View style={styles.productCartImageWrapper}>
                        <Image source={{ uri: product.image }} alt={product.name} style={styles.productCartImage} />
                      </View>
                      <View style={styles.productDetails}>
                        <Text style={styles.productNameInCart}>{product.name}</Text>
                        <Text>${(product.price * product.quantity).toFixed(2)}</Text>
                        <View style={styles.itemActions}>
                          <Pressable style={styles.deleteItem} onPress={() => removeItem(index)}>
                            <FontAwesome name="trash-o" size={18} color="#A60000" />
                          </Pressable>
                          <View style={styles.quantityControls}>
                            <Pressable style={styles.decreaseQuantity} onPress={() => changeQuantity(index, -1)}>
                              <Text style={styles.quantityControlText}>-</Text>
                            </Pressable>
                            <Text style={styles.quantityDisplay}>{product.quantity}</Text>
                            <Pressable style={styles.increaseQuantity} onPress={() => changeQuantity(index, 1)}>
                              <Text style={styles.quantityControlText}>+</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text>Subtotal</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>IVA</Text>
                  <Text>${iva.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalText}>Total</Text>
                  <Text style={styles.totalText}>${total.toFixed(2)}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.continueButton,
                    cart.length === 0 && styles.continueButtonDisabled,
                    pressed && styles.continueButtonPressed
                  ]}
                  onPress={continueCheckout}
                  disabled={cart.length === 0}
                >
                  <Text style={styles.continueButtonText}>Continuar</Text>
                </Pressable>
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
          <Text style={styles.loadingMessage}>Cargando productos...</Text>
        </View>
      )}

      {isMobile && showCartWindow && (
        <Animated.View
          style={[
            styles.cartWindowOverlay,
            { opacity: cartWindowAnim.interpolate({
              inputRange: [0, width],
              outputRange: [1, 0],
            })},
          ]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => {}}
        >
          <Pressable
            style={styles.cartWindowBackdrop}
            onPress={toggleCartWindow}
          />
          <Animated.View
            style={[
              styles.cartWindowContent,
              { transform: [{ translateX: cartWindowAnim }] },
            ]}
          >
            <View style={styles.cartWindowHeader}>
              <Text style={styles.cartWindowTitle}>Tu Carrito</Text>
              <Pressable style={styles.closeButton} onPress={toggleCartWindow}>
                <FontAwesome name="times" size={28} color="#664400" />
              </Pressable>
            </View>
            <ScrollView style={styles.productsInCartPopup} contentContainerStyle={styles.productsInCartPopupContent}>
              {cart.length === 0 ? (
                <Text style={styles.cartEmptyText}>El carrito está vacío...</Text>
              ) : (
                cart.map((product, index) => (
                  <View key={product.id} style={styles.productInCart}>
                    <View style={styles.productCartImageWrapper}>
                      <Image source={{ uri: product.image }} alt={product.name} style={styles.productCartImage} />
                    </View>
                    <View style={styles.productDetails}>
                      <Text style={styles.productNameInCart}>{product.name}</Text>
                      <Text>${(product.price * product.quantity).toFixed(2)}</Text>
                      <View style={styles.itemActions}>
                        <Pressable style={styles.deleteItem} onPress={() => removeItem(index)}>
                          <FontAwesome name="trash-o" size={18} color="#A60000" />
                        </Pressable>
                        <View style={styles.quantityControls}>
                          <Pressable style={styles.decreaseQuantity} onPress={() => changeQuantity(index, -1)}>
                            <Text style={styles.quantityControlText}>-</Text>
                          </Pressable>
                          <Text style={styles.quantityDisplay}>{product.quantity}</Text>
                          <Pressable style={styles.increaseQuantity} onPress={() => changeQuantity(index, 1)}>
                            <Text style={styles.quantityControlText}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>IVA</Text>
                <Text>${iva.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalText}>${total.toFixed(2)}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.continueButton,
                  cart.length === 0 && styles.continueButtonDisabled,
                  pressed && styles.continueButtonPressed
                ]}
                onPress={continueCheckout}
                disabled={cart.length === 0}
              >
                <Text style={styles.continueButtonText}>Continuar</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productsPageWrapper: {
    flex: 1,
    backgroundColor: '#FFF2E0',
  },
  mainContentScrollView: {
    flex: 1,
  },
  mainContentContainer: {
    flexGrow: 1,
  },
  navbarSpacer: {
    height: 80,
    backgroundColor: 'transparent',
  },
  mainContainer: {
    padding: 20,
    gap: 20,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  mainContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainContainerMobile: {
    flexDirection: 'column',
  },
  searchBarContainer: {
    width: '100%',
    marginBottom: 20,
    zIndex: 1,
  },
  searchBarContainerMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  productSearchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  productSearchInputMobile: {
    marginRight: 0,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
    paddingVertical: 10,
    flexGrow: 1,
  },
  productsGridDesktop: {
    flex: 3,
    justifyContent: 'flex-start',
    paddingRight: 20,
  },
  productsGridMobile: {
    justifyContent: 'center',
    gap: 10,
  },
  noProductsMessage: {
    width: '100%',
    fontSize: 24,
    color: '#664400',
    padding: 40,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 300,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    aspectRatio: 0.8,
    marginBottom: 120,
  },
  productContent: {
    flexDirection: 'column',
    flex: 1,
    paddingBottom: 50,
  },
  productInfo: {
    padding: 15,
    flexGrow: 1,
  },
  productName: {
    fontSize: 24,
    color: '#A63700',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 21,
    marginBottom: 10,
    flexGrow: 1,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#664400',
    marginTop: 10,
  },
  productImageContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#A63700',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cartSidebar: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    padding: 15,
    maxHeight: '10%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cartHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  cartTitle: {
    color: '#A63700',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  productsInCart: {
    flexGrow: 1,
    marginBottom: 15,
  },
  cartEmptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    paddingVertical: 10,
  },
  productInCart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  productCartImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 5,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCartImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  productDetails: {
    flexDirection: 'column',
    flex: 1,
  },
  productNameInCart: {
    fontWeight: 'bold',
    color: '#333',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  deleteItem: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#A60000',
    borderRadius: 5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  increaseQuantity: {
    backgroundColor: '#E0A36D',
    width: 25,
    height: 25,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decreaseQuantity: {
    backgroundColor: '#A63700',
    width: 25,
    height: 25,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControlText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    fontSize: 16,
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    borderTopWidth: 2,
    borderTopColor: '#A63700',
    paddingTop: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRow: {
    marginTop: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#A63700',
  },
  continueButton: {
    backgroundColor: '#A63700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonPressed: {
    opacity: 0.8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingMessage: {
    fontSize: 18,
    color: '#A63700',
    marginTop: 20,
  },
  cartBubble: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#A63700',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
  },
  cartQuantity: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E0A36D',
    color: '#fff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  inlineCartButton: {
    backgroundColor: '#A63700',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  inlineCartQuantity: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E0A36D',
    color: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Mobile Cart Window Styles
  cartWindowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  cartWindowBackdrop: {
    flex: 1,
  },
  cartWindowContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '85%', // 85% of screen width
    backgroundColor: '#FFF2E0',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
    padding: 20,
  },
  cartWindowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  cartWindowTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A63700',
  },
  closeButton: {
    padding: 5,
  },
  productsInCartPopup: {
    flex: 1,
  },
  productsInCartPopupContent: {
    flexGrow: 1,
  },
});

export default ProductsScreen;