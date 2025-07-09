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
  Easing, // For easing functions in animations
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
// IMPORTANT: Replace this with your actual environment variable or hardcoded string if not using Vite
const API_BASE_URL = 'https://backendchocolush.runasp.net'; // Assuming base URL is up to .net

const ProductsScreen = () => {
  const [products, setProducts] = useState([]); // All fetched products
  const [cart, setCart] = useState([]); // Items in the cart
  const [isMobile, setIsMobile] = useState(false); // Tracks if current width is mobile
  const [showCartWindow, setShowCartWindow] = useState(false); // Controls visibility of mobile cart window
  const [showMobileBubble, setShowMobileBubble] = useState(false); // Controls mobile cart bubble visibility
  const [loading, setLoading] = useState(false); // Indicates if products are loading
  const [searchQuery, setSearchQuery] = useState(''); // Search query for filtering
  const [isScrolled, setIsScrolled] = useState(false); // For NavBarComponent scroll effect

  const router = useRouter(); // Expo Router's router instance
  const localSearchParams = useLocalSearchParams(); // Get URL query parameters
  const { brand } = localSearchParams; // Destructure 'brand' from query params

  // Animated value for the cart window slide-in/out
  const cartWindowAnim = React.useRef(new Animated.Value(width)).current;

  // Handles scroll for the NavBarComponent
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100); // Adjust this threshold as needed for navbar
  }, []);

  // Function to fetch products from the API
  const fetchAllOrBrandProducts = useCallback(async () => {
    setLoading(true); // Start loading
    const apiUrl = brand
      ? `${API_BASE_URL}/api/Producto/brand?brand=${encodeURIComponent(brand)}`
      : `${API_BASE_URL}/api/Producto`;

    try {
      const response = await axios.get(apiUrl);
      setProducts(response.data); // Update products state
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos. Intenta de nuevo más tarde.');
      setProducts([]); // Clear products on error
    } finally {
      setLoading(false); // End loading
    }
  }, [brand]); // Re-fetch if brand changes

  // Computed property (useMemo) to filter products based on the search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products; // If no search query, return all products
    }
    const query = searchQuery.toLowerCase(); // Convert query to lowercase for case-insensitive search
    return products.filter((prod) =>
      prod.PROD_NOMBRE.toLowerCase().includes(query) // Filter by product name
    );
  }, [products, searchQuery]); // Re-filter if products or searchQuery changes

  // Save cart to AsyncStorage
  const saveCart = useCallback(async (currentCart) => {
    try {
      await AsyncStorage.setItem('carrito', JSON.stringify(currentCart));
    } catch (e) {
      console.error('Error saving cart to AsyncStorage:', e);
      Alert.alert('Error', 'No se pudo guardar el carrito.');
    }
  }, []);

  // Load cart from AsyncStorage
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

  // Add a product to the shopping cart
  const addToCart = useCallback((id, name, price, image, quantity = 1) => {
    const numericPrice = parseFloat(price); // Convert price string to number
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.name === name);
      let newCart;
      if (existingProduct) {
        // If product already in cart, increment quantity
        newCart = prevCart.map((item) =>
          item.name === name ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Otherwise, add new product to cart
        newCart = [
          ...prevCart,
          {
            id: id,
            name: name,
            price: numericPrice,
            quantity: quantity,
            image: image,
          },
        ];
      }
      saveCart(newCart); // Save updated cart
      if (isMobile) {
        setShowCartWindow(true); // Auto-open cart window on mobile
        // Animate in the cart window
        Animated.timing(cartWindowAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start();
      }
      return newCart;
    });
  }, [isMobile, saveCart, cartWindowAnim]);

  // Function to change the quantity of an item in the cart
  const changeQuantity = useCallback((index, change) => {
    setCart((prevCart) => {
      let newCart = [...prevCart];
      if (newCart[index]) {
        newCart[index].quantity += change;
        if (newCart[index].quantity <= 0) {
          newCart.splice(index, 1); // Remove item if quantity is zero or less
        }
      }
      saveCart(newCart); // Save updated cart
      return newCart;
    });
  }, [saveCart]);

  // Function to remove an item from the cart
  const removeItem = useCallback((index) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart.splice(index, 1); // Remove item by index
      saveCart(newCart); // Save updated cart
      return newCart;
    });
  }, [saveCart]);

  // Computed properties for cart summary (subtotal, IVA, total)
  const subtotal = useMemo(() => {
    return cart.reduce((totalVal, product) => totalVal + product.price * product.quantity, 0);
  }, [cart]);

  const iva = useMemo(() => {
    return subtotal * 0.15;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + iva;
  }, [subtotal, iva]);

  // Function to proceed to checkout, including stock validation
  const continueCheckout = useCallback(async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito Vacío', 'El carrito está vacío. Por favor, agrega productos antes de continuar.');
      return;
    }

    setLoading(true); // Set loading state to true
    console.log('--- Iniciando validación de stock ---');
    console.log('Carrito actual:', JSON.parse(JSON.stringify(cart)));

    try {
      // Fetch all products from API again to get the most current stock data for validation
      const response = await axios.get(`${API_BASE_URL}/api/Producto`);
      const apiProducts = response.data;
      console.log('Productos obtenidos de la API (para validación de stock):', apiProducts);

      let errors = [];
      // Iterate through items in the cart and validate against current stock from API
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

      // If there are any stock validation errors, alert the user
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

      // Redirect based on user login status
      if (isAuthenticated) {
        console.log('Usuario logueado. Redirigiendo a /screens/PaymentsScreen');
        router.push('/screens/PaymentsScreen'); // Navigate to payments screen
      } else {
        Alert.alert('Iniciar Sesión Requerido', 'Debes iniciar sesión para continuar.');
        console.log('Usuario no logueado. Redirigiendo a /screens/LogInScreen');
        router.push('/screens/LogInScreen'); // Navigate to login screen
      }

    } catch (error) {
      console.error('Error general en continueCheckout:', error);
      if (error.response) {
        // Server responded with a status other than 2xx
        Alert.alert('Error del Servidor', `Error del servidor al validar stock: ${error.response.status} - ${error.response.data.Message || 'Mensaje desconocido'}`);
      } else if (error.request) {
        // Request was made but no response received
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor para validar el stock. Por favor, revisa tu conexión a internet.');
      } else {
        // Something else happened while setting up the request
        Alert.alert('Error', 'Error inesperado al preparar la validación de stock. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false); // Set loading state to false
    }
  }, [cart, router]);

  // Computed property for the total quantity of items in the cart (for bubble)
  const totalCartQuantity = useMemo(() => {
    return cart.reduce((totalVal, product) => totalVal + product.quantity, 0);
  }, [cart]);

  // Function to toggle the mobile cart window visibility
  const toggleCartWindow = useCallback(() => {
    setShowCartWindow((prev) => {
      const newState = !prev;
      Animated.timing(cartWindowAnim, {
        toValue: newState ? 0 : width, // Slide in to 0, slide out to full width
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      return newState;
    });
  }, [cartWindowAnim, width]);

  // Effect for initial load and brand changes
  useEffect(() => {
    loadCart(); // Load cart from storage on mount
    fetchAllOrBrandProducts(); // Fetch products
  }, [loadCart, fetchAllOrBrandProducts]); // Dependencies: ensure functions are stable

  // Effect to handle screen orientation/size changes for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(Dimensions.get('window').width <= 768); // Update isMobile state
    };
    updateDimensions(); // Initial check

    // Add event listener for dimension changes
    const subscription = Dimensions.addEventListener('change', updateDimensions);

    // Cleanup function to remove event listener
    return () => subscription?.remove();
  }, []);

  // Effect to hide mobile cart if not on mobile (e.g., orientation change to desktop)
  useEffect(() => {
    if (!isMobile) {
      setShowCartWindow(false);
      Animated.timing(cartWindowAnim, {
        toValue: width, // Ensure it's off-screen
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [isMobile, cartWindowAnim, width]);

  // !!! REMOVED this useEffect to prevent auto-closing when cart is empty
  // useEffect(() => {
  //   if (cart.length === 0 && showCartWindow) {
  //     setShowCartWindow(false);
  //     Animated.timing(cartWindowAnim, {
  //       toValue: width,
  //       duration: 300,
  //       easing: Easing.ease,
  //       useNativeDriver: true,
  //     }).start();
  //   }
  // }, [cart, cartWindowAnim, width, showCartWindow]);

  // Effect for mobile bubble visibility based on isMobile and totalCartQuantity
  useEffect(() => {
    setShowMobileBubble(isMobile && totalCartQuantity > 0 && !showCartWindow); // Only show bubble if offcanvas is not open
  }, [isMobile, totalCartQuantity, showCartWindow]);


  // Determine dynamic styles based on window width
  const responsiveContainerStyle = width > 768 ? styles.mainContainerDesktop : styles.mainContainerMobile;
  const responsiveProductGridStyle = width > 768 ? styles.productsGridDesktop : styles.productsGridMobile;
  const responsiveProductCardWidth = (width > 768) ? ((width * 0.7) - 60 - 20 * 2) / 3 // Approx 3 columns on desktop (70% of screen, 60px padding, 20px gap)
                                     : (width > 480) ? (width - 40 - 20) / 2 // 2 columns on tablet (40px padding, 20px gap)
                                     : '95%'; // Single column on small mobile

  return (
    <View style={styles.productsPageWrapper}>
      <NavBarComponent isScrolled={isScrolled} />
      {/* Main content ScrollView */}
      <ScrollView
        style={styles.mainContentScrollView} // Apply new style here
        onScroll={handleScroll}
        scrollEventThrottle={16} // Optimize scroll performance
        contentContainerStyle={styles.mainContentContainer} // Important for content sizing
      >
        <View style={styles.navbarSpacer} /> {/* Spacer for fixed navbar */}

        <View style={[styles.mainContainer, responsiveContainerStyle]}>
          <View style={[styles.searchBarContainer, isMobile && styles.searchBarContainerMobile]}>
            <TextInput
              style={[styles.productSearchInput, isMobile && styles.productSearchInputMobile]}
              placeholder="Buscar productos por nombre..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#888"
            />
            {/* Cart Button for Mobile (Next to Search Bar) */}
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
                        parseFloat(prod.PROD_PRECIO).toFixed(2),
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

          {/* Desktop Cart Sidebar */}
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
        <FooterComponent /> {/* Footer is part of the main ScrollView */}
      </ScrollView>


      {/* Mobile Cart Bubble (Only show if offcanvas is NOT open) */}
      {showMobileBubble && (
        <Pressable style={styles.cartBubble} onPress={toggleCartWindow}>
          <FontAwesome name="shopping-cart" size={28} color="#ffffff" />
          <Text style={styles.cartQuantity}>{totalCartQuantity}</Text>
        </Pressable>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#A63700" />
          <Text style={styles.loadingMessage}>Cargando productos...</Text>
        </View>
      )}

      {/* Mobile Cart Offcanvas Window */}
      {isMobile && showCartWindow && ( // Only render overlay if cart is visible and on mobile
        <Animated.View
          style={[
            styles.cartWindowOverlay,
            { opacity: cartWindowAnim.interpolate({
              inputRange: [0, width], // From fully visible to fully hidden
              outputRange: [1, 0],
            })},
          ]}
          // Prevent closing when clicking inside the cart content itself
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => {}}
        >
          {/* Backdrop for closing */}
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
            {/* Product list that scrolls independently */}
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
            {/* Summary and Checkout Button (Fixed at bottom) */}
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
    // position: 'relative', // Ensure this is the positioning context for absolute children
  },
  mainContentScrollView: { // New style for the main scrollable content
    flex: 1,
  },
  mainContentContainer: { // Important for content sizing in ScrollView
    flexGrow: 1, // Ensures content takes full height if not enough items
  },
  navbarSpacer: {
    height: 80, // Approximate height of NavBarComponent (6em approx from Vue CSS)
    backgroundColor: 'transparent',
  },
  // Main container layout based on screen size
  mainContainer: {
    padding: 20, // 2em
    gap: 20, // 2em
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
    zIndex: 1, // Ensure search bar is visible
  },
  searchBarContainerMobile: {
    flexDirection: 'row', // Arrange search input and button horizontally
    alignItems: 'center',
    justifyContent: 'space-between', // Space them out
    gap: 10, // Gap between search input and button
  },
  productSearchInput: {
    flex: 1, // Allow search input to take available space
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 18, // 1.1em
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
    marginRight: 0, // Reset margin
  },
  // Products Grid Layout
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Distribute items evenly
    gap: 20, // 2em
    paddingVertical: 10, // 1em
    flexGrow: 1,
  },
  productsGridDesktop: {
    flex: 3, // Takes 3 parts of space
    justifyContent: 'flex-start', // Start aligning products from left
    paddingRight: 20, // Space before sidebar
  },
  productsGridMobile: {
    justifyContent: 'center', // Center cards on mobile
    gap: 10, // Smaller gap on mobile
  },
  noProductsMessage: {
    width: '100%', // Span full width
    fontSize: 24, // 1.5em
    color: '#664400',
    padding: 40, // 2em
    textAlign: 'center',
  },
  // Product Card Styling
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
    aspectRatio: 0.8, // Maintain aspect ratio for uniform cards
    marginBottom: 10, // Added margin for spacing between rows
  },
  productContent: {
    flexDirection: 'column',
    flex: 1, // Allow content to grow
    paddingBottom: 50, // Space for the add-to-cart button
  },
  productInfo: {
    padding: 15, // 1.5em
    flexGrow: 1,
  },
  productName: {
    // fontFamily: 'DynaPuff', // Not a standard RN font, remove or replace
    fontSize: 24, // 1.5em
    color: '#A63700',
    marginBottom: 8, // 0.5em
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15, // 0.95em
    color: '#333333',
    lineHeight: 21, // 1.4
    marginBottom: 10, // 1em
    flexGrow: 1,
  },
  price: {
    fontSize: 22, // 1.4em
    fontWeight: 'bold',
    color: '#664400',
    marginTop: 10, // 1em
  },
  productImageContainer: {
    width: '100%',
    height: 180,
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
    borderRadius: 25, // 50% for circle
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
  // Cart Sidebar Styling (Desktop)
  cartSidebar: {
    flex: 1, // Takes 1 part of space on desktop
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    padding: 15, // 1.5em
    maxHeight: '80%', // Adjusted for RN to prevent overflowing parent
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cartHeader: {
    marginBottom: 15, // 1.5em
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  cartTitle: {
    // fontFamily: 'DynaPuff', // Not a standard RN font
    color: '#A63700',
    textAlign: 'center',
    fontSize: 28, // 1.8em
    fontWeight: 'bold',
  },
  productsInCart: {
    flexGrow: 1, // Allow this section to grow
    marginBottom: 15, // 1.5em
  },
  cartEmptyText: {
    textAlign: 'center',
    fontSize: 18, // 1.1em
    color: 'gray',
    paddingVertical: 10, // 1em
  },
  productInCart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // 1em
    marginBottom: 10, // 1em
    paddingBottom: 10, // 1em
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
    flexGrow: 1,
  },
  productNameInCart: {
    fontWeight: 'bold',
    fontSize: 16, // 1em
    color: '#664400',
    marginBottom: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 0.8em
    marginTop: 5, // 0.5em
  },
  deleteItem: {
    padding: 5, // 0.2em
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5, // 0.5em
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingVertical: 2, // 0.2em
    paddingHorizontal: 5, // 0.5em
  },
  decreaseQuantity: {
    backgroundColor: '#A63700',
    borderRadius: 4,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  increaseQuantity: {
    backgroundColor: '#A63700',
    borderRadius: 4,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControlText: {
    color: '#ffffff',
    fontSize: 16, // 1em
    fontWeight: 'bold',
  },
  quantityDisplay: {
    fontWeight: 'bold',
    fontSize: 18, // 1.1em
    color: '#333333',
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15, // 1.5em
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // 0.8em
    fontSize: 18, // 1.1em
  },
  totalRow: {
    marginBottom: 0,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 21, // 1.3em
    color: '#664400',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a7d3a',
    borderRadius: 8,
    marginTop: 10, // 1em
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18, // 1.1em
    fontWeight: 'bold',
  },
  continueButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  continueButtonPressed: {
    backgroundColor: '#166a31',
  },

  // Cart Bubble (Mobile, bottom-right floating)
  cartBubble: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#A63700',
    borderRadius: 30, // 50%
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 900,
  },
  cartQuantity: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#A60000',
    color: '#ffffff',
    borderRadius: 15, // 50% for circle
    paddingHorizontal: 8, // 0.5em
    paddingVertical: 3, // 0.2em
    fontSize: 12, // 0.6em
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  // New: Inline cart button for mobile (next to search bar)
  inlineCartButton: {
    backgroundColor: '#A63700', // Match theme
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inlineCartQuantity: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#A60000',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontSize: 10,
    fontWeight: 'bold',
    minWidth: 18,
    textAlign: 'center',
  },

  // Mobile Cart Offcanvas Window
  cartWindowOverlay: { // This is the full-screen overlay for the cart
    position: 'absolute', // Make it fixed to the viewport
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dim background
    zIndex: 1000,
    flexDirection: 'row', // Important for positioning content to the right
    justifyContent: 'flex-end', // Pushes the cart content to the right
  },
  cartWindowBackdrop: { // Added separate backdrop for clickable area
    flex: 1, // Takes up remaining space
  },
  cartWindowContent: {
    backgroundColor: '#ffffff',
    width: '85%', // 85% of screen width
    maxWidth: 400, // Max width for larger screens (if mobile view stretches)
    height: '100%', // Take full height of the overlay
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    padding: 15, // 1.5em
    flexDirection: 'column', // Arrange header, scrollable, summary vertically
    flex: 0, // This is key: let it shrink to content, but it will be full height due to parent flex row
             // Reverted to 0 to prevent it from taking extra space if not needed,
             // The width and height ensure it's constrained correctly.
  },
  cartWindowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // 1.5em
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10, // 1em
  },
  cartWindowTitle: {
    // fontFamily: 'DynaPuff', // Not a standard RN font
    color: '#A63700',
    fontSize: 28, // 1.8em
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  productsInCartPopup: {
    flex: 1, // Crucial: This makes the ScrollView take up available space, allowing only its content to scroll
  },
  productsInCartPopupContent: {
    paddingBottom: 20, // Add some padding at the bottom of the scrollable area
  },

  // Loader Styling
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  loadingMessage: {
    fontSize: 18, // 1.2em
    color: '#664400',
    marginTop: 10, // 1em
  },
});

export default ProductsScreen;