/**
 * Supabase Auth `User` → sayt `currentUser` (AppContext / Header / Checkout)
 * user_metadata kalitlari (country, phone, name) bir xil qolsin.
 */
export function mapAuthUserToAppUser(authUser) {
    if (!authUser) return null;
    const meta = authUser.user_metadata || {};
    const fromMetaName = meta.name ?? meta.display_name ?? meta.full_name;
    const name =
        fromMetaName != null && String(fromMetaName).trim() !== ''
            ? String(fromMetaName).trim()
            : authUser.email?.split('@')[0] || '';
    const fromMetaPhone = meta.phone ?? meta.phone_number;
    const phone =
        fromMetaPhone != null && String(fromMetaPhone).trim() !== ''
            ? String(fromMetaPhone).trim()
            : '';
    const countryRaw = meta.country;
    const country =
        countryRaw != null && String(countryRaw).trim() !== ''
            ? String(countryRaw).trim().toLowerCase()
            : 'uzbekistan';
    return {
        ...meta,
        id: authUser.id,
        email: authUser.email,
        name,
        phone,
        country,
    };
}
