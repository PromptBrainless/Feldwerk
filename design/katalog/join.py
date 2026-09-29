#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent

def join() -> dict:
    index = json.loads((HERE / "index.json").read_text())
    items = []
    for block in index["bloecke"]:
        name = Path(block["datei"]).name
        chunk = json.loads((HERE / name).read_text())
        items.extend(chunk["items"])
    return {
        "projekt": index["projekt"],
        "t": index["t"],
        "objectalignment": index["objectalignment"],
        "origin": index["origin"],
        "items": items,
    }

if __name__ == "__main__":
    data = join()
    print(len(data["items"]), "items")
