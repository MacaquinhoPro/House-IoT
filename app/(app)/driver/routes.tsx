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

export default function MisRutas() {
  const router = useRouter();

  const rutasProximas = [
    {
      fecha: 'Hoy',
      origen: 'Ciudad A',
      destino: 'Ciudad B',
      hora: '08:00 AM',
      duracion: '3h 40m',
      estado: 'En curso',
    },
    {
      fecha: 'Mañana',
      origen: 'Ciudad C',
      destino: 'Ciudad D',
      hora: '10:00 AM',
      duracion: '5h 00m',
      estado: 'Pendiente',
    },
    {
      fecha: 'Lun, 24 abr',
      origen: 'Ciudad E',
      destino: 'Ciudad F',
      hora: '06:00 AM',
      duracion: '2h 35m',
      estado: 'Pendiente',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Rutas Próximas</Text>

      <ScrollView style={{ marginTop: 20 }}>
        {rutasProximas.map((ruta, index) => (
          <View key={index} style={styles.routeCard}>
            <View style={styles.row}>
              <Ionicons name="bus-outline" size={24} color={COLORS.midnightBlue} />
              <Text style={styles.dateText}>{ruta.fecha} | {ruta.hora}</Text>
            </View>

            <Text style={styles.routeText}>
              {ruta.origen} ➔ {ruta.destino}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>Duración: {ruta.duracion}</Text>
              <View style={[styles.statusChip, ruta.estado === 'En curso' ? styles.active : styles.pending]}>
                <Text style={styles.statusText}>{ruta.estado}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.navbar}>
              <Ionicons name="home-outline" size={28} color={COLORS.gray} onPress={() => router.navigate('/driver')} />
              <Ionicons name="swap-horizontal-outline" size={28} color={COLORS.skyBlue} />
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
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.midnightBlue,
  },
  routeCard: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.gray,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.midnightBlue,
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  active: {
    backgroundColor: '#D0F0FF',
  },
  pending: {
    backgroundColor: '#FFE8D0',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.midnightBlue,
    fontWeight: '600',
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
