// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

//  Definir interfaz para el mensaje de contacto
interface ContactMessage {
    id: string;
    timestamp: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: 'pending' | 'read' | 'responded';
}

//  Ruta inteligente: /tmp en Vercel, carpeta 'data' en local
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'contact-messages.json');

//  Crear carpeta y archivo si no existen (con tipo de retorno explícito)
function ensureDataFileExists(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
}

//  Leer mensajes existentes (con tipo de retorno explícito)
function readMessages(): ContactMessage[] {
    try {
        ensureDataFileExists();
        const data = fs.readFileSync(DATA_FILE, 'utf-8');

        //  Validación de tipo segura
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            return parsed as ContactMessage[];
        }
        console.warn('Formato de archivo incorrecto, inicializando array vacío');
        return [];
    } catch (error) {
        console.error('Error al leer mensajes:', error);
        return [];
    }
}


function saveMessages(messages: ContactMessage[]): boolean {
    try {
        ensureDataFileExists();
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error al guardar mensajes:', error);
        return false;
    }
}

//  Validar email
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

//  Validar teléfono (opcional)
function isValidPhone(phone: string): boolean {
    if (!phone) return true;
    return /^\+?[0-9\s\-()]{7,15}$/.test(phone.trim());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        //  Validaciones
        if (!body.name || !body.email || !body.subject || !body.message) {
            return NextResponse.json(
                { error: 'Todos los campos obligatorios deben estar completos' },
                { status: 400 }
            );
        }

        if (body.name.trim().length < 2) {
            return NextResponse.json(
                { error: 'El nombre debe tener al menos 2 caracteres' },
                { status: 400 }
            );
        }

        if (!isValidEmail(body.email)) {
            return NextResponse.json(
                { error: 'El email no es válido' },
                { status: 400 }
            );
        }

        if (body.phone && !isValidPhone(body.phone)) {
            return NextResponse.json(
                { error: 'El teléfono no es válido' },
                { status: 400 }
            );
        }

        if (body.subject.trim().length < 5) {
            return NextResponse.json(
                { error: 'El asunto debe tener al menos 5 caracteres' },
                { status: 400 }
            );
        }

        if (body.message.trim().length < 10) {
            return NextResponse.json(
                { error: 'El mensaje debe tener al menos 10 caracteres' },
                { status: 400 }
            );
        }

        //  Leer mensajes existentes (tipo ContactMessage[])
        const messages = readMessages();

        //  Crear nuevo mensaje con tipo explícito
        const newMessage: ContactMessage = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            name: body.name.trim(),
            email: body.email.trim(),
            phone: body.phone?.trim() || null,
            subject: body.subject.trim(),
            message: body.message.trim(),
            status: 'pending',
        };

        //  Agregar al principio del array
        messages.unshift(newMessage);

        //  Guardar con tipo seguro
        const saved = saveMessages(messages);

        if (!saved) {
            return NextResponse.json(
                {
                    error: isVercel
                        ? '⚠️ Los mensajes se guardan temporalmente en Vercel. Se perderán tras el próximo deploy.'
                        : 'Error al guardar el mensaje'
                },
                { status: 500 }
            );
        }

        //  Éxito con advertencia en Vercel
        return NextResponse.json(
            {
                success: true,
                message: isVercel
                    ? '✅ Mensaje recibido. Nota: En Vercel los datos son temporales y se pierden tras cada deploy.'
                    : '✅ Mensaje enviado correctamente',
                messageId: newMessage.id,
                isTemporary: isVercel,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al procesar contacto:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: isVercel ? 'Los mensajes se guardan en /tmp (temporal)' : undefined
            },
            { status: 500 }
        );
    }
}

//  GET para ver mensajes (solo en desarrollo)
export async function GET() {
    //  Solo permitir en desarrollo/local
    if (process.env.NODE_ENV === 'production' && !isVercel) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const messages = readMessages();
    return NextResponse.json({
        messages,
        storage: isVercel ? '/tmp (temporal)' : 'data/ (persistente)',
        warning: isVercel
            ? ' En Vercel los datos se pierden tras cada deploy/reinicio del servidor'
            : null
    });
}