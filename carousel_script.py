import os
import sys
import yaml
import shutil
import subprocess
import re

valid_exts = (".jpg", ".jpeg", ".png")
name_pattern = re.compile(r"^Day\d+-\d{3}\..+$", re.IGNORECASE)

# --- Get trip name ---
if len(sys.argv) < 2:
    print("Usage: python3 carousel_script.py TRIP_NAME")
    sys.exit(1)

trip = sys.argv[1]
folder = os.path.join("images", trip)
yaml_file = os.path.join("_data/carousels", f"{trip}.yml")

if not os.path.isdir(folder):
    print(f"Error: folder {folder} does not exist.")
    sys.exit(1)

# --- Load YAML ---
if os.path.exists(yaml_file):
    with open(yaml_file) as f:
        data = yaml.safe_load(f) or {}
else:
    data = {}

def show_image(path):
    try:
        if os.name == "posix":
            subprocess.run(["open", path])
        elif os.name == "nt":
            os.startfile(path)
    except Exception:
        pass

def shift_files_and_captions(day_path, day, insert_pos, new_file, day_data):
    """Insert a new file and shift filenames and captions accordingly."""
    ext = os.path.splitext(new_file)[1].lower()

    # Get currently ordered files
    ordered = sorted(
        [f for f in os.listdir(day_path) if name_pattern.match(f) and f.lower().endswith(valid_exts)]
    )
    count = len(ordered)

    # Sort YAML entries to match the file order
    day_data.sort(key=lambda x: os.path.basename(x["url"]))

    # Renaming safely in reverse order to avoid overwrites
    for i in range(count, insert_pos - 1, -1):
        old_name = f"{day}-{i:03d}{ext}"
        new_name = f"{day}-{i + 1:03d}{ext}"
        old_path = os.path.join(day_path, old_name)
        new_path = os.path.join(day_path, new_name)
        if os.path.exists(old_path):
            shutil.move(old_path, new_path)

    # Shift captions down too
    day_data.insert(insert_pos - 1, {"url": None, "caption": None})
    for i in range(insert_pos, len(day_data)):
        entry = day_data[i]
        if entry["url"]:
            base = os.path.basename(entry["url"])
            new_base = f"{day}-{i+1:03d}{ext}"
            entry["url"] = "/" + os.path.join("images", trip, day, new_base).replace("\\", "/")

    # Move new file to its position
    new_name = f"{day}-{insert_pos:03d}{ext}"
    new_path = os.path.join(day_path, new_name)
    shutil.move(os.path.join(day_path, new_file), new_path)

    # Get caption for new file
    show_image(new_path)
    caption = input(f"Enter caption for {new_name}: ").strip()

    rel_path = "/" + os.path.join("images", trip, day, new_name).replace("\\", "/")
    day_data[insert_pos - 1] = {"url": rel_path, "caption": caption}

    # Renumber all captions to match filenames
    renumber_captions(day, day_path, day_data)
    return day_data

def renumber_captions(day, day_path, day_data):
    """Ensure captions are ordered consistently with renamed files."""
    files = sorted([f for f in os.listdir(day_path) if f.lower().endswith(valid_exts)])
    new_data = []
    for i, f in enumerate(files):
        ext = os.path.splitext(f)[1].lower()
        rel_path = "/" + os.path.join("images", trip, day, f).replace("\\", "/")
        # Reuse caption if already exists
        caption = ""
        if i < len(day_data) and os.path.basename(day_data[i].get("url", "")) == f:
            caption = day_data[i].get("caption", "")
        new_data.append({"url": rel_path, "caption": caption})
    day_data[:] = new_data

# --- Process each day ---
days = sorted([d for d in os.listdir(folder) if os.path.isdir(os.path.join(folder, d))])

for day in days:
    day_path = os.path.join(folder, day)
    files = sorted([f for f in os.listdir(day_path) if f.lower().endswith(valid_exts)])
    if not files:
        continue

    data.setdefault(day, [])
    print(f"\n--- Processing {day} ({len(files)} photos) ---")

    for fname in files:
        ext = os.path.splitext(fname)[1].lower()
        path = os.path.join(day_path, fname)

        # Only process new/unformatted files
        if not name_pattern.match(fname):
            show_image(path)

            ordered = sorted([f for f in os.listdir(day_path) if name_pattern.match(f) and f.lower().endswith(valid_exts)])
            count = len(ordered)

            print("\nCurrent order:")
            for i, f in enumerate(ordered, 1):
                print(f"  {i}. {f}")
            print(f"  {count + 1}. [Place at end]")

            while True:
                try:
                    pos = int(input(f"Select position (1–{count + 1}) for {fname}: "))
                    if 1 <= pos <= count + 1:
                        break
                    print("Out of range.")
                except ValueError:
                    print("Invalid number.")

            data[day] = shift_files_and_captions(day_path, day, pos, fname, data[day])
        else:
            # Already numbered, ensure caption exists
            new_name = fname
            rel_path = "/" + os.path.join("images", trip, day, new_name).replace("\\", "/")
            entry = next((x for x in data[day] if os.path.basename(x["url"]) == new_name), None)
            if not entry:
                show_image(path)
                caption = input(f"Enter caption for {new_name}: ").strip()
                data[day].append({"url": rel_path, "caption": caption})

    # Ensure final ordering
    renumber_captions(day, day_path, data[day])

# --- Save YAML ---
os.makedirs(os.path.dirname(yaml_file), exist_ok=True)
with open(yaml_file, "w") as f:
    yaml.dump(data, f, sort_keys=False, allow_unicode=True)

print(f"\n✅ Captions (and order) updated safely in {yaml_file}")
