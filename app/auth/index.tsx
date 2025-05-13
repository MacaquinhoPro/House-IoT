import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Buffer } from 'buffer';
import Slider from '@react-native-community/slider';
import { Device } from 'react-native-ble-plx';

// UUID constants
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// Importación condicional de BleManager
let BleManager: any;
let isMobilePlatform = false;

// Solo importamos BleManager en plataformas nativas
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  BleManager = require('react-native-ble-plx').BleManager;
  isMobilePlatform = true;
}

const HomeScreen: React.FC = () => {
  // BLE Manager - solo se crea en plataformas móviles
  const [bleManager] = useState(() => {
    if (isMobilePlatform) {
      return new BleManager();
    }
    return null;
  });
  
  // Auth context for user role
  const { userData } = useAuth();
  const userRole = userData?.role || 'child';
  
  // State variables
  const [temperature, setTemperature] = useState(23.2);
  const [humidity, setHumidity] = useState(95.0);
  const [motion, setMotion] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [lightStates, setLightStates] = useState({
    bathroom: false,
    mainRoom: false,
    secondaryRoom: false,
    guestRoom: false,
  });
  const [lightIntensities, setLightIntensities] = useState({
    bathroom: 100,
    mainRoom: 100,
    secondaryRoom: 100,
    guestRoom: 100,
  });
  const [expandedLight, setExpandedLight] = useState<string | null>(null);
  const [scanTimeoutId, setScanTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    const entry = `[${timestamp}] ${message}`;
    setLogs(prevLogs => [entry, ...prevLogs.slice(0, 9)]);
    console.log(entry); // Para depuración
  };

  // Solicitar permisos de Bluetooth - solo en Android
  const requestBlePermissions = async () => {
    if (!isMobilePlatform) {
      addLog("Bluetooth no disponible en plataforma web");
      return false;
    }

    try {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ...(Platform.Version >= 31 ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ] : []),
        ]);
        
        const allPermissionsGranted = Object.values(granted).every(
          value => value === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allPermissionsGranted) {
          Alert.alert('Permisos requeridos', 'Se necesitan permisos de Bluetooth para conectar con el dispositivo');
          return false;
        }
        return true;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Connect to ESP32 via BLE
  const scanAndConnect = async () => {
    if (!isMobilePlatform) {
      Alert.alert(
        "Funcionalidad no disponible",
        "La conexión Bluetooth solo está disponible en dispositivos móviles. Por favor, usa la aplicación en un dispositivo Android o iOS."
      );
      return;
    }

    if (isScanning) return;
    
    // Verificar permisos primero
    const hasPermissions = await requestBlePermissions();
    if (!hasPermissions) return;
    
    try {
      setIsScanning(true);
      addLog("Buscando dispositivo ESP32...");

      // Start scanning for devices
      bleManager.startDeviceScan(
        [SERVICE_UUID], 
        null, 
        (error: Error | null, device: Device | null) => {
          if (error) {
        addLog(`Error al escanear: ${error.message}`);
        setIsScanning(false);
        return;
          }
          
          if (device && device.name === "ESP32_IoT") {
        bleManager.stopDeviceScan();
        
        // Connect to the device
        addLog(`Dispositivo ESP32 encontrado: ${device.name}`);
        connectToDevice(device);
          }
        }
      );
      
      // Stop scanning after 10 seconds
      const timeoutId = setTimeout(() => {
        if (bleManager) {
          bleManager.stopDeviceScan();
        }
        setIsScanning(false);
        addLog("Búsqueda de dispositivos finalizada");
        setScanTimeoutId(null);
      }, 10000);

      setScanTimeoutId(timeoutId);
      
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setIsScanning(false);
    }
  };

  // Connect to a discovered device
  const connectToDevice = async (device: Device) => {
    if (!device) return;
    
    try {
      addLog(`Conectando a ${device.name}...`);
      const connectedDevice = await device.connect();
      const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
      
      setConnectedDevice(deviceWithServices);
      setIsConnected(true);
      setIsScanning(false);
      addLog(`Conectado a ${device.name}`);
      
      // Subscribe to notifications
      subscribeToNotifications(deviceWithServices);
      
    } catch (error) {
      addLog(`Error al conectar: ${error instanceof Error ? error.message : String(error)}`);
      setIsConnected(false);
      setIsScanning(false);
    }
  };
  
  // Send command to ESP32
  const sendCommand = async (command: string) => {
    if (!isMobilePlatform) {
      addLog(`Simulando envío de comando: ${command}`);
      // Aquí podríamos implementar alguna simulación para web
      return;
    }

    if (!connectedDevice || !isConnected) {
      addLog("No hay conexión con ESP32");
      return;
    }
    
    try {
      // Usar Buffer para manejar la conversión a base64 correctamente
      const data = Buffer.from(command, 'utf-8').toString('base64');
      
      await connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        data
      );
      
      addLog(`Comando enviado: ${command}`);
    } catch (error) {
      addLog(`Error al enviar comando: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Subscribe to BLE notifications
  const subscribeToNotifications = (device: Device) => {
    if (!device || !isMobilePlatform) return;
    
    try {
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            addLog(`Error en notificación: ${error.message}`);
            return;
          }
          
          if (characteristic?.value) {
            try {
              // Decodificar correctamente usando Buffer
              const decodedValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              handleReceivedData(decodedValue);
            } catch (decodeError) {
              addLog(`Error al decodificar datos: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`);
            }
          }
        }
      );
      
      addLog("Suscrito a notificaciones de ESP32");
    } catch (error) {
      addLog(`Error al suscribirse: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle data received from ESP32
  const handleReceivedData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.temperature !== undefined) {
        setTemperature(parsedData.temperature);
      }
      
      if (parsedData.humidity !== undefined) {
        setHumidity(parsedData.humidity);
      }
      
      if (parsedData.motion !== undefined) {
        setMotion(parsedData.motion);
      }
      
      if (parsedData.log) {
        addLog(parsedData.log);
      }
    } catch (error) {
      addLog(`Error al procesar datos: ${data}`);
    }
  };
  
  // Verify PIN
  const verifyPIN = () => {
    if (pin === '123456') {
      setIsPinModalVisible(false);
      sendCommand('ACCESS:GRANTED');
      addLog('Acceso concedido');
    } else {
      Alert.alert('Error', 'PIN incorrecto');
      sendCommand('ACCESS:DENIED');
      addLog('Acceso denegado');
    }
    setPin('');
  };
  
  // Toggle light state
  const toggleLight = (room: keyof typeof lightStates) => {
    if (userRole !== 'parent' && userRole !== 'child') {
      Alert.alert('Acceso denegado', 'No tienes permiso para controlar las luces');
      return;
    }
    
    setLightStates(prev => {
      const newState = { ...prev, [room]: !prev[room] };
      sendCommand(`LIGHT:${room.toUpperCase()}:${newState[room] ? 'ON' : 'OFF'}`);
      addLog(`${newState[room] ? 'Encendido' : 'Apagado'} LED ${room}`);
      return newState;
    });
  };
  
  // Change light intensity
  const changeLightIntensity = (room: keyof typeof lightIntensities, value: number) => {
    if (userRole !== 'parent' && userRole !== 'child') {
      Alert.alert('Acceso denegado', 'No tienes permiso para controlar las luces');
      return;
    }
    
    const intensity = Math.round(value);
    setLightIntensities(prev => ({ ...prev, [room]: intensity }));
    sendCommand(`LIGHT:${room.toUpperCase()}:INTENSITY:${intensity}`);
    addLog(`Intensidad LED ${room}: ${intensity}%`);
  };
  
  // Control blinds
  const controlBlinds = (action: string) => {
    if (userRole !== 'parent' && userRole !== 'child') {
      Alert.alert('Acceso denegado', 'No tienes permiso para controlar las persianas');
      return;
    }
    
    sendCommand(`BLINDS:${action}`);
    addLog(`Persiana: ${action}`);
  };
  
  // Control alarm
  const controlAlarm = (action: string) => {
    if (userRole !== 'parent') {
      Alert.alert('Acceso denegado', 'Solo los padres pueden controlar la alarma');
      return;
    }
    
    sendCommand(`ALARM:${action}`);
    addLog(`Alarma: ${action}`);
  };
  
  // Expand/collapse light control
  const toggleLightExpand = (room: string) => {
    setExpandedLight(expandedLight === room ? null : room);
  };
  
  // Render numeric keypad button
  const renderKeypadButton = (number: string) => {
    return (
      <TouchableOpacity 
        style={styles.keypadButton} 
        onPress={() => setPin(prev => prev + number)}
        key={`key-${number}`}
      >
        <Text style={styles.keypadButtonText}>{number}</Text>
      </TouchableOpacity>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Limpiar timeout de escaneo si existe
      if (scanTimeoutId) {
        clearTimeout(scanTimeoutId);
      }
      
      // Desconectar dispositivos
      if (isMobilePlatform && bleManager) {
        if (isScanning) {
          bleManager.stopDeviceScan();
        }
        
        if (connectedDevice) {
          try {
            connectedDevice.cancelConnection();
          } catch (error) {
            console.log('Error al desconectar:', error);
          }
        }
        
        // Destruir BLE Manager
        bleManager.destroy();
      }
    };
  }, [connectedDevice, isScanning, scanTimeoutId, bleManager]);

  return (
    <View style={styles.container}>
      {/* Advertencia de plataforma web si es necesario */}
      {!isMobilePlatform && (
        <View style={styles.webWarning}>
          <Text style={styles.webWarningText}>
            ⚠️ Estás usando la versión web de la aplicación. Las funcionalidades Bluetooth no están disponibles.
            Por favor, usa un dispositivo Android o iOS para la experiencia completa.
          </Text>
        </View>
      )}
      
      {/* Header with connection status */}
      <View style={styles.header}>
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>
            {isConnected ? "Conectado a ESP32" : "Desconectado"}
          </Text>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
          ]} />
        </View>
        <TouchableOpacity 
          style={[
            styles.connectButton,
            (isConnected || isScanning || !isMobilePlatform) && styles.disabledButton
          ]} 
          onPress={scanAndConnect}
          disabled={isConnected || isScanning || !isMobilePlatform}
        >
          <Text style={styles.buttonText}>
            {isScanning ? "Buscando..." : isConnected ? "Conectado" : "Conectar"}
          </Text>
          {isScanning && <ActivityIndicator color="#fff" size="small" />}
        </TouchableOpacity>
      </View>
      
      {/* Resto del contenido de la UI aquí... */}
      {/* Mostraré una versión simplificada para la respuesta */}
      
      <View style={styles.sensorPanel}>
        <Text style={styles.sensorText}>Temperatura: {temperature.toFixed(1)} °C</Text>
        <Text style={styles.sensorText}>Humedad: {humidity.toFixed(1)} %</Text>
        <Text style={styles.sensorText}>Movimiento: {motion ? 'Sí' : 'No'}</Text>
      </View>
      
      {/* Log panel */}
      <View style={styles.logPanel}>
        <Text style={styles.logTitle}>Registro de Actividades:</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3f51b5',
    padding: 16,
  },
  webWarning: {
    backgroundColor: '#FFC107',
    padding: 10,
    marginBottom: 16,
    borderRadius: 4,
  },
  webWarningText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectButton: {
    backgroundColor: '#7986cb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sensorPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sensorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  logPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    maxHeight: 200,
  },
  logTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logScroll: {
    flexGrow: 0,
  },
  logEntry: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  keypadButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;