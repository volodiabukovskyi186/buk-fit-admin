export function getHSInputUnsupportedTypeError(type: string): Error {
  return Error(`Input type "${type}" isn't supported by matInput.`);
}
