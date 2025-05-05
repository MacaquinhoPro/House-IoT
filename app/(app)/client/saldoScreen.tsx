import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

// Paleta de colores consistente con el resto de la aplicación
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  green: '#4CAF50',
  mediumGray: '#AAAAAA',
};

export default function SaldoScreen() {
  const { userData, updateUserBalance } = useAuth();
  const router = useRouter();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  // Actualizar el saldo desde userData cuando cambie
  useEffect(() => {
    if (userData && userData.saldo !== undefined) {
      setCurrentBalance(userData.saldo);
    }
  }, [userData]);

  // Manejar la recarga de saldo
  const handleRecharge = async () => {
    // Validar que sea un número válido y mayor que 0
    const amount = parseInt(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateUserBalance(amount);
      setIsModalVisible(false);
      setRechargeAmount('');
      Alert.alert('Éxito', `Se han recargado $${amount} a tu cuenta`);
    } catch (error) {
      console.error('Error al recargar saldo:', error);
      Alert.alert('Error', 'No se pudo completar la recarga. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear el saldo como moneda
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(balance);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Saldo</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Balance Card */}
      <View style={styles.balanceCardContainer}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo Disponible</Text>
            <Ionicons name="wallet-outline" size={24} color={COLORS.white} />
          </View>
          
          <Text style={styles.balanceAmount}>
            {formatBalance(currentBalance)}
          </Text>
          
          <Text style={styles.balanceSubtext}>
            Último movimiento: {new Date().toLocaleDateString()}
          </Text>
          
          <TouchableOpacity 
            style={styles.rechargeButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.rechargeButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Transaction History */}
      <View style={styles.transactionSection}>
        <Text style={styles.transactionTitle}>Historial de Movimientos</Text>
        
        {/* Mostrar historial de transacciones si se implementa en el futuro */}
        <View style={styles.emptyTransactions}>
          <Ionicons name="receipt-outline" size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No hay movimientos recientes</Text>
        </View>
      </View>
      
      {/* Navigation Bar */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/client')}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.gray} />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cash" size={24} color={COLORS.skyBlue} />
          <Text style={[styles.navText, styles.activeNavText]}>Saldo</Text>
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
      
      {/* Modal de Recarga */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recargar Saldo</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setRechargeAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleRecharge}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Recargar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  balanceCardContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  balanceCard: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
  },
  balanceSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 20,
  },
  rechargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.skyBlue,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  rechargeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  transactionSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: 15,
  },
  emptyTransactions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  bottomNavigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: 60,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  inputPrefix: {
    fontSize: 24,
    color: COLORS.primaryBlue,
    marginRight: 5,
  },
  amountInput: {
    fontSize: 24,
    color: COLORS.primaryBlue,
    textAlign: 'center',
    minWidth: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});