import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // For icons

// Import logo relative to this component's new location
import ChocoLushLogo from '../../assets/images/ChocoLushLogo.png';

const { width } = Dimensions.get('window');

// --- DefaultButtonComponent (inlined as it's only used here) ---
const DefaultButton = ({ text, onPress, style, textStyle }) => (
  <Pressable style={[defaultButtonStyles.button, style]} onPress={onPress}>
    <Text style={[defaultButtonStyles.text, textStyle]}>{text}</Text>
  </Pressable>
);

const defaultButtonStyles = StyleSheet.create({
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#4a2c2a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
// --- End DefaultButtonComponent ---


const NavBarComponent = ({ isScrolled }) => { // Receive isScrolled as prop
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for offcanvas menu
  useEffect(() => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.7,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isMenuOpen, slideAnim, fadeAnim, width]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateAndCloseMenu = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Navbar */}
      <View style={[navStyles.navbar, isScrolled && navStyles.navbarScrolled]}>
        <View style={navStyles.navbarLogo}>
          <Image source={ChocoLushLogo} style={navStyles.navbarLogoImg} />
        </View>

        {/* Desktop Nav Items */}
        {width > 768 && (
          <View style={navStyles.desktopNavItems}>
            <View style={navStyles.navItem}>
              <DefaultButton text="Home" onPress={() => router.push('/')} />
            </View>
            <View style={navStyles.navItem}>
              <DefaultButton text="Brands" onPress={() => router.push('/screens/BrandsScreen')} />
            </View>
            <View style={navStyles.navItem}>
              <DefaultButton text="Productos" onPress={() => router.push('/screens/ProductsScreen')} />
            </View>
          </View>
        )}

        {/* User Section (Desktop) */}
        {width > 768 && (
          <View style={navStyles.navbarUserSection}>
            <Pressable style={navStyles.circleNav} onPress={() => router.push('/screens/LogInScreen')}>
                <FontAwesome name="user" size={24} color="#3c0d0d" />
            </Pressable>
          </View>
        )}

        {/* Hamburger Button (Mobile) */}
        {width <= 768 && (
          <Pressable onPress={toggleMenu} style={navStyles.navbarHamburger}>
            <FontAwesome name={isMenuOpen ? 'times' : 'bars'} size={30} color="#4a2c2a" />
          </Pressable>
        )}
      </View>

      {/* Offcanvas Backdrop (Mobile) */}
      {width <= 768 && (
        <Animated.View style={[navStyles.offcanvasBackdrop, { opacity: fadeAnim, display: isMenuOpen ? 'flex' : 'none' }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
        </Animated.View>
      )}

      {/* Offcanvas Menu (Mobile) */}
      {width <= 768 && (
        <Animated.View style={[navStyles.offcanvasMenu, { transform: [{ translateX: slideAnim }] }]}>
          <View style={navStyles.offcanvasCloseButton}>
            <Pressable onPress={toggleMenu}>
              <FontAwesome name="times" size={30} color="#4a2c2a" />
            </Pressable>
          </View>
          <View style={navStyles.offcanvasNavList}>
            <View style={navStyles.navItemOffcanvas}>
              <DefaultButton text="Home" onPress={() => navigateAndCloseMenu('/')} style={navStyles.offcanvasButton} textStyle={navStyles.offcanvasButtonText}/>
            </View>
            <View style={navStyles.navItemOffcanvas}>
              <DefaultButton text="Brands" onPress={() => navigateAndCloseMenu('/screens/BrandsScreen')} style={navStyles.offcanvasButton} textStyle={navStyles.offcanvasButtonText}/>
            </View>
            <View style={navStyles.navItemOffcanvas}>
              <DefaultButton text="Productos" onPress={() => navigateAndCloseMenu('/screens/ProductsScreen')} style={navStyles.offcanvasButton} textStyle={navStyles.offcanvasButtonText}/>
            </View>
            <View style={navStyles.navItemOffcanvas}>
              <DefaultButton text="Iniciar Sesion" onPress={() => navigateAndCloseMenu('/screens/LogInScreen')} style={navStyles.offcanvasButton} textStyle={navStyles.offcanvasButtonText}/>
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
};

const navStyles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80, // 6em approx
    paddingHorizontal: 20, // 1.5em approx
    position: 'absolute', // Fixed positioning
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  navbarScrolled: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  navbarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  navbarLogoImg: {
    height: 30, // 2em approx
    width: 30 * (150 / 60), // Adjust width based on aspect ratio of your logo if known
    resizeMode: 'contain',
    marginRight: 8, // 0.5em approx
  },
  navbarHamburger: {
    display: 'flex', // Show on mobile
    backgroundColor: 'transparent',
    borderWidth: 0,
    zIndex: 1002,
  },
  desktopNavItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarUserSection: {
    marginLeft: 'auto', // Push to right
  },
  navItem: {
    marginLeft: 40, // 3em approx
  },
  navItemOffcanvas: {
    paddingVertical: 10, // 0.8em approx
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  offcanvasButton: {
    width: '100%',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    paddingHorizontal: 15, // 0.5em + 1em approx
    paddingVertical: 8,
  },
  offcanvasButtonText: {
    color: '#4a2c2a',
    fontSize: 16, // 1.1em approx
    fontWeight: 'normal',
  },
  offcanvasBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  offcanvasMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%', // Adjust width as needed
    maxWidth: 300,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1001,
    padding: 15, // 1em approx
    flexDirection: 'column',
    overflow: 'hidden',
  },
  offcanvasNavList: {
    width: '100%',
  },
  offcanvasCloseButton: {
    alignSelf: 'flex-end',
    paddingBottom: 15, // 1em approx
  },
  circleNav: {
    width: 50,
    height: 50,
    borderRadius: 25, // 50%
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavBarComponent;