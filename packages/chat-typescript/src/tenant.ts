export type TenantScope = Record<string, string>

export function matches(threadTenant: TenantScope, identityTenant: TenantScope): boolean {
  for (const [key, value] of Object.entries(threadTenant)) {
    if (identityTenant[key] !== value) return false
  }
  return true
}
