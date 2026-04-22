from __future__ import annotations

TenantScope = dict[str, str]


def matches(thread_tenant: TenantScope, identity_tenant: TenantScope) -> bool:
    for key, value in thread_tenant.items():
        iv = identity_tenant.get(key)
        if iv == "*":
            continue
        if iv != value:
            return False
    return True
