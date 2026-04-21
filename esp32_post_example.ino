#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==========================================
// KONFIGURASI WIFI & SERVER
// ==========================================
const char* ssid = "Fuad";
const char* password = "********";

// Ganti IP dengan IP Laptop/PC kamu
const char* serverName = "http://[IP_ADDRESS]/Dashboard_Monitor_ESP32/api/post-data.php";
String apiKeyValue = "MentimunBesar";

// ==========================================
// KONFIGURASI PIN SENSOR
// ==========================================
// Sensor DHT22
#define DHTPIN 4          // Pin yang terhubung ke pin Data DHT22
#define DHTTYPE DHT22     // Tipe DHT (DHT11 atau DHT22)
DHT dht(DHTPIN, DHTTYPE);

// Sensor Analog (Soil Moisture & LDR)
// Catatan: Gunakan pin ADC ESP32, misalnya pin 34 dan 35
#define SOIL_MOISTURE_PIN 34 
#define LDR_PIN 35 

// Timer
unsigned long lastTime = 0;
unsigned long timerDelay = 3000; // Kirim setiap 3 detik

void setup() {
  Serial.begin(115200);

  // Inisialisasi Sensor DHT
  dht.begin();
  
  // Konfigurasi pin analog sebagai input
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  // Koneksi WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    if(WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");
      
      // ==========================================
      // MEMBACA DATA SENSOR
      // ==========================================
      
      // 1. Membaca DHT22
      float airHum = dht.readHumidity();
      float temp = dht.readTemperature();
      
      // Validasi pembacaan DHT
      if (isnan(airHum) || isnan(temp)) {
        Serial.println("Gagal membaca dari sensor DHT!");
        // Kamu bisa set ke 0.0 jika error atau biarkan saja
      }
      
      // 2. Membaca Soil Moisture (Analog 0-4095 di ESP32)
      int soilAnalog = analogRead(SOIL_MOISTURE_PIN);
      // Pemetaan: (Umumnya semakin basah, nilai analog semakin KECIL)
      // Ubah Angka 4095 (Kering) dan 1000 (Basah) sesuai dengan kalibrasi sensormu!
      float soilHum = map(soilAnalog, 4095, 1000, 0, 100);
      if(soilHum < 0) soilHum = 0; // Memastikan tidak ada nilai minus
      if(soilHum > 100) soilHum = 100;
      
      // 3. Membaca LDR (Analog 0-4095)
      int ldrAnalog = analogRead(LDR_PIN);
      // Pemetaan kasar ke Lux (Asumsi sensor mendeteksi range lux 0-1200)
      // Ubah rentang ini sesuai sirkuit LDR dan target keterangan di dashboard-mu!
      float light = map(ldrAnalog, 4095, 0, 0, 1200); 
      if(light < 0) light = 0;

      // ==========================================
      // MENGIRIM DATA
      // ==========================================
      // Example (add before sending)
      String httpRequestData = "{\"airHumidity\":" + String(airHum) +
                               ",\"soilHumidity\":" + String(soilHum) +
                               ",\"temperature\":" + String(temp) +
                               ",\"light\":" + String(light) +
                               ",\"api_key\":\"" + apiKeyValue + "\"}";
                               
      Serial.print("Payload Data: ");
      Serial.println(httpRequestData);
      
      int httpResponseCode = http.POST(httpRequestData);
      
      if (httpResponseCode > 0) {
        Serial.print("HTTP Response: ");
        Serial.println(httpResponseCode);
        Serial.println("Server Response: " + http.getString());
      } else {
        Serial.print("Error Code: ");
        Serial.println(httpResponseCode);
      }
      
      http.end();
    } else {
      Serial.println("WiFi Disconnected!");
    }
    lastTime = millis();
  }
}

