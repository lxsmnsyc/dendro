export function defer(action: () => void | Promise<void>): Promise<void> {
  return Promise.resolve().then(action);
}
