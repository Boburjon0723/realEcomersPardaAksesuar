/**
 * settings.about_mission_images — JSON qator (URL massivi) yoki eski about_mission_image
 */
export function getMissionImageUrls(settings) {
    if (!settings) return []
    try {
        const raw = settings.about_mission_images
        if (raw != null && raw !== '') {
            const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
            if (Array.isArray(arr) && arr.length) return arr.filter(Boolean)
        }
    } catch {
        /* ignore */
    }
    if (settings.about_mission_image) return [settings.about_mission_image]
    return []
}
