
# Sistema Peer-to-Peer con gRPC

Este proyecto consiste en un sistema peer-to-peer (P2P) donde múltiples pares se registran con un servidor de directorio central e intercambian archivos usando gRPC (Google Remote Procedure Call). Cada par puede subir y descargar archivos, buscar archivos en otros pares y manejar autenticación mediante tokens JWT.

![P2P-Page-1 drawio](https://github.com/user-attachments/assets/2b37fc20-0811-498e-a523-b135d680db23)

## Componentes

1. **Peers (Nodos)**:
   - Cada peer ejecuta su propio servidor gRPC y cliente API REST para interactuar con otros peers y el servidor de directorio.
   - Se proporcionan varios archivos Docker para diferentes pares, cada uno definiendo el entorno, las dependencias y los archivos compartidos.

2. **Servidor de Directorio**:
   - Un servidor central donde todos los pares se registran. Lleva un seguimiento de qué peer tiene qué archivos.
   - El servidor de directorio puede ser consultado por cualquier peer para buscar archivos en otros peers.

## Desglose de Archivos

### Dockerfiles

#### `Peer/Dockerfile`
- Dockerfile base para el nodo peer.
- Se configura un entorno Node.js.
- Se exponen los puertos `5000` y `50051` para los servicios web y gRPC.

#### `Peer/peer1.Dockerfile`, `Peer/peer2.Dockerfile`, `Peer/peer3.Dockerfile`
- Extiende el Dockerfile base, especificando archivos distintos compartidos por cada peer.
- Cada peer genera archivos únicos en la carpeta `shared/` (`shakira.txt`, `rihana.txt`, etc.).

#### `Server/Dockerfile`
- Dockerfile para el servidor de directorio.
- Se configura un entorno Node.js y se expone el puerto `6000` para la API REST.

### Docker Compose

#### `docker-compose.yml`
- Define los servicios para el servidor de directorio y los pares.
- Configura los puertos y las rutas de los contenedores.
- Crea una red compartida para que los contenedores puedan comunicarse entre sí.
- Inicia el servidor de directorio y los pares con sus respectivos Dockerfiles.

### Archivos de la Aplicación Peer

#### `Peer/src/pclient/client.js`
- Implementa la lógica del cliente peer.
- Maneja rutas como login, logout, búsqueda, subida y descarga de archivos.
- Se comunica con el servidor de directorio para registrar el peer y buscar archivos.

#### `Peer/src/pclient/services`

1. **authService.js**:
   - Gestiona la autenticación basada en JWT, incluyendo login, logout y verificación de tokens.

2. **filesService.js**:
   - Proporciona funcionalidad para listar archivos en el directorio del peer.

3. **grpcService.js**:
   - Define los métodos de subida y descarga que interactúan con otros peers a través de gRPC.

4. **loginService.js**:
   - Maneja las operaciones de login y logout utilizando `authService.js`.

5. **searchService.js**:
   - Proporciona métodos para buscar archivos entre los peers y obtener archivos de otros peers.

#### `Peer/src/proto/file.proto`
- Archivo de definición Protocol Buffer para el servicio gRPC.
- Describe los servicios (`UploadFile` y `DownloadFile`) y los formatos de los mensajes correspondientes.

#### `Peer/src/pserver/server.js`
- Inicia el servidor gRPC del peer, permitiendo que otros peers suban o descarguen archivos de este peer.

#### `Peer/src/pserver/services/grpcService.js`
- Define la lógica del servidor gRPC, permitiendo a los peers subir y descargar archivos.
- Implementa el manejo de archivos usando `fs` y expone estas funcionalidades mediante gRPC.

### `Peer/src/peer.js`
- Inicia tanto el servidor gRPC como las funcionalidades del cliente dentro de cada peer.

### Servidor de Directorio

#### `Server/src/directoryServer.js`
- Proporciona endpoints REST API para registrar peers, buscar archivos y obtener índices de archivos para un peer específico.
- Almacena la información del peer, como la IP, el puerto y los archivos.
- Soporta la búsqueda de un archivo consultando los peers registrados.

## Resumen del Flujo de Trabajo

1. **Registro del Peer**: 
   - Cada peer se registra con el servidor de directorio al iniciarse, proporcionando su ID, dirección IP, puerto y una lista de archivos que está compartiendo.

2. **Búsqueda de Archivos**:
   - Un peer puede buscar un archivo en todos los peers registrados consultando el servidor de directorio.

3. **Transferencia de Archivos**:
   - Si se encuentra un archivo en otro peer, el servicio gRPC permite descargar el archivo directamente desde el peer que lo ofrece.
   - Un peer puede subir archivos a otros peers utilizando el mismo servicio gRPC.

4. **Autenticación**:
   - El sistema implementa autenticación JWT, donde los peers inician sesión utilizando un nombre de usuario y contraseña, y el token JWT se usa para solicitudes posteriores.

## Despliegue

Cada peer y el servidor de directorio se despliegan como contenedores Docker separados. El archivo `peer.js` inicia tanto el servidor gRPC como las funcionalidades del cliente dentro de cada peer, asegurando que puedan manejar solicitudes gRPC entrantes y comunicarse con el servidor de directorio.

**Puertos Clave**:
- **5000**: API Web para peers.
- **50051**: Servicios gRPC para subir/descargar archivos.


## **Endpoints del Peer**

### 1. **`/api/login`**
   - **Método:** `POST`
   - **Descripción:** Inicia sesión en el sistema utilizando un nombre de usuario y contraseña. Devuelve un token JWT que debe ser utilizado en solicitudes posteriores para la autenticación.
   - **Parámetros del cuerpo (JSON):**
     - `username` (string): Nombre de usuario.
     - `password` (string): Contraseña.
   - **Respuesta exitosa (200):** Token de autenticación.
   - **Respuesta de error (401):** Error de autenticación.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:3000/api/login    -H "Content-Type: application/json"    -d '{
     "username": "user",
     "password": "password"
   }'
   ```

---

### 2. **`/api/logout`**
   - **Método:** `POST`
   - **Descripción:** Cierra sesión del usuario autenticado utilizando el token JWT proporcionado en el encabezado de autorización.
   - **Encabezado:** `Authorization: Bearer <token>`
   - **Respuesta exitosa (200):** Confirmación de cierre de sesión.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:3000/api/logout    -H "Authorization: Bearer <token>"
   ```

---

### 3. **`/api/search`**
   - **Método:** `POST`
   - **Descripción:** Busca un archivo entre los peers registrados en el sistema.
   - **Encabezado:** `Authorization: Bearer <token>`
   - **Parámetros del cuerpo (JSON):**
     - `filename` (string): El nombre del archivo que se desea buscar.
   - **Respuesta exitosa (200):** Lista de peers que tienen el archivo.
   - **Respuesta de error (404):** Archivo no encontrado.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:3000/api/search    -H "Authorization: Bearer <token>"    -H "Content-Type: application/json"    -d '{
     "filename": "shakira.txt"
   }'
   ```

---

### 4. **`/api/download`**
   - **Método:** `POST`
   - **Descripción:** Descarga un archivo desde otro peer especificando su IP y el nombre del archivo.
   - **Encabezado:** `Authorization: Bearer <token>`
   - **Parámetros del cuerpo (JSON):**
     - `filename` (string): El nombre del archivo que se desea descargar.
     - `peerIp` (string): La dirección IP del peer que tiene el archivo.
   - **Respuesta exitosa (200):** El archivo ha sido descargado con éxito.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:3000/api/download    -H "Authorization: Bearer <token>"    -H "Content-Type: application/json"    -d '{
     "filename": "shakira.txt",
     "peerIp": "192.168.1.2"
   }'
   ```

---

### 5. **`/api/upload`**
   - **Método:** `POST`
   - **Descripción:** Sube un archivo desde el peer local hacia otro peer especificando su IP.
   - **Encabezado:** `Authorization: Bearer <token>`
   - **Parámetros del cuerpo (JSON):**
     - `filename` (string): El nombre del archivo que se desea subir.
     - `peerIp` (string): La dirección IP del peer destino.
   - **Respuesta exitosa (200):** El archivo ha sido subido con éxito.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:3000/api/upload    -H "Authorization: Bearer <token>"    -H "Content-Type: application/json"    -d '{
     "filename": "rihanna.txt",
     "peerIp": "192.168.1.3"
   }'
   ```

---

### 6. **`/api/index`**
   - **Método:** `POST`
   - **Descripción:** Obtiene la lista de archivos disponibles en otro peer especificando su IP.
   - **Encabezado:** `Authorization: Bearer <token>`
   - **Parámetros del cuerpo (JSON):**
     - `peerIp` (string): La dirección IP del peer del que se desea obtener el índice de archivos.
   - **Respuesta exitosa (200):** Lista de archivos disponibles en el peer.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:3000/api/index    -H "Authorization: Bearer <token>"    -H "Content-Type: application/json"    -d '{
     "peerIp": "192.168.1.4"
   }'
   ```

---

## **Endpoints del Servidor de Directorio**

### 1. **`/api/register`**
   - **Método:** `POST`
   - **Descripción:** Registra un peer en el servidor de directorio, proporcionando su IP, puerto y los archivos disponibles.
   - **Parámetros del cuerpo (JSON):**
     - `peerId` (string): ID del peer.
     - `ip` (string): Dirección IP del peer.
     - `port` (number): Puerto del peer.
     - `files` (array): Lista de archivos que el peer está compartiendo.
   - **Respuesta exitosa (200):** Confirmación de registro.

   **Ejemplo con `curl`:**
   ```bash
   curl -X POST http://localhost:5000/api/register    -H "Content-Type: application/json"    -d '{
     "peerId": "peer1",
     "ip": "192.168.1.1",
     "port": 5000,   
     "files": ["shakira.txt", "beyonce.txt"]
   }'
   ```

---

### 2. **`/api/search`**
   - **Método:** `GET`
   - **Descripción:** Busca un archivo en los peers registrados en el servidor de directorio.
   - **Parámetros de consulta:**
     - `filename` (string): El nombre del archivo que se desea buscar.
   - **Respuesta exitosa (200):** Lista de peers que tienen el archivo.

   **Ejemplo con `curl`:**
   ```bash
   curl -X GET "http://localhost:5000/api/search?filename=shakira.txt"
   ```

---

### 3. **`/api/files`**
   - **Método:** `GET`
   - **Descripción:** Obtiene la lista de archivos compartidos por un peer específico usando su IP.
   - **Parámetros de consulta:**
     - `peerIp` (string): La IP del peer del cual se quiere obtener los archivos.
   - **Respuesta exitosa (200):** Lista de archivos compartidos por el peer.

   **Ejemplo con `curl`:**
   ```bash
   curl -X GET "http://localhost:5000/api/files?peerIp=192.168.1.2"
   ```


