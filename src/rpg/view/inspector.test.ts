import assert from "node:assert/strict";
import { test } from "node:test";
import { cellAhead, dirLabel, messageAhead, playerCell } from "./inspector.ts";
import type { TownMap } from "../runtime/types.ts";

function emptyMap(messages: Record<string, string> = {}): TownMap {
  return {
    formatVersion: 1,
    id: "test",
    name: "Test",
    tileSize: 64,
    width: 10,
    height: 10,
    layers: [],
    spans: {},
    messages,
  } as unknown as TownMap;
}

test("playerCell rundet Fließkomma-Positionen auf die aktuelle Zelle", () => {
  assert.deepEqual(playerCell(3.2, 4.8), { x: 3, y: 5 });
  assert.deepEqual(playerCell(3, 4), { x: 3, y: 4 });
});

test("cellAhead folgt der Blickrichtung, A verringert x, D erhöht x", () => {
  assert.deepEqual(cellAhead(5, 5, "left"), { x: 4, y: 5 });
  assert.deepEqual(cellAhead(5, 5, "right"), { x: 6, y: 5 });
  assert.deepEqual(cellAhead(5, 5, "up"), { x: 5, y: 4 });
  assert.deepEqual(cellAhead(5, 5, "down"), { x: 5, y: 6 });
});

test("messageAhead findet den Spruch der Zelle vor der Figur", () => {
  const map = emptyMap({ "6,5": "Willkommen" });
  assert.equal(messageAhead(map, 5, 5, "right"), "Willkommen");
  assert.equal(messageAhead(map, 5, 5, "left"), null);
});

test("dirLabel beschriftet alle vier Richtungen", () => {
  assert.equal(dirLabel("up"), "Norden");
  assert.equal(dirLabel("down"), "Süden");
  assert.equal(dirLabel("left"), "Westen");
  assert.equal(dirLabel("right"), "Osten");
});
