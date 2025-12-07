import re

import arrow

from routechoices.lib.tcp_protocols.commons import (
    GenericConnection,
    GenericTCPServer,
    add_locations,
)


class XexunConnection(GenericConnection):
    protocol_name = "Xexun"

    async def start_listening(self):
        print(f"Xexun - Listening from {self.address}")
        while True:
            imei = None
            try:
                data_raw = ""
                while not data_raw:
                    data_bin = await self.stream.read_bytes(255, partial=True)
                    data_raw = data_bin.decode("ascii", "ignore")
                    data_raw = re.search(r"G[PN]RMC,.+", data_raw).group(0)
                imei = re.search(r"imei:(\d+)(,.*)?$", data_raw).group(1)
            except Exception as e:
                print(f"Xexun - Error parsing data ({e})", flush=True)
                self.stream.close()
                return

            try:
                await self.process_identification(imei)
            except Exception as e:
                print(f"Xexun - Could not identify device ({e})", flush=True)
                self.stream.close()
                return
            self.logger.info(
                f"XEXUN DATA, {self.aid}, {self.address}, {self.imei}: {data_raw}"
            )
            try:
                await self.process_data(data_raw)
            except Exception as e:
                print(f"Xexun - Could not parse data ({e})", flush=True)
                self.stream.close()
                return

    async def process_data(self, data_raw):
        data = data_raw.split(",")
        if data[2] != "A":
            return

        tim = arrow.get(f"{data[9]} {data[1][:6]}", "DDMMYY HHmmss").int_timestamp
        lat_minute = float(data[3])
        lat = lat_minute // 100 + (lat_minute % 100) / 60
        if data[4] == "S":
            lat *= -1
        lon_minute = float(data[5])
        lon = lon_minute // 100 + (lon_minute % 100) / 60
        if data[6] == "W":
            lon *= -1

        await add_locations(self.db_device, [(tim, lat, lon)])
        print(f"Xexun - {self.imei} wrote 1 locations to DB", flush=True)


class TCPServer(GenericTCPServer):
    connection_class = XexunConnection
