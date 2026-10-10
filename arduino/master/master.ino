#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  
  // true = Master mode
  SerialBT.begin("ESP32_Master_Node", true); 
  Serial.println("Master node started. Attempting connection...");

  // Connect by the slave's advertised name
  bool connected = SerialBT.connect("ESP32_Slave_Node");

  if (connected) {
    Serial.println("Connected to slave!");
  } else {
    Serial.println("Connection failed. Make sure slave is powered and nearby.");
    while (1) delay(1000); // Halt if connection fails
  }
}

void loop() {
  // USB -> Bluetooth (send a message to the slave)
  if (Serial.available()) {
    SerialBT.write(Serial.read());
  }
  // Bluetooth -> USB (receive messages from the slave)
  if (SerialBT.available()) {
    Serial.write(SerialBT.read());
  }
  delay(20);
}