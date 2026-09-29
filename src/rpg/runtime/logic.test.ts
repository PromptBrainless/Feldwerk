import assert from "node:assert/strict";
import { test } from "node:test";
import { EventInterpreter } from "./EventInterpreter.ts";
import { createEmptyGameState } from "./GameState.ts";
import { tryStep } from "./movement.ts";
import { paintCell } from "../editor/paint.ts";
import { isBlocked, resizeMap, tileAt } from "./tilemap.ts";
import { START, buildTown } from "./town.ts";
import { ObjectId } from "./types.ts";

test("interpreter zeigt die Zeile, dann den Schalter", () => {
  const state = createEmptyGameState("town");
  const interp = new EventInterpreter([
    { type: "message", text: "Hallo" },
    { type: "setSwitch", id: "sawSign", value: true },
  ]);
  interp.tick(state);
  assert.deepEqual([...interp.messages()], ["Hallo"]);
  assert.equal(state.switches.sawSign, undefined);
  interp.tick(state);
  assert.equal(state.switches.sawSign, true);
  assert.equal(interp.isDone(), true);
});

test("A geht nach links, D nach rechts, Sperre hält", () => {
  assert.deepEqual(tryStep((x) => x < 0, 4, 8, "left"), { x: 3, y: 8 });
  assert.deepEqual(tryStep(() => false, 4, 8, "right"), { x: 5, y: 8 });
  assert.deepEqual(tryStep(() => false, 4, 8, "up"), { x: 4, y: 7 });
  assert.equal(tryStep(() => true, 4, 8, "down"), null);
});

test("Beispielstadt: Start frei, Rand und Wasser zu", () => {
  const map = buildTown();
  assert.equal(isBlocked(map, START.x, START.y), false);
  assert.equal(isBlocked(map, START.x + 1, START.y), false);
  assert.equal(isBlocked(map, START.x - 1, START.y), false);
  assert.equal(isBlocked(map, START.x, START.y - 1), false);
  assert.equal(isBlocked(map, START.x, START.y + 1), false);
  assert.equal(isBlocked(map, 0, 8), true);
  assert.equal(isBlocked(map, 15, 3), true);
  assert.equal(isBlocked(map, 8, 7), true);
  assert.equal(map.messages["8,7"]?.includes("Beispielstadt"), true);
});

test("Karte wächst und schrumpft, Rand fällt weg", () => {
  const map = buildTown();
  assert.equal(resizeMap(map, 30, 18), true);
  assert.equal(map.width, 30);
  assert.equal(map.height, 18);
  assert.equal(tileAt(map, "objects", 8, 7), ObjectId.sign);
  assert.equal(map.messages["8,7"]?.includes("Beispielstadt"), true);
  assert.equal(isBlocked(map, 15, 3), true);
  assert.equal(resizeMap(map, 4, 4), true);
  assert.equal(map.width, 8);
  assert.equal(map.height, 8);
  assert.equal(map.spans["3,2"]?.w, 2);
  assert.equal(map.messages["8,7"], undefined);
  assert.equal(tileAt(map, "objects", 0, 0), ObjectId.tree);
});

test("Gebäudefläche blockiert und löst sich auf einmal", () => {
  const map = buildTown();
  const stamp = { w: 3, h: 2, solid: true, talk: true };
  assert.equal(paintCell(map, 6, 10, "brush", "object", 0, ObjectId.cottage, "Tür zu", false, stamp), true);
  for (let y = 10; y <= 11; y += 1) {
    for (let x = 6; x <= 8; x += 1) assert.equal(isBlocked(map, x, y), true);
  }
  assert.equal(map.messages["8,11"], "Tür zu");
  assert.equal(map.spans["6,10"]?.w, 3);
  assert.equal(paintCell(map, 7, 11, "erase", "object", 0, 0, "", false, { w: 1, h: 1, solid: true, talk: false }), true);
  assert.equal(isBlocked(map, 6, 10), false);
  assert.equal(isBlocked(map, 8, 11), false);
  assert.equal(map.spans["6,10"], undefined);
});

test("Blumenfläche bleibt begehbar, sperrender Boden nicht", () => {
  const map = buildTown();
  assert.equal(
    paintCell(map, 6, 4, "brush", "object", 0, ObjectId.flowers, "", false, { w: 2, h: 2, solid: false, talk: false }),
    true,
  );
  assert.equal(isBlocked(map, 6, 4), false);
  assert.equal(isBlocked(map, 7, 5), false);
  map.blockingGrounds.push(101);
  assert.equal(paintCell(map, 5, 8, "brush", "ground", 101, 0, "", false, { w: 1, h: 1, solid: false, talk: false }), true);
  assert.equal(tileAt(map, "ground", 5, 8), 101);
  assert.equal(isBlocked(map, 5, 8), true);
});
