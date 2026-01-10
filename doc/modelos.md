# Guía de Modelos de Perplexity

Esta aplicación utiliza la API de Perplexity para validar ideas de contenido. Actualmente está configurado el modelo más económico para optimizar costos.

## Modelo Actual: `sonar`

El modelo `sonar` es el más balanceado y económico de Perplexity ($1.00 por millón de tokens). Es ideal para validaciones rápidas y estructuradas como las que realiza esta herramienta.

## Cómo cambiar el modelo manualmente

Si necesitas más capacidad de razonamiento o búsquedas más profundas, puedes cambiar el modelo siguiendo estos pasos:

1. Abre el archivo: `src/lib/perplexity.ts`
2. Localiza la sección donde se define el objeto de la petición (alrededor de la línea 50):

```typescript
// ...
body: JSON.stringify({
    model: "sonar", // <--- Cambia este valor
    messages: [
        // ...
    ],
    // ...
})
// ...
```

3. Sustituye `"sonar"` por uno de los siguientes modelos disponibles:

### Modelos Disponibles (2026)

| Modelo | Descripción | Costo Aprox. |
| :--- | :--- | :--- |
| **`sonar`** | **(Actual)** El más rápido y económico. | $1 / 1M tokens |
| **`sonar-pro`** | Mayor capacidad de razonamiento. | $3 / 1M input - $15 / 1M output |
| **`sonar-reasoning-pro`** | Incluye pasos de pensamiento (CoT). Muy preciso. | $2 / 1M input - $8 / 1M output |
| **`sonar-deep-research`** | Búsqueda exhaustiva y síntesis avanzada. | El más costoso |

> **Nota:** Al cambiar a modelos como `sonar-reasoning-pro`, asegúrate de que la lógica de parseo JSON siga funcionando, ya que estos modelos a veces añaden explicaciones fuera del bloque JSON.

## Recomendaciones para el POC

Para la **Prueba de Concepto (POC)** actual, recomendamos mantener el modelo `sonar` ya que:
- Los tiempos de respuesta son inferiores a 10-15 segundos.
- El costo por validación es prácticamente despreciable.
- La estructura JSON es más consistente que en los modelos de "razonamiento" (que tienden a ser más conversacionales).
