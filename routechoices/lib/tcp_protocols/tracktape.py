import json

import arrow

from routechoices.lib.helpers import safe64encode
from routechoices.lib.tcp_protocols.commons import (
    GenericConnection,
    GenericTCPServer,
    add_locations,
)


class TrackTapeConnection(GenericConnection):
    protocol_name = "TrackTape"

    async def start_listening(self):
        print(f"TrackTape - Listening from {self.address}")
        while True:
            imei = None
            try:
                data_raw = ""
                while not data_raw:
                    data_bin = await self.stream.read_until(b"\n")
                    data_raw = data_bin.decode("ascii").strip()
                data = json.loads(data_raw)
                imei = data["id"]
            except Exception as e:
                print(f"TrackTape - Could not read data ({e})", flush=True)
                self.stream.close()
                return
            try:
                await self.process_identification(imei)
            except Exception as e:
                print(f"TrackTape - Could not identify device ({e})", flush=True)
                self.stream.close()
                return
            self.logger.info(
                f"TRCKTP DATA, {self.aid}, {self.address}, {self.imei}: {safe64encode(json.dumps(data))}"
            )
            try:
                await self.process_data(data)
            except Exception as e:
                print(f"TrackTape - Could not parse location ({e})", flush=True)
                self.stream.close()
                return

    async def process_data(self, data):
        try:
            battery_level = int(data.get("batteryLevel"))
        except Exception:
            pass
        else:
            self.db_device.battery_level = battery_level

        locs = data.get("positions", [])
        loc_array = []
        for loc in locs:
            try:
                tim = arrow.get(loc.get("timestamp")).int_timestamp
                lon = float(loc.get("lon"))
                lat = float(loc.get("lat"))
            except Exception:
                continue
            else:
                loc_array.append((tim, lat, lon))
        if loc_array:
            await add_locations(self.db_device, loc_array)
            print(
                f"TrackTape - {self.imei} wrote {len(loc_array)} locations to DB",
                flush=True,
            )


class TCPServer(GenericTCPServer):
    connection_class = TrackTapeConnection
