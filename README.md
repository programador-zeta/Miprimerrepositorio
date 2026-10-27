# Somewhere Tag

Web mobile-first de etiquetas NFC. Next.js App Router, TypeScript, Tailwind CSS y Supabase (PostgreSQL, Auth y Storage).

## Desarrollo local

Requisitos: Node.js 22 o posterior, npm, Docker, Bash, curl, Python 3 y espacio para las imágenes oficiales de Supabase.

```bash
npm run setup:local
npm run dev
```

La aplicación escucha en el puerto 3000. El script prepara Supabase local, aplica las migraciones y crea `.env.local` sin imprimir claves. Conserva cualquier `.env.local` que ya exista. No necesita credenciales de un proyecto remoto. El archivo `.env.example` documenta las variables de conexión.

Este proyecto usa el checkout existente; no necesita crear otro Git worktree.

En hosts con Docker `vfs`, el script consolida la imagen oficial de PostgreSQL en una capa local para evitar duplicaciones que agotan el disco. Descarga las herramientas desde sus releases oficiales y verifica sus checksums. Las imágenes se obtienen del registro oficial de Supabase en Docker Hub. El primer arranque puede tardar varios minutos.

## Flujo NFC y rutas

- `/`: presentación de la marca.
- `/login`: inicio de sesión.
- `/signup`: registro separado con nombre, correo y confirmación de contraseña.
- `/auth/confirm`: confirmación de correo y sesión con Supabase Auth.
- `/activate/[code]`: activación con autenticación y código secreto.
- `/u/[username]`: perfil público con foto, ciudad, bio y contadores públicos.
- `/u/[username]/emergency`: contacto y datos opcionales compartidos, con llamada directa.
- `/u/[username]/experiences`: experiencias públicas.
- `/u/[username]/summary`: total, tipos y actividad pública reciente.
- `/dashboard`: panel privado con actividad y accesos a los editores.
- `/dashboard/profile`, `/dashboard/emergency`, `/dashboard/experiences`, `/dashboard/tags`: edición y administración.
- `/t/[code]`: consulta real a Supabase mediante `resolve_tag`.
- `unclaimed`: muestra **Activar mi tag**.
- `active`: redirige a `/u/[username]`; si el propietario todavía no tiene perfil, indica que está preparándolo.
- `disabled`: muestra **Este Somewhere Tag no está disponible.**
- Inexistente: responde 404.
- Consulta fallida: muestra un mensaje de conexión y permite reintentar.

`SW0001` es el tag inicial. Las instalaciones nuevas guardan su código aleatorio en Vault; se recupera únicamente desde el SQL Editor privado del propietario. Instalaciones locales antiguas pueden conservar el fixture `LOCAL-SW-2026`. Las pruebas crean tags temporales propios con `tests/tag-fixture.json` y nunca reutilizan el secreto de `SW0001`. **Los códigos y hashes de prueba no se usan en producción ni en etiquetas físicas**. El NFC almacena solo la URL pública, nunca el código secreto.

## Verificación

Con Supabase y la aplicación en ejecución:

```bash
npm test
npm run test:integration
npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

Las pruebas de integración usan exclusivamente Supabase local. Crean dos usuarios y tags temporales, prueban autorización y estados, y limpian esos datos al terminar. `SW0001` debe permanecer sin reclamar para ejecutar estas pruebas. Las pruebas de navegador usan Chromium del sistema cuando está disponible; en otras máquinas, ejecutar `npx playwright install chromium` o configurar `CHROMIUM_PATH`.

## Datos y seguridad

El esquema versionado está en `supabase/migrations/`. Incluye `tags`, `profiles`, `emergency_profiles`, `experiences` y `tag_scans`, con RLS y políticas por propietario. Los visitantes solamente leen perfiles, información de emergencia y experiencias públicas. Cada scan guarda únicamente el tag y la fecha.

Los códigos de activación se guardan como hashes bcrypt. La consulta pública devuelve exclusivamente estado y username. Ni siquiera un propietario puede seleccionar la columna `activation_code`. La función de reclamación requiere autenticación, verifica el código y bloquea la fila durante la operación para impedir reclamaciones simultáneas.

La aplicación utiliza la clave anon/publishable, nunca una clave service-role. La prueba de integración obtiene la clave administrativa del CLI local en memoria para preparar y limpiar sus fixtures; no se envía al frontend ni se guarda en el repositorio.

## Experiencias y fotografías

Crear, editar o eliminar experiencias desde el panel. Incluyen tipo, nombre, lugar, fecha, fotografía y nota opcional. Son privadas por defecto. El perfil público y el resumen cuentan únicamente las públicas. El panel privado incluye todas las del propietario.

Las fotos de perfil son públicas. Las fotos de experiencias están en un bucket privado; las políticas permiten leerlas únicamente al propietario o cuando la experiencia asociada es pública. Cambiar la visibilidad también cambia el acceso al archivo. Las imágenes se sirven por rutas del mismo origen con comprobación de permisos, para que el navegador no necesite conectarse a un segundo puerto local. Los archivos admitidos son JPG, PNG y WebP de hasta 5 MB.

Los tags reclamados pueden deshabilitarse o reactivarse desde el panel, sin liberar su propietario ni permitir que alguien vuelva a reclamarlos.

## Estado verificado

Las pruebas de integración comprueban RLS entre dos usuarios, ocultación de códigos, reclamación y estados de tags, y la protección de archivos ajenos. La prueba móvil recorre registro, activación, edición de perfil y foto, emergencia, creación privada, publicación de una experiencia, resumen y pausa/reactivación del tag.

## Publicación: GitHub + Render + Supabase

El archivo `render.yaml` prepara un servicio web gratuito en Render. El código se conecta desde GitHub y Supabase sigue gestionando datos, usuarios y fotografías.

El procedimiento completo está en [DEPLOYMENT.md](DEPLOYMENT.md). Para usar los paneles de Render y Supabase no se necesitan tokens de Vercel ni tokens administrativos pegados en el chat. La web necesita únicamente `SUPABASE_URL` y `SUPABASE_ANON_KEY` del proyecto remoto configuradas en Render.

No copiar el seed ni los secretos locales a producción. La autenticación local permite registro sin confirmación de correo para desarrollo; en remoto se mantiene la confirmación y se comprueba la entrega de correo.

## Fotografía

La fotografía de montaña incluida proviene de Start Bootstrap Grayscale. Licencia y atribución en `public/images/PHOTO-LICENSE.txt`.

## Conexión con la etiqueta NFC

La etiqueta guarda un registro NDEF de tipo URL: `https://somewhere-tag.onrender.com/t/SW0001`. Se escribe con una herramienta NFC y un teléfono compatible. No se guarda el código secreto, la contraseña ni los datos personales en la etiqueta.

La integración prepara el tag remoto si todavía no existe. Antes de grabarlo, recuperar su código privado mediante `deployment/read-first-tag-code.sql` desde el SQL Editor del propietario, sin compartir el resultado. Si el tag se creó antes, usar el código original. Crear una cuenta en `/signup`, confirmar el correo si se solicita, abrir el enlace del tag y reclamarlo con ese código. Desde entonces, el mismo enlace abre el perfil del propietario. Los cambios de perfil se guardan en Supabase y no requieren reescribir el NFC. Durante las pruebas no bloquear la etiqueta como solo lectura.
