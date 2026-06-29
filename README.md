# Ruleta de Sorteo (Flask)

Pequeña app Flask que dibuja una ruleta con participantes, selecciona un ganador aleatorio y muestra efectos visuales. Está lista para contenedizar con Docker.

Archivos clave:

- [app.py](app.py) — servidor Flask y endpoint `/spin`.
- [templates/index.html](templates/index.html) — interfaz web con canvas.
- [static/js/wheel.js](static/js/wheel.js) — lógica de dibujo y animación.
- [static/css/style.css](static/css/style.css) — estilos.
- [Dockerfile](Dockerfile) — contenedor para producción/desarrollo.

Cómo ejecutar localmente:

```bash
python -m venv .venv
source .venv/bin/activate  # o .venv\Scripts\activate en Windows
pip install -r requirements.txt
python app.py
```

Construir y correr con Docker:

```bash
docker build -t ruleta-flask .
docker run -p 5000:5000 ruleta-flask
```
