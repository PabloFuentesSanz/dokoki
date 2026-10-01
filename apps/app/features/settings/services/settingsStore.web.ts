// En web los ajustes viven en memoria hasta que llegue la sincronización con la cuenta.
const memory = new Map<string, unknown>();

export async function readSetting(key: string): Promise<unknown> {
  return memory.get(key) ?? null;
}

export async function writeSetting(key: string, value: unknown): Promise<void> {
  memory.set(key, value);
}
