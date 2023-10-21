#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "arduino_secrets.h"

#define uS_TO_S_FACTOR 1000000
#define TIME_TO_SLEEP  300 // In seconds

// GPIO where the DS18B20 is connected to
const int oneWireBus = 4;     

// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(oneWireBus);

// Pass our oneWire reference to Dallas Temperature sensor 
DallasTemperature sensors(&oneWire);

bool logTemperature() {
  Serial.println("Logging temperature...");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wifi connecting");
    while(WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("Wifi connected");
  }

  sensors.requestTemperatures(); 
  float temperatureC = sensors.getTempCByIndex(0);

  WiFiClient client;
  HTTPClient http;

  http.begin(client, SECRET_TEMPERATURE_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST("{\"tempCelsius\": " + String(temperatureC) + ", \"locationName\": \"jacks-office\"}");

  Serial.println("Response code: " + String(httpResponseCode));

  http.end();

  return httpResponseCode == 204;
}

void invokeWithRetry(bool (*func)(), int secondsBetweenInvocations = 3, int maxAttempts = 3) {
  int attempts = 0;

  while(!func() && attempts < maxAttempts) {
    Serial.println("Invocation failed. Retrying...");
    delay(secondsBetweenInvocations * 1000);
    attempts++;
  }
}

void setup() {
  // Start the Serial Monitor
  Serial.begin(115200);

  Serial.println("Beginning WiFi...");
  WiFi.begin(SECRET_SSID, SECRET_PASSWORD);
  Serial.println("done");

  // Serial.println("waiting for sync...");
  // waitForSync();
  // Serial.println("done");

  // Start the DS18B20 sensor
  sensors.begin();

  invokeWithRetry(&logTemperature);

  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  // esp_deep_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_OFF);

  Serial.flush(); 
  esp_deep_sleep_start();
}

void loop() {
  
}