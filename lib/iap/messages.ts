import type { UserMessage } from './types';

/**
 * Textos para cada resultado de compra. Nunca se pide volver a comprar cuando el
 * usuario puede haber pagado ya: en esos casos se verifica o se restaura.
 */

export const PURCHASE_PENDING_MESSAGE: UserMessage = {
  title: 'Pago pendiente',
  message:
    'La tienda está esperando a que se complete el pago. Te daremos acceso automáticamente en cuanto se confirme; no hace falta que vuelvas a comprar.',
};

export const PURCHASE_VERIFYING_MESSAGE: UserMessage = {
  title: 'Compra recibida',
  message:
    'Estamos verificando tu compra con la tienda. El acceso se activará solo en unos minutos; no vuelvas a comprar. Si cierras la app, se completará la próxima vez que la abras.',
};

export const ALREADY_HAS_ACCESS_MESSAGE: UserMessage = {
  title: 'Ya tienes acceso',
  message: 'Tu cuenta ya tiene acceso a esta programación. No hace falta volver a contratarla.',
};

export const PURCHASE_FAILED_MESSAGE: UserMessage = {
  title: 'No se pudo confirmar la compra',
  message:
    'No hemos podido confirmar la compra con nuestro servidor. Se reintentará automáticamente; si ya se te ha cobrado no perderás el acceso. También puedes usar «Restaurar compras».',
};

const INVALID_MESSAGES: Record<string, UserMessage> = {
  expired: {
    title: 'Suscripción caducada',
    message: 'Esta suscripción ya ha caducado. Puedes volver a suscribirte cuando quieras.',
  },
  refunded: {
    title: 'Compra reembolsada',
    message: 'Esta compra se reembolsó y ya no da acceso al contenido.',
  },
  revoked: {
    title: 'Compra revocada',
    message: 'La tienda ha retirado esta compra y ya no da acceso al contenido.',
  },
  on_hold: {
    title: 'Problema con el pago',
    message: 'La tienda no ha podido cobrar la renovación. Actualiza tu método de pago desde «Gestionar suscripción» para recuperar el acceso.',
  },
  paused: {
    title: 'Suscripción en pausa',
    message: 'Tu suscripción está en pausa. Puedes reanudarla desde «Gestionar suscripción».',
  },
  cancelled: {
    title: 'Compra cancelada',
    message: 'La compra se canceló antes de completarse y no se ha realizado ningún cargo.',
  },
  account_mismatch: {
    title: 'Compra de otra cuenta',
    message: 'Esta compra se hizo con otra cuenta de Training ProgLine. Inicia sesión con esa cuenta para usarla.',
  },
};

const DEFAULT_INVALID: UserMessage = {
  title: 'Compra no válida',
  message:
    'La tienda no ha confirmado esta compra. Si se te ha cobrado, prueba con «Restaurar compras» o escríbenos desde Contacto.',
};

/** Mensaje para el veredicto del servidor; null cuando se concedió el acceso. */
export function messageForConfirmation(status: string, reason?: string): UserMessage | null {
  switch (status) {
    case 'entitled':
      return null;
    case 'store_pending':
      return PURCHASE_PENDING_MESSAGE;
    case 'verification_delayed':
    case 'verified':
    case 'linked':
      return PURCHASE_VERIFYING_MESSAGE;
    case 'ownership_conflict':
      return {
        title: 'Compra vinculada a otra cuenta',
        message:
          'Esta compra ya pertenece a otra cuenta de Training ProgLine. Inicia sesión con la cuenta con la que compraste para usarla.',
      };
    case 'test_account_restricted':
      return {
        title: 'Compra de prueba',
        message: 'Las compras de prueba no están habilitadas ahora mismo. No se ha realizado ningún cargo real.',
      };
    case 'invalid':
      return (reason && INVALID_MESSAGES[reason]) || DEFAULT_INVALID;
    default:
      return PURCHASE_FAILED_MESSAGE;
  }
}

/** Mensaje para un error de la tienda al iniciar la compra; null si el usuario la canceló. */
export function messageForStoreError(code: string | undefined): UserMessage | null {
  switch (code) {
    case 'user-cancelled':
      return null;
    case 'deferred-payment':
    case 'pending':
      return PURCHASE_PENDING_MESSAGE;
    case 'already-owned':
    case 'duplicate-purchase':
      return {
        title: 'Ya tienes esta compra',
        message: 'La tienda indica que ya la compraste. Estamos recuperándola; si no aparece, pulsa «Restaurar compras».',
      };
    case 'item-unavailable':
    case 'sku-not-found':
    case 'query-product':
    case 'sku-offer-mismatch':
      return {
        title: 'Producto no disponible',
        message: 'Este producto no está disponible ahora mismo en la tienda. Inténtalo más tarde.',
      };
    case 'network-error':
    case 'service-timeout':
    case 'service-disconnected':
    case 'connection-closed':
    case 'remote-error':
    case 'service-error':
      return {
        title: 'Sin conexión con la tienda',
        message: 'No hemos podido conectar con la tienda. Comprueba tu conexión e inténtalo de nuevo.',
      };
    case 'billing-unavailable':
    case 'iap-not-available':
    case 'feature-not-supported':
    case 'init-connection':
    case 'not-prepared':
      return {
        title: 'Tienda no disponible',
        message:
          'Las compras no están disponibles en este dispositivo. Comprueba que has iniciado sesión en la tienda y que las compras están permitidas.',
      };
    case 'user-error':
      return {
        title: 'Revisa tu cuenta de la tienda',
        message: 'La tienda no ha podido procesar la compra con tu cuenta. Revisa tu método de pago e inténtalo de nuevo.',
      };
    default:
      return {
        title: 'No se pudo completar la compra',
        message:
          'La compra no se ha completado. Si la tienda llegó a cobrarte, la recuperaremos automáticamente; si no, inténtalo de nuevo.',
      };
  }
}

export const RESTORE_DONE_MESSAGE: UserMessage = {
  title: 'Compras restauradas',
  message: 'Hemos comprobado tus compras con la tienda y tu cuenta está al día.',
};

export const RESTORE_FAILED_MESSAGE: UserMessage = {
  title: 'No se pudieron restaurar',
  message: 'No hemos podido comprobar tus compras ahora mismo. Comprueba tu conexión e inténtalo de nuevo.',
};

export const REFUND_REQUESTED_MESSAGE: UserMessage = {
  title: 'Solicitud de reembolso enviada',
  message: 'Apple revisará la solicitud. Si la aprueba, esta suscripción dejará de dar acceso en cuanto nos lo notifique.',
};

export const REFUND_FAILED_MESSAGE: UserMessage = {
  title: 'No se pudo abrir la solicitud de reembolso',
  message: 'Apple no ha abierto la solicitud. Comprueba que el dispositivo usa el Apple ID con el que se contrató la suscripción.',
};

export const STORE_ON_WEB_MESSAGE =
  'Las programaciones y suscripciones se compran desde la app de Training ProgLine en Android o iPhone. Lo que compres allí se verá aquí con tu misma cuenta.';
