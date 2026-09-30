import assert from "node:assert/strict";
import { test } from "node:test";
import { computeSwatchWindow } from "./swatches.ts";

const CATALOG_TOTAL = 505;

test("computeSwatchWindow mounts only a small slice of a large catalog", () => {
  const win = computeSwatchWindow({
    clientWidth: 900,
    scrollLeft: 0,
    scrollTop: 0,
    rows: 3,
    total: CATALOG_TOTAL,
  });
  assert.ok(win.end - win.start <= 60, `expected a narrow window, got ${win.end - win.start}`);
  assert.ok(win.end <= CATALOG_TOTAL);
  assert.equal(win.start, 0);
});

test("computeSwatchWindow scrolls the window forward without growing it", () => {
  const win = computeSwatchWindow({
    clientWidth: 900,
    scrollLeft: 0,
    scrollTop: 2000,
    rows: 3,
    total: CATALOG_TOTAL,
  });
  assert.ok(win.start > 0);
  assert.ok(win.end - win.start <= 60);
});

test("computeSwatchWindow never exceeds the catalog bounds", () => {
  const win = computeSwatchWindow({
    clientWidth: 900,
    scrollLeft: 0,
    scrollTop: 999999,
    rows: 3,
    total: CATALOG_TOTAL,
  });
  assert.ok(win.start <= CATALOG_TOTAL);
  assert.ok(win.end <= CATALOG_TOTAL);
});

test("computeSwatchWindow in single row mode widens with the viewport, not with the catalog", () => {
  const win = computeSwatchWindow({
    clientWidth: 900,
    scrollLeft: 0,
    scrollTop: 0,
    rows: 1,
    total: CATALOG_TOTAL,
  });
  assert.ok(win.end - win.start < 30, `expected a narrow single-row window, got ${win.end - win.start}`);
});

test("computeSwatchWindow handles an empty catalog", () => {
  const win = computeSwatchWindow({
    clientWidth: 900,
    scrollLeft: 0,
    scrollTop: 0,
    rows: 3,
    total: 0,
  });
  assert.equal(win.start, 0);
  assert.equal(win.end, 0);
});
