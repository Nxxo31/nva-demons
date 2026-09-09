# Plan de Integración Hi.Events (R-14)

## Visión General
Hi.Events es una plataforma de ticketing autoalojada (AGPL) que será el backend oficial para la venta de entradas de eventos de NVA Demons. Esta integración permitirá:
- Sincronización automática de eventos desde Hi.Events al frontend
- Compra de tickets mediante el flujo nativo de Hi.Events
- Gestión de pagos a través de Stripe/PayPal integrado en Hi.Events
- Dashboard de administración para organizadores

## Arquitectura
```
Frontend (Next.js) <---> Hi.Events API (REST) <---> Base de datos (PostgreSQL)
                              ↑
                   Hi.Events Web Interface (admin)
```

### Componentes Clave
1. **API Layer**: Hi.Events expone endpoints REST para eventos, tickets, categorías, etc.
2. **Frontend Integration**: Servicios en Next.js para consumir la API y mostrar datos dinámicos
3. **Checkout**: Redirección al flujo nativo de Hi.Events para procesamiento seguro de pagos
4. **Webhooks** (futuro): Para notificaciones de eventos en tiempo real

## Endpoints API Relevantes
Basado en la documentación de Hi.Events:

### Eventos
- `GET /api/events` - Listar todos los eventos públicos
- `GET /api/events/:id` - Obtener detalles de un evento específico
- `GET /api/events/:id/tickets` - Obtener tickets disponibles para un evento

### Categorías
- `GET /api/categories` - Listar categorías de eventos

### Pagos
El flujo de pago se maneja completamente dentro de Hi.Events mediante:
- Redirección a `/checkout` de Hi.Events
- Uso de sus pasarelas integradas (Stripe, PayPal, etc.)
- Confirmación vía webhook o redirect URL

## Plan de Implementación

### Fase 1: Preparación (Actual)
- [x] Crear documentación de integración
- [ ] Verificar estructura de componentes existentes para futura integración
- [ ] Definir tipos de datos y interfaces TypeScript

### Fase 2: Integración Básica
- [ ] Crear servicio `hiEventsService.ts` para llamadas a API
- [ ] Modificar `Events.tsx` para consumir eventos dinámicos de Hi.Events
- [ ] Modificar `Tickets.tsx` para mostrar tickets reales por evento
- [ ] Implementar loading y error states

### Fase 3: Flujo de Compra
- [ ] Implementar redirección segura a checkout de Hi.Events
- [ ] Manejo de URLs de retorno (success/cancel)
- [ ] Estado de pago pendiente/confirmado

### Fase 4: Optimización
- [ ] Cache de respuestas API (ISR o client-side)
- [ ] Manejo de errores y retry logic
- [ ] Sincronización periódica de datos

## Requisitos de Despliegue
Hi.Events requiere:
- Docker y Docker Compose
- PostgreSQL 13+
- SMTP server para emails de notificación
- Dominio configurado con SSL
- Puertos expuestos: 8080 (app), 5432 (DB)

### Comando de Despliegue Básico
```bash
# Clonar Hi.Events
git clone https://github.com/hi-events/hi-events.git
cd hi-events

# Copiar configuración de ejemplo
cp .env.example .env

# Editar .env con variables de entorno
# APP_URL, DB_CONNECTION, MAIL_MAILER, etc.

# Iniciar con Docker Compose
docker compose up -d
```

## Consideraciones de Seguridad
- Hi.Events maneja PCI compliance para pagos
- Todos los datos de clientes viven en la DB de Hi.Events, no en el frontend
- Se recomienda ejecutar Hi.Events en subdominio separado (ej: tickets.nvademons.com)
- CSP headers deben permitir recursos de Hi.Events domain
- Webhooks deben validar signatures si se implementan

## Próximos Pasos Inmediatos
1. Verificar que `Tickets.tsx` tenga estructura adecuada para integración futura
2. Definir contrato TypeScript para eventos/tickets de Hi.Events
3. Planificar despliegue separado de Hi.Events (no irreversible por ahora)