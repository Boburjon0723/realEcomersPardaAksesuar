import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getGeminiKey() {
    return (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '').trim()
}

/** 
 * User specifically requested gemini-2.0-flash-lite in the recent task.
 * We'll prioritize that if specified in env, otherwise fallback to their standard 2.0-flash.
 */
function pickGeminiModel() {
    return (process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash-lite').trim()
}

export async function POST(request) {
    const geminiKey = getGeminiKey()
    if (!geminiKey) {
        return NextResponse.json({ ok: false, error: 'missing_key' }, { status: 503 })
    }

    let body
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
    }

    const { messages } = body
    if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ ok: false, error: 'messages_required' }, { status: 400 })
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ 
            model: pickGeminiModel(),
            systemInstruction: "Siz Nuur Home CRM tizimi uchun maxsus AI yordamchisiz. Nuur Home parda aksessuarlari va interyer dizayni bilan shug'ullanadi. Foydalanuvchi savollariga aniq, do'stona va professional javob bering. CRM tizimi bo'yicha yoki umumiy savollar bo'yicha yordam bering."
        })

        const lastMessage = messages[messages.length - 1].content
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }))

        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            },
        })

        const result = await chat.sendMessage(lastMessage)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({ ok: true, text })
    } catch (e) {
        console.error('AI Chat Error:', e)
        return NextResponse.json({ ok: false, error: 'ai_error', message: e.message }, { status: 502 })
    }
}
