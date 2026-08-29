import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { ParticipantRecord, SessionRecord } from '../db';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendWorkshopMaterialEmail(participant: ParticipantRecord, session: SessionRecord, slidesCount: number): Promise<{ success: boolean; message: string }> {
  const subject = `[LiveDeck] Material do Workshop: ${session.title}`;
  const htmlContent = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #090d16; color: #f3f4f6; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f293d;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
          LiveDeck Workshop
        </span>
        <h1 style="font-size: 24px; font-weight: 800; margin-top: 20px; color: #ffffff; line-height: 1.3;">
          ${session.title}
        </h1>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #d1d5db;">
        Olá, <strong>${participant.name}</strong>!
      </p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
        Obrigado por participar do nosso workshop interativo ao vivo. Como prometido, aqui está o seu acesso completo a todo o material apresentado durante a sessão.
      </p>

      <div style="background-color: #111827; border-left: 4px solid #6366f1; padding: 20px; border-radius: 6px; margin: 25px 0;">
        <h3 style="margin: 0 0 8px 0; color: #818cf8; font-size: 16px;">Resumo do Conteúdo:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
          <li><strong>Total de Slides:</strong> ${slidesCount} tópicos apresentados</li>
          <li><strong>Tópico Principal:</strong> Smart Contracts em Solidity & Agentes IA com LangChain / Viem</li>
          <li><strong>Repositório do Workshop:</strong> Código fonte e especificações inclusas</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'}/join/${session.id}?recap=true" 
           style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
          Acessar Slides Interativos em PDF / Web
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;" />

      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        Você recebeu este e-mail porque preencheu o formulário de cadastro com consentimento LGPD no início da apresentação.<br/>
        LiveDeck — Plataforma de Apresentação Sincronizada para Workshops.
      </p>
    </div>
  `;

  // 1. Try Resend if configured
  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.SMTP_FROM || 'LiveDeck <onboarding@resend.dev>',
        to: participant.email,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Dispatch] Resend sent to ${participant.email}`);
      return { success: true, message: `Enviado via Resend para ${participant.email}` };
    } catch (err: any) {
      console.error(`[Email Dispatch] Resend failed for ${participant.email}:`, err.message);
    }
  }

  // 2. Try SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'workshop@livedeck.dev',
        to: participant.email,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Dispatch] SMTP sent to ${participant.email}`);
      return { success: true, message: `Enviado via SMTP para ${participant.email}` };
    } catch (err: any) {
      console.error(`[Email Dispatch] SMTP failed for ${participant.email}:`, err.message);
    }
  }

  // 3. Fallback: Log email dispatch (Zero-Downtime Local Execution)
  console.log(`[Email Dispatch Simulation] Mock Email sent to ${participant.name} <${participant.email}>`);
  return { success: true, message: `Simulado/Registrado com sucesso para ${participant.email}` };
}
