# CLAUDE.md — Sistema Nutrición y Seguimiento

> Contexto de negocio para desarrollo. Sin código — solo para entender qué estamos construyendo y para quién.

---

## 1. El cliente

**Move Factory** es un gimnasio que ofrece, además del servicio físico, nutrición personalizada con seguimiento de avances físicos para sus usuarios.

- Actualmente menos de 50 usuarios activos, con proyección de crecimiento.
- El diferenciador del negocio es dar un servicio más completo y profesional que la competencia.
- Hoy la nutricionista envía pautas en Word por WhatsApp y no existe seguimiento de métricas. Este sistema reemplaza ese proceso.

---

## 2. El problema que resuelve

| Problema actual                      | Lo que resuelve el sistema                                      |
| ------------------------------------ | --------------------------------------------------------------- |
| Pautas enviadas por WhatsApp en Word | Plataforma web donde el usuario ve su pauta siempre actualizada |
| Sin seguimiento de métricas          | Registro histórico de medidas y visualización de evolución      |
| Sin cálculo de compras               | El usuario genera su lista de compras semanal desde su pauta    |
| Diferenciación difícil               | Producto propio que eleva la percepción del servicio            |

---

## 3. Actores del sistema

### Administrador

- Acceso total al sistema
- Crear, editar y eliminar usuarios
- Cambiar contraseñas
- Gestionar tablas maestras (momentos, categorías de alimentos)
- Ver todo

### Nutricionista

- Crear y buscar usuarios
- Crear pautas de alimentación
- Asociar pautas a usuarios
- Ingresar marcas de seguimiento (medidas y métricas)
- Ver métricas históricas de cada usuario

### Usuario (alumno del gym)

- Ver su pauta de alimentación activa
- Seleccionar alimentos dentro de cada momento según las porciones indicadas
- Generar su lista de compras semanal
- Ver su historial de métricas

### Super Admin

- **No se implementa en esta versión.** Gestión directa vía Supabase SQL Editor cuando sea necesario.

---

## 4. Módulo Nutrición

### Concepto de Pauta

Una pauta es una guía de alimentación organizada por **días** y **momentos**. No especifica alimentos concretos sino **tipos y porciones**.

Ejemplo de un momento:

```
Almuerzo:
- 250g Proteína
- 180g Carbohidratos
- Verduras: libre elección
- Nota: Consumir 2 vasos de agua
```

### Cómo se construye una pauta

1. La nutricionista selecciona un **momento** (ej: Almuerzo)
2. Agrega **tipos de alimento con porción** a ese momento
3. Puede agregar una **nota o comentario** al momento
4. Puede **repetir ese momento** en otros días (ej: Lunes a Viernes igual, Sábado y Domingo diferente)
5. Repite el proceso para cada momento del día

### Momentos del día

- Definidos en tabla maestra — no hardcodeados
- El administrador puede crear nuevos momentos
- Ejemplos: Desayuno, Media Mañana, Almuerzo, Once, Cena, Post Entrenamiento

### Listado maestro de alimentos

- Proporcionado por el cliente (nutricionista/admin)
- Cada alimento tiene: nombre, categoría, peso por porción (crudo y cocido), unidad de medida
- El usuario elige de este listado al seleccionar sus alimentos

### Cómo el usuario interactúa con su pauta

1. Ve su pauta activa organizada por días y momentos
2. En cada momento ve los tipos y porciones indicados
3. Selecciona de un listado qué alimento específico elige para cada tipo
   - Ejemplo: "250g Proteína" → elige Pollo (250g cocido)
4. Con todos los días completados puede **generar su lista de compras semanal**

### Lista de compras

- Suma las porciones seleccionadas por tipo de alimento durante la semana
- Resultado ejemplo: "2.500g Pollo, 5 rebanadas de pan..."
- Verduras de libre elección no se calculan
- No incluye precios ni equivalencias de envase — solo cantidades totales

### Historial de pautas

- Cada pauta tiene estado: **activa** o **archivada**
- Al crear pauta nueva, la anterior pasa automáticamente a archivada
- Las pautas archivadas son consultables
- Se puede duplicar una archivada para editarla como base de una nueva
- ⚠️ El flujo exacto de creación y actualización de pautas aún no está 100% cerrado — **preguntar antes de implementar esta lógica**

---

## 5. Módulo Seguimiento

### Métricas

- Solo medidas físicas — sin fotos en esta versión
- Métricas: peso, circunferencias corporales (múltiples)
- Configurables — se pueden agregar nuevas métricas sin modificar código
- La nutricionista ingresa las medidas en cada sesión de control
- El usuario ve su historial y evolución de cada métrica

---

## 6. Lo que NO es este sistema

- ❌ No es una app nativa (iOS/Android)
- ✅ **Sí es una PWA** — instalable en celular desde el navegador, desde el inicio
- ❌ No tiene pagos ni e-commerce
- ❌ No conecta con dispositivos ni wearables
- ❌ No tiene control de stock ni precios de alimentos
- ❌ No tiene módulo de ejercicios ni rutinas de entrenamiento
- ❌ No tiene Super Admin en la UI (se gestiona directo en Supabase)

---

## 7. Stack tecnológico

| Capa         | Tecnología                         |
| ------------ | ---------------------------------- |
| Frontend     | Vue.js + shadcn-vue                |
| Backend / DB | Supabase (Auth + PostgreSQL + RLS) |
| Hosting      | Vercel                             |
| PWA          | Configurado desde el inicio        |

---

## 8. Arquitectura de datos — consideración clave

Aunque hoy es para un solo cliente, **todas las tablas deben incluir `gym_id`** desde el inicio. Hoy siempre tendrá el mismo valor, pero permite escalar a múltiples gimnasios en el futuro sin reescribir la base de datos.

---

## 9. MVP — qué debe funcionar para lanzar

### Fase 1 — MVP mínimo

1. Login y roles (Admin, Nutricionista, Usuario)
2. Gestión de usuarios
3. Crear pauta (días + momentos + tipos + porciones)
4. Asociar pauta a usuario
5. Usuario ve su pauta y selecciona alimentos
6. Generación de lista de compras semanal

### Fase 2 — post MVP

1. Módulo de seguimiento de métricas
2. Historial y visualización de evolución
3. Duplicar y editar pautas archivadas

---

## 10. Cómo trabajamos

- **Pregunta antes de asumir.** Si hay dos formas de resolver algo, muéstralas brevemente antes de implementar.
- **Buenas prácticas, soluciones simples.** Nada sobreingeniado — si hay una forma simple y una compleja, elige la simple.
- **El flujo de pautas no está 100% cerrado.** Preguntar siempre antes de tomar decisiones de diseño en esa área.
- **UI llamativa y profesional.** El cliente debe sentir que tiene un producto de calidad.
- El desarrollador quiere entender el código, no solo que funcione.
