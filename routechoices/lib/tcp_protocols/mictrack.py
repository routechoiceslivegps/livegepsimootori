import arrow

from routechoices.lib.helpers import safe64encode
from routechoices.lib.tcp_protocols.commons import (
    GenericConnection,
    GenericTCPServer,
    add_locations,
    send_sos,
)


class MicTrackConnection(GenericConnection):
    protocol_name = "MicTrack"

    def __init__(self, stream, address, logger):
        super().__init__(stream, address, logger)
        self.protocol_version = None

    async def start_listening(self):
        print(f"MicTrack - Listening from {self.address}")
        while True:
            imei = None
            try:
                data_bin = await self.stream.read_bytes(2)
                data_raw = data_bin.decode("ascii")

                protocol = None
                if data_raw.startswith("#"):
                    protocol = 1
                elif data_raw == "MT":
                    protocol = 2
                else:
                    raise Exception("Unknown protocol")

                if not self.protocol_version:
                    self.protocol_version = protocol
                elif self.protocol_version != protocol:
                    raise Exception("Cannot change protocol")
            except Exception as e:
                print(f"MicTrack - Invalid protocol ({e})", flush=True)
                self.stream.close()
                return

            try:
                if self.protocol_version == 1:
                    data_bin = await self.stream.read_until(b"\r\n##", 1000)
                    data_raw += data_bin.decode("ascii").strip()
                else:
                    data_bin = await self.stream.read_bytes(22)
                    data_raw += data_bin.decode("ascii")

                imei = None
                if self.protocol_version == 1:
                    data = data_raw.split("#")
                    imei = data[1]
                else:
                    data = data_raw.split(";")
                    imei = data[2]
                    if data[3] == "R0":
                        while len(data_raw.split("+")) < 9:
                            data_bin = await self.stream.read_bytes(90, partial=True)
                            data_raw += data_bin.decode("ascii")
                        data = data_raw.split(";")
                    else:
                        data_bin = await self.stream.read_bytes(90, partial=True)
                        data_raw += data_bin.decode("ascii")
            except Exception:
                print("MicTrack - Cannot read data", flush=True)
                self.stream.close()
                return
            try:
                await self.process_identification(imei)
            except Exception as e:
                print(f"MicTrack - Invalid identification ({e})", flush=True)
                self.stream.close()
                return
            try:
                self.logger.info(
                    f"MICTRK {self.protocol_version} DATA, {self.aid}, {self.address}, {self.imei}: {safe64encode(data_raw)}"
                )
                await self.process_data(data)
            except Exception as e:
                print(f"MicTrack - Couldn't parse data ({e})", flush=True)
                self.stream.close()
                return

    async def process_identification(self, imei):
        await super().process_identification(imei)
        self.db_device.user_agent = f"{self.protocol_name} V{self.protocol_version}"

    async def process_data(self, data):
        if self.protocol_version == 1:
            await self.process_data_protocol_v1(data)
        if self.protocol_version == 2:
            await self.process_data_protocol_v2(data)

    async def process_data_protocol_v1(self, data):
        gps_data = data[6].split(",")
        batt_volt, msg_type = gps_data[0].split("$")
        if msg_type != "GPRMC" or gps_data[2] not in ("A", "L"):
            raise Exception("Not GPS data or invalid data", flush=True)

        tim = arrow.get(f"{gps_data[9]} {gps_data[1]}", "DDMMYY HHmmss.S").int_timestamp

        lat_minute = float(gps_data[3])
        lat = lat_minute // 100 + (lat_minute % 100) / 60
        if gps_data[4] == "S":
            lat *= -1

        lon_minute = float(gps_data[5])
        lon = lon_minute // 100 + (lon_minute % 100) / 60
        if gps_data[6] == "W":
            lon *= -1

        try:
            # https://help.mictrack.com/articles/how-to-calculate-battery-voltage-into-percentage-for-mictrack-devices/
            # we assume 4.2V battery going empty at 3.3V
            self.db_device.battery_level = max(
                [0, min([100, int((int(batt_volt) - 33) / 9 * 100)])]
            )
        except Exception:
            print("MicTrack - Invalid battery level value", flush=True)

        await add_locations(self.db_device, [(tim, lat, lon)])
        print(f"MicTrack - {self.imei} wrote 1 location to DB", flush=True)

        sos_triggered = data[4] == "SOS"
        if sos_triggered:
            sos_device_aid, sos_lat, sos_lon, sos_sent_to = await send_sos(
                self.db_device
            )
            print(
                (
                    f"MicTrack - SOS triggered by device {sos_device_aid}, "
                    f"{sos_lat}, {sos_lon} email sent to {sos_sent_to}"
                ),
                flush=True,
            )

    async def process_data_protocol_v2(self, data):
        msg_type = data[3]
        if msg_type != "R0":
            return

        gps_data = data[4].split("+")
        batt_volt = gps_data[7]

        tim = arrow.get(gps_data[1], "YYMMDDHHmmss").int_timestamp
        lat = float(gps_data[2])
        lon = float(gps_data[3])

        try:
            # https://help.mictrack.com/articles/how-to-calculate-battery-voltage-into-percentage-for-mictrack-devices/
            # we assume 4.2V battery going empty at 3.5V
            self.db_device.battery_level = max(
                [0, min([100, int((int(batt_volt) - 3500) / 700 * 100)])]
            )
        except Exception:
            print("MicTrack - Invalid battery level value", flush=True)

        await add_locations(self.db_device, [(tim, lat, lon)])
        print(f"MicTrack - {self.imei} wrote 1 location to DB", flush=True)

        sos_triggered = gps_data[6] == "5"
        if sos_triggered:
            sos_device_aid, sos_lat, sos_lon, sos_sent_to = await send_sos(
                self.db_device
            )
            print(
                (
                    f"MicTrack - SOS triggered by device {sos_device_aid}, "
                    f"{sos_lat}, {sos_lon} email sent to {sos_sent_to}"
                ),
                flush=True,
            )


class TCPServer(GenericTCPServer):
    connection_class = MicTrackConnection
