# Tarea-3-SD

# Integrantes
  - Vicente Berroeta
  - Felipe Ponce

#Instrucciones:
1) Clonar el repositorio.
    ```bash
    https://github.com/vicebp/Tarea-3-SD.git
    ```
2) Iniciar contenedores.
    ```bash
    docker-compose up --build
    ```
3) En este punto solo queda esperar, ya que cassandra demora en generar las replicas.
4) Luego segun lo solicitado dentro de la tarea corresponde Crear un paciente en la siguiente ruta:
    ```url
    http://localhost:3000/createClient [POST]
    ```
    ```json
    {
        "rut":"19502778-k",
        "nombre":"vicente",
        "apellido":"berroeta",
        "email":"vicente.berroeta@mail.udp.cl",
        "fecha_nacimiento":"1"
    }
    ```
    Como respuesta retornará el ID de receta 67b3da2c-2b47-4e96-8d5b-22b391984c31.
5) Luego con el ID obtenido en el punto anterior, pasaremos al siguiente punto solicitado el cual es editar   
    ```url
    http://localhost:3000/editReceta [POST]
    ```
    ```
    json
    {
        "id":" 67b3da2c-2b47-4e96-8d5b-22b391984c31",
        "comentario": "fumador",
        "farmacos":"ansiolitico",
        "doctor": "raska"
    }
    ```
6)Este punto no se locita pero sirve para poder ver las recetas existentes en la siguiente ruta
  ```url
  http://localhost:3000/getRecetas [GET]
  ```
  Retorna todas las recetas con sus respectivos pacientes.
  ```json
  {
        "id": "67b3da2c-2b47-4e96-8d5b-22b391984c31",
        "comentario": "fumador",
        "doctor": "raska",
        "farmacos": "ansiolitico",
        "id_paciente": "68fd0316-2035-488d-b990-e1e19a34799a"
   }
   ```
7) Finalmete se debe poder elimnar una receta mediante la siguiente ruta
    ```url
    http://localhost:3000/deleteReceta [POST]
    ```
    ```json
    {
    "id": "67b3da2c-2b47-4e96-8d5b-22b391984c31"
    }
    ```
# Preguntas
   - Explique la arquitectura que Cassandra maneja. Cuando se crea el cl ́uster ¿C ́omo los nodos se conectan? ¿Qu ́e
        ocurre cuando un cliente realiza una petici ́on a uno de los nodos? ¿Qu ́e ocurre cuando uno de los nodos se desconecta?
        ¿La red generada entre los nodos siempre es eficiente? ¿Existe balanceo de carga?
        
Cassandra funciona mediante un esquema peer-to-peer, en donde las conexiones entre peers estan dadas por protocolo Gossip, para comunicarse.
Al momento de llegar una petición a un pees, este direcciona la petición al peer correspondiente. Luego, la petición se registra en una estructura llamada Mem Table, que sirve como respaldo cuando un nodo se cae. Luego, se utilizan las SSTables, para escribir los datos en el disco. 
El cluster creado costa de 3 nodos y cada una tiene replicas, esto es bastante beneficioso ya que da tolerancia a fallas, en particular cassnadra utiliza las estrategias de Replica placement strategy y Snitch. El cual el primero consiste en replicacion y el segundo en redirreccion de consultas.

En cuanto la red generada por Cassandra en esta tarea, podemos decir que es no es muy eficiente, ya que cassandra esta pensada para procesar gran cantidad de datos, mientras que en nuestro ejemplo son bastante pocos la verdad. Adicionalmente al tener que trabbajar con grandes cantidades de datos se puede ver al momento de levantar el cluster que cassandra demora bastante, lo cual nos puede indicar que necesita bastantes recursos, que en este caso se estan desaprovechando.

El balanceo de carga que utilizado por cassandra es RandomPartitioner el cual distribuye las peticiones de manera aleatoria.

   - Cassandra posee principalmente dos estrategias para mantener redundancia en la replicación de datos. ¿Cuáles son estos? ¿Cuál es la ventaja de uno sobre otro?           ¿Cuál utilizaría usted para en el caso actual y por qué? Justifique apropiadamente su respuesta.
Cassandra utiliza SimpleStrategy y NetworkTopologyStrategy,  La primera consiste en instanciar replicas en los nodos siguientes en sentido de las agujas del reloj.
La segunda consiste en generar hashes para posteriormente calcular un arbol binario, denominado Merkle.
La ventaja principal que posee NetworkTopologyStrategy sobre SimpleStrategy al tener la estructura de un arbol puede almacenar múltiples copias en diferentes datacenters.
Finalmente utilizaria la estrategia de SimpleStrategy, ya que esta permite utilizzar los nodos requeridos en esta actividad, adicionalmente como se muestra en el enunciado de la tarea, en la figura 1 ejemplo del sistema de Autenticacion, parace ser que al ir en senbtiudo de las manesillas del reloj deberiamos usar esta.

   - Teniendo en cuenta el contexto del problema ¿Usted cree que la solución propuesta es la correcta? ¿Qué ocurre cuando se quiere escalar en la solución? ¿Qué              mejoras implementaría? Oriente su respuesta hacia el Sharding (la replicación/distribución de los datos) y comente una estrategia que podría seguir para ordenar    los  datos.
No creo que sea la solucion correcta, ya que como se menciono anteriormente, se esta desaprovechando la capacidad de cassandra. Utilizaria otra base de datos no relacional, mas facil de implementar y a menor costo, como por ejemplo Mongodb. En caso de escalar imagino que se refier a que hora con una mallor cantidad de datos utilizar cassandra seria bastante bueno, pero teniendo en consideracion que esta tampoco daria a basto bajo en modelo creado en esta tarea. Entonces, si disponemos de los recursos suficientes podriamos ahcer un escalamiento vertical para aumentar la memoria que utiliza cada nodo . Adicionalmente a esto escalaria de manera horizontal utilizando clustering, realizando otro cluster conectandolo al primero para generar otro datacenter, ademas de utilizar NetworkTopologyStrategy para mejorar esta problematica de escalabilidad.
 
