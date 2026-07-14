import zipfile
import json
import os
from lxml import etree

KMZ_PATH = "data/camps.kmz"
OUTPUT_PATH = "data/spots.json"

def kmz_to_json(kmz_path, output_path):
    # KMZ is just a zipped KML
    with zipfile.ZipFile(kmz_path, 'r') as kmz:
        # Find the main KML file inside
        kml_filename = next(
            name for name in kmz.namelist()
            if name.endswith('.kml')
        )
        with kmz.open(kml_filename) as kml_file:
            tree = etree.parse(kml_file)

    root = tree.getroot()
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}

    spots = []
    for placemark in root.iter('{http://www.opengis.net/kml/2.2}Placemark'):
        point = placemark.find('.//kml:Point/kml:coordinates', ns)
        if point is not None and point.text:
            coords = point.text.strip().split(',')
            if len(coords) >= 2:
                lng, lat = float(coords[0]), float(coords[1])
                spots.append({"lat": lat, "lng": lng})

    with open(output_path, 'w') as f:
        json.dump(spots, f)

    print(f"Wrote {len(spots)} spots to {output_path}")

if __name__ == "__main__":
    kmz_to_json(KMZ_PATH, OUTPUT_PATH)
