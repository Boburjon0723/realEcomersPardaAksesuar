/**
 * Rang boshqaruvi - Boshqaruv panelida yangi rang qo'shish va tahrirlash
 * O'zbekcha, Ruscha, Inglizcha nomlar uchun alohida inputlar
 */
import React, { useState, useEffect } from 'react';
import { getAllColors, addColor, updateColor, deleteColor } from '../../services/supabase/products';

const LABELS = {
    uz: {
        title: 'Ranglar boshqaruvi',
        addNew: "Yangi rang qo'shish",
        nameUz: "Nom (O'zbekcha)",
        nameRu: 'Nom (Ruscha)',
        nameEn: 'Nom (Inglizcha)',
        hexCode: 'Hex kodi',
        actions: 'Amallar',
        save: 'Saqlash',
        cancel: 'Bekor qilish',
        delete: "O'chirish",
        edit: 'Tahrirlash',
        success: 'Muvaffaqiyatli saqlandi',
        error: 'Xatolik',
        required: "Kamida bitta til uchun nom kiriting",
    },
    ru: {
        title: 'Управление цветами',
        addNew: 'Добавить новый цвет',
        nameUz: 'Название (Узбекский)',
        nameRu: 'Название (Русский)',
        nameEn: 'Название (Английский)',
        hexCode: 'Hex код',
        actions: 'Действия',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Редактировать',
        success: 'Успешно сохранено',
        error: 'Ошибка',
        required: 'Введите название хотя бы на одном языке',
    },
    en: {
        title: 'Color management',
        addNew: 'Add new color',
        nameUz: 'Name (Uzbek)',
        nameRu: 'Name (Russian)',
        nameEn: 'Name (English)',
        hexCode: 'Hex code',
        actions: 'Actions',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        success: 'Saved successfully',
        error: 'Error',
        required: 'Enter name in at least one language',
    },
};

export default function ColorManagement({ lang = 'uz', onSuccess }) {
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name_uz: '', name_ru: '', name_en: '', hex_code: '#000000' });

    const t = LABELS[lang] || LABELS.uz;

    const loadColors = async () => {
        setLoading(true);
        setError('');
        const res = await getAllColors();
        if (res.success) setColors(res.colors || []);
        else setError(res.error || 'Ranglarni yuklashda xatolik');
        setLoading(false);
    };

    useEffect(() => { loadColors(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name_uz, name_ru, name_en, hex_code } = form;
        if (!name_uz?.trim() && !name_ru?.trim() && !name_en?.trim()) {
            setError(t.required);
            return;
        }
        if (!hex_code?.trim()) {
            setError('Hex kod kiriting');
            return;
        }
        setError('');
        setSuccess('');
        if (editingId) {
            const res = await updateColor(editingId, form);
            if (res.success) {
                setSuccess(t.success);
                setEditingId(null);
                setForm({ name_uz: '', name_ru: '', name_en: '', hex_code: '#000000' });
                loadColors();
                onSuccess?.();
            } else setError(res.error || t.error);
        } else {
            const res = await addColor(form);
            if (res.success) {
                setSuccess(t.success);
                setShowForm(false);
                setForm({ name_uz: '', name_ru: '', name_en: '', hex_code: '#000000' });
                loadColors();
                onSuccess?.();
            } else setError(res.error || t.error);
        }
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setForm({
            name_uz: c.name_uz || c.name || '',
            name_ru: c.name_ru || '',
            name_en: c.name_en || '',
            hex_code: c.hex_code || '#000000',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`${t.delete}?`)) return;
        const res = await deleteColor(id);
        if (res.success) {
            loadColors();
            if (editingId === id) setEditingId(null);
        } else setError(res.error || t.error);
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
        setForm({ name_uz: '', name_ru: '', name_en: '', hex_code: '#000000' });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.title}</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                >
                    {t.addNew}
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameUz}</label>
                        <input
                            type="text"
                            value={form.name_uz}
                            onChange={(e) => setForm((f) => ({ ...f, name_uz: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Oq, Qora, Kulrang..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameRu}</label>
                        <input
                            type="text"
                            value={form.name_ru}
                            onChange={(e) => setForm((f) => ({ ...f, name_ru: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Белый, Черный..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameEn}</label>
                        <input
                            type="text"
                            value={form.name_en}
                            onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="White, Black..."
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.hexCode}</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={form.hex_code === 'transparent' ? '#ffffff' : form.hex_code}
                                    onChange={(e) => setForm((f) => ({ ...f, hex_code: e.target.value }))}
                                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={form.hex_code}
                                    onChange={(e) => setForm((f) => ({ ...f, hex_code: e.target.value }))}
                                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
                            {t.save}
                        </button>
                        <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            {t.cancel}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="text-gray-500">Yuklanmoqda...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Rang</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">O'zbekcha</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Ruscha</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Inglizcha</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Hex</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {colors.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        <div
                                            className="w-8 h-8 rounded border border-gray-300"
                                            style={{ backgroundColor: c.hex_code === 'transparent' ? 'transparent' : (c.hex_code || '#ccc') }}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-sm">{c.name_uz || c.name || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{c.name_ru || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{c.name_en || '-'}</td>
                                    <td className="px-4 py-2 text-sm font-mono">{c.hex_code || '-'}</td>
                                    <td className="px-4 py-2 flex gap-2">
                                        <button onClick={() => handleEdit(c)} className="text-primary hover:underline text-sm">{t.edit}</button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-sm">{t.delete}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
