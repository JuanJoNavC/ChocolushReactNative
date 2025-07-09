import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
// You'll need to replace these with your actual image paths
// Make sure to put your images in the assets/images folder
import ProductosCard1 from '../../assets/images/ProductosCard1.png';
import BrandsCard2 from '../../assets/images/BrandsCard2.png';
import CalidadCard3 from '../../assets/images/CalidadCard3.png';
import Bg2x from '../../assets/images/bg2x.png'; // Assuming bg2x.avif is converted to png
import Smores2 from '../../assets/images/smores2.png';

const { width } = Dimensions.get('window');

const IndexScreen = () => {
  // The heroSectionRef and onMounted from Vue are not directly transferable
  // in the same way for basic React Native setup.
  // We're focusing on replicating the UI and styling.

  const handleDiscoverProducts = () => {
    // Handle navigation or action for "Descubrir Productos"
    console.log('Discover Products pressed');
  };

  const handleExploreBrands = () => {
    // Handle navigation or action for "Explorar Marcas"
    console.log('Explore Brands pressed');
    // Example for navigation using expo-router (if you had a /brands route)
    // useRouter().push('/brands');
  };

  const handleSeeNewArrivals = () => {
    // Handle navigation or action for "Ver Novedades"
    console.log('See New Arrivals pressed');
  };

  const handleExploreCollection = () => {
    console.log('Explore Our Collection pressed');
  };

  const handleExploreSmores = () => {
    console.log('Explore Smores pressed');
  };

  // Simple Navbar Component (adapted from Vue's NavBarComponent)
  const NavBarComponent = () => (
    <View style={navStyles.navBar}>
      <Text style={navStyles.navText}>Chocolush</Text>
      {/* You can add navigation links here */}
    </View>
  );

  // Simple Hero Component (adapted from Vue's HeroComponent)
  const HeroComponent = () => (
    <View style={heroStyles.heroContainer}>
      <Text style={heroStyles.heroTitle}>Deléitate con la Dulzura</Text>
      <Text style={heroStyles.heroSubtitle}>Explora nuestros sabores únicos</Text>
      <Pressable style={heroStyles.heroButton} onPress={() => console.log('Shop Now')}>
        <Text style={heroStyles.heroButtonText}>Comprar Ahora</Text>
      </Pressable>
    </View>
  );

  // Simple Footer Component (adapted from Vue's FooterComponent)
  const FooterComponent = () => (
    <View style={footerStyles.footerContainer}>
      <Text style={footerStyles.footerText}>© 2025 Chocolush. Todos los derechos reservados.</Text>
      {/* Add more footer content if needed */}
    </View>
  );


  return (
    <ScrollView style={styles.outerContainer}>
      <NavBarComponent />
      <HeroComponent />

      <View style={styles.paddingTop}>
        <View style={styles.container}>
          <Text style={styles.mainHeading}>Bienvenido a Chocolush</Text>
          <Text style={styles.subText}>Estas a un paso de probar los mejores dulces</Text>

          <View style={styles.cardsGridContainer}>
            <View style={styles.productCard}>
              <Image source={ProductosCard1} style={styles.cardImgTop} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Nuestra Exquisita Selección</Text>
                <Text style={styles.cardText}>Explore una curada colección de los más finos dulces y chocolates, diseñados para deleitar todos los paladares.</Text>
                <View style={styles.cardButtonWrapper}>
                  <Pressable style={styles.btnPrimary} onPress={handleDiscoverProducts}>
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
                  <Pressable style={styles.btnPrimary} onPress={handleExploreBrands}>
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
                  <Pressable style={styles.btnPrimary} onPress={handleSeeNewArrivals}>
                    <Text style={styles.btnPrimaryText}>Ver Novedades</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.candyBanner}>
        <Image source={Bg2x} style={styles.bannerImage} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Deléitese con la Exquisita Dulzura</Text>
          <Text style={styles.bannerText}>Descubra nuestra selección curada de chocolates gourmet y dulces artesanales, elaborados para deleitar cada paladar.</Text>
          <Pressable style={styles.shopNowBtn} onPress={handleExploreCollection}>
            <Text style={styles.shopNowBtnText}>Explora Nuestra Colección</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.featureBoxWrapper}>
        <View style={styles.featureBox}>
          <View style={styles.textContent}>
            <Text style={styles.featureTitle}>Verano de S'mores</Text>
            <Text style={styles.featureDescription}>
              Aplasta tus S'mores y crea recuerdos inolvidables, porque ha llegado el momento de reunirse alrededor de la fogata para disfrutar del dulce favorito de todos.
            </Text>
            <Pressable style={styles.exploreButton} onPress={handleExploreSmores}>
              <Text style={styles.exploreButtonText}>Explore S'mores</Text>
            </Pressable>
          </View>
          <View style={styles.imageContent}>
            <View style={styles.circularImageContainer}>
              <Image source={Smores2} style={styles.featureImage} />
            </View>
          </View>
        </View>
      </View>
      <FooterComponent />
    </ScrollView>
  );
};

const navStyles = StyleSheet.create({
  navBar: {
    backgroundColor: '#A65300', // Example color
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const heroStyles = StyleSheet.create({
  heroContainer: {
    backgroundColor: '#FFECB3', // A light, warm color
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#A63700',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#664400',
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

const footerStyles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#A63700', // Darker brown for footer
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#FFF2E0',
    fontSize: 14,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF2E0',
  },
  paddingTop: {
    paddingTop: 16, // 1em approx
  },
  container: {
    maxWidth: 1200, // This will be simulated by horizontal padding and `alignSelf: 'center'`
    alignSelf: 'center', // Center the container
    width: '100%',
    paddingHorizontal: 20, // 2em approx, using pixels for RN
  },
  mainHeading: {
    color: '#A63700',
    textAlign: 'center',
    fontSize: 28, // Adjusted for mobile
    fontWeight: 'bold',
    marginBottom: 20, // 1em approx
  },
  subText: {
    color: '#664400',
    textAlign: 'center',
    fontSize: 16, // 1.2em approx
    marginBottom: 30, // 2em approx
  },
  cardsGridContainer: {
    flexDirection: 'column', // Default to column for mobile
    gap: 30, // 2em approx
    padding: 15, // 1em approx
    alignSelf: 'center',
    width: '100%',
  },
  productCard: {
    borderWidth: 0, // No border, border: none
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
    display: 'flex',
    flexDirection: 'column',
    height: 'auto', // Will adjust based on content
  },
  cardImgTop: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardBody: {
    backgroundColor: '#FAD0C4',
    padding: 15, // 1.5em approx
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#A60000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10, // 0.5em approx
  },
  cardText: {
    color: '#5C4033',
    textAlign: 'center',
    fontSize: 15, // 0.95em approx
    marginBottom: 15, // 1em approx
    flexGrow: 1,
  },
  cardButtonWrapper: {
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom
  },
  btnPrimary: {
    backgroundColor: '#A65300',
    paddingVertical: 12, // 0.75em approx
    paddingHorizontal: 25, // 1.5em approx
    fontWeight: 'bold',
    borderRadius: 5, // A slight round
  },
  btnPrimaryText: {
    color: 'white',
    fontWeight: 'bold',
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
    tintColor: 'rgba(0,0,0,0.2)', // Simulates brightness(0.8) by overlaying a semi-transparent black
    tintColorBlendMode: 'multiply',
  },
  bannerContent: {
    position: 'absolute',
    textAlign: 'center',
    color: '#FFF',
    paddingHorizontal: 10, // 1em approx
    maxWidth: '80%',
  },
  bannerTitle: {
    fontSize: 30, // 3em approx
    marginBottom: 10, // 0.5em approx
    color: '#FFF8DC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerText: {
    fontSize: 18, // 1.5em approx
    marginBottom: 20, // 1.5em approx
    lineHeight: 22, // 1.4 line-height
    color: '#FFF8DC',
    textAlign: 'center',
  },
  shopNowBtn: {
    backgroundColor: '#FF69B4', // Hot pink for var(--main-color)
    color: 'white',
    paddingVertical: 15, // 1em approx
    paddingHorizontal: 30, // 2em approx
    fontSize: 18, // 1.2em approx
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
    padding: 10, // 1em approx
    marginVertical: 30, // 3em approx
    alignItems: 'center',
    width: '100%',
  },
  featureBox: {
    backgroundColor: '#FFECB3',
    borderRadius: 15,
    maxWidth: 1000,
    width: '90%',
    padding: 30, // 3em approx
    flexDirection: 'row', // Default to row for wider screens
    alignItems: 'center',
    gap: 30, // 3em approx
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
    alignItems: 'flex-start', // Aligns text to the left
    paddingRight: 20, // 2em approx
  },
  featureTitle: {
    fontSize: 28, // 2.8em approx
    color: '#8B4513',
    marginBottom: 5, // 0.5em approx
    lineHeight: 32, // 1.2 line-height
    fontWeight: 'bold',
  },
  featureDescription: {
    fontSize: 16, // 1.1em approx
    color: '#5C4033',
    lineHeight: 24, // 1.6 line-height
    marginBottom: 20, // 2em approx
  },
  exploreButton: {
    backgroundColor: '#3498db',
    color: 'white',
    paddingVertical: 10, // 0.8em approx
    paddingHorizontal: 25, // 1.8em approx
    fontSize: 16, // 1.05em approx
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
    borderRadius: 150, // 50% for perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10, // For Android glow
  },
  featureImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'cover',
    borderRadius: (300 * 0.9) / 2, // Make image circular
  },
});

// Responsive styles using Dimensions API
// Note: StyleSheet.create doesn't support media queries directly.
// We apply conditional styles based on screen width.
// This is a simplified approach. For more complex responsiveness,
// you might use `react-native-responsive-fontsize` or `Dimensions` more extensively.

const responsiveStyles = StyleSheet.create({
  // Cards Grid Container for larger screens (min-width: 768px)
  cardsGridContainerLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows items to wrap
    justifyContent: 'space-around', // Distribute items evenly
    gap: 30, // 2em approx
    padding: 20, // 2em approx
  },
  // Feature Box for smaller screens (max-width: 992px)
  featureBoxSmall: {
    flexDirection: 'column',
    textAlign: 'center',
    padding: 20, // 2em approx
    gap: 20, // 2em approx
  },
  textContentSmall: {
    paddingRight: 0,
    alignItems: 'center', // Center text
  },
  featureTitleSmall: {
    fontSize: 22, // 2.2em approx
  },
  featureDescriptionSmall: {
    fontSize: 16, // 1em approx
  },
  // Feature Box for very small screens (max-width: 576px)
  featureBoxXSmall: {
    padding: 15, // 1.5em approx
  },
  featureTitleXSmall: {
    fontSize: 18, // 1.8em approx
  },
  circularImageContainerXSmall: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  featureImageXSmall: {
    borderRadius: (200 * 0.9) / 2,
  },
  // Candy Banner for smaller screens (max-width: 768px)
  candyBannerSmall: {
    height: 300,
  },
  bannerTitleSmall: {
    fontSize: 20, // 2em approx
  },
  bannerTextSmall: {
    fontSize: 16, // 1em approx
  },
  shopNowBtnSmall: {
    paddingVertical: 12, // 0.8em approx
    paddingHorizontal: 25, // 1.5em approx
    fontSize: 16, // 1em approx
  },
  // Candy Banner for very small screens (max-width: 480px)
  candyBannerXSmall: {
    height: 250,
  },
  bannerTitleXSmall: {
    fontSize: 15, // 1.5em approx
  },
  bannerTextXSmall: {
    fontSize: 14, // 0.9em approx
  },
  shopNowBtnXSmall: {
    paddingVertical: 10, // 0.7em approx
    paddingHorizontal: 20, // 1.2em approx
    fontSize: 14, // 0.9em approx
  },
});

export default IndexScreen;