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
  ActivityIndicator
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import Slider from 'react-native-slider';
import { useAuth } from '../../context/AuthContext';

// Define the service and characteristic UUIDs for ESP32 communication
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// BLE Manager instance
const bleManager = new BleManager();

const HomeScreen: React.FC = () => {
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

  // Connect to ESP32 via BLE
  const scanAndConnect = async () => {
    if (isScanning) return;
    
    try {
      setIsScanning(true);
      addLog("Buscando dispositivo ESP32...");

      // Start scanning for devices
      bleManager.startDeviceScan(
        [SERVICE_UUID], 
        null, 
        (error, device) => {
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
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
        addLog("Búsqueda de dispositivos finalizada");
      }, 10000);
      
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setIsScanning(false);
    }
  };

  // Connect to a discovered device
  const connectToDevice = async (device: Device) => {
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
    if (!connectedDevice || !isConnected) {
      addLog("No hay conexión con ESP32");
      return;
    }
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      
      await connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        btoa(String.fromCharCode.apply(null, Array.from(data)))
      );
      
      addLog(`Comando enviado: ${command}`);
    } catch (error) {
      addLog(`Error al enviar comando: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Subscribe to BLE notifications
  const subscribeToNotifications = (device: Device) => {
    if (!device) return;
    
    device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          addLog(`Error en notificación: ${error.message}`);
          return;
        }
        
        if (characteristic?.value) {
          const decoder = new TextDecoder('utf-8');
          const data = atob(characteristic.value);
          const decodedValue = decoder.decode(Uint8Array.from(data, c => c.charCodeAt(0)));
          
          handleReceivedData(decodedValue);
        }
      }
    );
    
    addLog("Suscrito a notificaciones de ESP32");
  };
  
  // Handle data received from ESP32
  const handleReceivedData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.temperature) {
        setTemperature(parsedData.temperature);
      }
      
      if (parsedData.humidity) {
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
  
  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    const entry = `[${timestamp}] ${message}`;
    setLogs(prevLogs => [entry, ...prevLogs.slice(0, 9)]);
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
      sendCommand(`LIGHT:${room.toUpperCase()}:${newState[room as keyof typeof newState] ? 'ON' : 'OFF'}`);
      addLog(`${newState[room] ? 'Encendido' : 'Apagado'} LED ${room}`);
      return newState;
    });
  };
  
  // Change light intensity
  const changeLightIntensity = (room: string, value: number) => {
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
      >
        <Text style={styles.keypadButtonText}>{number}</Text>
      </TouchableOpacity>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectedDevice) {
        connectedDevice.cancelConnection();
      }
      bleManager.destroy();
    };
  }, [connectedDevice]);

  return (
    <View style={styles.container}>
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
          style={styles.connectButton} 
          onPress={scanAndConnect}
          disabled={isConnected || isScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? "Buscando..." : isConnected ? "Conectado" : "Conectar"}
          </Text>
          {isScanning && <ActivityIndicator color="#fff" size="small" />}
        </TouchableOpacity>
      </View>
      
      {/* Sensor readings */}
      <View style={styles.sensorPanel}>
        <Text style={styles.sensorText}>Temperatura: {temperature.toFixed(1)} °C</Text>
        <Text style={styles.sensorText}>Humedad: {humidity.toFixed(1)} %</Text>
        <Text style={styles.sensorText}>Movimiento: {motion ? 'Sí' : 'No'}</Text>
      </View>
      
      {/* Blinds control */}
      <View style={styles.controlRow}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => controlBlinds('UP')}
        >
          <Text style={styles.buttonText}>Subir Persiana (5s)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => controlBlinds('DOWN')}
        >
          <Text style={styles.buttonText}>Bajar Persiana (5s)</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.controlRow}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.fullWidthButton]} 
          onPress={() => controlBlinds('STOP')}
        >
          <Text style={styles.buttonText}>Detener Persiana</Text>
        </TouchableOpacity>
      </View>
      
      {/* Alarm control - only for parent */}
      {userRole === 'parent' && (
        <View style={styles.controlRow}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => controlAlarm('ACTIVATE')}
          >
            <Text style={styles.buttonText}>Activar Alarma</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => controlAlarm('DEACTIVATE')}
          >
            <Text style={styles.buttonText}>Desactivar Alarma</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Light controls */}
      <View style={styles.lightsContainer}>
        {/* Bathroom */}
        <TouchableOpacity 
          style={[
            styles.lightBox, 
            expandedLight === 'bathroom' && styles.expandedLightBox
          ]} 
          onPress={() => toggleLightExpand('bathroom')}
        >
          <Text style={styles.lightTitle}>Baño</Text>
          <Switch
            value={lightStates.bathroom}
            onValueChange={() => toggleLight('bathroom')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={lightStates.bathroom ? '#f5dd4b' : '#f4f3f4'}
          />
          {expandedLight === 'bathroom' && (
            <View style={styles.intensityControl}>
              <Text style={styles.intensityText}>
                Intensidad: {lightIntensities.bathroom}%
              </Text>
              <Slider
                value={lightIntensities.bathroom}
                onValueChange={(value: number) => changeLightIntensity('bathroom', value)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#81b0ff"
                maximumTrackTintColor="#000000"
                thumbTintColor="#f5dd4b"
                style={styles.slider}
              />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Main Room */}
        <TouchableOpacity 
          style={[
            styles.lightBox, 
            expandedLight === 'mainRoom' && styles.expandedLightBox
          ]} 
          onPress={() => toggleLightExpand('mainRoom')}
        >
          <Text style={styles.lightTitle}>Habitación Principal</Text>
          <Switch
            value={lightStates.mainRoom}
            onValueChange={() => toggleLight('mainRoom')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={lightStates.mainRoom ? '#f5dd4b' : '#f4f3f4'}
          />
          {expandedLight === 'mainRoom' && (
            <View style={styles.intensityControl}>
              <Text style={styles.intensityText}>
                Intensidad: {lightIntensities.mainRoom}%
              </Text>
              <Slider
                value={lightIntensities.mainRoom}
                onValueChange={(value: number) => changeLightIntensity('mainRoom', value)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#81b0ff"
                maximumTrackTintColor="#000000"
                thumbTintColor="#f5dd4b"
                style={styles.slider}
              />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Secondary Room */}
        <TouchableOpacity 
          style={[
            styles.lightBox, 
            expandedLight === 'secondaryRoom' && styles.expandedLightBox
          ]} 
          onPress={() => toggleLightExpand('secondaryRoom')}
        >
          <Text style={styles.lightTitle}>Habitación Secundaria</Text>
          <Switch
            value={lightStates.secondaryRoom}
            onValueChange={() => toggleLight('secondaryRoom')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={lightStates.secondaryRoom ? '#f5dd4b' : '#f4f3f4'}
          />
          {expandedLight === 'secondaryRoom' && (
            <View style={styles.intensityControl}>
              <Text style={styles.intensityText}>
                Intensidad: {lightIntensities.secondaryRoom}%
              </Text>
              <Slider
                value={lightIntensities.secondaryRoom}
                onValueChange={(value: number) => changeLightIntensity('secondaryRoom', value)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#81b0ff"
                maximumTrackTintColor="#000000"
                thumbTintColor="#f5dd4b"
                style={styles.slider}
              />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Guest Room */}
        <TouchableOpacity 
          style={[
            styles.lightBox, 
            expandedLight === 'guestRoom' && styles.expandedLightBox
          ]} 
          onPress={() => toggleLightExpand('guestRoom')}
        >
          <Text style={styles.lightTitle}>Habitación de Invitados</Text>
          <Switch
            value={lightStates.guestRoom}
            onValueChange={() => toggleLight('guestRoom')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={lightStates.guestRoom ? '#f5dd4b' : '#f4f3f4'}
          />
          {expandedLight === 'guestRoom' && (
            <View style={styles.intensityControl}>
              <Text style={styles.intensityText}>
                Intensidad: {lightIntensities.guestRoom}%
              </Text>
              <Slider
                value={lightIntensities.guestRoom}
                onValueChange={(value: number) => changeLightIntensity('guestRoom', value)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#81b0ff"
                maximumTrackTintColor="#000000"
                thumbTintColor="#f5dd4b"
                style={styles.slider}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Enter Home button */}
      <TouchableOpacity 
        style={styles.enterButton} 
        onPress={() => setIsPinModalVisible(true)}
      >
        <Text style={styles.buttonText}>Ingresar a Casa</Text>
      </TouchableOpacity>
      
      {/* Log panel */}
      <View style={styles.logPanel}>
        <Text style={styles.logTitle}>Registro de Actividades:</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>
      </View>
      
      {/* PIN Modal */}
      <Modal
        visible={isPinModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingrese el PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              editable={false}
              placeholder="******"
              secureTextEntry
            />
            
            <View style={styles.keypad}>
              <View style={styles.keypadRow}>
                {renderKeypadButton('1')}
                {renderKeypadButton('2')}
                {renderKeypadButton('3')}
              </View>
              <View style={styles.keypadRow}>
                {renderKeypadButton('4')}
                {renderKeypadButton('5')}
                {renderKeypadButton('6')}
              </View>
              <View style={styles.keypadRow}>
                {renderKeypadButton('7')}
                {renderKeypadButton('8')}
                {renderKeypadButton('9')}
              </View>
              <View style={styles.keypadRow}>
                <TouchableOpacity 
                  style={styles.keypadButton} 
                  onPress={() => setPin('')}
                >
                  <Text style={styles.keypadButtonText}>C</Text>
                </TouchableOpacity>
                {renderKeypadButton('0')}
                <TouchableOpacity 
                  style={[styles.keypadButton, styles.enterPinButton]} 
                  onPress={verifyPIN}
                >
                  <Text style={styles.keypadButtonText}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsPinModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3f51b5',
    padding: 16,
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
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    marginHorizontal: 0,
  },
  lightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lightBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  expandedLightBox: {
    width: '100%',
    height: 'auto',
  },
  lightTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  intensityControl: {
    width: '100%',
    marginTop: 16,
  },
  intensityText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  enterButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    width: '100%',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 8,
  },
  keypad: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  enterPinButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 4,
    padding: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
});

export default HomeScreen;