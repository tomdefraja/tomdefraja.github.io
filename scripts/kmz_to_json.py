import zipfile
import json
from xml.etree import ElementTree as ET

KMZ_PATH = "data/camps.kmz"
OUTPUT_PATH = "data/spots.json"

# maps.me colour -> (category label, hex used for map markers)
# Add a line here whenever you start using a new maps.me colour.
COLOR_MAP = {
    "red":    ("Hosted",        "#e53935"),
    "orange": ("Wild camp",     "#fb8c00"),
    "yellow": ("Accommodation", "#fdd835"),
}

def fallback_category(color):
    return (color.capitalize(), "#9e9e9e")

def load_kml_bytes(kmz_path):
    with zipfile.ZipFile(kmz_path) as z:
        kml_name = next(n for n in z.namelist() if n.lower().endswith(".kml"))
        return z.read(kml_name)

def parse_placemarks(kml_bytes):
    ns = {"kml": "http://earth.google.com/kml/2.2"}
    root = ET.fromstring(kml_bytes)
    spots = []
    for pm in root.iter("{http://earth.google.com/kml/2.2}Placemark"):
        name_el = pm.find("kml:name", ns)
        desc_el = pm.find("kml:description", ns)
        time_el = pm.find("kml:TimeStamp/kml:when", ns)
        style_el = pm.find("kml:styleUrl", ns)
        coord_el = pm.find("kml:Point/kml:coordinates", ns)

        if coord_el is None or coord_el.text is None:
            continue

        lng_str, lat_str, *_ = coord_el.text.strip().split(",")
        color = (style_el.text or "").replace("#placemark-", "") if style_el is not None else ""
        category, hexcode = COLOR_MAP.get(color, fallback_category(color) if color else ("Unknown", "#9e9e9e"))
        date_str = time_el.text[:10] if time_el is not None and time_el.text else None

        spots.append({
            "name": (name_el.text or "").strip() if name_el is not None else "",
            "description": (desc_el.text or "").strip() if desc_el is not None else "",
            "date": date_str,
            "lat": float(lat_str),
            "lng": float(lng_str),
            "color": color,
            "category": category,
            "categoryHex": hexcode,
        })
    return spots

def main():
    kml_bytes = load_kml_bytes(KMZ_PATH)
    spots = parse_placemarks(kml_bytes)
    spots.sort(key=lambda s: s["date"] or "")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(spots, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(spots)} spots to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()