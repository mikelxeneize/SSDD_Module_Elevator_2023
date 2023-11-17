
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>

// Replace with your network credentials
const char* ssid = "ssid"; // wifi net name
const char* password = "password"; // wifi net password

// Replace with your MQTT broker IP address
const char* mqtt_server = "test.mosquitto.org";
const char* mqtt_topic = "ssdd2023/ascensor";
const int port = 1883;
const char* mqttUser = "ascensor1";
const char* mqttPassword = "ascensor1";

WiFiClient espClient;
PubSubClient client(espClient);

// Replace with your PIR sensor pin
const int pirPin = 5; //the digital pin connected to the PIR sensor's output, GPIO5
int pinLed = 2; //led built-in on the board, pin GPIO2

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      //client.publish("outTopic", "hello world");
      // ... and resubscribe
      //client.subscribe("inTopic"); no tiene que suscribirse
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(pinLed, OUTPUT);
  Serial.begin(9600);
  Serial.println("1. Estoy en el setup, antes del setup_wifi");
  setup_wifi();
  Serial.println("2. Me conecte al wifi");
  client.setServer(mqtt_server, port);
  client.connect(mqttUser);
} 

void loop() {
    Serial.println("3. Estoy en el loop");
    Serial.println(client.connected());
  if (!client.connected()) {
    Serial.println("4. El cliente no se conecto");
    reconnect();
  }
  Serial.println("5. El cliente se conecto");
  client.loop();
  Serial.println("6. El cliente ya entro al mqtt loop");
  int pirState = digitalRead(pirPin);
  if (pirState == HIGH) {//mando un true, o un 1
    Serial.println("Movimiento detectado");
    client.publish(mqtt_topic, "c84605b4-7a59-11ee-b962-0242ac120002,OCUPADO");
    digitalWrite(pinLed, LOW); //por alguna razon que desconozco, en este sketch LOW es prendido y HIGH es apago
    delay(5000);
  }
  else {
    Serial.println("Sin movimientos"); //no mando nada
    //client.publish(mqtt_topic, "Motion stopped!");
    digitalWrite(pinLed, HIGH);
    delay(5000);
  }
}