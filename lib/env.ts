import "server-only";

export class EnvConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvConfigError";
  }
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function readEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

export function requireEnv(names: string[]) {
  const value = readEnv(names);

  if (!value) {
    throw new EnvConfigError(`${names.join(" or ")} must be configured.`);
  }

  return value;
}

export function assertAsciiEnv(name: string, value: string) {
  const invalidCharacter = [...value].find(
    (character) => character.charCodeAt(0) > 255
  );

  if (invalidCharacter) {
    throw new EnvConfigError(`${name} contains non-ASCII characters.`);
  }
}

export function validateProductionEnv(
  groups: Array<{ names: string[]; ascii?: boolean }>
) {
  if (!isProduction()) {
    return;
  }

  for (const group of groups) {
    const value = requireEnv(group.names);

    if (group.ascii) {
      assertAsciiEnv(group.names[0], value);
    }
  }
}
