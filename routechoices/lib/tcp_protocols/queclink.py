import math

import arrow

from routechoices.lib.tcp_protocols.commons import (
    GenericConnection,
    GenericTCPServer,
    add_locations,
    get_pending_commands,
    mark_pending_commands_sent,
    save_device,
    send_sos,
)


class QueclinkConnection(GenericConnection):
    protocol_name = "Queclink"

    async def start_listening(self):
        print(f"Queclink - Listening from {self.address}")
        while True:
            imei = None
            try:
                data_bin = await self.stream.read_until(b"$")
                data = data_bin.decode("ascii")
                parts = data.split(",")
                if parts[0][:7] == "+ACK:GT" or parts[0][:8] in (
                    "+RESP:GT",
                    "+BUFF:GT",
                ):
                    imei = parts[2]
            except Exception as e:
                print(
                    f"Queclink - Error parsing initial message ({str(e)})", flush=True
                )
                self.stream.close()
                return

            try:
                await self.process_identification(imei)
            except Exception as e:
                print(f"Queclink - Could not identify device ({e})", flush=True)
                self.stream.close()
                return

            self.logger.info(
                f"GL300 DATA, {self.aid}, {self.address}, {self.imei}: {data}"
            )

            try:
                await self.send_pending_commands()
            except Exception:
                print(f"Queclink - {self.imei} Could not send pending command")

            try:
                await self.process_line(data)
            except Exception:
                print(f"Queclink - {self.imei} Could not parse incomming data")

    async def send_pending_commands(self):
        if not self.imei:
            return
        access_date, commands = await get_pending_commands(self.imei)
        for command in commands:
            await self.stream.write(command.encode())
        commands_count = len(commands)
        if commands_count > 0:
            print(f"Queclink - {self.imei} {commands_count} commands sent")
            await mark_pending_commands_sent(self.imei, access_date)

    async def process_line(self, data):
        parts = data.split(",")
        if parts[0][:8] in ("+RESP:GT", "+BUFF:GT") and parts[0][8:] in (
            "FRI",
            "GEO",
            "SPD",
            "SOS",
            "RTL",
            "PNL",
            "NMR",
            "DIS",
            "DOG",
            "IGL",
            "LOC",
        ):
            nb_pts = int(parts[6])
            if 12 * nb_pts + 10 == len(parts):
                len_points = 12
            elif 11 * nb_pts + 11 == len(parts):
                len_points = 11
            else:
                len_points = math.floor((len(parts) - 10) / nb_pts)
            pts = []
            for i in range(nb_pts):
                try:
                    lon = float(parts[11 + i * len_points])
                    lat = float(parts[12 + i * len_points])
                    tim = arrow.get(
                        parts[13 + i * len_points], "YYYYMMDDHHmmss"
                    ).int_timestamp
                except Exception as e:
                    print(
                        f"Queclink - {self.imei} Error parsing position ({str(e)})",
                        flush=True,
                    )
                    continue
                else:
                    pts.append((tim, lat, lon))
            batt = None
            batt_raw = parts[-3]
            if batt_raw == "":
                batt_raw = parts[-6]
            try:
                batt = int(batt_raw)
            except Exception:
                pass
            await self.on_data(pts, batt)
            if parts[0][8:] == "SOS":
                sos_device_aid, sos_lat, sos_lon, sos_sent_to = await send_sos(
                    self.db_device
                )
                print(
                    f"Queclink - SOS triggered by device {sos_device_aid}, {sos_lat},"
                    f" {sos_lon} email sent to {sos_sent_to}",
                    flush=True,
                )
        elif parts[0] == "+ACK:GTHBD":
            await self.stream.write(
                f"+SACK:GTHBD,{parts[1]},{parts[5]}".encode("ascii")
            )
        elif parts[0][:8] == "+RESP:GT" and parts[0][8:] == "INF":
            try:
                print(
                    f"Queclink - {self.imei} Battery level at {parts[18]}%", flush=True
                )
                batt = int(parts[18])
            except Exception as e:
                print(
                    f"Queclink - {self.imei} Error parsing battery level ({str(e)})",
                    flush=True,
                )
            self.db_device.battery_level = batt
            await save_device(self.db_device)

    async def on_data(self, pts, batt=None):
        if batt:
            self.db_device.battery_level = batt
        loc_array = pts
        await add_locations(self.db_device, loc_array)
        print(f"Queclink - {self.imei} wrote {len(pts)} locations to DB", flush=True)


class TCPServer(GenericTCPServer):
    connection_class = QueclinkConnection
