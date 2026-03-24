/** O'zbekiston: viloyat → shahar/tuman kalitlari (translations.js dagi t() bilan) */
export const OTHER_VALUE = '__other__';

export const UZBEKISTAN_REGIONS = [
    { id: 'region_tashkent_city', cities: ['tashkent'] },
    { id: 'region_karakalpakstan', cities: ['nukus'] },
    { id: 'region_andijan', cities: ['andijan'] },
    { id: 'region_bukhara', cities: ['bukhara'] },
    { id: 'region_fergana', cities: ['fergana'] },
    { id: 'region_jizzakh', cities: ['jizzakh'] },
    { id: 'region_kashkadarya', cities: ['karshi'] },
    { id: 'region_navoi', cities: ['navoi'] },
    { id: 'region_namangan', cities: ['namangan'] },
    { id: 'region_samarkand', cities: ['samarkand'] },
    { id: 'region_surkhandarya', cities: ['termez'] },
    { id: 'region_syrdarya', cities: ['gulistan'] },
    { id: 'region_tashkent', cities: ['chirchiq', 'angren'] },
    { id: 'region_khorezm', cities: ['urgench'] }
];

export function getCitiesForRegion(regionId) {
    const r = UZBEKISTAN_REGIONS.find((x) => x.id === regionId);
    return r ? r.cities : [];
}
