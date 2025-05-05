import { useRouter } from 'expo-router';
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// Obtener dimensiones del dispositivo
const { width, height } = Dimensions.get('window');

// Paleta de colores
const COLORS = {
  skyBlue: '#20ADF5',
  midnightBlue: '#1A2E46',
  gray: '#989898',
  white: '#FFFFFF'
};

export default function DriverHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>¡Hola, Luis 👋!</Text>
        <Text style={styles.subtitle}>Listo para tu próxima ruta</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mi próxima ruta</Text>
        <Text style={styles.routeText}>Ciudad A ➔ Ciudad B</Text>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={COLORS.gray} />
          <Text style={styles.infoText}>08:00</Text>
          <Ionicons name="timer-outline" size={20} color={COLORS.gray} style={{ marginLeft: 10 }} />
          <Text style={styles.infoText}>3h 10min</Text>
          <Ionicons name="people-outline" size={20} color={COLORS.gray} style={{ marginLeft: 10 }} />
          <Text style={styles.infoText}>18 pasajeros</Text>
        </View>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Iniciar ruta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis rutas próximas</Text>

        <ScrollView style={{ maxHeight: 200 }}>
            <View style={styles.routeCard}>
            <Ionicons name="bus-outline" size={20} color={COLORS.midnightBlue} />
            <Text style={styles.routeInfo}>Hoy ➔ Ciudad C → Ciudad D</Text>
            </View>

            <View style={styles.routeCard}>
            <Ionicons name="bus-outline" size={20} color={COLORS.midnightBlue} />
            <Text style={styles.routeInfo}>Mañana ➔ Ciudad E → Ciudad F</Text>
            </View>

            <View style={styles.routeCard}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.midnightBlue} />
            <Text style={styles.routeInfo}>Lun, 24 abr ➔ Ciudad G → Ciudad H</Text>
            </View>

            {/* Puedes seguir agregando más rutas aquí */}
        </ScrollView>
        </View>

      <View style={styles.navbar}>
        <Ionicons name="home-outline" size={28} color={COLORS.skyBlue} />
        <Ionicons name="swap-horizontal-outline" size={28} color={COLORS.gray} onPress={() => router.navigate('/driver/routes')} />
        <Ionicons name="document-text-outline" size={28} color={COLORS.gray} onPress={() => router.navigate('/driver/history')}/>
        <Ionicons name="settings-outline" size={28} color={COLORS.gray} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.midnightBlue,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.midnightBlue,
    marginBottom: 10,
  },
  routeText: {
    fontSize: 18,
    color: COLORS.midnightBlue,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  routeInfo: {
    fontSize: 14,
    color: COLORS.midnightBlue,
    marginLeft: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: COLORS.white,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
