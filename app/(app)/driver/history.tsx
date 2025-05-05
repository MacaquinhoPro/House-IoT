import { useRouter } from 'expo-router';
import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  skyBlue: '#20ADF5',
  midnightBlue: '#1A2E46',
  gray: '#989898',
  white: '#FFFFFF'
};

export default function ViajesAnteriores() {
  const router = useRouter();

  const viajesRealizados = [
    {
      fecha: '21 de abril de 2025',
      origen: 'Ciudad A',
      destino: 'Ciudad B',
      duracion: '3h 40m',
      pasajeros: 30,
    },
    {
      fecha: '18 de abril de 2025',
      origen: 'Ciudad C',
      destino: 'Ciudad D',
      duracion: '5h 00m',
      pasajeros: 25,
    },
    {
      fecha: '15 de abril de 2025',
      origen: 'Ciudad E',
      destino: 'Ciudad F',
      duracion: '2h 50m',
      pasajeros: 28,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viajes Anteriores</Text>

      <ScrollView style={{ marginTop: 20 }}>
        {viajesRealizados.map((viaje, index) => (
          <View key={index} style={styles.tripCard}>
            <Text style={styles.dateText}>{viaje.fecha}</Text>

            <Text style={styles.routeText}>
              {viaje.origen} ➔ {viaje.destino}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>Duración: {viaje.duracion}</Text>
              <Text style={styles.infoText}>Pasajeros: {viaje.pasajeros}</Text>
            </View>

            <View style={styles.completedChip}>
              <Text style={styles.completedText}>Completado</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.navbar}>
            <Ionicons name="home-outline" size={28} color={COLORS.gray} onPress={() => router.navigate('/driver')} />
            <Ionicons name="swap-horizontal-outline" size={28} color={COLORS.gray} onPress={() => router.navigate('/driver/routes')} />
            <Ionicons name="document-text-outline" size={28} color={COLORS.skyBlue} />
            <Ionicons name="settings-outline" size={28} color={COLORS.gray} />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.midnightBlue,
  },
  tripCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 6,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.midnightBlue,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  completedChip: {
    backgroundColor: '#D0F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.midnightBlue,
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
