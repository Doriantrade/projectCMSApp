export interface EmailConfig {
    recipients: string;     // Cadena con destinatarios separados por comas
    body: string;          // Cuerpo del email
    subject: string;       // Asunto del email
    fromAddress: string;   // Dirección del remitente
    replyTo: string;       // Dirección para respuesta
    usercrea: string;      // Usuario que creó la configuración
    fecrea: string | Date; // Fecha de creación (puede ser string o Date)
    codcli: string;        // Código de cliente
    idconfig: number;      // ID de configuración
    codecProcess: string;  // Código de proceso
  }
  
  // Opcional (si siempre recibes un array)
  export type EmailConfigResponse = EmailConfig[];