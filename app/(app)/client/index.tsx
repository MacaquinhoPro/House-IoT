import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Paleta de colores actualizada
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  yellow: '#FFC107',
  green: '#4CAF50',
  mediumGray: '#AAAAAA',
};

export default function ClientHome() {
  const { userData } = useAuth();
  const router = useRouter();
  
  // Estados para el formulario de búsqueda
  const [from, setFrom] = useState('CSA');
  const [fromDetails, setFromDetails] = useState('City, Station or Airport');
  const [to, setTo] = useState('CSA');
  const [toDetails, setToDetails] = useState('City, Station or Airport');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [passengerCount, setPassengerCount] = useState('1');

  // Formatear fechas para la visualización
  const formatDate = (date: Date | null) => {
    if (!date) return 'Optional';
    
    // Formato personalizado: "28 abr 2025"
    const day = date.getDate();
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  // Función para intercambiar origen y destino
  const swapLocations = () => {
    const tempFrom = from;
    const tempFromDetails = fromDetails;
    
    setFrom(to);
    setFromDetails(toDetails);
    setTo(tempFrom);
    setToDetails(tempFromDetails);
  };

  // Manejadores para los date pickers
  const onDepartureDateChange = (event: any, selectedDate?: Date) => {
    setShowDeparturePicker(false);
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  const onReturnDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowReturnPicker(false);
    if (selectedDate) {
      setReturnDate(selectedDate);
    }
  };

  // Navegación a otras pantallas
  const navigateToSearch = () => {
    router.push('/selectScreen');
  };

  // Obtener el nombre del usuario desde userData
  const userName = userData?.nombre || 'Usuario';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {userName}</Text>
        <Text style={styles.subGreeting}>¿Listo para tu próximo viaje?</Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Opciones de transporte - Solo mostramos Bus activo */}
        <View style={styles.transportContainer}>
          <View style={styles.transportCircle}>
            <Ionicons name="bus" size={32} color={COLORS.primaryBlue} />
            <Text style={styles.transportLabel}>Bus</Text>
          </View>
        </View>
        
        {/* Formulario de búsqueda */}
        <View style={styles.searchForm}>
          {/* Origen y destino */}
          <View style={styles.locationRow}>
            <View style={styles.locationField}>
              <Text style={styles.fieldLabel}>From</Text>
              <TextInput
                style={styles.locationInput}
                value={from}
                onChangeText={setFrom}
                placeholder="CSA"
              />
              <TextInput
                style={styles.locationDetailsInput}
                value={fromDetails}
                onChangeText={setFromDetails}
                placeholder="City, Station or Airport"
              />
            </View>
            
            <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
              <Ionicons name="swap-horizontal" size={20} color={COLORS.primaryBlue} />
            </TouchableOpacity>
            
            <View style={styles.locationField}>
              <Text style={styles.fieldLabel}>To</Text>
              <TextInput
                style={styles.locationInput}
                value={to}
                onChangeText={setTo}
                placeholder="CSA"
              />
              <TextInput
                style={styles.locationDetailsInput}
                value={toDetails}
                onChangeText={setToDetails}
                placeholder="City, Station or Airport"
              />
            </View>
          </View>
          
          {/* Fechas */}
          <View style={styles.datesRow}>
            <TouchableOpacity 
              style={styles.dateField} 
              onPress={() => setShowDeparturePicker(true)}
            >
              <Text style={styles.fieldLabel}>Departing on</Text>
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                <Text style={styles.dateText}>
                  {formatDate(departureDate)}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateField} 
              onPress={() => setShowReturnPicker(true)}
            >
              <Text style={styles.fieldLabel}>Returning on</Text>
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                <Text style={styles.dateText}>
                  {returnDate ? formatDate(returnDate) : 'Optional'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Mostrar pickers de fecha */}
          {showDeparturePicker && (
            <DateTimePicker
              value={departureDate || new Date()}
              mode="date"
              display="default"
              onChange={onDepartureDateChange}
              minimumDate={new Date()}
            />
          )}
          
          {showReturnPicker && (
            <DateTimePicker
              value={returnDate || new Date()}
              mode="date"
              display="default"
              onChange={onReturnDateChange}
              minimumDate={departureDate || new Date()}
            />
          )}
          
          {/* Pasajeros */}
          <View style={styles.passengersContainer}>
            <View style={styles.passengersContent}>
              <Text style={styles.fieldLabel}>Pasajeros</Text>
              <View style={styles.passengerInputContainer}>
                <Ionicons name="people-outline" size={18} color={COLORS.gray} />
                <TextInput
                  style={styles.passengerInput}
                  value={passengerCount}
                  onChangeText={(text) => {
                    // Solo permitir números
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setPassengerCount(numericValue || '1');
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.passengerLabel}>
                  {parseInt(passengerCount) === 1 ? 'Pasajero' : 'Pasajeros'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primaryBlue} />
            </TouchableOpacity>
          </View>
          
          {/* Botón de búsqueda */}
          <TouchableOpacity style={styles.searchButton} onPress={navigateToSearch}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sección de tus tiquetes */}
        <View style={styles.ticketsSection}>
          <Text style={styles.ticketSectionTitle}>Tus Tiquetes</Text>
          
          {/* Tiquete activo */}
          <View style={styles.ticketCard}>
            <View style={styles.routeInfo}>
              <View style={styles.routeDetails}>
                <Ionicons name="bus-outline" size={16} color={COLORS.primaryBlue} />
                <Text style={styles.routeText}>Sincelejo</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.gray} />
                <Text style={styles.routeText}>Montería</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Activo</Text>
              </View>
            </View>
            
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={16} color={COLORS.gray} />
              <Text style={styles.timeText}>Duración: 2 h 30 min</Text>
            </View>
          </View>

          {/* Tiquete inactivo */}
          <View style={styles.ticketCard}>
            <View style={styles.routeInfo}>
              <View style={styles.routeDetails}>
                <Ionicons name="bus-outline" size={16} color={COLORS.primaryBlue} />
                <Text style={styles.routeText}>Montería</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.gray} />
                <Text style={styles.routeText}>Sincelejo</Text>
              </View>
              <View style={[styles.statusBadge, styles.inactiveBadge]}>
                <Text style={styles.inactiveStatusText}>Desactivado</Text>
              </View>
            </View>
            
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={16} color={COLORS.gray} />
              <Text style={styles.timeText}>Duración: 2 h 30 min</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Ionicons name="home" size={24} color={COLORS.skyBlue} />
          <Text style={[styles.navText, styles.activeNavText]}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/saldoScreen')}
        >
          <Ionicons name="cash-outline" size={24} color={COLORS.gray} />
          <Text style={styles.navText}>Saldo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/mapScreen')}
        >
          <Ionicons name="map-outline" size={24} color={COLORS.gray} />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/favoritesScreen')}
        >
          <Ionicons name="heart-outline" size={24} color={COLORS.gray} />
          <Text style={styles.navText}>Favoritos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  transportContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  transportCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transportLabel: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.primaryBlue,
  },
  searchForm: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  locationInput: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryBlue,
    padding: 0,
  },
  locationDetailsInput: {
    fontSize: 12,
    color: COLORS.gray,
    padding: 0,
    marginTop: 2,
  },
  datesRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dateField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primaryBlue,
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  passengersContent: {
    flex: 1,
  },
  passengerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerInput: {
    fontSize: 16,
    color: COLORS.primaryBlue,
    fontWeight: '600',
    marginLeft: 8,
    minWidth: 20,
  },
  passengerLabel: {
    fontSize: 16, 
    color: COLORS.primaryBlue,
    marginLeft: 4,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  ticketsSection: {
    padding: 20,
  },
  ticketSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginBottom: 15,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 16,
    color: COLORS.primaryBlue,
    marginHorizontal: 6,
  },
  statusBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveBadge: {
    backgroundColor: COLORS.lightGray,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  inactiveStatusText: {
    color: COLORS.mediumGray,
    fontSize: 12,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.gray,
  },
  bottomNavigation: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  activeNavText: {
    color: COLORS.skyBlue,
  },
});