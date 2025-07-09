import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, Animated, Easing, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // For icons

// Ensure these image paths are correct relative to IndexScreen.jsx
import ChocoLushLogo from '../../assets/images/ChocoLushLogo.png'; // NEW: Add your logo
import ProductosCard1 from '../../assets/images/ProductosCard1.png';
import BrandsCard2 from '../../assets/images/BrandsCard2.png';
import CalidadCard3 from '../../assets/images/CalidadCard3.png';
import Bg2x from '../../assets/images/bg2x.png';
import Smores2 from '../../assets/images/smores2.png';
import BannerImg2 from '../../assets/images/bannerimg2.png';


const { width, height } = Dimensions.get('window'); // Get full screen dimensions

// --- DefaultButtonComponent (inlined for this example as per request) ---
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


// --- NavBarComponent ---
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
// --- End NavBarComponent ---


const IndexScreen = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const currentYear = new Date().getFullYear(); // For the footer copyright

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 100); // Adjust this threshold as needed
  };

  return (
    <>
      <NavBarComponent isScrolled={isScrolled} />
      <ScrollView
        style={styles.outerContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Component Content */}
        <View style={heroStyles.heroContainer}>
            <Image
                source={BannerImg2} // Use the imported image
                style={heroStyles.heroBackgroundImage}
                resizeMode="cover"
            />
            <Text style={heroStyles.heroTitle}>Deléitate con la Dulzura</Text>
            <Text style={heroStyles.heroSubtitle}>Explora nuestros sabores únicos</Text>
            <Pressable style={heroStyles.heroButton} onPress={() => console.log('Shop Now')}>
                <Text style={heroStyles.heroButtonText}>Comprar Ahora</Text>
            </Pressable>
        </View>

        <View style={styles.paddingTop}>
          <View style={styles.container}>
            <Text style={styles.mainHeading}>Bienvenido a Chocolush</Text>
            <Text style={styles.subText}>Estas a un paso de probar los mejores dulces</Text>

            <View style={[
              styles.cardsGridContainer,
              width >= 768 && responsiveStyles.cardsGridContainerLarge
            ]}>
              <View style={styles.productCard}>
                <Image source={ProductosCard1} style={styles.cardImgTop} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Nuestra Exquisita Selección</Text>
                  <Text style={styles.cardText}>Explore una curada colección de los más finos dulces y chocolates, diseñados para deleitar todos los paladares.</Text>
                  <View style={styles.cardButtonWrapper}>
                    <Pressable style={styles.btnPrimary} onPress={() => console.log('Discover Products pressed')}>
                      <Text style={styles.btnPrimaryText}>Descubrir Productos</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.productCard}>
                <Image source={BrandsCard2} style={styles.cardImgTop} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Marcas de Prestigio</Text>
                  <Text style={styles.cardText}>Conozca las renombradas marcas que conforman nuestra oferta, garantizando calidad y sabor inigualables.</Text>
                  <View style={styles.cardButtonWrapper}>
                    <Pressable style={styles.btnPrimary} onPress={() => console.log('Explore Brands pressed')}>
                      <Text style={styles.btnPrimaryText}>Explorar Marcas</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.productCard}>
                <Image source={CalidadCard3} style={styles.cardImgTop} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Calidad Garantizada</Text>
                  <Text style={styles.cardText}>Nuestra promesa: solo los productos de la más alta calidad, seleccionados de las mejores fuentes a nivel global.</Text>
                  <View style={styles.cardButtonWrapper}>
                    <Pressable style={styles.btnPrimary} onPress={() => console.log('See New Arrivals pressed')}>
                      <Text style={styles.btnPrimaryText}>Ver Novedades</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[
          styles.candyBanner,
          width <= 768 && responsiveStyles.candyBannerSmall,
          width <= 480 && responsiveStyles.candyBannerXSmall
        ]}>
          <Image source={Bg2x} style={styles.bannerImage} />
          <View style={styles.bannerContent}>
            <Text style={[
              styles.bannerTitle,
              width <= 768 && responsiveStyles.bannerTitleSmall,
              width <= 480 && responsiveStyles.bannerTitleXSmall
            ]}>Deléitese con la Exquisita Dulzura</Text>
            <Text style={[
              styles.bannerText,
              width <= 768 && responsiveStyles.bannerTextSmall,
              width <= 480 && responsiveStyles.bannerTextXSmall
            ]}>Descubra nuestra selección curada de chocolates gourmet y dulces artesanales, elaborados para deleitar cada paladar.</Text>
            <Pressable style={[
              styles.shopNowBtn,
              width <= 768 && responsiveStyles.shopNowBtnSmall,
              width <= 480 && responsiveStyles.shopNowBtnXSmall
            ]} onPress={() => console.log('Explore Our Collection pressed')}>
              <Text style={styles.shopNowBtnText}>Explora Nuestra Colección</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.featureBoxWrapper}>
          <View style={[
            styles.featureBox,
            width <= 992 && responsiveStyles.featureBoxSmall,
            width <= 576 && responsiveStyles.featureBoxXSmall
          ]}>
            <View style={[
              styles.textContent,
              width <= 992 && responsiveStyles.textContentSmall
            ]}>
              <Text style={[
                styles.featureTitle,
                width <= 992 && responsiveStyles.featureTitleSmall,
                width <= 576 && responsiveStyles.featureTitleXSmall
              ]}>Verano de S'mores</Text>
              <Text style={[
                styles.featureDescription,
                width <= 992 && responsiveStyles.featureDescriptionSmall
              ]}>
                Aplasta tus S'mores y crea recuerdos inolvidables, porque ha llegado el momento de reunirse alrededor de la fogata para disfrutar del dulce favorito de todos.
              </Text>
              <Pressable style={styles.exploreButton} onPress={() => console.log('Explore Smores pressed')}>
                <Text style={styles.exploreButtonText}>Explore S'mores</Text>
              </Pressable>
            </View>
            <View style={styles.imageContent}>
              <View style={[
                styles.circularImageContainer,
                width <= 576 && responsiveStyles.circularImageContainerXSmall
              ]}>
                <Image source={Smores2} style={[
                  styles.featureImage,
                  width <= 576 && responsiveStyles.featureImageXSmall
                ]} />
              </View>
            </View>
          </View>
        </View>
        
        {/* NEW FOOTER CONTENT */}
        <View style={footerStyles.mainFooter}>
            <View style={footerStyles.footerContentWrapper}>
                <View style={footerStyles.footerTopSection}>
                    <View style={footerStyles.footerBrand}>
                        <Image source={ChocoLushLogo} style={footerStyles.footerLogo} />
                        <View style={footerStyles.socialIcons}>
                            <Pressable onPress={() => Linking.openURL('https://twitter.com')} style={({ pressed }) => [footerStyles.socialIconLink, pressed && footerStyles.socialIconLinkPressed]} aria-label="Twitter">
                                <FontAwesome name="twitter" size={width <= 480 ? 20 : 24} color="#A65300" />
                            </Pressable>
                            <Pressable onPress={() => Linking.openURL('https://instagram.com')} style={({ pressed }) => [footerStyles.socialIconLink, pressed && footerStyles.socialIconLinkPressed]} aria-label="Instagram">
                                <FontAwesome name="instagram" size={width <= 480 ? 20 : 24} color="#A65300" />
                            </Pressable>
                            <Pressable onPress={() => Linking.openURL('https://facebook.com')} style={({ pressed }) => [footerStyles.socialIconLink, pressed && footerStyles.socialIconLinkPressed]} aria-label="Facebook">
                                <FontAwesome name="facebook-f" size={width <= 480 ? 20 : 24} color="#A65300" />
                            </Pressable>
                        </View>
                    </View>

                    <View style={footerStyles.footerLinks}>
                        <View style={footerStyles.footerColumn}>
                            <Text style={footerStyles.footerColumnTitle}>Empresa</Text>
                            <Pressable onPress={() => console.log('Sobre Nosotros')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Sobre Nosotros</Text></Pressable>
                            <Pressable onPress={() => console.log('Blog')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Blog</Text></Pressable>
                            <Pressable onPress={() => console.log('Nuestra Historia')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Nuestra Historia</Text></Pressable>
                            <Pressable onPress={() => console.log('Carreras')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Carreras</Text></Pressable>
                        </View>

                        <View style={footerStyles.footerColumn}>
                            <Text style={footerStyles.footerColumnTitle}>Productos</Text>
                            <Pressable onPress={() => console.log('Chocolates')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Chocolates</Text></Pressable>
                            <Pressable onPress={() => console.log('Dulces')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Dulces</Text></Pressable>
                            <Pressable onPress={() => console.log('Ediciones Especiales')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Ediciones Especiales</Text></Pressable>
                            <Pressable onPress={() => console.log('Personalizados')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Personalizados</Text></Pressable>
                            <Pressable onPress={() => console.log('Tiendas')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Tiendas</Text></Pressable>
                        </View>

                        <View style={footerStyles.footerColumn}>
                            <Text style={footerStyles.footerColumnTitle}>Soporte</Text>
                            <Pressable onPress={() => console.log('Preguntas Frecuentes')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Preguntas Frecuentes</Text></Pressable>
                            <Pressable onPress={() => console.log('Contacto')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Contacto</Text></Pressable>
                            <Pressable onPress={() => console.log('Envíos')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Envíos</Text></Pressable>
                            <Pressable onPress={() => console.log('Devoluciones')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed]}><Text style={footerStyles.footerLinkText}>Devoluciones</Text></Pressable>
                        </View>
                    </View>

                    <View style={footerStyles.footerCta}>
                        <Pressable style={({ pressed }) => [footerStyles.ctaButton, pressed && footerStyles.ctaButtonPressed]} onPress={() => console.log('¡Compra Ahora!')}>
                            <Text style={footerStyles.ctaButtonText}>¡Compra Ahora!</Text>
                        </Pressable>
                        <Text style={footerStyles.ctaSlogan}>Endulza tu día con ChocoLush.</Text>
                    </View>
                </View>

                <View style={footerStyles.footerBottomSection}>
                    <Text style={footerStyles.copyright}>© {currentYear} ChocoLush. Todos los derechos reservados.</Text>
                    <View style={footerStyles.legalLinks}>
                        <Pressable onPress={() => console.log('Términos y Condiciones')} style={({ pressed }) => [footerStyles.legalLinkItem, pressed && footerStyles.legalLinkItemPressed]}><Text style={footerStyles.legalLinkText}>Términos y Condiciones</Text></Pressable>
                        <Pressable onPress={() => console.log('Política de Privacidad')} style={({ pressed }) => [footerStyles.legalLinkItem, pressed && footerStyles.legalLinkItemPressed]}><Text style={footerStyles.legalLinkText}>Política de Privacidad</Text></Pressable>
                        <Pressable onPress={() => console.log('Política de Cookies')} style={({ pressed }) => [footerStyles.legalLinkItem, pressed && footerStyles.legalLinkItemPressed]}><Text style={footerStyles.legalLinkText}>Política de Cookies</Text></Pressable>
                    </View>
                </View>
            </View>
        </View>
      </ScrollView>
    </>
  );
};


// --- Navbar Styles (ONLY these are for the NavBarComponent) ---
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
// --- End Navbar Styles ---


const heroStyles = StyleSheet.create({
  heroContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    position: 'relative', // IMPORTANT: for absolute positioning of the image
    overflow: 'hidden', // Ensures image doesn't overflow rounded corners if added
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '110%', // Increased width to ensure full cover
    height: '200%', // Increased height for better background effect
    resizeMode: 'cover',
    zIndex: -1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF', // Changed to white for better contrast on dark image
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFF', // Changed to white for better contrast on dark image
    textAlign: 'center',
    marginBottom: 30,
  },
  heroButton: {
    backgroundColor: '#A65300',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  heroButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
// --- End Hero Component Styles ---


// --- NEW FOOTER Component Styles ---
const footerStyles = StyleSheet.create({
  mainFooter: {
    backgroundColor: '#fffaf7', // A light, creamy color, similar to the image's background
    paddingVertical: 48, // 3em converted to px (3 * 16)
    paddingHorizontal: 32, // 2em converted to px (2 * 16)
    color: '#5C4033', // Dark brown for text
  },
  footerContentWrapper: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  footerTopSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 32, // 2em converted
    paddingBottom: 32, // 2em converted
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 64, 51, 0.1)', // Subtle divider
  },
  footerBrand: {
    flexShrink: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 150,
  },
  footerLogo: {
    height: 48, // 3em converted
    width: 48 * (150 / 60), // Adjust based on aspect ratio
    resizeMode: 'contain',
    marginBottom: 16, // 1em converted
  },
  socialIcons: {
    flexDirection: 'row',
  },
  socialIconLink: {
    marginRight: 16, // 1em converted
    padding: 5, // Add padding to make Pressable area larger
  },
  socialIconLinkPressed: {
    opacity: 0.7, // Visual feedback on press
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32, // 2em converted
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  footerColumn: {
    minWidth: 120,
    marginBottom: 16, // Added for mobile stacking gap
  },
  footerColumnTitle: {
    color: '#A60000', // Dark red for column titles
    fontSize: 17.6, // 1.1em converted
    marginBottom: 16, // 1em converted
    fontWeight: 'bold', // React Native Text doesn't inherit font-weight, needs explicit
  },
  footerLinkItem: {
    marginBottom: 12.8, // 0.8em converted
    paddingVertical: 2, // Added to make Pressable area larger
  },
  footerLinkItemPressed: {
    opacity: 0.7, // Visual feedback on press
  },
  footerLinkText: {
    color: '#5C4033',
    fontSize: 15.2, // 0.95em converted
  },
  footerCta: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: 180,
    marginLeft: 32, // 2em converted
  },
  ctaButton: {
    backgroundColor: '#F47B20', // Bright orange for CTA
    borderRadius: 5,
    paddingVertical: 16, // 1em converted
    paddingHorizontal: 32, // 2em converted
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  ctaButtonPressed: {
    backgroundColor: '#E06A1C', // Darker on hover/press
    transform: [{ translateY: -2 }],
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16, // 1em converted
    fontWeight: 'bold',
  },
  ctaSlogan: {
    marginTop: 12.8, // 0.8em converted
    fontSize: 14.4, // 0.9em converted
    color: '#7D5D4E', // Lighter brown for slogan
    textAlign: 'center',
  },
  footerBottomSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24, // 1.5em converted
    fontSize: 13.6, // 0.85em converted
  },
  copyright: {
    marginBottom: 8, // 0.5em converted, for mobile stacking
    color: '#5C4033',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center on small screens
    marginTop: 16, // 1em converted, for mobile stacking
  },
  legalLinkItem: {
    marginLeft: 24, // 1.5em converted
    paddingVertical: 2, // Added to make Pressable area larger
  },
  legalLinkItemPressed: {
    opacity: 0.7, // Visual feedback on press
  },
  legalLinkText: {
    color: '#5C4033',
    textDecorationLine: 'none', // Equivalent to text-decoration: none;
    fontSize: 13.6, // 0.85em converted
  },
});
// --- END NEW FOOTER Component Styles ---


// Rest of IndexScreen.jsx styles remain the same
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF2E0',
    paddingTop: 80, // Make space for fixed navbar
  },
  paddingTop: {
    paddingTop: 16,
  },
  container: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  mainHeading: {
    color: '#A63700',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subText: {
    color: '#664400',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
  },
  cardsGridContainer: {
    flexDirection: 'column',
    gap: 30,
    padding: 15,
    alignSelf: 'center',
    width: '100%',
  },
  productCard: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
  },
  cardImgTop: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardBody: {
    backgroundColor: '#FAD0C4',
    padding: 15,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#A60000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  cardText: {
    color: '#5C4033',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 15,
    flexGrow: 1,
  },
  cardButtonWrapper: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  btnPrimary: {
    backgroundColor: '#A65300',
    paddingVertical: 12,
    paddingHorizontal: 25,
    fontWeight: 'bold',
    borderRadius: 5,
  },
  btnPrimaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Candy Banner Styles
  candyBanner: {
    position: 'relative',
    width: '100%',
    height: 400,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',

  },
  bannerContent: {
    position: 'absolute',
    textAlign: 'center',
    color: '#FFF',
    paddingHorizontal: 10,
    maxWidth: '80%',
  },
  bannerTitle: {
    fontSize: 30,
    marginBottom: 10,
    color: '#FFF8DC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerText: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 22,
    color: '#FFF8DC',
    textAlign: 'center',
  },
  shopNowBtn: {
    backgroundColor: '#FF69B4',
    color: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shopNowBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Feature Box Styles
  featureBoxWrapper: {
    padding: 10,
    marginVertical: 30,
    alignItems: 'center',
    width: '100%',
  },
  featureBox: {
    backgroundColor: '#FFECB3',
    borderRadius: 15,
    maxWidth: 1000,
    width: '90%',
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  textContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: 20,
  },
  featureTitle: {
    fontSize: 28,
    color: '#8B4513',
    marginBottom: 5,
    lineHeight: 32,
    fontWeight: 'bold',
  },
  featureDescription: {
    fontSize: 16,
    color: '#5C4033',
    lineHeight: 24,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#3498db',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 25,
    fontSize: 16,
    fontWeight: 'bold',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContent: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularImageContainer: {
    width: 300,
    height: 300,
    backgroundColor: '#FFA000',
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  featureImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'cover',
    borderRadius: (300 * 0.9) / 2,
  },
});

// Responsive styles using Dimensions API
const responsiveStyles = StyleSheet.create({
  cardsGridContainerLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 30,
    padding: 20,
  },
  featureBoxSmall: {
    flexDirection: 'column',
    textAlign: 'center',
    padding: 20,
    gap: 20,
  },
  textContentSmall: {
    paddingRight: 0,
    alignItems: 'center',
  },
  featureTitleSmall: {
    fontSize: 22,
  },
  featureDescriptionSmall: {
    fontSize: 16,
  },
  featureBoxXSmall: {
    padding: 15,
  },
  featureTitleXSmall: {
    fontSize: 18,
  },
  circularImageContainerXSmall: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  featureImageXSmall: {
    borderRadius: (200 * 0.9) / 2,
  },
  candyBannerSmall: {
    height: 300,
  },
  bannerTitleSmall: {
    fontSize: 20,
  },
  bannerTextSmall: {
    fontSize: 16,
  },
  shopNowBtnSmall: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    fontSize: 16,
  },
  candyBannerXSmall: {
    height: 250,
  },
  bannerTitleXSmall: {
    fontSize: 15,
  },
  bannerTextXSmall: {
    fontSize: 14,
  },
  shopNowBtnXSmall: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 14,
  },

  // Responsive Footer Styles
  footerTopSectionMobile: {
    flexDirection: 'column', // Stack sections vertically
    alignItems: 'center', // Center items when stacked
    textAlign: 'center',
  },
  footerBrandMobile: {
    alignItems: 'center', // Center logo and social icons
    marginBottom: 32, // 2em converted
  },
  socialIconsMobile: {
    marginTop: 16, // 1em converted
  },
  footerLinksMobile: {
    flexDirection: 'column', // Stack link columns
    alignItems: 'center', // Center link columns
    marginBottom: 32, // 2em converted
  },
  footerColumnMobile: {
    marginBottom: 24, // 1.5em converted
    width: '100%', // Full width for columns
    maxWidth: 250, // Constrain width of stacked columns
  },
  footerColumnTitleMobile: {
    textAlign: 'center', // Center column titles
  },
  footerLinkItemMobile: {
    alignItems: 'center', // Center list items in column
  },
  footerCtaMobile: {
    marginLeft: 0, // Remove left margin
    width: '100%',
    marginBottom: 32, // 2em converted
  },
  footerBottomSectionMobile: {
    flexDirection: 'column', // Stack copyright and legal links
    textAlign: 'center',
  },
  legalLinksMobile: {
    flexDirection: 'row', // Keep legal links in a row if possible
    flexWrap: 'wrap', // Allow wrapping of legal links
    justifyContent: 'center',
    marginTop: 16, // 1em converted
  },
  legalLinkItemMobile: {
    marginHorizontal: 12.8, // 0.8em converted
    marginVertical: 8, // 0.5em converted
  },
  mainFooterSmall: {
    paddingVertical: 32, // 2em converted
    paddingHorizontal: 16, // 1em converted
  },
  socialIconLinkXSmall: {
    marginHorizontal: 8, // 0.5em converted
  },
  ctaButtonSmall: {
    paddingVertical: 12.8, // 0.8em converted
    paddingHorizontal: 24, // 1.5em converted
    fontSize: 14.4, // 0.9em converted
  },
});

export default IndexScreen;