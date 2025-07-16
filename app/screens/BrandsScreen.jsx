import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform, // For potential platform-specific adjustments
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // For navigation
import { useRouter } from "expo-router";

// Assuming these components are adapted for React Native as well
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

const BrandsScreen = () => {
  const navigation = useNavigation();

  // Local images in React Native are imported directly
  // Make sure these paths are correct relative to this file
  const brandImages = {
    KitKat: require("../../assets/images/kitkat2.png"),
    Brachs: require("../../assets/images/brachs-logo.png"),
    Nerds: require("../../assets/images/nerds-logo.png"),
    JellyBelly: require("../../assets/images/jelly-belly-logo.png"),
    Feastables: require("../../assets/images/Feastables_logo_2023_Upscaled.png"),
    ChupaChups: require("../../assets/images/Chupa_Chups_logo.png"),
    Milka: require("../../assets/images/Milka-logo.png"),
    Twix: require("../../assets/images/twix-logo.png"),
  };

  const router = useRouter();

  const navigateToBrand = (brand) => {
    // In React Navigation, you pass parameters via the second argument of navigate
    router.push({
      pathname: "/screens/ProductsScreen",
      params: { brand: brand },
    });
  };

  // Array to map through for rendering brand cards
  const brands = [
    { name: "KitKat", image: brandImages.KitKat, hoverClass: "hover-red" },
    { name: "Brachs", image: brandImages.Brachs, hoverClass: "hover-purple" },
    { name: "Nerds", image: brandImages.Nerds, hoverClass: "hover-blue" },
    {
      name: "JellyBelly",
      image: brandImages.JellyBelly,
      hoverClass: "hover-red2",
    },
    {
      name: "Feastables",
      image: brandImages.Feastables,
      hoverClass: "hover-cian",
    },
    {
      name: "ChupaChups",
      image: brandImages.ChupaChups,
      hoverClass: "hover-red",
    },
    { name: "Milka", image: brandImages.Milka, hoverClass: "hover-purple" },
    { name: "Twix", image: brandImages.Twix, hoverClass: "hover-yellow" },
  ];

  return (
    <View style={styles.brandsView}>
      <NavBarComponent style={styles.navbarProducts} />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.promociones}>
          <Text style={styles.tituloPromociones}>Todas nuestras marcas</Text>
          <Text style={styles.subTituloPromociones}>
            Un portafolio de las marcas más deliciosas
          </Text>

          <View style={styles.logoRow}>
            {brands.map((brand, index) => (
              <TouchableOpacity
                key={index} // Use a unique key for list items
                style={[styles.logoCard, styles[brand.hoverClass]]} // Apply initial style and hover (now tap) style
                onPress={() => navigateToBrand(brand.name)}
                activeOpacity={0.7} // Visual feedback on touch
              >
                <Image
                  source={brand.image}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <FooterComponent />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  brandsView: {
    flex: 1, // Takes up the whole screen
    backgroundColor: "#feebd0", // Apply to the main container
    paddingTop: 60, // Space for fixed NavBar (adjust if your NavBar height differs)
  },
  navbarProducts: {
    // These styles will be applied to the NavBarComponent's outermost View
    // The NavBarComponent itself should handle its fixed positioning internally if possible
    // Or you can directly pass these styles if your NavBarComponent accepts them
  },
  scrollViewContent: {
    flexGrow: 1, // Allows content to grow and be scrollable
    paddingBottom: 20, // Add some padding at the bottom for content
  },
  promociones: {
    backgroundColor: "#feebd0",
    paddingVertical: 20,
    paddingHorizontal: 15,
    textAlign: "center", // React Native doesn't have a direct 'textAlign' for View; applies to Text children
  },
  tituloPromociones: {
    color: "#3f000b",
    fontSize: 32, // Adjusted from 2em for better RN scaling
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subTituloPromociones: {
    fontSize: 14, // Adjusted from small
    textAlign: "center",
    color: "#555", // Add a subtle color for subtext
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: "row", // Arrange items in a row
    flexWrap: "wrap", // Allow items to wrap to the next line
    justifyContent: "center", // Center items horizontally
    gap: 20, // Replaces 'gap' property (React Native uses margin for spacing)
    // Manually add margin for gap effect:
    marginVertical: 10,
    marginHorizontal: -10, // Compensate for item margins
  },
  logoCard: {
    backgroundColor: "#f8f3f0",
    borderRadius: 15, // Adjusted from 1em
    width: 180, // Fixed width for card (adjust based on design)
    height: 180, // Fixed height for card
    alignItems: "center", // Center content horizontally
    justifyContent: "center", // Center content vertically
    shadowColor: "#000", // Box shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Box shadow for Android
    transition: "background-color 0.5s ease", // Note: Transitions are not natively supported like CSS. You'd use Animated API for this.
    // For tap feedback, we use activeOpacity on TouchableOpacity
    margin: 10, // Provides spacing between cards, simulating gap
  },
  logoImage: {
    width: "60%", // Adjust image size within the card
    height: "60%", // Adjust image size within the card
    resizeMode: "contain", // Ensures the whole image is visible
  },
  // Hover color variants - In React Native, these would be `onPress` or `onLongPress` effects
  // For simplicity, I'm applying these as static styles on `TouchableOpacity`
  // A more advanced implementation would use `useState` to change background on press/release
  "hover-red": {
    // For a static "tapped" style, or you could change background dynamically
    // backgroundColor: '#e62125', // If you want this color permanently on card
  },
  "hover-purple": {},
  "hover-cian": {},
  "hover-yellow": {},
  "hover-red2": {},
  "hover-purple2": {},
  "hover-blue": {},

  // Media Queries - React Native handles responsiveness differently.
  // We'll use Dimensions API or flex property adjustments for small screens.
  // Example for responsive card size (conceptual, needs to be dynamic):
  "@media (max-width: 768px)": {
    // This is conceptual, in real RN you'd use Dimensions or check screen width
    // logoCard: { width: '45%' }, // Adjust width for smaller screens
  },
  "@media (max-width: 480px)": {
    // logoCard: { width: '90%' }, // Adjust width for even smaller screens
  },
});

export default BrandsScreen;
