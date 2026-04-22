export type TenantScope = Record<string, string>

export function matches(threadTenant: TenantScope, identityTenant: TenantScope): boolean {
  for (const [key, value] of Object.entries(threadTenant)) {
    const iv = identityTenant[key]
    if (iv === '*') continue
    if (iv !== value) return false
  }
  return true
}
