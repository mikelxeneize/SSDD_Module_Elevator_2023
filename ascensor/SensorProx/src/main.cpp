
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// Replace with your network credentials
const char* ssid = "ALEJANDRO";
const char* password = "necochea4866";

// Replace with your MQTT broker IP address
const char* mqtt_server = "https://test.mosquitto.org/";
const char* mqtt_topic = "ssdd2023/ascensor";
WiFiClient espClient;
PubSubClient client(espClient);

// Replace with your PIR sensor pin
const int pirPin = D1; //the digital pin connected to the PIR sensor's output, GPIO5
int pinLed = D2; //led built-in on the board, pin GPIO2

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

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
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
  setup_wifi();
  client.setServer(mqtt_server, 1883);
} 

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  int pirState = digitalRead(pirPin);
  if (pirState == HIGH) {//mando un true, o un 1
    Serial.println("Movimiento detectado");
    client.publish(mqtt_topic, "1");
    digitalWrite(pinLed, HIGH);
    delay(5000);
  }
  else {
    Serial.println("Sin movimientos"); //no mando nada
    //client.publish(mqtt_topic, "Motion stopped!");
    digitalWrite(pinLed, LOW);
    delay(5000);
  }
}