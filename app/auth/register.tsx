import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, UserData } from '../../context/AuthContext';

// Paleta de colores
const COLORS = {
  skyBlue: '#20ADF5',
  midnightBlue: '#1A2E46',
  gray: '#989898',
  white: '#FFFFFF'
};

// Clave de empresa para usuarios "parent" (hard‑coded)
const PARENT_KEY = '12345';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'child' | 'parent'>('child');
  const [parentKey, setParentKey] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    // Validaciones básicas
    if (!name || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor, ingresa un correo electrónico válido');
      return;
    }
    // Validar clave si es parent
    if (userRole === 'parent' && parentKey !== PARENT_KEY) {
      Alert.alert('Error', 'La clave de padre/madre no es válida');
      return;
    }

    setIsLoading(true);
    try {
      const userData: UserData = {
        nombre: name,
        apellido: lastName,
        correo: email,
        role: userRole
      };
      await register(email, password, userData);
      Alert.alert('Éxito', '¡Cuenta creada exitosamente!', [
        {
          text: 'OK',
          onPress: () => router.replace(
            userRole === 'parent' ? '../users' : '../users'
          )
        }
      ]);
    } catch (error: any) {
      let errorMessage = 'Error al crear la cuenta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está en uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => router.push('/auth');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Sign Up to Explore and Book Tickets</Text>

          {/* Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor={COLORS.gray}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={COLORS.gray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Role selection */}
          <Text style={styles.sectionLabel}>Tipo de cuenta:</Text>
          <View style={styles.roleContainer}>
            {/* Child */}
            <TouchableOpacity style={styles.roleOption} onPress={() => setUserRole('child')}>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  userRole === 'child' && { borderColor: COLORS.skyBlue }
                ]}>
                  {userRole === 'child' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.roleText}>Hijo / Hija</Text>
              </View>
              <Text style={styles.roleDescription}>
                Acceso limitado: solo control de luces y persianas
              </Text>
            </TouchableOpacity>

            {/* Parent */}
            <TouchableOpacity style={styles.roleOption} onPress={() => setUserRole('parent')}>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  userRole === 'parent' && { borderColor: COLORS.skyBlue }
                ]}>
                  {userRole === 'parent' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.roleText}>Padre / Madre</Text>
              </View>
              <Text style={styles.roleDescription}>
                Control total de la casa inteligente
              </Text>
            </TouchableOpacity>
          </View>

          {/* Parent key */}
          {userRole === 'parent' && (
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa la clave de padre/madre"
                placeholderTextColor={COLORS.gray}
                value={parentKey}
                onChangeText={setParentKey}
                secureTextEntry
              />
            </View>
          )}

          {/* Remember Me */}
          <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[
              styles.checkbox,
              rememberMe && { backgroundColor: COLORS.skyBlue, borderColor: COLORS.skyBlue }
            ]}>
              {rememberMe && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          {/* Register button */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Social login */}
          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Or login with</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color={COLORS.midnightBlue} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color={COLORS.midnightBlue} />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Navigate to login */}
          <View style={styles.loginAccountContainer}>
            <Text style={styles.haveAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginAccountText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ... todos los estilos originales sin cambios ... */
  container: { flex: 1, backgroundColor: COLORS.white },
  keyboardView: { flex: 1 },
  header: {
    backgroundColor: COLORS.midnightBlue,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '600' },
  content: {
    flex: 1, padding: 20, backgroundColor: COLORS.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.midnightBlue, marginTop: 20, marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 30,
    paddingHorizontal: 15, marginBottom: 15, height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16, color: COLORS.midnightBlue },
  eyeIcon: { padding: 8 },

  sectionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.midnightBlue, marginBottom: 10 },
  roleContainer: { marginBottom: 20 },
  roleOption: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    padding: 15, marginBottom: 10,
  },
  radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  radioOuter: {
    height: 20, width: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.gray,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.skyBlue },
  roleText: { fontSize: 16, fontWeight: '600', color: COLORS.midnightBlue },
  roleDescription: { fontSize: 14, color: COLORS.gray, marginLeft: 30 },

  rememberContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1,
    borderColor: COLORS.gray, justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  rememberText: { color: COLORS.gray, fontSize: 14 },
  registerButton: {
    backgroundColor: COLORS.midnightBlue, borderRadius: 30,
    height: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 25,
  },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  orContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  orText: { color: COLORS.gray, marginHorizontal: 15, fontSize: 14 },
  socialButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 30,
    paddingVertical: 12, paddingHorizontal: 20, width: '48%',
  },
  socialButtonText: { color: COLORS.midnightBlue, marginLeft: 8, fontSize: 14, fontWeight: '500' },
  loginAccountContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 20 },
  haveAccountText: { color: COLORS.gray, fontSize: 14 },
  loginAccountText: { color: COLORS.skyBlue, fontSize: 14, fontWeight: '600' }
});
