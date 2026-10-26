import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage } from "../src/lib/auth-errors";
test("confirmation failures give a different next step from invalid credentials", () => {
  assert.match(
    authErrorMessage({ code: "email_not_confirmed" }, false),
    /Confirma tu correo/,
  );
  assert.match(
    authErrorMessage({ code: "invalid_credentials" }, false),
    /Correo o contraseña incorrectos/,
  );
});
test("mail delivery restrictions and rate limits are actionable", () => {
  assert.match(
    authErrorMessage({ code: "email_address_not_authorized" }, true),
    /configurar el envío/,
  );
  assert.match(
    authErrorMessage({ code: "over_email_send_rate_limit" }, true),
    /límite de correos/,
  );
  assert.match(authErrorMessage({ status: 429 }, true), /demasiados intentos/);
});
test("disabled signup and weak passwords are not reported as wrong credentials", () => {
  assert.match(
    authErrorMessage({ code: "signup_disabled" }, true),
    /registro por correo está desactivado/,
  );
  assert.match(
    authErrorMessage({ code: "weak_password" }, true),
    /contraseña más segura/,
  );
});
test("unknown provider errors never echo private provider messages", () => {
  const error = {
    code: "unknown",
    status: 500,
    message: "private@example.test secret-value",
  };
  assert.doesNotMatch(authErrorMessage(error, true), /private@|secret-value/);
});
