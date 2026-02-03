/**
 * Capacitor platform detection utilities
 */

let Capacitor: typeof import('@capacitor/core').Capacitor | null = null;

// Dynamic import to avoid SSR issues
async function getCapacitor() {
  if (typeof window === 'undefined') return null;
  if (Capacitor) return Capacitor;

  try {
    const module = await import('@capacitor/core');
    Capacitor = module.Capacitor;
    return Capacitor;
  } catch {
    return null;
  }
}

/**
 * Check if running on a native platform (iOS/Android)
 */
export async function isNativePlatform(): Promise<boolean> {
  const cap = await getCapacitor();
  return cap?.isNativePlatform() ?? false;
}

/**
 * Get the current platform
 */
export async function getPlatform(): Promise<'ios' | 'android' | 'web'> {
  const cap = await getCapacitor();
  return (cap?.getPlatform() ?? 'web') as 'ios' | 'android' | 'web';
}

/**
 * Check if a plugin is available
 */
export async function isPluginAvailable(pluginName: string): Promise<boolean> {
  const cap = await getCapacitor();
  return cap?.isPluginAvailable(pluginName) ?? false;
}
