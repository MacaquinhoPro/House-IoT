// app/users/index.tsx
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, onValue, update, set, push, off } from 'firebase/database';
import { rtdb } from '@/utils/FirebaseConfig';          // <- exporta aquí tu RTDB
import { useAuth } from '@/context/AuthContext';

const LED_LABELS = [
  'Baño',
  'Habitación Principal',
  'Habitación Secundaria',
  'Habitación de Invitados',
];

export default function Home() {
  const { userData } = useAuth();
  const role = userData?.role ?? 'child';              // “child” o “parent”

  /* --------------------------- estado local --------------------------- */
  const [temperature, setTemperature] = useState(0);
  const [humidity,    setHumidity]    = useState(0);
  const [motion,      setMotion]      = useState(false);

  const [ledStates,   setLedStates]   = useState([false,false,false,false]);
  const [ledPWM,      setLedPWM]      = useState  ([0,0,0,0]);
  const [expanded,    setExpanded]    = useState<number|null>(null);

  const [logs,        setLogs]        = useState<string[]>([]);

  const [pinModal,    setPinModal]    = useState(false);
  const [pin,         setPin]         = useState('');

  /* ---------------------------- firebase RTDB ------------------------- */
  useEffect(() => {
    /* sensores ---------------- */
    const tRef   = ref(rtdb, '/Sensores/temperatura');
    const hRef   = ref(rtdb, '/Sensores/humedad');
    const pirRef = ref(rtdb, '/Sensores/motion');
    onValue(tRef,   s => setTemperature(s.val() ?? 0));
    onValue(hRef,   s => setHumidity   (s.val() ?? 0));
    onValue(pirRef, s => setMotion     (s.val() === 1));

    /* leds -------------------- */
    const ledsRef = ref(rtdb, '/Leds');
    onValue(ledsRef, s => {
      const d = s.val() ?? {};
      const st:boolean[]=[]; const pwm:number[]=[];
      LED_LABELS.forEach((_,i)=>{
        st [i] = !!d[i]?.state;
        pwm[i] =  d[i]?.pwm   ?? 0;
      });
      setLedStates(st);  setLedPWM(pwm);
    });

    /* log --------------------- */
    const logRef = ref(rtdb, '/Eventos');
    onValue(logRef, s => {
      const arr:string[]=[];
      s.forEach(c=>{ arr.unshift(c.val()); });
      setLogs(arr.slice(0,50));
    });

    return ()=>{ off(tRef); off(hRef); off(pirRef); off(ledsRef); off(logRef); };
  }, []);

  const pushLog = (m:string)=>
    push(ref(rtdb,'/Eventos'),`[${new Date().toLocaleTimeString()}] ${m}`);

  /* --------------------- acciones (escritura en RTDB) ----------------- */
  const setCurtain = (cmd:'up'|'down'|'stop')=>{
    set(ref(rtdb,'/Curtain/command'),cmd);
    pushLog(`Persiana: ${cmd}`);
  };

  const setAlarm   = (state:boolean)=>{
    if(role!=='parent') return Alert.alert('Acceso denegado','Solo los padres pueden controlar la alarma');
    set(ref(rtdb,'/Alarm/active'),state);
    pushLog(`Alarma ${state?'activada':'desactivada'}`);
  };

  const toggleLed  = (i:number)=>{
      const next = !ledStates[i];
    update(ref(rtdb),{
      [`/Leds/${i}/state`]:next,
      [`/Leds/${i}/pwm`  ]:next?255:0,
    });
    pushLog(`${next?'Encendido':'Apagado'} LED ${LED_LABELS[i]}`);
  };

  const changePWM  = (i:number,v:number)=>{
      update(ref(rtdb),{
      [`/Leds/${i}/pwm`  ]:Math.round(v),
    });
    pushLog(`Intensidad LED ${LED_LABELS[i]} = ${Math.round(v)}`);
  };

  /* ------------------------------- UI --------------------------------- */
  return (
    <LinearGradient colors={['#0D47A1','#42A5F5']} style={styles.container}>

      {/* Panel sensores */}
      <View style={styles.sensorCard}>
        <Text style={styles.sensorTxt}>Temperatura: {temperature.toFixed(1)} °C</Text>
        <Text style={styles.sensorTxt}>Humedad:     {humidity   .toFixed(1)} %</Text>
        <Text style={styles.sensorTxt}>Movimiento:  {motion?'Sí':'No'}</Text>
      </View>

      {/* Botones persiana */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={()=>setCurtain('up')}  ><Text style={styles.btnTxt}>Subir Persiana (5s)</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={()=>setCurtain('down')}><Text style={styles.btnTxt}>Bajar Persiana (5s)</Text></TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={()=>setCurtain('stop')}><Text style={styles.btnTxt}>Detener Persiana</Text></TouchableOpacity>
      </View>

      {/* Botones alarma */}
      {role==='parent' && (
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={()=>setAlarm(true)} ><Text style={styles.btnTxt}>Activar Alarma</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={()=>setAlarm(false)}><Text style={styles.btnTxt}>Desactivar Alarma</Text></TouchableOpacity>
        </View>
      )}

      {/* Cuadrícula LEDs */}
      <View style={styles.grid}>
        {LED_LABELS.map((lbl,i)=>(
          <View key={i} style={styles.tile}>
            <TouchableOpacity onPress={()=>setExpanded(expanded===i?null:i)}>
              <Text style={styles.tileTitle}>{lbl}</Text>
            </TouchableOpacity>

            <Switch
              value={ledStates[i]}
              onValueChange={()=>toggleLed(i)}
              thumbColor={ledStates[i]?'#f5dd4b':'#ccc'}
            />

            {expanded===i && (
              <Slider
                style={{width:'100%',marginTop:8}}
                minimumValue={0} maximumValue={255} step={1}
                value={ledPWM[i]}
                minimumTrackTintColor='#81b0ff'
                thumbTintColor='#f5dd4b'
                onSlidingComplete={v=>changePWM(i,v)}
              />
            )}
          </View>
        ))}
      </View>

      {/* Ingresar a casa */}
      <TouchableOpacity style={styles.pinBtn} onPress={()=>setPinModal(true)}>
        <Text style={styles.btnTxt}>Ingresar a Casa</Text>
      </TouchableOpacity>

      {/* Log */}
      <View style={styles.logCard}>
        <ScrollView>
          {logs.map((l,k)=><Text key={k} style={styles.logTxt}>{l}</Text>)}
        </ScrollView>
      </View>

      {/* Modal PIN (básico) */}
      <Modal visible={pinModal} transparent animationType='fade'>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ingrese PIN</Text>
            <TextInput
              style={styles.pinInput}
              keyboardType='numeric'
              secureTextEntry
              value={pin}
              onChangeText={setPin}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.modalBtn}
                onPress={()=>{
                  if(pin==='123456'){            // ejemplo
                    set(ref(rtdb,'/Access'),'GRANTED');
                    pushLog('Acceso concedido');
                    setPinModal(false);
                  }else Alert.alert('PIN incorrecto');
                }}>
                <Text style={styles.btnTxt}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={()=>setPinModal(false)}>
                <Text style={styles.btnTxt}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ------------------------------ estilos ------------------------------ */
const styles = StyleSheet.create({
  container:{flex:1},
  sensorCard:{margin:16,padding:16,borderRadius:12,backgroundColor:'rgba(255,255,255,0.15)'},
  sensorTxt:{color:'#fff',fontSize:18,textAlign:'center',marginBottom:4},

  row:{flexDirection:'row',justifyContent:'space-between',marginHorizontal:16,marginBottom:12},
  btn:{flex:1,marginHorizontal:4,padding:10,borderRadius:8,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center'},
  btnTxt:{color:'#fff',fontWeight:'600',textAlign:'center'},

  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',paddingHorizontal:16},
  tile:{width:'48%',borderRadius:14,backgroundColor:'rgba(255,255,255,0.15)',padding:14,marginBottom:12,alignItems:'center'},
  tileTitle:{color:'#fff',fontWeight:'600',marginBottom:8,textAlign:'center'},

  pinBtn:{margin:16,padding:12,borderRadius:8,backgroundColor:'#BBDEFB',alignItems:'center'},

  logCard:{marginHorizontal:16,marginBottom:12,maxHeight:140,padding:10,borderRadius:12,backgroundColor:'rgba(255,255,255,0.15)'},
  logTxt:{color:'#fff',fontSize:12,marginBottom:2},

  modalBg:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'},
  modalCard:{width:'80%',padding:20,borderRadius:12,backgroundColor:'#fff'},
  modalTitle:{fontSize:18,fontWeight:'600',marginBottom:12,textAlign:'center'},
  pinInput:{borderWidth:1,borderColor:'#ccc',borderRadius:8,fontSize:18,padding:8,textAlign:'center',marginBottom:16},
  modalBtn:{flex:1,marginHorizontal:4,padding:10,borderRadius:8,backgroundColor:'#1565C0',alignItems:'center'}
});
