# 🛡️ Autana Group: Golden Rules & Skills

Este documento define los estándares de desarrollo, diseño y flujo de trabajo para el ecosistema de **Autana Group**. El objetivo es garantizar una experiencia de lujo, consistencia técnica y escalabilidad.

---

## 💎 Identidad y Estética (UI/UX)
*   **Concepto:** Lujo caribeño, exclusividad, minimalismo elegante.
*   **Paleta de Colores:**
    *   **Gold:** `#D4AF37` (Principal accent, botones, iconos destacados).
    *   **Charcoal:** `#1a1a1a` (Fondos profundos, textos principales).
    *   **Off-White:** `#FDFCFB` (Fondos claros para contraste).
*   **Tipografía:**
    *   **Headings:** Serif (ej. Playfair Display) para un look sofisticado.
    *   **Body:** Sans-serif (ej. Inter o Outfit) para legibilidad.
*   **Componentes Clave:**
    *   **3D Flip Cards:** Uso de transformaciones 3D para tarjetas de propiedades.
    *   **Glassmorphism:** Efectos de desenfoque (`backdrop-blur`) en modales y headers.
    *   **Micro-animaciones:** Transiciones suaves con Framer Motion (stiffness 260, damping 20).

---

## 🚀 Stack Tecnológico
*   **Frontend:** React 19 + Vite + Tailwind CSS 4.
*   **Backend:** Node.js (Express) + TypeScript.
*   **Base de Datos:** PostgreSQL (pg). Gestión de DDL vía herramientas externas (DBgate), no migraciones automáticas.
*   **Procesamiento de Imágenes:** **Sharp** es obligatorio para convertir subidas a **WebP** con resolución máxima de 1920px.
*   **Package Manager:** **pnpm** (Uso obligatorio para consistencia de dependencias).

---

## 🛠️ Reglas de Desarrollo
1.  **Internacionalización:** Toda cadena de texto debe estar en `src/utils/translations.ts` (ES/EN). Prohibido hardcodear texto en los componentes.
2.  **Seguridad:** Prohibido subir archivos `.env`. Las variables de entorno se gestionan exclusivamente en el panel de **Easypanel**.
3.  **Lazy Loading:** Todas las páginas deben cargarse mediante `lazy()` y `Suspense` para optimizar el bundle inicial.
4.  **Servicios API:** Centralizar llamadas en `src/services/api.ts` usando Axios con interceptores para el token JWT.
5.  **Tipado:** TypeScript es obligatorio. Definir interfaces claras en `src/types/`.
6.  **Accesibilidad y Semántica:** Todo campo de formulario (`input`, `select`, `textarea`) debe tener un `id` único y un atributo `name`. Las etiquetas (`label`) deben usar el atributo `htmlFor` apuntando al `id` del campo correspondiente para garantizar la accesibilidad y el auto-completado del navegador.
7.  **Soporte Multi-lenguaje e IA:** Las propiedades deben ser bilingües. El sistema utiliza **DeepSeek AI** para la traducción automática de títulos y descripciones. El catálogo debe estar estructurado en un endpoint de contexto (`/api/ai/context`) para alimentar agentes de IA externos (como WhatsApp Bots).

---

## 📦 Flujo de Despliegue
*   **Entorno:** Dockerizado.
*   **Servidor:** Nginx como proxy inverso.
*   **Salud:** El endpoint `/health` en el backend es crítico para los health checks de Easypanel.

---

> **"No solo vendemos propiedades, vendemos un estilo de vida. El código debe reflejar esa misma excelencia."** 💎🚀
