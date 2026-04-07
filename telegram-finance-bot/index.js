/**
 * Telegram Finance Bot (CRM integration)
 * Flow:
 * 1) User sends phone number
 * 2) CRM whitelist check
 * 3) Menu: Moliya | Xodimlar
 * Moliya: bo'lim → material → miqdor → summa → izoh → material_movements
 * Xodimlar: ro'yxat (har birida shu oy avansi) → xodim → batafsil + avans / oylik to'lovi → CRM
 */

require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')

const BOT_TOKEN = process.env.BOT_TOKEN
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const BOT_USERS_TABLE = (process.env.BOT_USERS_TABLE || 'bot_users').trim()
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
        'Missing env vars: BOT_TOKEN, SUPABASE_URL, and one of SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY'
    )
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true })
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Running with SUPABASE_ANON_KEY fallback.')
}
console.log(`Auth lookup table (primary): ${BOT_USERS_TABLE}`)

// Simple per-user in-memory session (later: Redis/DB)
const sessions = new Map()

const STEP = {
    WAIT_PHONE: 'WAIT_PHONE',
    MAIN_MENU: 'MAIN_MENU',
    PICK_DEPARTMENT: 'PICK_DEPARTMENT',
    PICK_MATERIAL: 'PICK_MATERIAL',
    ENTER_AMOUNT: 'ENTER_AMOUNT',
    ENTER_NOTE: 'ENTER_NOTE',
    EMP_MENU: 'EMP_MENU',
    EMP_ACTION: 'EMP_ACTION',
    EMP_ADV_AMOUNT: 'EMP_ADV_AMOUNT',
    EMP_ADV_NOTE: 'EMP_ADV_NOTE',
    EMP_SAL_AMOUNT: 'EMP_SAL_AMOUNT',
    EMP_SAL_AMOUNT: 'EMP_SAL_AMOUNT',
    EMP_SAL_NOTE: 'EMP_SAL_NOTE',
    PICK_MONTH: 'PICK_MONTH',
}

const UI_EMP = {
    ADV: '💰 Avans kiritish',
    SAL: '💵 Oylik berish',
    LIST: "📋 Ro'yxat",
    MONTH: '📅 Oyni tanlash',
    SUMMARY: '📊 Oylik hisobot',
}

function normalizePhone(value) {
    return String(value || '').replace(/[^\d+]/g, '')
}

function canonicalPhone(value) {
    const digits = String(value || '').replace(/\D/g, '')
    if (!digits) return ''
    if (digits.startsWith('998') && digits.length >= 12) return digits.slice(-12)
    if (digits.length === 9) return `998${digits}`
    if (digits.length > 12) return digits.slice(-12)
    return digits
}

async function findAllowedUserByPhone(phone) {
    const candidates = [BOT_USERS_TABLE, 'users', 'customers']
    const inputCanonical = canonicalPhone(phone)
    for (const table of candidates) {
        let { data, error } = await supabase.from(table).select('*').eq('phone', phone).limit(1)
        if ((!data || !data.length) && !error) {
            // Fallback: DBdagi turli formatlarni bir xil ko'rinishga keltirib solishtiramiz.
            const scan = await supabase.from(table).select('*').limit(500)
            data = scan.data || []
            error = scan.error
            if (!error) {
                data = data.filter((row) => canonicalPhone(row.phone) === inputCanonical)
            }
        }
        if (error) {
            const msg = String(error.message || '')
            const tableMissing = msg.includes('Could not find the table') || msg.includes('does not exist')
            const colMissing = msg.includes("column 'phone' does not exist")
            if (tableMissing || colMissing) continue
            throw error
        }
        if (data && data[0]) {
            const row = data[0]
            const isActive = row.active === undefined ? true : !!row.active
            if (!isActive) return null
            return {
                id: row.id,
                full_name: row.full_name || row.name || 'User',
                phone: row.phone,
                source_table: table,
            }
        }
    }
    return null
}

async function getDepartments() {
    const { data, error } = await supabase
        .from('departments')
        .select('id, name_uz, name_ru, name_en, parent_id')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
}

async function getMaterialNames(limit = 24) {
    const { data, error } = await supabase
        .from('raw_materials')
        .select('name_uz, name_ru, name_en')
        .order('created_at', { ascending: false })
        .limit(limit)
    if (error) throw error
    const seen = new Set()
    const out = []
    for (const r of data || []) {
        const name = String(r.name_uz || r.name_ru || r.name_en || '').trim()
        if (!name) continue
        const key = name.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        out.push(name)
    }
    return out
}

async function resolveOrCreateMaterialByName(name) {
    const clean = String(name || '').trim()
    if (!clean) throw new Error('Material name required')

    const { data: existing, error: findErr } = await supabase
        .from('raw_materials')
        .select('id, name_uz')
        .ilike('name_uz', clean)
        .limit(1)
    if (findErr) throw findErr
    if (existing && existing[0]) return existing[0]

    const { data: inserted, error: insErr } = await supabase
        .from('raw_materials')
        .insert([
            {
                name_uz: clean,
                unit: 'pcs',
                unit_price: 0,
                track_stock: false,
                stock_quantity: null,
            },
        ])
        .select('id, name_uz')
        .single()
    if (insErr) throw insErr
    return inserted
}

function monthBoundsLocal(periodYm) {
    let y, m
    if (periodYm && /^\d{4}-\d{2}$/.test(periodYm)) {
        const parts = periodYm.split('-')
        y = parseInt(parts[0], 10)
        m = parseInt(parts[1], 10) - 1
    } else {
        const now = new Date()
        y = now.getFullYear()
        m = now.getMonth()
    }
    const pad = (n) => String(n).padStart(2, '0')
    const from = `${y}-${pad(m + 1)}-01`
    const lastDay = new Date(y, m + 1, 0).getDate()
    const to = `${y}-${pad(m + 1)}-${pad(lastDay)}`

    const monthNames = [
        'Yanvar',
        'Fevral',
        'Mart',
        'Aprel',
        'May',
        'Iyun',
        'Iyul',
        'Avgust',
        'Sentyabr',
        'Oktyabr',
        'Noyabr',
        'Dekabr',
    ]
    const label = `${monthNames[m]} ${y}`
    return { from, to, label, ym: `${y}-${pad(m + 1)}` }
}

function getMonthOptions() {
    const options = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const y = d.getFullYear()
        const m = d.getMonth()
        const pad = (n) => String(n).padStart(2, '0')
        const ym = `${y}-${pad(m + 1)}`
        const monthNames = [
            'Yanvar',
            'Fevral',
            'Mart',
            'Aprel',
            'May',
            'Iyun',
            'Iyul',
            'Avgust',
            'Sentyabr',
            'Oktyabr',
            'Noyabr',
            'Dekabr',
        ]
        options.push({ label: `${monthNames[m]} ${y}`, ym })
    }
    return options
}

/** Avans/oylik sanasi — server UTC emas, bot ishlayotgan mashinaning mahalliy kuni (CRM bilan mos). */
function todayYmdLocal() {
    const d = new Date()
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${mo}-${day}`
}

/** DATE ustuni: "YYYY-MM-DD..." — boshidagi 10 belgi kalendar sanasi (vaqt zonasi siljishisiz). */
function calendarYmdForFilter(value) {
    if (value == null || value === '') return ''
    const s = String(value).trim()
    const head = s.length >= 10 ? s.slice(0, 10) : ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function rowInMonthRange(ymdLocal, from, to) {
    return ymdLocal.length === 10 && ymdLocal >= from && ymdLocal <= to
}

async function getEmployees() {
    const { data, error } = await supabase
        .from('employees')
        .select('id, name, position, monthly_salary, bonus_percent')
        .order('name', { ascending: true })
        .limit(100)
    if (error) throw error
    return data || []
}

function formatDdMmYyyy(iso) {
    if (!iso) return ''
    const part = String(iso).split('T')[0]
    const [y, m, d] = part.split('-')
    if (!d || !m || !y) return part
    return `${d}.${m}.${y}`
}

/** Shu oy: barcha xodimlar bo'yicha avans yig'indisi + qatorlar (ro'yxat uchun) */
async function getAdvancesGroupedForMonth(periodYm) {
    const { from, to } = monthBoundsLocal(periodYm)
    const { data, error } = await supabase
        .from('employee_advances')
        .select('employee_id, amount, advance_date')
        .order('advance_date', { ascending: false })
        .limit(2000)
    if (error) {
        const m = String(error.message || '')
        if (
            m.includes('employee_advances') ||
            m.includes('schema cache') ||
            m.includes('does not exist')
        ) {
            return { byEmp: {}, tableMissing: true }
        }
        throw error
    }
    const byEmp = {}
    for (const r of data || []) {
        const ymd = calendarYmdForFilter(r.advance_date)
        if (!rowInMonthRange(ymd, from, to)) continue
        const id = r.employee_id != null ? String(r.employee_id) : ''
        if (!id) continue
        if (!byEmp[id]) byEmp[id] = { total: 0, rows: [] }
        const amt = Number(r.amount) || 0
        byEmp[id].total += amt
        byEmp[id].rows.push({ advance_date: r.advance_date, amount: amt })
    }
    for (const k of Object.keys(byEmp)) {
        byEmp[k].rows.sort((a, b) => String(b.advance_date).localeCompare(String(a.advance_date)))
    }
    return { byEmp, tableMissing: false }
}

async function advancesMonthDetail(employeeId, periodYm) {
    const { from, to } = monthBoundsLocal(periodYm)
    const { data, error } = await supabase
        .from('employee_advances')
        .select('amount, advance_date')
        .eq('employee_id', employeeId)
        .order('advance_date', { ascending: false })
        .limit(500)
    if (error) {
        const m = String(error.message || '')
        if (
            m.includes('employee_advances') ||
            m.includes('schema cache') ||
            m.includes('does not exist')
        ) {
            return { total: 0, rows: [], tableMissing: true }
        }
        throw error
    }
    const rows = (data || []).filter((r) =>
        rowInMonthRange(calendarYmdForFilter(r.advance_date), from, to)
    )
    const total = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0)
    return { total, rows, tableMissing: false }
}

async function salaryPaymentsMonthDetail(employeeId, periodYm) {
    const { from, to } = monthBoundsLocal(periodYm)
    const { data, error } = await supabase
        .from('employee_salary_payments')
        .select('amount, payment_date')
        .eq('employee_id', employeeId)
        .order('payment_date', { ascending: false })
        .limit(500)
    if (error) {
        const m = String(error.message || '')
        if (
            m.includes('employee_salary_payments') ||
            m.includes('schema cache') ||
            m.includes('does not exist')
        ) {
            return { total: 0, rows: [], tableMissing: true }
        }
        throw error
    }
    const rows = (data || []).filter((r) =>
        rowInMonthRange(calendarYmdForFilter(r.payment_date), from, to)
    )
    const total = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0)
    return { total, rows, tableMissing: false }
}

async function saveEmployeeAdvance({ user, employeeId, amount, note }) {
    const cleanNote = note && String(note).trim() !== '-' ? String(note).trim() : null
    const { error } = await supabase.from('employee_advances').insert([
        {
            employee_id: employeeId,
            amount,
            advance_date: todayYmdLocal(),
            note: cleanNote,
            source: 'telegram',
            recorded_by_phone: user.phone || null,
            recorded_by_name: user.full_name || null,
        },
    ])
    if (error) {
        const m = String(error.message || '')
        if (m.includes('employee_advances') || m.includes('schema cache') || m.includes('does not exist')) {
            throw new Error(
                "CRMda `employee_advances` jadvali yo'q. Supabase SQL Editor da loyihadagi add_employee_advances.sql faylini ishga tushiring."
            )
        }
        throw error
    }
}

async function saveEmployeeSalaryPayment({ user, employeeId, amount, note }) {
    const cleanNote = note && String(note).trim() !== '-' ? String(note).trim() : null
    const { error } = await supabase.from('employee_salary_payments').insert([
        {
            employee_id: employeeId,
            amount,
            payment_date: todayYmdLocal(),
            note: cleanNote,
            source: 'telegram',
            recorded_by_phone: user.phone || null,
            recorded_by_name: user.full_name || null,
        },
    ])
    if (error) {
        const m = String(error.message || '')
        if (
            m.includes('employee_salary_payments') ||
            m.includes('schema cache') ||
            m.includes('does not exist')
        ) {
            throw new Error(
                "CRMda `employee_salary_payments` jadvali yo'q. Loyihadagi add_employee_salary_payments.sql ni Supabase da ishga tushiring."
            )
        }
        throw error
    }
}

function parsePositiveAmount(text) {
    const n = Number(String(text || '').replace(/\s/g, '').replace(/,/g, '.'))
    return Number.isFinite(n) && n > 0 ? n : NaN
}

/** Telegram tugma matni ≤ 64 belgi */
function employeeMenuButtonText(emp, indexZeroBased) {
    const n = indexZeroBased + 1
    const name = String(emp.name || 'Xodim').trim() || 'Xodim'
    const pos = String(emp.position || '').trim()
    let s = pos ? `${n}. ${name} — ${pos}` : `${n}. ${name}`
    if (s.length > 64) {
        s = `${n}. ${name}`.slice(0, 64)
    }
    return s.slice(0, 64)
}

function employeeListKeyboard(list) {
    const rows = []
    for (let i = 0; i < list.length; i += 2) {
        const row = [{ text: employeeMenuButtonText(list[i], i) }]
        if (list[i + 1]) {
            row.push({ text: employeeMenuButtonText(list[i + 1], i + 1) })
        }
        rows.push(row)
    }
    rows.push([{ text: UI_EMP.MONTH }, { text: UI_EMP.SUMMARY }])
    rows.push([{ text: '⬅️ Orqaga' }])
    return {
        reply_markup: {
            keyboard: rows,
            resize_keyboard: true,
        },
    }
}

function findEmployeeByMenuText(list, text) {
    const t = String(text || '').trim()
    for (let i = 0; i < list.length; i++) {
        if (employeeMenuButtonText(list[i], i) === t) return list[i]
    }
    const n = parseInt(t, 10)
    if (Number.isFinite(n) && n >= 1 && n <= list.length) return list[n - 1]
    return null
}

function monthPickerKeyboard() {
    const options = getMonthOptions()
    const rows = []
    for (let i = 0; i < options.length; i += 2) {
        const row = [{ text: options[i].label }]
        if (options[i + 1]) row.push({ text: options[i + 1].label })
        rows.push(row)
    }
    rows.push([{ text: '⬅️ Orqaga' }])
    return {
        reply_markup: {
            keyboard: rows,
            resize_keyboard: true,
        },
    }
}

async function sendMonthPicker(chatId, s) {
    s.step = STEP.PICK_MONTH
    await bot.sendMessage(chatId, "Hisobot oyini tanlang:", monthPickerKeyboard())
}

async function sendMonthlySummary(chatId, s) {
    const periodYm = s.reportPeriodYm
    const { label } = monthBoundsLocal(periodYm)
    const list = await getEmployees()
    const { byEmp: advByEmp } = await getAdvancesGroupedForMonth(periodYm)

    // Oylik to'lovlarini ham yig'amiz
    const salByEmp = {}
    for (const e of list) {
        const { total } = await salaryPaymentsMonthDetail(e.id, periodYm)
        salByEmp[String(e.id)] = total
    }

    const lines = [
        `📊 Oylik hisobot: ${label}`,
        '',
        `Xodimlar soni: ${list.length}`,
        '--------------------------------',
    ]

    let totalAdv = 0
    let totalSal = 0

    for (const e of list) {
        const id = String(e.id)
        const adv = advByEmp[id]?.total || 0
        const sal = salByEmp[id] || 0
        totalAdv += adv
        totalSal += sal

        if (adv > 0 || sal > 0) {
            lines.push(`👤 ${e.name}:`)
            lines.push(`   💰 Avans: ${adv.toLocaleString('uz-UZ')} so'm`)
            lines.push(`   💸 Oylik: ${sal.toLocaleString('uz-UZ')} so'm`)
            lines.push(`   ✅ Jami: ${(adv + sal).toLocaleString('uz-UZ')} so'm`)
            lines.push('')
        }
    }

    lines.push('--------------------------------')
    lines.push(`💰 Jami Avans: ${totalAdv.toLocaleString('uz-UZ')} so'm`)
    lines.push(`💸 Jami Oylik: ${totalSal.toLocaleString('uz-UZ')} so'm`)
    lines.push(`✨ Umumiy to'lov: ${(totalAdv + totalSal).toLocaleString('uz-UZ')} so'm`)

    let msg = lines.join('\n')
    if (msg.length > 4000) msg = msg.slice(0, 3980) + '\n…'

    await bot.sendMessage(chatId, msg)
}

async function sendEmployeeList(chatId, s) {
    const list = await getEmployees()
    if (!list.length) {
        s.step = STEP.MAIN_MENU
        await bot.sendMessage(chatId, "Hozircha CRMda xodimlar yo'q. Avval CRM → Xodimlar bo'limida qo'shing.", mainMenuKeyboard())
        return
    }
    const periodYm = s.reportPeriodYm
    const { byEmp: advByEmp, tableMissing: advTableMissing } = await getAdvancesGroupedForMonth(periodYm)
    s.payload.empList = list
    s.step = STEP.EMP_MENU

    const { label } = monthBoundsLocal(periodYm)
    const lines = [
        `Xodimlar (${list.length}). Oy: ${label}`,
        '',
        "📊 Ushbu oydagi avanslar:",
    ]
    for (let i = 0; i < list.length; i++) {
        const e = list[i]
        const pack = advByEmp[String(e.id)]
        const total = pack ? pack.total : 0
        lines.push(`${i + 1}. ${e.name} — ${total.toLocaleString('uz-UZ')} so'm`)
    }
    lines.push('')
    lines.push("Xodimni tanlang, oyni o'zgartiring yoki umumiy hisobotni ko'ring.")
    if (advTableMissing) {
        lines.push('')
        lines.push("⚠️ `employee_advances` jadvali yo'q.")
    }

    let msg = lines.join('\n')
    if (msg.length > 3900) {
        msg = msg.slice(0, 3880) + '\n…'
    }
    await bot.sendMessage(chatId, msg, employeeListKeyboard(list))
}

async function sendEmployeeActionMenu(chatId, s) {
    const emp = s.payload.empSelected
    if (!emp) {
        await sendEmployeeList(chatId, s)
        return
    }
    const periodYm = s.reportPeriodYm
    const adv = await advancesMonthDetail(emp.id, periodYm)
    const salPay = await salaryPaymentsMonthDetail(emp.id, periodYm)
    const crmMonthly =
        (Number(emp.monthly_salary) || 0) + (Number(emp.bonus_percent) || 0)

    s.step = STEP.EMP_ACTION

    const advLines = []
    const maxRows = 18
    if (adv.rows.length === 0) {
        advLines.push('   (shu oy yozuv yo‘q)')
    } else {
        const slice = adv.rows.slice(0, maxRows)
        for (const r of slice) {
            advLines.push(
                `   • ${formatDdMmYyyy(r.advance_date)} — ${(Number(r.amount) || 0).toLocaleString('uz-UZ')} so'm`
            )
        }
        if (adv.rows.length > maxRows) {
            advLines.push(`   … va yana ${adv.rows.length - maxRows} ta`)
        }
    }

    const salLines = []
    if (salPay.rows.length === 0) {
        salLines.push('   (shu oy to‘lov yozuvi yo‘q)')
    } else {
        const sm = salPay.rows.slice(0, maxRows)
        for (const r of sm) {
            salLines.push(
                `   • ${formatDdMmYyyy(r.payment_date)} — ${(Number(r.amount) || 0).toLocaleString('uz-UZ')} so'm`
            )
        }
        if (salPay.rows.length > maxRows) {
            salLines.push(`   … va yana ${salPay.rows.length - maxRows} ta`)
        }
    }

    const warns = []
    if (adv.tableMissing) {
        warns.push(
            "\n⚠️ `employee_advances` jadvali yo'q — avans ko'rinmaydi. `add_employee_advances.sql` ni ishga tushiring."
        )
    }
    if (salPay.tableMissing) {
        warns.push(
            "\n⚠️ `employee_salary_payments` jadvali yo'q — oylik yozilmaydi. `add_employee_salary_payments.sql` ni ishga tushiring."
        )
    }

    const { label } = monthBoundsLocal(periodYm)
    const body = [
        `👤 ${emp.name}`,
        `💼 ${emp.position || '—'}`,
        '',
        `💵 CRM bo'yicha oylik+jami bonus: ${crmMonthly.toLocaleString('uz-UZ')} so'm`,
        '',
        `📅 ${label} avanslari jami: ${adv.total.toLocaleString('uz-UZ')} so'm`,
        ...advLines,
        '',
        `💸 ${label} oylik to'lovlari jami: ${salPay.total.toLocaleString('uz-UZ')} so'm`,
        ...salLines,
        warns.join(''),
        '',
        'Tugmalar: avans kiritish, oylik to‘lovi, yoki ro‘yxatga qaytish.',
    ].join('\n')

    let text = body
    if (text.length > 4000) {
        text = text.slice(0, 3980) + '\n…'
    }
    await bot.sendMessage(chatId, text, employeeActionKeyboard())
}

async function saveMovement({ user, departmentId, materialName, amount, note }) {
    const material = await resolveOrCreateMaterialByName(materialName)
    const qty = 1
    const total = Number(amount)
    if (!Number.isFinite(total) || total < 0) throw new Error('Invalid amount')

    const unitPrice = total
    const auditNote = `${note || ''}\n\n[telegram]\nuser: ${user.full_name || 'Unknown'}\nphone: ${user.phone || '-'}`

    const { error } = await supabase.from('material_movements').insert([
        {
            raw_material_id: material.id,
            department_id: departmentId,
            quantity: qty,
            total_cost: total,
            unit_price_snapshot: unitPrice,
            movement_date: new Date().toISOString().slice(0, 10),
            note: auditNote.trim(),
        },
    ])
    if (error) throw error
}

function getSession(chatId) {
    if (!sessions.has(chatId)) {
        sessions.set(chatId, {
            step: STEP.WAIT_PHONE,
            authUser: null,
            reportPeriodYm: null,
            payload: {},
        })
    }
    return sessions.get(chatId)
}

function employeeActionKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                [{ text: UI_EMP.ADV }, { text: UI_EMP.SAL }],
                [{ text: UI_EMP.LIST }],
                [{ text: '⬅️ Orqaga' }],
            ],
            resize_keyboard: true,
        },
    }
}

function mainMenuKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                [{ text: 'Moliya' }, { text: 'Xodimlar' }],
                [{ text: 'Moliya ro\'yxati' }]
            ],
            resize_keyboard: true,
        },
    }
}

function departmentKeyboard(departments) {
    const rows = (departments || []).map((d) => [{ text: d.name_uz || d.name_ru || d.name_en || String(d.id) }])
    rows.push([{ text: "⬅️ Orqaga" }])
    return {
        reply_markup: {
            keyboard: rows,
            resize_keyboard: true,
        },
    }
}

function materialKeyboard(materialNames) {
    const rows = []
    for (let i = 0; i < (materialNames || []).length; i += 2) {
        const row = [{ text: materialNames[i] }]
        if (materialNames[i + 1]) row.push({ text: materialNames[i + 1] })
        rows.push(row)
    }
    rows.push([{ text: "✍️ Yangi material yozaman" }, { text: "⬅️ Orqaga" }])
    return {
        reply_markup: {
            keyboard: rows,
            resize_keyboard: true,
        },
    }
}

function isBackText(text) {
    const t = String(text || '').trim().toLowerCase()
    return t === '⬅️ orqaga'.toLowerCase() || t === 'orqaga' || t === 'ortga'
}

async function sendDepartmentStep(chatId, s) {
    const depts = await getDepartments()
    s.payload.departments = depts
    s.step = STEP.PICK_DEPARTMENT
    await bot.sendMessage(chatId, "Bo'limni tanlang:", departmentKeyboard(depts))
}

async function sendMaterialStep(chatId, s) {
    s.step = STEP.PICK_MATERIAL
    const materialNames = await getMaterialNames()
    s.payload.materialNames = materialNames
    await bot.sendMessage(
        chatId,
        `Bo'lim: ${s.payload.departmentName || 'Bo‘lim'}\nMaterialni tanlang yoki yangisini yozing:`,
        materialKeyboard(materialNames)
    )
}

async function sendRecentMovements(chatId) {
    const { data, error } = await supabase
        .from('material_movements')
        .select(`
            id,
            total_cost,
            movement_date,
            raw_materials (name_uz),
            departments (name_uz)
        `)
        .order('created_at', { ascending: false })
        .limit(15)

    if (error) {
        console.error('Fetch movements error:', error)
        await bot.sendMessage(chatId, "Ro'yxatni olishda xatolik yuz berdi.")
        return
    }

    if (!data || data.length === 0) {
        await bot.sendMessage(chatId, "Hozircha harajatlar yo'q.")
        return
    }

    const lines = ["📊 Oxirgi 15 ta harajat:", ""]
    data.forEach((m, i) => {
        const material = m.raw_materials?.name_uz || 'Material'
        const department = m.departments?.name_uz || 'Bo\'lim'
        const date = formatDdMmYyyy(m.movement_date)
        const cost = Number(m.total_cost).toLocaleString('uz-UZ')
        lines.push(`${i + 1}. ${date} | ${material} (${department}): ${cost} so'm`)
    })

    await bot.sendMessage(chatId, lines.join('\n'))
}

async function goBack(chatId, s) {
    if (s.step === STEP.EMP_SAL_NOTE) {
        s.step = STEP.EMP_SAL_AMOUNT
        await bot.sendMessage(chatId, "Oylik to'lovi summasini kiriting (faqat raqam):")
        return
    }
    if (s.step === STEP.EMP_SAL_AMOUNT) {
        await sendEmployeeActionMenu(chatId, s)
        return
    }
    if (s.step === STEP.EMP_ADV_NOTE) {
        s.step = STEP.EMP_ADV_AMOUNT
        await bot.sendMessage(chatId, 'Avans summasini kiriting (faqat raqam):')
        return
    }
    if (s.step === STEP.EMP_ADV_AMOUNT) {
        await sendEmployeeActionMenu(chatId, s)
        return
    }
    if (s.step === STEP.EMP_ACTION) {
        await sendEmployeeList(chatId, s)
        return
    }
    if (s.step === STEP.EMP_MENU) {
        s.payload = {}
        s.step = STEP.MAIN_MENU
        await bot.sendMessage(chatId, 'Asosiy menyu:', mainMenuKeyboard())
        return
    }
    if (s.step === STEP.PICK_DEPARTMENT) {
        s.payload = {}
        s.step = STEP.MAIN_MENU
        await bot.sendMessage(chatId, 'Asosiy menyu:', mainMenuKeyboard())
        return
    }
    if (s.step === STEP.PICK_MATERIAL) {
        await sendDepartmentStep(chatId, s)
        return
    }
    if (s.step === STEP.ENTER_AMOUNT) {
        await sendMaterialStep(chatId, s)
        return
    }
    if (s.step === STEP.ENTER_NOTE) {
        s.step = STEP.ENTER_AMOUNT
        await bot.sendMessage(chatId, 'Summa kiriting:')
        return
    }
    if (s.step === STEP.PICK_MONTH) {
        await sendEmployeeList(chatId, s)
        return
    }
    s.payload = {}
    s.step = STEP.MAIN_MENU
    await bot.sendMessage(chatId, 'Asosiy menyu:', mainMenuKeyboard())
}

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id
    sessions.set(chatId, { step: STEP.WAIT_PHONE, authUser: null, payload: {} })
    await bot.sendMessage(chatId, 'Telefon raqamingizni yuboring (masalan: +99890xxxxxxx)')
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = String(msg.text || '').trim()
    if (!text || text.startsWith('/start')) return

    const s = getSession(chatId)

    try {
        if (isBackText(text)) {
            await goBack(chatId, s)
            return
        }

        if (s.authUser && text === 'Moliya') {
            delete s.payload.empList
            delete s.payload.empSelected
            delete s.payload.pendingAdvanceAmount
            delete s.payload.pendingSalaryAmount
            await sendDepartmentStep(chatId, s)
            return
        }

        if (s.authUser && text === 'Xodimlar') {
            await sendEmployeeList(chatId, s)
            return
        }

        if (s.authUser && text === 'Moliya ro\'yxati') {
            await sendRecentMovements(chatId)
            return
        }

        if (s.step === STEP.EMP_SAL_NOTE) {
            const amt = s.payload.pendingSalaryAmount
            const emp = s.payload.empSelected
            if (!emp || !amt) {
                await sendEmployeeList(chatId, s)
                return
            }
            await saveEmployeeSalaryPayment({
                user: s.authUser,
                employeeId: emp.id,
                amount: amt,
                note: text,
            })
            delete s.payload.pendingSalaryAmount
            await bot.sendMessage(
                chatId,
                `✅ Oylik to'lovi saqlandi: ${amt.toLocaleString('uz-UZ')} so'm — ${emp.name}.`
            )
            await sendEmployeeActionMenu(chatId, s)
            return
        }

        if (s.step === STEP.EMP_ADV_NOTE) {
            const amt = s.payload.pendingAdvanceAmount
            const emp = s.payload.empSelected
            if (!emp || !amt) {
                await sendEmployeeList(chatId, s)
                return
            }
            await saveEmployeeAdvance({
                user: s.authUser,
                employeeId: emp.id,
                amount: amt,
                note: text,
            })
            delete s.payload.pendingAdvanceAmount
            await bot.sendMessage(
                chatId,
                `✅ Avans saqlandi: ${amt.toLocaleString('uz-UZ')} so'm — ${emp.name}. CRM → Xodimlar bo'limida shu oy ustuni yangilanadi.`
            )
            await sendEmployeeActionMenu(chatId, s)
            return
        }

        if (s.step === STEP.EMP_SAL_AMOUNT) {
            const amt = parsePositiveAmount(text)
            if (Number.isNaN(amt)) {
                await bot.sendMessage(chatId, "Noto'g'ri summa. Musbat raqam kiriting (masalan: 500000 yoki 500000.5).")
                return
            }
            s.payload.pendingSalaryAmount = amt
            s.step = STEP.EMP_SAL_NOTE
            await bot.sendMessage(chatId, "Izoh (yo'q bo'lsa '-' yuboring):")
            return
        }

        if (s.step === STEP.EMP_ADV_AMOUNT) {
            const amt = parsePositiveAmount(text)
            if (Number.isNaN(amt)) {
                await bot.sendMessage(chatId, "Noto'g'ri summa. Musbat raqam kiriting (masalan: 500000 yoki 500000.5).")
                return
            }
            s.payload.pendingAdvanceAmount = amt
            s.step = STEP.EMP_ADV_NOTE
            await bot.sendMessage(chatId, "Izoh (yo'q bo'lsa '-' yuboring):")
            return
        }

        if (s.step === STEP.EMP_ACTION) {
            if (text === UI_EMP.ADV) {
                s.step = STEP.EMP_ADV_AMOUNT
                await bot.sendMessage(chatId, 'Avans summasini kiriting (so‘m, faqat raqam):')
                return
            }
            if (text === UI_EMP.SAL) {
                const emp = s.payload.empSelected
                const hint =
                    (Number(emp?.monthly_salary) || 0) + (Number(emp?.bonus_percent) || 0)
                s.step = STEP.EMP_SAL_AMOUNT
                await bot.sendMessage(
                    chatId,
                    `Oylik to'lovi summasini kiriting (so'm, faqat raqam).\nTavsiya (CRM maosh+bonus): ${hint.toLocaleString('uz-UZ')} so'm`
                )
                return
            }
            if (text === UI_EMP.LIST) {
                await sendEmployeeList(chatId, s)
                return
            }
            await bot.sendMessage(
                chatId,
                `Tugmalardan tanlang: ${UI_EMP.ADV} / ${UI_EMP.SAL} / ${UI_EMP.LIST}`
            )
            return
        }

        if (s.step === STEP.PICK_MONTH) {
            const options = getMonthOptions()
            const chosen = options.find((o) => o.label === text)
            if (!chosen) {
                await bot.sendMessage(chatId, "Iltimos, menyudagi oylardan birini tanlang.")
                return
            }
            s.reportPeriodYm = chosen.ym
            await bot.sendMessage(chatId, `✅ Hisobot davri o'zgartirildi: ${chosen.label}`)
            await sendEmployeeList(chatId, s)
            return
        }

        if (s.step === STEP.EMP_MENU) {
            if (text === UI_EMP.MONTH) {
                await sendMonthPicker(chatId, s)
                return
            }
            if (text === UI_EMP.SUMMARY) {
                await sendMonthlySummary(chatId, s)
                return
            }
            const list = s.payload.empList || []
            const chosen = findEmployeeByMenuText(list, text)
            if (!chosen) {
                await bot.sendMessage(
                    chatId,
                    `Menyudagi tugmani bosing yoki 1–${list.length} orasida raqam yuboring.`
                )
                return
            }
            s.payload.empSelected = chosen
            await sendEmployeeActionMenu(chatId, s)
            return
        }

        if (s.step === STEP.WAIT_PHONE) {
            const phone = normalizePhone(text)
            const user = await findAllowedUserByPhone(phone)
            if (!user) {
                await bot.sendMessage(chatId, 'Ruxsat berilmagan. CRMda raqamingiz topilmadi (reject).')
                return
            }
            s.authUser = user
            s.step = STEP.MAIN_MENU
            await bot.sendMessage(
                chatId,
                `Xush kelibsiz, ${user.full_name || 'foydalanuvchi'}.\nBo'limni tanlang:`,
                mainMenuKeyboard()
            )
            return
        }

        if (s.step === STEP.MAIN_MENU) {
            await bot.sendMessage(chatId, "Iltimos, menyudan bo'lim tanlang.")
            return
        }

        if (s.step === STEP.PICK_DEPARTMENT) {
            const chosen = (s.payload.departments || []).find((d) => {
                const name = String(d.name_uz || d.name_ru || d.name_en || '').trim()
                return name.toLowerCase() === text.toLowerCase()
            })
            if (!chosen) {
                await bot.sendMessage(chatId, "Noto'g'ri tanlov. Bo'limni tugmadan tanlang.")
                return
            }
            s.payload.departmentId = chosen.id
            s.payload.departmentName = chosen.name_uz || chosen.name_ru || chosen.name_en || 'Bo‘lim'
            await sendMaterialStep(chatId, s)
            return
        }

        if (s.step === STEP.PICK_MATERIAL) {
            if (text === "✍️ Yangi material yozaman") {
                await bot.sendMessage(chatId, 'Yangi material nomini yozing:')
                return
            }
            s.payload.materialName = text
            s.step = STEP.ENTER_AMOUNT
            await bot.sendMessage(chatId, 'Summa kiriting:')
            return
        }

        if (s.step === STEP.ENTER_AMOUNT) {
            s.payload.amount = text
            s.step = STEP.ENTER_NOTE
            await bot.sendMessage(chatId, "Izoh yuboring (yo'q bo'lsa '-'):")
            return
        }

        if (s.step === STEP.ENTER_NOTE) {
            await saveMovement({
                user: s.authUser,
                departmentId: s.payload.departmentId,
                materialName: s.payload.materialName,
                amount: s.payload.amount,
                note: text === '-' ? '' : text,
            })

            s.payload = {}
            s.step = STEP.MAIN_MENU
            await bot.sendMessage(chatId, "Saqlandi. Ma'lumot CRM moliya bo'limiga yuborildi.", mainMenuKeyboard())
            return
        }
    } catch (err) {
        console.error('Bot error:', err)
        await bot.sendMessage(chatId, `Xatolik: ${err.message}`)
    }
})

console.log('Telegram finance bot started...')
