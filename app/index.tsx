// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // En cuanto el Root Layout termine de montarse,
  // esto reemplazará la ruta “/” por “/auth”.
  return <Redirect href="/auth" />;
}
