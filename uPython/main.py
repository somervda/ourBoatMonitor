import pycom
import lteHelper
import machine
from machine import I2C
import pytrackHelper
from pytrack import Pytrack
from LIS2HH12 import LIS2HH12
import time
import gc
import bme280
from ADS1115 import ADS1115


# ***********************************************************
# ourBoatMonitor IOT code for the boat sensor and LTE transmiter
# ***********************************************************
pycom.heartbeat(False)

print("machine.reset_cause()", machine.reset_cause())

# Flags to switch on sensors to collect
includeGPS = True
includeBME280 = True
includeADS1115 = False

#  flag to go into sleep loop (Turn off for testing)
doSleep = True

py = Pytrack()
acc = LIS2HH12()

print("")
DEEP_SLEEP_SECONDS = 600

# Set deep sleep parameters
py.setup_int_wake_up(True, False)
# Turn off accelerometer
acc.set_odr(0)
gc.collect()

# ******************************************************************
# Collect sensor data, append to the dataList array to be sent via LTE
# ******************************************************************
dataList = []

# Get the Lithium Ion (Li-ion) battery voltage
dataList.append(("LIVoltage", py.read_battery_voltage()))

#  Include GPS reading
if includeGPS:
    print("Getting GPS...")
    #  Get GPS data from pytrack board
    gps = pytrackHelper.getGPS(py, 300)
    if (gps[0] is not None and gps[1] is not None):
        # Create a list of key value pairs to be
        # sent by LTE to hologram
        dataList.append(("lat", gps[0]))
        dataList.append(("lng", gps[1]))

# Use i2c bus 1 for additional i2c devices (Otherwise using Bus 0 messes up the deep sleep processing)
i2c = I2C(1, I2C.MASTER, pins=('P10', 'P9'), baudrate=100000)
#  Include the BME280 sensor for Temperature, Presure and humidity readings
if includeBME280:
    print("BME280")
    bme = bme280.BME280(i2c=i2c)
    t, p, h = bme.values
    dataList.append(("Pressure", p))
    dataList.append(("Temperature", t))
    dataList.append(("Humidity", h))


#  Include ADS1115 sensor for house battery voltage and bilge water level switch settings
if includeADS1115:
    adc = ADS1115(i2c, address=0x48)
    dataList.append(("ADC0", adc.get_voltage(0)))
    dataList.append(("ADC1", adc.get_voltage(1)))

# Turn off extra i2c devices before deep sleep
i2c.deinit()

# Connect to LTE and send the list of data items and hologram device key
lteHelper.sendData(dataList, "lQ6Gjc$n")

if doSleep:
    # Go into low power sleep
    print("Deep sleep for %d seconds..." % (DEEP_SLEEP_SECONDS))
    time.sleep(1)
    py.setup_sleep(DEEP_SLEEP_SECONDS)
    py.go_to_sleep(gps=False)
else:
    print("No sleep - ending...")
