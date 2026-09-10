#!/usr/bin/env python3
"""
Converts stops.txt from "TTC Routes and Schedules" into GeoJSON

Usage:
    python ttc_stops_simple.py path/to/stops.txt

Requires: pandas 

Outputs (written to the current directory):
    ttc_stops.csv
    ttc_stops.geojson
"""

import sys
import json
import pandas as pd

def main():

    stops = pd.read_csv(sys.argv[1], dtype={"stop_code": str, "stop_id": str})
    stops = stops[["stop_code", "stop_id", "stop_name", "stop_lat", "stop_lon"]]

    # build GeoJSON structure (file format expected by Leaflet)
    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [row.stop_lon, row.stop_lat]},
            "properties": {
                "stop_code": row.stop_code,
                "stop_id": row.stop_id,
                "stop_name": row.stop_name, # properties holds extra info about the point
            },
        }
        for row in stops.itertuples()
    ] # creates list of dictionaries 
    with open("ttc_stops.geojson", "w") as file:
        json.dump({"type": "FeatureCollection", "features": features}, file) # a geoJSON FeatureCollection is a list of Features
    
    print("Wrote ttc_stops.geojson")


if __name__ == "__main__":
    main()