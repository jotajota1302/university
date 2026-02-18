# Política de Privacidad — OpenClaw University

**Última actualización:** 2026-02-18  
**Servicio:** OpenClaw University API (https://openclaw-university-api.onrender.com)

---

## 1. Quiénes somos

OpenClaw University es un servicio de auditoría y certificación para agentes de inteligencia artificial basados en OpenClaw. Operado por el equipo de OpenClaw University.

---

## 2. Qué datos recogemos

### 2.1 Datos de uso del servicio
- **Identificador de cliente** (`clientId`): el nombre que eliges al generar tu token de acceso. No requiere datos personales reales.
- **Tokens de acceso**: identificadores UUID generados aleatoriamente. No contienen información personal.
- **Resultados de auditoría**: scores, grades y resultados de los checks de seguridad/GDPR. Se almacenan asociados a tu token.
- **Metadatos de certificados**: tipo, grade, fecha de emisión y validez.

### 2.2 Datos que procesamos temporalmente pero NO almacenamos
- **Contenido de archivos de configuración** (`SOUL.md`, `AGENTS.md`, `TOOLS.md`, `config`, `memory`): se utilizan exclusivamente para ejecutar el análisis. **No se persisten en ningún servidor.** Se procesan en memoria durante el tiempo de la auditoría y se descartan inmediatamente.

---

## 3. Para qué usamos los datos

| Dato | Finalidad | Base legal |
|------|-----------|------------|
| clientId + token | Autenticación y control de acceso | Ejecución del contrato de servicio |
| Resultados de auditoría | Historial de auditorías del cliente | Interés legítimo / consentimiento |
| Certificados emitidos | Verificación pública de certificaciones | Consentimiento explícito |
| Archivos de configuración (temporal) | Ejecución del análisis de seguridad/GDPR | Consentimiento explícito previo al análisis |

---

## 4. Consentimiento explícito para la auditoría

Antes de procesar cualquier archivo de configuración de tu agente, el servicio solicita tu consentimiento explícito mediante un checkbox en la interfaz. Sin ese consentimiento, el análisis no se ejecuta.

Puedes retirar tu consentimiento en cualquier momento dejando de usar el servicio y solicitando la eliminación de tus datos.

---

## 5. Dónde se almacenan los datos

Los resultados de auditoría y los metadatos de certificados se almacenan en una base de datos PostgreSQL alojada en **Supabase** (región EU-West, Irlanda), dentro del Espacio Económico Europeo.

El servicio API está desplegado en **Render** (región Frankfurt, Alemania).

---

## 6. Durante cuánto tiempo conservamos los datos

| Dato | Período de retención |
|------|---------------------|
| Tokens de acceso | 30 días desde la emisión (o hasta revocación) |
| Resultados de auditoría | Mientras el token esté activo + 90 días |
| Certificados | 6 meses de validez + 30 días adicionales |
| Archivos de configuración | **0 días** — procesados en memoria, no almacenados |

Puedes solicitar la eliminación de todos tus datos enviando un email con tu `clientId`.

---

## 7. Tus derechos (RGPD)

Como usuario tienes derecho a:
- **Acceso**: solicitar qué datos tenemos asociados a tu token
- **Rectificación**: corregir datos incorrectos
- **Supresión**: solicitar el borrado de todos tus datos
- **Portabilidad**: recibir tus datos en formato JSON
- **Oposición**: oponerte al tratamiento de tus datos

Para ejercer cualquiera de estos derechos, contacta con nosotros.

---

## 8. Transferencias internacionales

Todos los datos se almacenan dentro del Espacio Económico Europeo (Irlanda y Alemania). No se realizan transferencias a terceros países.

---

## 9. Seguridad

- Comunicaciones cifradas mediante HTTPS/TLS
- Tokens de acceso almacenados como UUIDs (no reversibles a contraseñas)
- Acceso a la base de datos restringido por IP y credenciales seguras
- Los archivos de configuración nunca se escriben en disco

---

## 10. Contacto

Para cualquier consulta sobre privacidad o para ejercer tus derechos:  
**Email:** _(añadir email de contacto)_  
**Servicio:** OpenClaw University

---

*Esta política puede actualizarse. La fecha de última actualización se indica al inicio del documento.*
