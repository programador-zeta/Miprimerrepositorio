export function authErrorMessage(
  error: { code?: string; status?: number },
  signup: boolean,
): string {
  switch (error.code) {
    case "email_not_confirmed":
      return "Confirma tu correo antes de iniciar sesión. Revisa también la carpeta de spam.";
    case "email_address_not_authorized":
      return "El servicio de correo aún no permite enviar confirmaciones a esta dirección. Es necesario configurar el envío de correos de Somewhere.";
    case "over_email_send_rate_limit":
      return "Se alcanzó el límite de correos de confirmación. Espera antes de volver a intentarlo.";
    case "over_request_rate_limit":
      return "Hubo demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "El registro por correo está desactivado en Somewhere. Es necesario habilitarlo antes de crear cuentas.";
    case "weak_password":
      return "Elige una contraseña más segura, con mayúsculas, minúsculas, números y un símbolo.";
    case "email_address_invalid":
      return "Revisa la dirección de correo electrónico e inténtalo de nuevo.";
    case "invalid_credentials":
      return "Correo o contraseña incorrectos. Inténtalo de nuevo.";
    case "user_already_exists":
      return "Si ya tienes una cuenta, inicia sesión. Revisa también si tienes un correo de confirmación pendiente.";
    default:
      if (error.status === 429)
        return "Hubo demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
      return signup
        ? "No pudimos crear la cuenta en este momento. Inténtalo de nuevo más tarde."
        : "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.";
  }
}
