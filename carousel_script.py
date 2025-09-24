import os
import sys
import yaml
import shutil
import subprocess

valid_exts = (".jpg", ".jpeg", ".png")

# --- Get trip name from command line ---
if len(sys.argv) < 2:
    print("Usage: python3 carousel_script.py TRIP_NAME")
    sys.exit(1)

trip = sys.argv[1]
folder = os.path.join("images", trip)
yaml_file = os.path.join("_data/carousels", f"{trip}.yml")

if not os.path.isdir(folder):
    print(f"Error: folder {folder} does not exist.")
    sys.exit(1)

# --- Load existing YAML ---
if os.path.exists(yaml_file):
    with open(yaml_file) as f:
        data = yaml.safe_load(f) or {}
else:
    data = {}

# --- Process each day folder ---
days = sorted([d for d in os.listdir(folder) if os.path.isdir(os.path.join(folder, d))])

for day in days:
    day_path = os.path.join(folder, day)
    files = sorted([f for f in os.listdir(day_path) if f.lower().endswith(valid_exts)])
    
    # Ensure YAML section exists
    data.setdefault(day, [])

    # --- Build dict of existing captions using only filenames ---
    existing = {}
    for item in data[day]:
        existing_name = os.path.basename(item["file"])
        existing[existing_name] = item.get("caption", "")

    new_entries = []
    for idx, old_name in enumerate(files, start=1):
        ext = os.path.splitext(old_name)[1].lower()
        new_name = f"{day}-{idx:03d}{ext}"
        old_path = os.path.join(day_path, old_name)
        new_path = os.path.join(day_path, new_name)

        # Rename file if needed
        if old_name != new_name:
            if not os.path.exists(new_path):
                shutil.move(old_path, new_path)
                print(f"Renamed {old_name} -> {new_name}")
            else:
                print(f"Skipped renaming {old_name}, {new_name} already exists!")

        # Open image if no caption yet
        caption = existing.get(new_name, "")
        if not caption:
            print(f"\nOpening {new_path} ...")
            if os.name == 'posix':  # macOS/Linux
                subprocess.run(["open", new_path])
            elif os.name == 'nt':   # Windows
                os.startfile(new_path)
            caption = input(f"Enter caption for {new_name}: ").strip()

        rel_path = "/" + os.path.join("images", trip, day, new_name)
        new_entries.append({"url": rel_path.replace("\\", "/"), "caption": caption})

    # Update day in YAML
    data[day] = new_entries

# --- Save YAML back ---
with open(yaml_file, "w") as f:
    yaml.dump(data, f, sort_keys=False, allow_unicode=True)

print(f"\nCaptions updated in {yaml_file}")
