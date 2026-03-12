// /app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {ContactMessage} from '@/types/index'
import fs from 'fs';
import path from 'path';


// Ruta del archivo JSON (fuera de la carpeta pública)
const DATA_FILE = path.join(process.cwd(), 'data', 'contact-messages.json');

// ✅ Crear carpeta y archivo si no existen
function ensureDataFileExists() {
    const dataDir = path.dirname(DATA_FILE);

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
}

// ✅ Leer mensajes existentes (CON TIPO ESPECÍFICO)
function readMessages(): ContactMessage[] {
    try {
        ensureDataFileExists();
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data) as ContactMessage[];
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        return [];
    }
}

// ✅ Guardar mensajes (CON TIPO ESPECÍFICO)
function saveMessages(messages: ContactMessage[]): boolean {
    try {
        ensureDataFileExists();
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
        return true;
    } catch (error) {
        console.error('Error al guardar el archivo:', error);
        return false;
    }
}

// ✅ Validar email
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Validar teléfono (opcional)
function isValidPhone(phone: string): boolean {
    if (!phone) return true; // Teléfono opcional
    return /^\+?[0-9\s\-()]{7,15}$/.test(phone);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // ✅ Validar datos con tipos específicos
        if (!body.name || !body.email || !body.subject || !body.message) {
            return NextResponse.json(
                { error: 'Todos los campos obligatorios deben estar completos' },
                { status: 400 }
            );
        }

        if (body.name.length < 2) {
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

        if (body.subject.length < 5) {
            return NextResponse.json(
                { error: 'El asunto debe tener al menos 5 caracteres' },
                { status: 400 }
            );
        }

        if (body.message.length < 10) {
            return NextResponse.json(
                { error: 'El mensaje debe tener al menos 10 caracteres' },
                { status: 400 }
            );
        }

        // ✅ Leer mensajes existentes
        const messages = readMessages();

        // ✅ Crear nuevo mensaje (CON TIPO ESPECÍFICO)
        const newMessage: ContactMessage = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            name: body.name.trim(),
            email: body.email.trim(),
            phone: body.phone?.trim() || null,
            subject: body.subject.trim(),
            message: body.message.trim(),
            status: 'pending'
        };

        // ✅ Agregar nuevo mensaje
        messages.unshift(newMessage); // Agregar al principio

        // ✅ Guardar en archivo
        const saved = saveMessages(messages);

        if (!saved) {
            return NextResponse.json(
                { error: 'Error al guardar el mensaje' },
                { status: 500 }
            );
        }

        // ✅ Éxito
        return NextResponse.json(
            {
                success: true,
                message: 'Mensaje enviado correctamente',
                messageId: newMessage.id
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al procesar el formulario:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// GET para obtener mensajes (opcional, solo para administradores)
export async function GET(request: NextRequest) {
    try {
        // ⚠️ IMPORTANTE: En producción, añade autenticación aquí
        // Por ejemplo: verificar si el usuario es admin

        const messages = readMessages();
        return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        return NextResponse.json(
            { error: 'Error al obtener mensajes' },
            { status: 500 }
        );
    }
}