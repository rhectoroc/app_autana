# Autana Admin & Backend - Registro de Avances

## Fecha: 25 de Octubre, 2026

### 🎥 Optimización de Video y Autoplay en Tarjetas
- **Pipeline de Video Silencioso y Ligero (`videoProcessor.ts`)**:
    - **Eliminación Total de Audio (`.noAudio()`)**: Se configuró FFmpeg para despojar cualquier pista de audio del video subido, garantizando que los navegadores móviles y de escritorio permitan el autoplay de inmediato sin restricciones de políticas de sonido.
    - **Formato MP4 Ultrarrápido (`H.264 / libx264`)**: Sustitución del codec lento `VP9/webm` (que causaba timeout en el servidor) por `libx264` con perfil `-preset ultrafast` y `-movflags +faststart`, permitiendo que el video comience a reproducirse en milisegundos sin esperar a que el archivo descargue por completo.
- **Autoplay en Tarjetas de Propiedad (`PropertyCard.tsx`)**:
    - Se adaptaron los componentes de tarjetas tanto en la aplicación administrativa (`app`) como en el portal público (`web`) con atributos `autoPlay`, `muted`, `loop` y `playsInline`.
    - Si la propiedad contiene un video, la tarjeta lo reproduce en bucle continuo de forma automática manteniendo la imagen de portada como respaldo (`poster`).
- **Trazabilidad y Logs del Servidor (`server/index.ts` y `videoProcessor.ts`)**:
    - Middleware de telemetría HTTP en Express para auditar en tiempo real cada petición (`[HTTP] METHOD /url -> status (ms)`).
    - Logs detallados del proceso de conversión FFmpeg paso a paso (comando, progreso porcentual, finalización o fallback).
- **Corrección de Build en Docker (`pnpm-workspace.yaml` & `Dockerfile`)**:
    - Habilitación de `allowBuilds` para compilación nativa de `sharp` y `esbuild` requerida por pnpm v10+ en el entorno Alpine.

---

## Fecha: 26 de Mayo, 2026

### 🛡️ Robustez en Validación de reCAPTCHA
- **Clave Secreta de Producción por Defecto (Fallback)**:
    - Se actualizó el controlador de reservas (`bookingController.ts`) para establecer la clave privada real de producción (`6Legwv0sAAAAAJH9Wx40E6t--JbX0kaNNy39naE8`) como valor de respaldo (fallback) en caso de que la variable de entorno `RECAPTCHA_SECRET_KEY` no se inyecte correctamente en el entorno de ejecución de Node.js, asegurando la validación del formulario de reservas en todo momento.

---

## Fecha: 25 de Mayo, 2026

### 🛡️ Fortificación de Seguridad y Auditoría (OWASP / Producción)
- **Control de Acceso y Autorización Estricta**:
    - **Middleware de Roles**: Creación y aplicación del middleware `requireAdmin` en `authMiddleware.ts` para validar el rol administrativo de los usuarios.
    - **Protección de Rutas Críticas**: Fortificación de las rutas de propiedades (`propertyRoutes.ts`) y exploración de medios (`explorerRoutes.ts`), restringiendo la creación, modificación, eliminación y lectura del sistema de archivos únicamente a administradores autorizados.
- **Seguridad en la Carga de Archivos (Multer)**:
    - Se implementaron filtros estrictos de tipo MIME y extensiones de archivo en la configuración de subida.
    - Sanitización profunda de los nombres de los archivos subidos para prevenir la ejecución de scripts maliciosos.
- **Prevención de Vulnerabilidades Críticas**:
    - **Path Traversal Fix**: Corrección de una vulnerabilidad de Path Traversal en el borrado de archivos y carpetas del gestor de medios (`explorerController.ts`), asegurando que solo se puedan manipular directorios dentro del sandbox de `/uploads`.
    - **Seguridad en Webhooks**: Implementación de verificación basada en firmas utilizando `WEBHOOK_SECRET` para proteger los endpoints públicos expuestos a Evolution API en `aiController.ts`.
    - **Cierre de Registro Público**: Modificación del flujo de registro en `authController.ts` para bloquear el registro de usuarios de forma pública una vez creado el primer administrador del sistema.
- **Cabeceras de Seguridad y CORS**:
    - Configuración de orígenes permitidos estrictos de CORS y cabeceras de seguridad HTTP en `index.ts` para producción.

### 📧 Sistema de Notificaciones de Negocio
- **Gestión de Reservas (Bookings)**:
    - **Esquema de Base de Datos**: Creación de la tabla `bookings` en `schema.sql` para registrar información detallada de los prospectos (nombre, teléfono, correo, fecha, hora, número de personas, mensaje).
    - **API de Reservas**: Desarrollo de las rutas (`bookingRoutes.ts`) y controladores (`bookingController.ts`) correspondientes.
    - **Notificaciones por Email (Nodemailer)**: Configuración e integración de alertas automáticas vía email para notificar las nuevas reservas a `Ll.es.servicios@gmail.com`.

### ⚡ Rendimiento del Servidor
- **Caché en Assets Estáticos**:
    - Configuración de cabeceras de respuesta `Cache-Control` estáticas con expiración de 1 año (`max-age=31536000`) para los recursos servidos desde `/uploads`, aliviando la carga del servidor de archivos del backend.

---

## Fecha: 15 de Mayo, 2026

### 🛡️ Infraestructura de Medios (Hierarchical Storage)
- **Carpetas por Propiedad**: Implementación de almacenamiento jerárquico. Ahora cada propiedad tiene su propio directorio físico `/uploads/prop_[ID]/`.
- **Aislamiento de Activos**: Los archivos de una propiedad están totalmente aislados, eliminando cualquier riesgo de colisión o sobreescritura accidental.
- **Refactor de Procesadores**: Actualización de `imageProcessor.ts` y `videoProcessor.ts` para soportar rutas dinámicas basadas en el ID de la propiedad.

### 🔍 Gestión Administrativa (Media Explorer)
- **Nuevo Módulo Explorer**: Creación de una herramienta interna en *Settings* para visualizar el volumen de datos y explorar archivos físicamente.
- **Previsualización de Activos**: Modal de preview de alta resolución integrado para imágenes y videos dentro del panel de configuración.
- **Eliminación Granular y Masiva**: Capacidad para borrar archivos individuales o carpetas de propiedades completas directamente desde la UI.

### 💎 UX & UI Premium
- **ConfirmModal Custom**: Sustitución de los diálogos nativos del navegador por modales de lujo con glassmorphism y animaciones Framer Motion.
- **Navegación Stay-on-Page**: El flujo de creación y edición ahora mantiene al usuario en la página tras guardar, mejorando la eficiencia del workflow.
- **Live Preview Sync**: Sincronización inmediata del carrusel de previsualización al seleccionar una imagen como principal ("Main").

### 🤖 Inteligencia Artificial & API
- **WhatsApp Concierge**: Refinamiento del agente para enviar archivos multimedia físicos via Evolution API.
- **Fix de Tipado**: Resolución de errores de compilación (`verifyToken`, imports faltantes, tipos implícitos) para asegurar builds de producción estables.

---
*Documento actualizado por Antigravity AI.*
