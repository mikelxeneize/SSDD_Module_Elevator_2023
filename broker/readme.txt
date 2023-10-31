NOTAS:

1) En el broker no se verifica que para publicar a un topico el cliente este suscripto
  //Si se modifica es solo 1 linea, easy

2) El cliente tiene un ID distinto por cada topico

3) Al sucribirse el broker devuelve un ID, este debe ser guardado por cada cliente

4) En la implementacion actual, el broker reenvia la publicacion a TODOS, incluso al cliente que la envi
  //Si se modifica es solo 1 linea, easy


AÑADIDO:
  5) Al suscribirse a topico "ascensor" devuelve ID y ascensores si es que hay ya creados