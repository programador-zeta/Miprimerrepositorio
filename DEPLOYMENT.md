# Publicar con GitHub, Render y Supabase

## Arquitectura

- GitHub: código fuente de Somewhere Tag.
- Render: servicio web Node.js, configurado por `render.yaml` con plan gratuito.
- Supabase: PostgreSQL, Auth y Storage. Se conserva el MVP existente.

No hace falta un token de Vercel. Conectar Render a GitHub desde sus paneles tampoco necesita un token de Render en este entorno.

## Supabase remoto

1. Iniciar sesión en Supabase y crear un proyecto dedicado a Somewhere Tag en una organización con cuota gratuita disponible. Si no queda cuota gratuita, detenerse antes de contratar recursos de pago.
2. Si la integración con GitHub no ha aplicado ya las migraciones, en el editor SQL del proyecto, ejecutar en orden los archivos SQL de `supabase/migrations`. Aplicarlos una sola vez, en transacciones, conservando el historial de cambios. No ejecutar un reset ni copiar `supabase/seed.sql`: su secreto local de prueba es conocido. La carga automática de semillas está desactivada; el setup local carga ese archivo únicamente en su contenedor Docker.
3. Obtener la URL del proyecto y su clave anon/publishable en la sección de conexión/API del proyecto. Estas son las únicas dos variables que necesita la web. Nunca usar una clave service-role en su lugar.

## Render conectado a GitHub

1. Iniciar sesión en Render con GitHub y autorizar únicamente el acceso al repositorio `programador-zeta/Miprimerrepositorio`.
2. Crear un Blueprint desde ese repositorio y su rama `main`. Render detectará `render.yaml`.
3. Introducir `SUPABASE_URL` y `SUPABASE_ANON_KEY` del proyecto remoto en los campos solicitados por el Blueprint. No usar las variables locales de este entorno.
4. Confirmar que se creará solamente el servicio web gratuito `somewhere-tag`. No se necesita una base PostgreSQL adicional en Render.
5. Iniciar el despliegue. El servicio compila Next.js y escucha en el puerto que proporciona Render. El enlace público será el que Render asigne al servicio; no se debe inventar su dirección.

La comprobación de salud utiliza la portada. Una portada que abre no demuestra por sí sola que Supabase esté conectado: comprobar también los flujos siguientes.

En la creación del proyecto Supabase, mantener Data API activada, desactivar la exposición automática de tablas y activar RLS automática. Las migraciones también activan RLS y conceden explícitamente los permisos necesarios.

## Autenticación y verificación

- Configurar en Supabase Auth la URL HTTPS real asignada por Render como URL del sitio y las redirecciones permitidas.
- Mantener la confirmación de correo activa y comprobar que se entreguen los correos.
- Crear el tag de la prueba pública con un secreto nuevo y aleatorio, guardado como hash bcrypt y entregado al propietario por un canal seguro. No reutilizar `LOCAL-SW-2026`.
- Comprobar mediante HTTPS: tag sin reclamar, tag inexistente, registro, confirmación, inicio de sesión, activación, perfil, emergencia y permisos de fotos públicas/privadas.
- Las pruebas administrativas del repositorio son para Supabase local; no ejecutarlas contra datos de producción.

El plan gratuito de Render puede suspender el servicio por inactividad y tardar en responder al primer acceso. Para un prototipo es utilizable; evaluar ese comportamiento antes de usar el tag en una situación de emergencia.

## Estado

Configuración de Render preparada. La publicación pública requiere conectar la cuenta Render del propietario con GitHub y configurar un proyecto Supabase remoto. El entorno local no tiene sesiones de esas cuentas.
