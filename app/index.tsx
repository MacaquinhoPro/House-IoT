import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// Obtener dimensiones del dispositivo para diseño responsive
const { width, height } = Dimensions.get('window');

// Paleta de colores
const COLORS = {
  skyBlue: '#20ADF5',
  midnightBlue: '#1A2E46',
  gray: '#989898',
  white: '#FFFFFF'
};

export default function Index() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  
  // Datos de los slides con títulos y descripciones
  const slides = [
    {
      title: "Bienvenido a Rutiq",
      description: "Tu compañero de viaje en transporte público",
      icon: 'bus',
      iconSize: 100
    },
    {
      title: "Compra tus pasajes",
      description: "Compra tu pasaje de bus con anticipación, sin filas ni complicaciones",
      icon: 'ticket',
      iconSize: 100
    },
    {
      title: "Rastreo en tiempo real",
      description: "Consulta en tiempo real por dónde va tu bus y evita esperas innecesarias en el paradero",
      icon: 'location',
      iconSize: 100
    },
    {
      title: "Planifica tus rutas",
      description: "Planea tus rutas y conoce qué bus tomar",
      icon: 'map',
      iconSize: 100
    }
  ];

  // Función para navegar a la pantalla de autenticación
  const navigateToAuth = () => {
    router.push('/auth');
  };

  // Función para avanzar al siguiente slide
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // Renderizar indicadores de posición (dots)
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentSlide ? COLORS.skyBlue : '#D9D9D9' }
            ]}
          />
        ))}
      </View>
    );
  };

  // Función para renderizar el icono correcto
  const renderIcon = () => {
    const iconName = slides[currentSlide].icon;
    let iconComponent;
    
    switch(iconName) {
      case 'bus':
        iconComponent = <Ionicons name="bus" size={100} color="#000000" />;
        break;
      case 'ticket':
        iconComponent = <Ionicons name="ticket" size={100} color="#000000" />;
        break;
      case 'location':
        iconComponent = <Ionicons name="location" size={100} color="#000000" />;
        break;
      case 'map':
        iconComponent = <Ionicons name="map" size={100} color="#000000" />;
        break;
      default:
        iconComponent = <Ionicons name="help-circle" size={100} color="#000000" />;
    }
    
    return iconComponent;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.slideContainer}>
        {/* Top blue section with icon */}
        <View style={styles.topSection}>
          {renderIcon()}
        </View>
        
        {/* Content section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.description}>{slides[currentSlide].description}</Text>
          
          {renderDots()}
          
          <View style={styles.navigationContainer}>
            {currentSlide < slides.length - 1 ? (
              <>
                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Siguiente</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={navigateToAuth} style={styles.skipButton}>
                  <Text style={styles.skipText}>Omitir</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={navigateToAuth} style={styles.getStartedButton}>
                <Text style={styles.getStartedButtonText}>¡Comenzar!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  slideContainer: {
    flex: 1,
  },
  topSection: {
    backgroundColor: COLORS.skyBlue,
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: COLORS.midnightBlue,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.gray,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 15,
    minWidth: 130,
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 130,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  getStartedButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});