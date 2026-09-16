import { Platform } from 'react-native';

/**
 * En iOS no se muestran precios ni botones de compra de contenido digital.
 * App Review exige que cualquier contenido digital de pago pase por In-App
 * Purchase (guía 3.1.1), y esta app todavía no tiene pasarela: el acceso a las
 * programaciones lo concede el entrenador o el gimnasio desde su panel.
 */
export const SHOW_CATALOG_PRICING = Platform.OS !== 'ios';

/** Mensaje para el contenido de catálogo al que el usuario aún no tiene acceso. */
export const CATALOG_ACCESS_REQUEST_MESSAGE = SHOW_CATALOG_PRICING
  ? 'El contenido está reservado al administrador. Los atletas y entrenadores podrán comprarla cuando conectemos la pasarela de pagos.'
  : 'El acceso a esta programación lo activa tu entrenador o tu gimnasio desde su panel. Habla con ellos para que te la asignen.';
