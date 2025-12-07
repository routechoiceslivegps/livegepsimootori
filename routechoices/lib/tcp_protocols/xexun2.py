from struct import pack, unpack

from routechoices.lib.helpers import safe64encode
from routechoices.lib.tcp_protocols.commons import (
    GenericConnection,
    GenericTCPServer,
    add_locations,
    send_sos,
)


def convert_coords(val):
    degrees = val // 100
    minutes = val - degrees * 100
    return degrees + minutes / 60


class Xexun2Connection(GenericConnection):
    protocol_name = "Xexun2"

    async def start_listening(self):
        print(f"Xexun2 - Listening from {self.address}")
        while True:
            imei = None
            try:
                data_bin = await self.stream.read_bytes(1024, partial=True)
                imei = data_bin[6:14].hex()[:15]
            except Exception as e:
                print(f"Xexun2 - Error parsing data ({e})", flush=True)
                self.stream.close()
                return

            try:
                await self.process_identification(imei)
            except Exception as e:
                print(f"Xexun2 - Could not identify device ({e})", flush=True)
                self.stream.close()
                return
            self.logger.info(
                f"XEXUN2 DATA, {self.aid}, {self.address}, {self.imei}: {safe64encode(bytes(data_bin))}"
            )
            try:
                await self.process_data(data_bin)
            except Exception as e:
                print(f"Xexun2 - Error parsing data ({e})", flush=True)

    def send_response(self, data_type, index):
        response = pack(">H", 0xFAAF)
        response += pack(">H", data_type)
        response += pack(">H", index)
        response += bytes.fromhex(f"{self.imei:0<16}")
        response += pack(">H", 1)
        response += pack(">H", 0xFFFE)
        response += pack("B", 1)
        response = pack(">H", 0xFAAF)
        self.stream.write(response)

    async def process_data(self, data_bin):
        data_type = unpack(">H", data_bin[2:4])[0]
        index = unpack(">H", data_bin[4:6])[0]

        if data_type == 0x07:
            self.send_response(data_type, index)
        elif data_type == 0x14:
            count = data_bin[18]
            lengths = []

            current_index = 19
            for i in range(count):
                length = unpack(">H", data_bin[current_index : current_index + 2])[0]
                lengths.append(length)
                current_index += 2

            locs = []
            alarm = False
            for length in lengths:
                try:
                    device_time = unpack(
                        ">I", data_bin[current_index + 1 : current_index + 5]
                    )[0]
                    battery_level = min(
                        100,
                        max(
                            0,
                            unpack(
                                ">H", data_bin[current_index + 6 : current_index + 8]
                            )[0]
                            & 0x7FFF,
                        ),
                    )
                    self.db_device.battery_level = battery_level
                    mask = data_bin[current_index + 8]
                    offset = 9
                    if mask & 1:
                        if not alarm:
                            alarm_value = unpack(
                                ">I",
                                data_bin[
                                    current_index + offset : current_index + offset + 4
                                ],
                            )[0]
                            alarm = alarm_value & 1 == 1
                        offset += 4
                    if mask & 2:
                        pos_mask = data_bin[current_index + offset]
                        offset += 1
                        if pos_mask & 1:
                            t = device_time
                            lon = convert_coords(
                                unpack(
                                    ">f",
                                    data_bin[
                                        current_index
                                        + 1
                                        + offset : current_index
                                        + 5
                                        + offset
                                    ],
                                )[0]
                            )
                            lat = convert_coords(
                                unpack(
                                    ">f",
                                    data_bin[
                                        current_index
                                        + 5
                                        + offset : current_index
                                        + 9
                                        + offset
                                    ],
                                )[0]
                            )
                            locs.append((t, lat, lon))
                            offset += 9
                        if pos_mask & 2:
                            wc = data_bin[current_index + offset]
                            offset += wc * 7
                        if pos_mask & 4:
                            cc = data_bin[current_index + offset]
                            offset += cc * 11
                        if pos_mask & 8:
                            tc = data_bin[current_index + offset]
                            offset += tc * 12
                        if pos_mask & 32:
                            offset += 4
                        if pos_mask & 64:
                            t = device_time
                            lon = convert_coords(
                                unpack(
                                    ">f",
                                    data_bin[
                                        current_index
                                        + 1
                                        + offset : current_index
                                        + 5
                                        + offset
                                    ],
                                )[0]
                            )
                            lat = convert_coords(
                                unpack(
                                    ">f",
                                    data_bin[
                                        current_index
                                        + 5
                                        + offset : current_index
                                        + 9
                                        + offset
                                    ],
                                )[0]
                            )
                            locs.append((t, lat, lon))
                            offset += 9
                        if pos_mask & 128:
                            dlen = unpack(
                                ">H",
                                data_bin[
                                    current_index + offset : current_index + 2 + offset
                                ],
                            )[0]
                            offset += 2
                            if dlen > 0:
                                dtype = data_bin[current_index + offset]
                                dlen2 = unpack(
                                    ">H",
                                    data_bin[
                                        current_index
                                        + offset
                                        + 1 : current_index
                                        + offset
                                        + 3
                                    ],
                                )[0]
                                offset += 3
                                if dtype == 71:
                                    t = device_time
                                    lon = convert_coords(
                                        unpack(
                                            ">d",
                                            data_bin[
                                                current_index
                                                + offset : current_index
                                                + offset
                                                + 8
                                            ],
                                        )[0]
                                    )
                                    lat = convert_coords(
                                        unpack(
                                            ">d",
                                            data_bin[
                                                current_index
                                                + offset
                                                + 8 : current_index
                                                + offset
                                                + 16
                                            ],
                                        )[0]
                                    )
                                    is_valid = data_bin[current_index + offset + 16] > 0
                                    if is_valid:
                                        locs.append((t, lat, lon))
                                offset += dlen2
                except Exception as e:
                    print(f"Xexun2 - Error parsing partial data ({e})", flush=True)
                    pass
                current_index += length

            if locs:
                await add_locations(self.db_device, locs)
                print(
                    f"Xexun2 - {self.imei} wrote {len(locs)} locations to DB",
                    flush=True,
                )

            if alarm:
                sos_device_aid, sos_lat, sos_lon, sos_sent_to = await send_sos(
                    self.db_device
                )
                print(
                    f"Xexun2 - SOS triggered by device {sos_device_aid}, {sos_lat}, {sos_lon}"
                    f" email sent to {sos_sent_to}",
                    flush=True,
                )


class TCPServer(GenericTCPServer):
    connection_class = Xexun2Connection
