#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  // No second argument = Slave mode
  SerialBT.begin("ESP32_Slave_Node");  
  Serial.println("Slave node started. Waiting for master...");
}

void loop() {
  // USB -> Bluetooth
  if (Serial.available()) {
    SerialBT.write(Serial.read());
  }
  // Bluetooth -> USB
  if (SerialBT.available()) {
    Serial.write(SerialBT.read());
  }
  delay(20);
}