import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'data', 'popup-config.json');

function readConfig() {
    try {
        return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    } catch {
        return {
            active: false,
            title: 'Oferta Agrotóxica',
            discount: '10% OFF',
            description: 'Aproveite a promoção.',
            couponCode: 'AGRO10',
        };
    }
}

// ─── GET /api/popup ───────────────────────────────────────────────────────────
// Rota pública — retorna configuração atual do popup
export async function GET() {
    const config = readConfig();
    return NextResponse.json(config, {
        headers: {
            'Cache-Control': 'no-store', // Sempre busca a versão mais recente
        },
    });
}

// ─── POST /api/popup ──────────────────────────────────────────────────────────
// Rota protegida — atualiza a configuração do popup
// Requer header: X-API-Key: <valor de POPUP_API_KEY no .env.local>
export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('X-API-Key');
    const envKey = process.env.POPUP_API_KEY;

    if (!envKey || apiKey !== envKey) {
        return NextResponse.json(
            { error: 'Não autorizado. X-API-Key inválida.' },
            { status: 401 }
        );
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'JSON inválido no body.' }, { status: 400 });
    }

    // Valida e limpa os campos recebidos — ignora campos desconhecidos
    const current = readConfig();
    const updated = {
        active: typeof body.active === 'boolean' ? body.active : current.active,
        title: typeof body.title === 'string' ? body.title : current.title,
        discount: typeof body.discount === 'string' ? body.discount : current.discount,
        description: typeof body.description === 'string' ? body.description : current.description,
        couponCode: typeof body.couponCode === 'string' ? body.couponCode : current.couponCode,
    };

    try {
        writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
        return NextResponse.json(
            { error: 'Falha ao salvar configuração no servidor.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, config: updated });
}
