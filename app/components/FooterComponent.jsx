import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // For icons

// Import logo relative to this component's new location
import ChocoLushLogo from '../../assets/images/ChocoLushLogo.png';

const { width } = Dimensions.get('window');

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={footerStyles.mainFooter}>
        <View style={footerStyles.footerContentWrapper}>
            <View style={[
              footerStyles.footerTopSection,
              width <= 768 && footerResponsiveStyles.footerTopSectionMobile
            ]}>
                <View style={[
                  footerStyles.footerBrand,
                  width <= 768 && footerResponsiveStyles.footerBrandMobile
                ]}>
                    <Image source={ChocoLushLogo} style={footerStyles.footerLogo} />
                    <View style={[
                      footerStyles.socialIcons,
                      width <= 768 && footerResponsiveStyles.socialIconsMobile
                    ]}>
                        <Pressable onPress={() => Linking.openURL('https://twitter.com')} style={({ pressed }) => [footerStyles.socialIconLink, pressed && footerStyles.socialIconLinkPressed, width <= 480 && footerResponsiveStyles.socialIconLinkXSmall]} aria-label="Twitter">
                            <FontAwesome name="twitter" size={width <= 480 ? 20 : 24} color="#A65300" />
                        </Pressable>
                        <Pressable onPress={() => Linking.openURL('https://instagram.com')} style={({ pressed }) => [footerStyles.socialIconLink, pressed && footerStyles.socialIconLinkPressed, width <= 480 && footerResponsiveStyles.socialIconLinkXSmall]} aria-label="Instagram">
                            <FontAwesome name="instagram" size={width <= 480 ? 20 : 24} color="#A65300" />
                        </Pressable>
                        <Pressable onPress={() => Linking.openURL('https://facebook.com')} style={({ pressed }) => [footerStyles.socialIconLink, pressed && footerStyles.socialIconLinkPressed, width <= 480 && footerResponsiveStyles.socialIconLinkXSmall]} aria-label="Facebook">
                            <FontAwesome name="facebook-f" size={width <= 480 ? 20 : 24} color="#A65300" />
                        </Pressable>
                    </View>
                </View>

                <View style={[
                  footerStyles.footerLinks,
                  width <= 768 && footerResponsiveStyles.footerLinksMobile
                ]}>
                    <View style={[
                      footerStyles.footerColumn,
                      width <= 768 && footerResponsiveStyles.footerColumnMobile
                    ]}>
                        <Text style={[
                          footerStyles.footerColumnTitle,
                          width <= 768 && footerResponsiveStyles.footerColumnTitleMobile
                        ]}>Empresa</Text>
                        <Pressable onPress={() => console.log('Sobre Nosotros')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Sobre Nosotros</Text></Pressable>
                        <Pressable onPress={() => console.log('Blog')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Blog</Text></Pressable>
                        <Pressable onPress={() => console.log('Nuestra Historia')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Nuestra Historia</Text></Pressable>
                        <Pressable onPress={() => console.log('Carreras')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Carreras</Text></Pressable>
                    </View>

                    <View style={[
                      footerStyles.footerColumn,
                      width <= 768 && footerResponsiveStyles.footerColumnMobile
                    ]}>
                        <Text style={[
                          footerStyles.footerColumnTitle,
                          width <= 768 && footerResponsiveStyles.footerColumnTitleMobile
                        ]}>Productos</Text>
                        <Pressable onPress={() => console.log('Chocolates')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Chocolates</Text></Pressable>
                        <Pressable onPress={() => console.log('Dulces')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Dulces</Text></Pressable>
                        <Pressable onPress={() => console.log('Ediciones Especiales')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Ediciones Especiales</Text></Pressable>
                        <Pressable onPress={() => console.log('Personalizados')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Personalizados</Text></Pressable>
                        <Pressable onPress={() => console.log('Tiendas')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Tiendas</Text></Pressable>
                    </View>

                    <View style={[
                      footerStyles.footerColumn,
                      width <= 768 && footerResponsiveStyles.footerColumnMobile
                    ]}>
                        <Text style={[
                          footerStyles.footerColumnTitle,
                          width <= 768 && footerResponsiveStyles.footerColumnTitleMobile
                        ]}>Soporte</Text>
                        <Pressable onPress={() => console.log('Preguntas Frecuentes')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Preguntas Frecuentes</Text></Pressable>
                        <Pressable onPress={() => console.log('Contacto')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Contacto</Text></Pressable>
                        <Pressable onPress={() => console.log('Envíos')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Envíos</Text></Pressable>
                        <Pressable onPress={() => console.log('Devoluciones')} style={({ pressed }) => [footerStyles.footerLinkItem, pressed && footerStyles.footerLinkItemPressed, width <= 768 && footerResponsiveStyles.footerLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Devoluciones</Text></Pressable>
                    </View>
                </View>

                <View style={[
                  footerStyles.footerCta,
                  width <= 768 && footerResponsiveStyles.footerCtaMobile
                ]}>
                    <Pressable style={({ pressed }) => [footerStyles.ctaButton, pressed && footerStyles.ctaButtonPressed, width <= 480 && footerResponsiveStyles.ctaButtonSmall]} onPress={() => console.log('¡Compra Ahora!')}>
                        <Text style={footerStyles.ctaButtonText}>¡Compra Ahora!</Text>
                    </Pressable>
                    <Text style={footerStyles.ctaSlogan}>Endulza tu día con ChocoLush.</Text>
                </View>
            </View>

            <View style={[
              footerStyles.footerBottomSection,
              width <= 768 && footerResponsiveStyles.footerBottomSectionMobile
            ]}>
                <Text style={footerStyles.copyright}>© {currentYear} ChocoLush. Todos los derechos reservados.</Text>
                <View style={[
                  footerStyles.legalLinks,
                  width <= 768 && footerResponsiveStyles.legalLinksMobile
                ]}>
                    <Pressable onPress={() => console.log('Términos y Condiciones')} style={({ pressed }) => [footerStyles.legalLinkItem, pressed && footerStyles.legalLinkItemPressed, width <= 768 && footerResponsiveStyles.legalLinkItemMobile]}><Text style={footerStyles.legalLinkText}>Términos y Condiciones</Text></Pressable>
                    <Pressable onPress={() => console.log('Política de Privacidad')} style={({ pressed }) => [footerStyles.legalLinkItem, pressed && footerStyles.legalLinkItemPressed, width <= 768 && footerResponsiveStyles.legalLinkItemMobile]}><Text style={footerStyles.legalLinkText}>Política de Privacidad</Text></Pressable>
                    <Pressable onPress={() => console.log('Política de Cookies')} style={({ pressed }) => [footerStyles.legalLinkItem, pressed && footerStyles.legalLinkItemPressed, width <= 768 && footerResponsiveStyles.legalLinkItemMobile]}><Text style={footerStyles.footerLinkText}>Política de Cookies</Text></Pressable>
                </View>
            </View>
        </View>
    </View>
  );
};

const footerStyles = StyleSheet.create({
  mainFooter: {
    backgroundColor: '#fffaf7',
    paddingVertical: 48,
    paddingHorizontal: 32,
    color: '#5C4033',
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
    gap: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 64, 51, 0.1)',
  },
  footerBrand: {
    flexShrink: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 150,
  },
  footerLogo: {
    height: 48,
    width: 48 * (150 / 60), // Adjust based on aspect ratio
    resizeMode: 'contain',
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
  },
  socialIconLink: {
    marginRight: 16,
    padding: 5,
  },
  socialIconLinkPressed: {
    opacity: 0.7,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  footerColumn: {
    minWidth: 120,
    marginBottom: 16,
  },
  footerColumnTitle: {
    color: '#A60000',
    fontSize: 17.6,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  footerLinkItem: {
    marginBottom: 12.8,
    paddingVertical: 2,
  },
  footerLinkItemPressed: {
    opacity: 0.7,
  },
  footerLinkText: {
    color: '#5C4033',
    fontSize: 15.2,
  },
  footerCta: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: 180,
    marginLeft: 32,
  },
  ctaButton: {
    backgroundColor: '#F47B20',
    borderRadius: 5,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ctaButtonPressed: {
    backgroundColor: '#E06A1C',
    transform: [{ translateY: -2 }],
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ctaSlogan: {
    marginTop: 12.8,
    fontSize: 14.4,
    color: '#7D5D4E',
    textAlign: 'center',
  },
  footerBottomSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    fontSize: 13.6,
  },
  copyright: {
    marginBottom: 8,
    color: '#5C4033',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legalLinkItem: {
    marginLeft: 24,
    paddingVertical: 2,
  },
  legalLinkItemPressed: {
    opacity: 0.7,
  },
  legalLinkText: {
    color: '#5C4033',
    textDecorationLine: 'none',
    fontSize: 13.6,
  },
});

// Responsive styles for footer (moved to a separate object for clarity)
const footerResponsiveStyles = StyleSheet.create({
  footerTopSectionMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  footerBrandMobile: {
    alignItems: 'center',
    marginBottom: 32,
  },
  socialIconsMobile: {
    marginTop: 16,
  },
  footerLinksMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 32,
  },
  footerColumnMobile: {
    marginBottom: 24,
    width: '100%',
    maxWidth: 250,
  },
  footerColumnTitleMobile: {
    textAlign: 'center',
  },
  footerLinkItemMobile: {
    alignItems: 'center',
  },
  footerCtaMobile: {
    marginLeft: 0,
    width: '100%',
    marginBottom: 32,
  },
  footerBottomSectionMobile: {
    flexDirection: 'column',
    textAlign: 'center',
  },
  legalLinksMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legalLinkItemMobile: {
    marginHorizontal: 12.8,
    marginVertical: 8,
  },
  mainFooterSmall: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  socialIconLinkXSmall: {
    marginHorizontal: 8,
  },
  ctaButtonSmall: {
    paddingVertical: 12.8,
    paddingHorizontal: 24,
    fontSize: 14.4,
  },
});

export default FooterComponent;