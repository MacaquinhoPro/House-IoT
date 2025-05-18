import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  skyBlue: "#20ADF5",
  midnightBlue: "#1A2E46",
  gray: "#989898",
  white: "#FFFFFF",
};

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShow] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa correo y contraseña");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/users");            // ⇢ pantalla principal
    } catch (err: any) {
      let msg = "Error al iniciar sesión";
      if (err.code === "auth/invalid-credential") msg = "Credenciales inválidas";
      if (err.code === "auth/user-not-found")     msg = "Usuario no encontrado";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => router.push("/auth/register");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <Text style={styles.title}>Iniciar Sesión</Text>

        {/* Email */}
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
          <TextInput
            placeholder="Correo"
            placeholderTextColor={COLORS.gray}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor={COLORS.gray}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShow(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loginTxt}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.regTxt}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={goRegister}>
            <Text style={[styles.regTxt, { color: COLORS.skyBlue }]}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.midnightBlue },
  inner:      { flex: 1, padding: 24, justifyContent: "center" },
  title:      { color: COLORS.white, fontSize: 28, fontWeight: "bold", marginBottom: 40, textAlign: "center" },
  inputWrap:  {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  input:      { flex: 1, marginLeft: 10, color: COLORS.midnightBlue },
  loginBtn:   {
    backgroundColor: COLORS.skyBlue,
    borderRadius: 30,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginTxt:   { color: COLORS.white, fontSize: 18, fontWeight: "600" },
  registerRow:{ flexDirection: "row", justifyContent: "center", marginTop: 20 },
  regTxt:     { color: COLORS.white },
});