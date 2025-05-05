import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, User as FirebaseUser} from 'firebase/auth';
import {doc,setDoc,getDoc,updateDoc,deleteDoc,collection,query,where,getDocs} from 'firebase/firestore';
import { auth, db } from '../utils/FirebaseConfig'; // Asegúrate de tener esta configuración

// Definir tipos
type UserRole = 'child' | 'parent';

// Interfaz para el usuario en Firestore, ahora con el campo saldo
export interface UserData {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  role: UserRole;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  // Estado del usuario
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  
  // Funciones de autenticación
  login: (email: string, password: string) => Promise<UserData | null>;
  register: (email: string, password: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Funciones CRUD para usuarios
  updateUserData: (userData: Partial<UserData>) => Promise<void>;
  getUserById: (id: string) => Promise<UserData | null>;
  getUserByEmail: (email: string) => Promise<UserData | null>;
  getUsersByRole: (role: UserRole) => Promise<UserData[]>;
  deleteUser: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Obtener datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({ id: user.uid, ...userDoc.data() as Omit<UserData, 'id'> });
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = { id: user.uid, ...userDoc.data() as Omit<UserData, 'id'> };
        setUserData(userData);
        return userData; // Devolver los datos del usuario
      }
      return null;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  };

  // Registrar nuevo usuario
  const register = async (email: string, password: string, userData: UserData): Promise<void> => {
    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Guardar datos del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: email,
        role: userData.role,
      });
      
      // Actualizar estado local
      setUserData({ id: user.uid, ...userData });
      
    } catch (error) {
      console.error('Error de registro:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    }
  };

  // Actualizar datos del usuario
  const updateUserData = async (updatedData: Partial<UserData>) => {
    if (!currentUser || !userData) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updatedData);
      
      // Actualizar estado local
      setUserData({ ...userData, ...updatedData });
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      throw error;
    }
  };

  // Obtener usuario por ID
  const getUserById = async (id: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() as Omit<UserData, 'id'> };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  };

  // Obtener usuario por correo electrónico
  const getUserByEmail = async (email: string) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('correo', '==', email));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() as Omit<UserData, 'id'> };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por correo:', error);
      throw error;
    }
  };

  // Obtener usuarios por rol
  const getUsersByRole = async (role: UserRole) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<UserData, 'id'>
      }));
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      throw error;
    }
  };

  // Eliminar usuario
  const deleteUser = async () => {
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      // Eliminar documento del usuario en Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      
      // Eliminar usuario de Authentication
      await currentUser.delete();
      
      // Actualizar estado local
      setUserData(null);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserData,
    getUserById,
    getUserByEmail,
    getUsersByRole,
    deleteUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;