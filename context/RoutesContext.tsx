import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where,orderBy, Timestamp, DocumentData, DocumentReference, QuerySnapshot } from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';
import { useAuth } from './AuthContext';

// Define the structure for a route
export interface ClientRoute {
  id?: string;
  cantidad: string;
  desde: string;
  hasta: string;
  fecha_regreso: string;
  fecha_salida: string;
  usuario: string;
  createdAt?: string;
}

// Interface for the context
interface RoutesContextType {
  routes: ClientRoute[];
  userRoutes: ClientRoute[];
  loading: boolean;
  error: string | null;
  addRoute: (route: Omit<ClientRoute, 'id'>) => Promise<ClientRoute | null>;
  updateRoute: (id: string, updatedData: Partial<ClientRoute>) => Promise<boolean>;
  deleteRoute: (id: string) => Promise<boolean>;
  getUserRoutes: () => Promise<void>;
  getRoutes: () => Promise<void>;
  clearError: () => void;
}

// Create the context
const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

// Provider component
export function RoutesProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<ClientRoute[]>([]);
  const [userRoutes, setUserRoutes] = useState<ClientRoute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { userData } = useAuth();

  // Get all routes
  const getRoutes = async (): Promise<void> => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'client_routes'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const routesData: ClientRoute[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        routesData.push({
          id: doc.id,
          cantidad: data.cantidad || '',
          desde: data.desde || '',
          hasta: data.hasta || '',
          fecha_regreso: data.fecha_regreso || '',
          fecha_salida: data.fecha_salida || '',
          usuario: data.usuario || '',
          createdAt: data.createdAt || ''
        });
      });
      
      setRoutes(routesData);
    } catch (err) {
      console.error('Error getting routes:', err);
      setError('Error al obtener las rutas');
    } finally {
      setLoading(false);
    }
  };

  // Get routes for the current user
  const getUserRoutes = async (): Promise<void> => {
    if (!userData?.id) {
      setUserRoutes([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'client_routes'),
        where('usuario', '==', userData.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const routesData: ClientRoute[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        routesData.push({
          id: doc.id,
          cantidad: data.cantidad || '',
          desde: data.desde || '',
          hasta: data.hasta || '',
          fecha_regreso: data.fecha_regreso || '',
          fecha_salida: data.fecha_salida || '',
          usuario: data.usuario || '',
          createdAt: data.createdAt || ''
        });
      });
      
      setUserRoutes(routesData);
    } catch (err) {
      console.error('Error getting user routes:', err);
      setError('Error al obtener tus rutas');
    } finally {
      setLoading(false);
    }
  };

  // Add a new route
  const addRoute = async (route: Omit<ClientRoute, 'id'>): Promise<ClientRoute | null> => {
    setLoading(true);
    try {
      const currentTimestamp = new Date().toISOString();
      const routeData = {
        ...route,
        createdAt: currentTimestamp
      };
      
      const docRef = await addDoc(collection(db, 'client_routes'), routeData);
      const newRoute = { ...routeData, id: docRef.id };
      
      // Update the local state
      setRoutes(prevRoutes => [newRoute, ...prevRoutes]);
      if (route.usuario === userData?.id) {
        setUserRoutes(prevRoutes => [newRoute, ...prevRoutes]);
      }
      
      return newRoute;
    } catch (err) {
      console.error('Error adding route:', err);
      setError('Error al crear la ruta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing route
  const updateRoute = async (id: string, updatedData: Partial<ClientRoute>): Promise<boolean> => {
    setLoading(true);
    try {
      const routeRef = doc(db, 'client_routes', id);
      await updateDoc(routeRef, updatedData);
      
      // Update local state
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === id ? { ...route, ...updatedData } : route
        )
      );
      
      setUserRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === id ? { ...route, ...updatedData } : route
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating route:', err);
      setError('Error al actualizar la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a route
  const deleteRoute = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'client_routes', id));
      
      // Update local state
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      setUserRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Error al eliminar la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Load user routes when user changes
  useEffect(() => {
    if (userData?.id) {
      getUserRoutes();
    }
  }, [userData?.id]);

  // Initial load of all routes
  useEffect(() => {
    getRoutes();
  }, []);

  return (
    <RoutesContext.Provider
      value={{
        routes,
        userRoutes,
        loading,
        error,
        addRoute,
        updateRoute,
        deleteRoute,
        getUserRoutes,
        getRoutes,
        clearError,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
}

// Custom hook to use the routes context
export function useRoutes() {
  const context = useContext(RoutesContext);
  if (context === undefined) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }
  return context;
}