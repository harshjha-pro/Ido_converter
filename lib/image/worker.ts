/// <reference lib="webworker" />
import { makeThumb, processImage, type ProcessSettings } from "./engine";
import { convertImage, type ConvertSettings } from "./convert";

type Req =
  | { id: number; kind: "process"; file: Blob; settings: ProcessSettings }
  | { id: number; kind: "thumb"; file: Blob }
  | { id: number; kind: "convert"; file: Blob; settings: ConvertSettings };

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (e: MessageEvent<Req>) => {
  const msg = e.data;
  try {
    if (msg.kind === "process") {
      const result = await processImage(msg.file, msg.settings);
      scope.postMessage({ id: msg.id, ok: true, result });
    } else if (msg.kind === "convert") {
      const result = await convertImage(msg.file, msg.settings);
      scope.postMessage({ id: msg.id, ok: true, result });
    } else {
      const thumb = await makeThumb(msg.file);
      scope.postMessage({ id: msg.id, ok: true, result: thumb });
    }
  } catch (err) {
    scope.postMessage({ id: msg.id, ok: false, error: String(err) });
  }
};
