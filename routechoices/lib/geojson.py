def get_geojson_coordinates(gj):
    if gj["type"] == "Point" and gj["coordinates"]:
        return gj["coordinates"]
    elif gj["type"] in ("LineString", "MultiPoint") and gj["coordinates"]:
        return gj["coordinates"][0]
    elif gj["type"] in ("Polygon", "MultiLineString") and gj["coordinates"]:
        return gj["coordinates"][0][0]
    elif gj["type"] == "MultiPolygon" and gj["coordinates"]:
        return gj["coordinates"][0][0][0]
    elif gj["type"] == "Feature" and gj["geometry"]:
        return get_geojson_coordinates(gj["geometry"])
    elif gj["type"] == "GeometryCollection" and gj["geometries"]:
        return get_geojson_coordinates(gj["geometries"][0])
    elif gj["type"] == "FeatureCollection" and gj["features"]:
        return get_geojson_coordinates(gj["features"][0])
    return None
