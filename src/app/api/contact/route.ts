import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// In-memory store for rate limiting
const requestMap = new Map<string, { count: number; resetTime: number }>();

const contactSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(2, "El asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

// Rate limiting: max 5 requests per IP per minute
function rateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  const record = requestMap.get(ip);
  if (!record) {
    // First request from this IP
    requestMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  // Check if window has reset
  if (now > record.resetTime) {
    // Reset window
    requestMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return { allowed: false, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    const rateLimitResult = rateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Honeypot check (anti-spam)
    if (body._gotcha) {
      return NextResponse.json(
        { success: false, error: "Spam detectado" },
        { status: 400 }
      );
    }

    // Log for development (no email sending since resend is not installed)
    console.log("Contact form submitted:", { name, email, subject, message: message.slice(0, 50) + "..." });

    return NextResponse.json(
      { success: true, message: "Mensaje enviado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}