# SSDD_Module_Elevator_2023
Trabajo práctico de SSDD sobre modulo de ascensor

En el siguiente repositorio se encuentran el modulo de gestión de ascensores. Cada carpeta pertenece a un microservicio distinto. Se ha podido cumplir el plan de hitos presentado (contra todo pronostico).

Notas previas:

- Para el apartado de promoción se utilizo una placa Nodemcu V3 con la placa wifi esp8266MOD. el sensor pir no contiene data explicita. El cable de datos del mismo se conecta a la placa en el pin D1 (en codigo es otro); el positivo va a vin para poder recibir 5V y el negativo a cualquier gnd. El id del ascensor que se relaciona con el sensor es: "c84605b4-7a59-11ee-b962-0242ac120002"

Orden de ejecución:

Para ejecutar el microservicio broker: "node broker/broker.js"

Para ejecutar el microservicio del selector ascensor:  "node selector-ascensor/SelectorAscensorGateway.js"

Para ejecutar el cliente web: Open with live server

Para ejecutar el microservicio ascensor: "node ascensor/scriptAscensor.js param[2]" donde param [2] son los datos en json del ascensor creado por otro servicio


Puertos:
Broker: 3000
Selector ascensor: 3001