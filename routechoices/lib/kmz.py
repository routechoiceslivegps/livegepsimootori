from defusedxml import minidom

from routechoices.lib.helpers import (
    Wgs84Coordinate,
    wgs84_bound_from_latlon_box,
)


def extract_wgs84_bound_from_kml_ground_overlay(go):
    latlon_box_nodes = go.getElementsByTagName("LatLonBox")
    latlon_quad_nodes = go.getElementsByTagNameNS("*", "LatLonQuad")
    if len(latlon_box_nodes):
        latlon_box = latlon_box_nodes[0]
        north, east, south, west, rot = (
            float(latlon_box.getElementsByTagName(val)[0].firstChild.nodeValue)
            for val in ("north", "east", "south", "west", "rotation")
        )
        nw, ne, se, sw = wgs84_bound_from_latlon_box(north, east, south, west, rot)
    elif len(latlon_quad_nodes):
        latlon_quad = latlon_quad_nodes[0]
        corners_lonlat = (
            latlon_quad.getElementsByTagName("coordinates")[0]
            .firstChild.nodeValue.strip()
            .split(" ")
        )
        sw, se, ne, nw = (
            Wgs84Coordinate(list(float(x) for x in cc.split(",")[:2][::-1]))
            for cc in corners_lonlat
        )
    else:
        raise Exception("Invalid GroundOverlay: Missing Geo Calibration")
    return (nw, ne, se, sw)


def extract_ground_overlays_info(kml):
    doc = minidom.parseString(kml)
    out = []
    main_name = name = "Untitled"
    try:
        main_name = doc.getElementsByTagName("name")[0].firstChild.nodeValue
    except Exception:
        pass
    for go in doc.getElementsByTagName("GroundOverlay"):
        try:
            name = go.getElementsByTagName("name")[0].firstChild.nodeValue
        except Exception:
            name = "Untitled"
        try:
            href = (
                go.getElementsByTagName("Icon")[0]
                .getElementsByTagName("href")[0]
                .firstChild.nodeValue
            )
            bound = extract_wgs84_bound_from_kml_ground_overlay(go)
        except Exception:
            raise ValueError()
        if name == main_name:
            fullname = name
        else:
            fullname = f"{main_name} - {name}"
        out.append((fullname, href, bound))
    return out
