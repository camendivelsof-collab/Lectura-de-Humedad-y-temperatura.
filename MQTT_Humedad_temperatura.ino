/*
 * Proyecto: Estación Climática IoT Arbeláez (Versión JSON Estable)
 * Dispositivo: Heltec WiFi LoRa 32 V3
 * Sensor: DHT11
 * * Requisitos: 
 * 1. Instalar librería "ArduinoJson" de Benoit Blanchon
 * 2. Instalar librería "PubSubClient" de Nick O'Leary
 * 3. Instalar librerías de Adafruit para el OLED (SSD1306 y GFX)
 * 4. Programa por Camilo Andrés Mendivelso
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- CONFIGURACIÓN DE RED ---
const char* ssid = "Nombre_red_wifi";           
const char* password = "Clave_red_wiFI";   

// --- CONFIGURACIÓN MQTT ---
const char* mqtt_server = "192.168.101.12"; // Tu IP de Host
const int mqtt_port = 1883; 
const char* mqtt_user = "sensor";       
const char* mqtt_pass = "sensor123";     

// --- PINES HELTEC V3 ---
#define OLED_SDA     17
#define OLED_SCL     18
#define OLED_RST     21
#define VEXT_CTRL    36  
#define DHTPIN       4   
#define DHTTYPE      DHT11

// --- OBJETOS ---
WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_SSD1306 display(128, 64, &Wire, OLED_RST);
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  
  // Encender pantalla y bus I2C en Heltec V3
  pinMode(VEXT_CTRL, OUTPUT);
  digitalWrite(VEXT_CTRL, LOW); 
  delay(100);
  
  Wire.begin(OLED_SDA, OLED_SCL);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Error al iniciar OLED");
  }

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  dht.begin();
  
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("SISTEMA INICIADO");
  display.display();
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    
    // ID FIJO: Importante para que EMQX mantenga el Log Trace activo
    String clientId = "ESP32_Arbelaez_PROD"; 

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("CONECTADO");
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 5 segundos");
      delay(5000);
    }
  }
}

/**
 * Función para enviar datos en formato JSON
 * Esto es lo que permite que EMQX lea 'payload.val' en la regla
 */
void enviarDato(const char* topico, float valor) {
  StaticJsonDocument<200> doc;
  doc["topic"] = topico;
  doc["val"] = valor;

  char buffer[256];
  serializeJson(doc, buffer);
  
  client.publish(topico, buffer);
  Serial.print("Enviado a ");
  Serial.print(topico);
  Serial.print(": ");
  Serial.println(buffer);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  static unsigned long lastMsg = 0;
  unsigned long now = millis();

  if (now - lastMsg > 10000) { // Enviar cada 10 segundos
    lastMsg = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println("Error al leer el sensor DHT");
      return;
    }

    // Publicar datos en formato JSON
    enviarDato("esp32/temperatura", t);
    enviarDato("esp32/humedad", h);

    // Actualizar pantalla OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0,0);
    display.println("ESTACION ARBELAEZ");
    display.drawLine(0, 12, 128, 12, WHITE);
    
    display.setCursor(0, 20);
    display.print("Temp: ");
    display.setTextSize(2);
    display.print(t, 1);
    display.print(" C");
    
    display.setTextSize(1);
    display.setCursor(0, 45);
    display.print("Hum:  ");
    display.setTextSize(2);
    display.print(h, 0);
    display.print(" %");
    
    display.display();
  }
}
