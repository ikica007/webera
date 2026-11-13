/**
 * Kadrovi snimka za skrol.
 *
 * Snimak nije <video>, nego paket slika (public/assets/vrijeme-*.bin).
 * Zato premotavanje naprijed i nazad ide kadar po kadar, glatko, na svakom
 * uređaju. Paket stiže u jednom fajlu i kadrovi su dostupni redom kako stižu.
 *
 * Format: "WEFP", verzija, broj kadrova, širina, visina, trajanje (ms),
 * ukupna veličina, tabela pozicija, pa WebP slike jedna za drugom.
 */

export type Pack = {
  count: number;
  width: number;
  height: number;
  /** trajanje originalnog snimka u sekundama */
  duration: number;
  /** koliko je kadrova stiglo sa mreže */
  available: number;
  /** 0–1, koliko je fajla stiglo */
  progress: number;
  failed: boolean;
  /** dekodiran kadar, ako je spreman */
  get(index: number): ImageBitmap | undefined;
  /** traži dekodiranje kadrova oko `index`, u smjeru kretanja */
  want(index: number, direction: number): void;
  dispose(): void;
};

const HEADER = 28;
const KEEP = 26;

export function loadPack(url: string): Pack {
  const cache = new Map<number, ImageBitmap>();
  const pending = new Set<number>();
  let offsets: Uint32Array | null = null;
  let buffer: Uint8Array | null = null;
  let loaded = 0;
  let disposed = false;
  let decoding = 0;

  const pack: Pack = {
    count: 0,
    width: 16,
    height: 9,
    duration: 15,
    available: 0,
    progress: 0,
    failed: false,
    get: (index) => cache.get(index),
    want(index, direction) {
      if (!offsets || !buffer) return;
      const ahead = direction >= 0 ? 7 : 3;
      const behind = direction >= 0 ? 3 : 7;
      // najprije traženi kadar, pa okolina
      decode(index);
      decode(index + 1);
      for (let step = 1; step <= Math.max(ahead, behind); step++) {
        if (step <= ahead) decode(index + 1 + step);
        if (step <= behind) decode(index - step);
      }
      if (cache.size > KEEP) {
        for (const key of cache.keys()) {
          if (Math.abs(key - index) > 12 && cache.size > KEEP - 6) {
            cache.get(key)?.close();
            cache.delete(key);
          }
        }
      }
    },
    dispose() {
      disposed = true;
      cache.forEach((bitmap) => bitmap.close());
      cache.clear();
    },
  };

  function decode(index: number) {
    if (!offsets || !buffer || disposed) return;
    if (index < 0 || index >= pack.available) return;
    if (cache.has(index) || pending.has(index) || decoding >= 4) return;
    pending.add(index);
    decoding++;
    const blob = new Blob([buffer.subarray(offsets[index], offsets[index + 1])], {
      type: "image/webp",
    });
    createImageBitmap(blob)
      .then((bitmap) => {
        if (disposed) bitmap.close();
        else cache.set(index, bitmap);
      })
      .catch(() => {})
      .finally(() => {
        pending.delete(index);
        decoding--;
      });
  }

  function parseHeader(bytes: Uint8Array) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint32(0, true) !== 0x50464557) throw new Error("nije paket kadrova");
    pack.count = view.getUint32(8, true);
    pack.width = view.getUint32(12, true);
    pack.height = view.getUint32(16, true);
    pack.duration = view.getUint32(20, true) / 1000;
    return view.getUint32(24, true);
  }

  (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok || !response.body) throw new Error("paket nije dostupan");
      const reader = response.body.getReader();
      let head = new Uint8Array(0);
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done || disposed) break;
        let chunk = value;
        if (!buffer) {
          // skupljamo zaglavlje dok ne saznamo veličinu i tabelu pozicija
          const merged = new Uint8Array(head.length + chunk.length);
          merged.set(head);
          merged.set(chunk, head.length);
          head = merged;
          if (head.length < HEADER) continue;
          total = parseHeader(head);
          const tableEnd = HEADER + (pack.count + 1) * 4;
          if (head.length < tableEnd) continue;
          buffer = new Uint8Array(total);
          chunk = head;
          const table = new Uint32Array(pack.count + 1);
          const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
          for (let i = 0; i <= pack.count; i++) table[i] = view.getUint32(HEADER + i * 4, true);
          offsets = table;
        }
        buffer.set(chunk.subarray(0, Math.min(chunk.length, total - loaded)), loaded);
        loaded = Math.min(total, loaded + chunk.length);
        pack.progress = loaded / total;
        while (pack.available < pack.count && offsets![pack.available + 1] <= loaded) {
          pack.available++;
        }
      }
      if (!buffer) throw new Error("prazan paket");
      pack.progress = 1;
    } catch {
      pack.failed = true;
    }
  })();

  return pack;
}
