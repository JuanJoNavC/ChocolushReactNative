import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";

// Import components from their new paths
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

// Ensure these image paths are correct relative to IndexScreen.jsx
import ProductosCard1 from "../../assets/images/ProductosCard1.png";
import BrandsCard2 from "../../assets/images/BrandsCard2.png";
import CalidadCard3 from "../../assets/images/CalidadCard3.jpg";
import Bg2x from "../../assets/images/bg2x.png";
import Smores2 from "../../assets/images/smores2.png";
import BannerImg2 from "../../assets/images/bannerimg2.png";

const { width, height } = Dimensions.get("window"); // Get full screen dimensions

// --- DefaultButtonComponent (removed from here, now inlined in NavBarComponent) ---

const IndexScreen = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  // currentYear moved to FooterComponent

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
          <Text style={heroStyles.heroSubtitle}>
            Explora nuestros sabores únicos
          </Text>
          <Pressable
            style={heroStyles.heroButton}
            onPress={() => console.log("Shop Now")}
          >
            <Text style={heroStyles.heroButtonText}>Comprar Ahora</Text>
          </Pressable>
        </View>

        <View style={styles.paddingTop}>
          <View style={styles.container}>
            <Text style={styles.mainHeading}>Bienvenido a Chocolush</Text>
            <Text style={styles.subText}>
              Estas a un paso de probar los mejores dulces
            </Text>

            <View
              style={[
                styles.cardsGridContainer,
                width >= 768 && responsiveStyles.cardsGridContainerLarge,
              ]}
            >
              <View style={styles.productCard}>
                <Image source={ProductosCard1} style={styles.cardImgTop} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>
                    Nuestra Exquisita Selección
                  </Text>
                  <Text style={styles.cardText}>
                    Explore una curada colección de los más finos dulces y
                    chocolates, diseñados para deleitar todos los paladares.
                  </Text>
                  <View style={styles.cardButtonWrapper}>
                    <Pressable
                      style={styles.btnPrimary}
                      onPress={() => console.log("Discover Products pressed")}
                    >
                      <Text style={styles.btnPrimaryText}>
                        Descubrir Productos
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.productCard}>
                <Image source={BrandsCard2} style={styles.cardImgTop} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Marcas de Prestigio</Text>
                  <Text style={styles.cardText}>
                    Conozca las renombradas marcas que conforman nuestra oferta,
                    garantizando calidad y sabor inigualables.
                  </Text>
                  <View style={styles.cardButtonWrapper}>
                    <Pressable
                      style={styles.btnPrimary}
                      onPress={() => console.log("Explore Brands pressed")}
                    >
                      <Text style={styles.btnPrimaryText}>Explorar Marcas</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.productCard}>
                <Image source={CalidadCard3} style={styles.cardImgTop} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Calidad Garantizada</Text>
                  <Text style={styles.cardText}>
                    Nuestra promesa: solo los productos de la más alta calidad,
                    seleccionados de las mejores fuentes a nivel global.
                  </Text>
                  <View style={styles.cardButtonWrapper}>
                    <Pressable
                      style={styles.btnPrimary}
                      onPress={() => console.log("See New Arrivals pressed")}
                    >
                      <Text style={styles.btnPrimaryText}>Ver Novedades</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.candyBanner,
            width <= 768 && responsiveStyles.candyBannerSmall,
            width <= 480 && responsiveStyles.candyBannerXSmall,
          ]}
        >
          <Image source={Bg2x} style={styles.bannerImage} />
          <View style={styles.bannerContent}>
            <Text
              style={[
                styles.bannerTitle,
                width <= 768 && responsiveStyles.bannerTitleSmall,
                width <= 480 && responsiveStyles.bannerTitleXSmall,
              ]}
            >
              Deléitese con la Exquisita Dulzura
            </Text>
            <Text
              style={[
                styles.bannerText,
                width <= 768 && responsiveStyles.bannerTextSmall,
                width <= 480 && responsiveStyles.bannerTextXSmall,
              ]}
            >
              Descubra nuestra selección curada de chocolates gourmet y dulces
              artesanales, elaborados para deleitar cada paladar.
            </Text>
            <Pressable
              style={[
                styles.shopNowBtn,
                width <= 768 && responsiveStyles.shopNowBtnSmall,
                width <= 480 && responsiveStyles.shopNowBtnXSmall,
              ]}
              onPress={() => console.log("Explore Our Collection pressed")}
            >
              <Text style={styles.shopNowBtnText}>
                Explora Nuestra Colección
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.featureBoxWrapper}>
          <View
            style={[
              styles.featureBox,
              width <= 992 && responsiveStyles.featureBoxSmall,
              width <= 576 && responsiveStyles.featureBoxXSmall,
            ]}
          >
            <View
              style={[
                styles.textContent,
                width <= 992 && responsiveStyles.textContentSmall,
              ]}
            >
              <Text
                style={[
                  styles.featureTitle,
                  width <= 992 && responsiveStyles.featureTitleSmall,
                  width <= 576 && responsiveStyles.featureTitleXSmall,
                ]}
              >
                Verano de S'mores
              </Text>
              <Text
                style={[
                  styles.featureDescription,
                  width <= 992 && responsiveStyles.featureDescriptionSmall,
                ]}
              >
                Aplasta tus S'mores y crea recuerdos inolvidables, porque ha
                llegado el momento de reunirse alrededor de la fogata para
                disfrutar del dulce favorito de todos.
              </Text>
              <Pressable
                style={styles.exploreButton}
                onPress={() => console.log("Explore Smores pressed")}
              >
                <Text style={styles.exploreButtonText}>Explore S'mores</Text>
              </Pressable>
            </View>
            <View style={styles.imageContent}>
              <View
                style={[
                  styles.circularImageContainer,
                  width <= 576 && responsiveStyles.circularImageContainerXSmall,
                ]}
              >
                <Image
                  source={Smores2}
                  style={[
                    styles.featureImage,
                    width <= 576 && responsiveStyles.featureImageXSmall,
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Render the new FooterComponent */}
        <FooterComponent />
      </ScrollView>
    </>
  );
};

// --- Hero Component Styles (remain in IndexScreen.jsx) ---
const heroStyles = StyleSheet.create({
  heroContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  heroBackgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "110%",
    height: "200%",
    resizeMode: "cover",
    zIndex: -1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 30,
  },
  heroButton: {
    backgroundColor: "#A65300",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  heroButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
// --- End Hero Component Styles ---

// Rest of IndexScreen.jsx styles remain here
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#FFF2E0",
    paddingTop: 80, // Make space for fixed navbar
  },
  paddingTop: {
    paddingTop: 16,
  },
  container: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  mainHeading: {
    color: "#A63700",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subText: {
    color: "#664400",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 30,
  },
  cardsGridContainer: {
    flexDirection: "column",
    gap: 30,
    padding: 15,
    alignSelf: "center",
    width: "100%",
  },
  productCard: {
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
    height: "auto",
  },
  cardImgTop: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardBody: {
    backgroundColor: "#FAD0C4",
    padding: 15,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#A60000",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  cardText: {
    color: "#5C4033",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 15,
    flexGrow: 1,
  },
  cardButtonWrapper: {
    alignItems: "center",
    marginTop: "auto",
  },
  btnPrimary: {
    backgroundColor: "#A65300",
    paddingVertical: 12,
    paddingHorizontal: 25,
    fontWeight: "bold",
    borderRadius: 5,
  },
  btnPrimaryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Candy Banner Styles
  candyBanner: {
    position: "relative",
    width: "100%",
    height: 400,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerContent: {
    position: "absolute",
    textAlign: "center",
    color: "#FFF",
    paddingHorizontal: 10,
    maxWidth: "80%",
  },
  bannerTitle: {
    fontSize: 30,
    marginBottom: 10,
    color: "#FFF8DC",
    fontWeight: "bold",
    textAlign: "center",
  },
  bannerText: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 22,
    color: "#FFF8DC",
    textAlign: "center",
  },
  shopNowBtn: {
    backgroundColor: "#FF69B4",
    color: "white",
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontSize: 18,
    fontWeight: "bold",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shopNowBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  // Feature Box Styles
  featureBoxWrapper: {
    padding: 10,
    marginVertical: 30,
    alignItems: "center",
    width: "100%",
  },
  featureBox: {
    backgroundColor: "#FFECB3",
    borderRadius: 15,
    maxWidth: 1000,
    width: "90%",
    padding: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  textContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingRight: 20,
  },
  featureTitle: {
    fontSize: 28,
    color: "#8B4513",
    marginBottom: 5,
    lineHeight: 32,
    fontWeight: "bold",
  },
  featureDescription: {
    fontSize: 16,
    color: "#5C4033",
    lineHeight: 24,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#3498db",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 25,
    fontSize: 16,
    fontWeight: "bold",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  imageContent: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  circularImageContainer: {
    width: 300,
    height: 300,
    backgroundColor: "#FFA000",
    borderRadius: 150,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#FFA000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  featureImage: {
    width: "90%",
    height: "90%",
    resizeMode: "cover",
    borderRadius: (300 * 0.9) / 2,
  },
});

// Responsive styles using Dimensions API
const responsiveStyles = StyleSheet.create({
  cardsGridContainerLarge: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 30,
    padding: 20,
  },
  featureBoxSmall: {
    flexDirection: "column",
    textAlign: "center",
    padding: 20,
    gap: 20,
  },
  textContentSmall: {
    paddingRight: 0,
    alignItems: "center",
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

  // Responsive Footer Styles (moved here from footerStyles)
  footerTopSectionMobile: {
    flexDirection: "column", // Stack sections vertically
    alignItems: "center", // Center items when stacked
    textAlign: "center",
  },
  footerBrandMobile: {
    alignItems: "center", // Center logo and social icons
    marginBottom: 32, // 2em converted
  },
  socialIconsMobile: {
    marginTop: 16, // 1em converted
  },
  footerLinksMobile: {
    flexDirection: "column", // Stack link columns
    alignItems: "center", // Center link columns
    marginBottom: 32, // 2em converted
  },
  footerColumnMobile: {
    marginBottom: 24, // 1.5em converted
    width: "100%", // Full width for columns
    maxWidth: 250, // Constrain width of stacked columns
  },
  footerColumnTitleMobile: {
    textAlign: "center", // Center column titles
  },
  footerLinkItemMobile: {
    alignItems: "center", // Center list items in column
  },
  footerCtaMobile: {
    marginLeft: 0, // Remove left margin
    width: "100%",
    marginBottom: 32, // 2em converted
  },
  footerBottomSectionMobile: {
    flexDirection: "column", // Stack copyright and legal links
    textAlign: "center",
  },
  legalLinksMobile: {
    flexDirection: "row", // Keep legal links in a row if possible
    flexWrap: "wrap", // Allow wrapping of legal links
    justifyContent: "center",
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
