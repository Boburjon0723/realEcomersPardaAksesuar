/**
 * Ombor / BOM / production + raw_materials ustunlarini Supabase da tekshiradi.
 * Ishlatish: node scripts/check-warehouse-db.js
 */
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return
    const text = fs.readFileSync(filePath, 'utf8')
    for (const line of text.split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith('#')) continue
        const i = t.indexOf('=')
        if (i < 0) continue
        const k = t.slice(0, i).trim()
        let v = t.slice(i + 1).trim()
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1)
        }
        if (!process.env[k]) process.env[k] = v
    }
}

const root = path.join(__dirname, '..')
loadEnvFile(path.join(root, 'CRM-tizimi-', '.env.local'))
loadEnvFile(path.join(root, 'CRM-tizimi-', '.env'))
loadEnvFile(path.join(root, '.env'))
loadEnvFile(path.join(root, 'telegram-finance-bot', '.env'))

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL ||
    process.env.SUPABASE_URL
const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('FAIL: SUPABASE_URL / KEY topilmadi (.env.local)')
    process.exit(1)
}

let createClient
try {
    createClient = require(path.join(
        root,
        'telegram-finance-bot',
        'node_modules',
        '@supabase',
        'supabase-js'
    )).createClient
} catch (_) {
    try {
        createClient = require(path.join(
            root,
            'CRM-tizimi-',
            'node_modules',
            '@supabase',
            'supabase-js'
        )).createClient
    } catch (e) {
        console.error('FAIL: @supabase/supabase-js o‘rnatilmagan')
        process.exit(1)
    }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const checks = []

function ok(name, detail) {
    checks.push({ name, pass: true, detail: detail || '' })
    console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`)
}
function fail(name, detail) {
    checks.push({ name, pass: false, detail: String(detail || '') })
    console.log(`❌ ${name} — ${detail}`)
}

async function probeSelect(label, table, columns) {
    const { data, error } = await supabase.from(table).select(columns).limit(1)
    if (error) {
        const msg = error.message || String(error)
        if (/does not exist|schema cache/i.test(msg)) {
            fail(label, msg)
            return { ok: false, error: msg }
        }
        // RLS / permission — jadval bor, lekin o‘qib bo‘lmasligi mumkin
        if (/permission|policy|row-level|JWT|anon/i.test(msg)) {
            ok(label, `jadval/ustun mavjud (RLS: ${msg.slice(0, 80)})`)
            return { ok: true, rls: true }
        }
        fail(label, msg)
        return { ok: false, error: msg }
    }
    ok(label, `ok (rows sample: ${Array.isArray(data) ? data.length : 0})`)
    return { ok: true, data }
}

async function probeInsertDelete(label, table, row, idField = 'id') {
    const { data, error } = await supabase.from(table).insert([row]).select(idField).limit(1)
    if (error) {
        const msg = error.message || String(error)
        if (/does not exist|schema cache/i.test(msg)) {
            fail(label, msg)
            return false
        }
        if (/permission|policy|row-level|violates/i.test(msg)) {
            ok(label, `sxema OK, yozish RLS/constraint: ${msg.slice(0, 100)}`)
            return true
        }
        fail(label, msg)
        return false
    }
    const id = data?.[0]?.[idField]
    if (id) {
        await supabase.from(table).delete().eq(idField, id)
    }
    ok(label, 'insert+delete OK')
    return true
}

async function main() {
    console.log(`Supabase: ${SUPABASE_URL}`)
    console.log('--- Ombor sxema tekshiruvi ---\n')

    await probeSelect(
        'raw_materials (ombor ustunlari)',
        'raw_materials',
        'id, name_uz, unit, unit_price, unit_price_uzs, track_stock, stock_quantity, sku, item_kind, min_stock, note, is_active'
    )

    await probeSelect(
        'material_stock_movements',
        'material_stock_movements',
        'id, raw_material_id, qty, type, balance_after, note, created_at'
    )

    await probeSelect('product_bom', 'product_bom', 'id, product_id, material_id, qty_per_unit, note')

    await probeSelect(
        'production_runs',
        'production_runs',
        'id, product_id, qty, color_key, status, note, produced_at'
    )

    await probeSelect(
        'products (Retseptlar uchun — sku YO‘Q)',
        'products',
        'id, name, name_uz, size, is_active'
    )

    // products.sku bo‘lmasligi kerak — noto‘g‘ri select xato bersa OK (bizda yo‘q)
    {
        const { error } = await supabase.from('products').select('id, sku').limit(1)
        if (error && /sku/i.test(error.message || '')) {
            ok('products.sku yo‘q (kutilgan)', 'kod size ishlatadi')
        } else if (!error) {
            ok('products.sku mavjud (ixtiyoriy)', 'ham ishlaydi')
        } else {
            fail('products.sku probe', error.message)
        }
    }

    await probeSelect(
        'departments (bot moliya)',
        'departments',
        'id, name_uz, parent_id, is_active, sort_order'
    )

    await probeSelect(
        'material_movements (bot moliya xarajat)',
        'material_movements',
        'id, raw_material_id, department_id, total_cost, movement_date'
    )

    // track_stock materiallar
    {
        const { data, error } = await supabase
            .from('raw_materials')
            .select('id, name_uz, stock_quantity, min_stock, track_stock')
            .eq('track_stock', true)
            .eq('is_active', true)
            .limit(5)
        if (error) fail('track_stock materiallar', error.message)
        else {
            ok('track_stock materiallar', `${data?.length || 0} ta (limit 5)`)
            if (data?.length) {
                const m = data[0]
                const stock = Number(m.stock_quantity) || 0
                const min = Number(m.min_stock) || 0
                const status = stock <= 0 ? 'out' : min > 0 && stock <= min ? 'low' : 'ok'
                ok('stock status mantiq (namuna)', `${m.name_uz}: stock=${stock} min=${min} → ${status}`)
            }
        }
    }

    // Harakat yozish (agar material topilsa) — faqat test, keyin qaytarish
    {
        const { data: mats } = await supabase
            .from('raw_materials')
            .select('id, stock_quantity, name_uz')
            .eq('track_stock', true)
            .limit(1)
        const mat = mats?.[0]
        if (!mat) {
            fail('stock move roundtrip', 'track_stock material yo‘q — CRM da qo‘shing')
        } else {
            const current = Number(mat.stock_quantity) || 0
            const delta = 0.001
            const newBal = current + delta
            const { data: mov, error: moveErr } = await supabase
                .from('material_stock_movements')
                .insert([
                    {
                        raw_material_id: mat.id,
                        qty: delta,
                        type: 'adjust',
                        balance_after: newBal,
                        note: 'AUTOTEST roundtrip — delete me',
                        ref_type: 'autotest',
                    },
                ])
                .select('id')
                .limit(1)

            if (moveErr) {
                const msg = moveErr.message || String(moveErr)
                if (/permission|policy|row-level/i.test(msg)) {
                    ok(
                        'stock move roundtrip',
                        `jadval OK, anon RLS insert bloklagan (bot service_role bilan yozadi)`
                    )
                } else {
                    fail('stock move roundtrip', msg)
                }
            } else {
                const moveId = mov?.[0]?.id
                const { error: updErr } = await supabase
                    .from('raw_materials')
                    .update({ stock_quantity: newBal })
                    .eq('id', mat.id)
                if (updErr) fail('stock update', updErr.message)
                else {
                    // qaytarish
                    await supabase
                        .from('raw_materials')
                        .update({ stock_quantity: current })
                        .eq('id', mat.id)
                    if (moveId) await supabase.from('material_stock_movements').delete().eq('id', moveId)
                    ok('stock move roundtrip', `${mat.name_uz}: insert+update+rollback OK`)
                }
            }
        }
    }

    const passed = checks.filter((c) => c.pass).length
    const failed = checks.filter((c) => !c.pass).length
    console.log(`\n--- Natija: ${passed} OK, ${failed} FAIL ---`)
    process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
