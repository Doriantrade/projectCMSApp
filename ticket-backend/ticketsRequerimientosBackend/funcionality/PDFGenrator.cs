//using iText.Kernel.Pdf;
//using iText.Layout;
//using iText.Layout.Element;
//using iText.Layout.Properties;
//using iText.Kernel.Colors;
//using iText.IO.Image;
//using iText.Layout.Borders;
//using iText.Kernel.Geom;
//using iText.Kernel.Font;
//using iText.IO.Font.Constants;
//using iText.Kernel.Pdf.Event; // Corrected: Changed from iText.Kernel.Pdf.Events to iText.Kernel.Pdf.Event
//using System.IO;
//using System;
//using System.Collections.Generic;
//using ticketsRequerimientosBackend.ModelsDto.Autorizacion;
//using iText.Commons.Actions;
//// using iText.Commons.Actions; // Esta no es necesaria para este caso

//public class PDFGenerator
//{
//    public byte[] GenerateRequerimientoPdf(AutorizacionResponse data)
//    {
//        using (MemoryStream ms = new MemoryStream())
//        {
//            PdfWriter writer = new PdfWriter(ms);
//            PdfDocument pdf = new PdfDocument(writer);
//            Document document = new Document(pdf, PageSize.A4);
//            document.SetMargins(70, 30, 70, 30);

//            PdfFont fontBold = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
//            PdfFont fontNormal = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);

//            AddHeader(document, data.Cabecera, fontBold, fontNormal);
//            AddTechniciansTable(document, data.Tecnicos, fontBold, fontNormal);

//            // Se usa IPdfDocumentEventHandler y el evento es PdfDocumentEvent
//            pdf.AddEventHandler(PdfDocumentEvent.END_PAGE, new FooterEventHandler(document, data.Cabecera, fontBold, fontNormal));
//            document.Close();
//            return ms.ToArray();
//        }
//    }

//    private void AddHeader(Document document, CabeceraRequerimiento cabecera, PdfFont fontBold, PdfFont fontNormal)
//    {
//        document.Add(new Paragraph("DETALLES DEL REQUERIMIENTO")
//            .SetTextAlignment(TextAlignment.CENTER)
//            .SetFontSize(18)
//            .SetFont(fontBold)
//            .SetMarginBottom(15));

//        Table headerTable = new Table(UnitValue.CreatePercentArray(new float[] { 1, 2, 1, 2 }))
//                                .UseAllAvailableWidth()
//                                .SetMarginBottom(20);

//        headerTable.AddCell(CreateCell("Ticket ID:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.IdTicket.ToString(), fontNormal));
//        headerTable.AddCell(CreateCell("Estado:", fontBold));
//        headerTable.AddCell(CreateCell(GetEstadoDescription(cabecera.Estado), fontNormal));

//        headerTable.AddCell(CreateCell("Agencia:", fontBold));
//        headerTable.AddCell(CreateCell($"{cabecera.NombreAgencia} ({cabecera.IdAgencia})", fontNormal));
//        headerTable.AddCell(CreateCell("Cliente:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.NombreCliente, fontNormal));

//        headerTable.AddCell(CreateCell("Ubicación:", fontBold));
//        headerTable.AddCell(CreateCell($"{cabecera.NombreCiudad}, {cabecera.NombreProvincia}", fontNormal));
//        headerTable.AddCell(CreateCell("Fecha Creación:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.Fecrea.ToString("dd/MM/yyyy HH:mm"), fontNormal));

//        headerTable.AddCell(CreateCell("Equipo:", fontBold));
//        headerTable.AddCell(CreateCell($"{cabecera.CodTipoEquipo} - {cabecera.CodMarca} {cabecera.CodModelo} (S/N: {cabecera.NserieEquipo})", fontNormal));
//        headerTable.AddCell(CreateCell("Área:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.Area, fontNormal));

//        headerTable.AddCell(CreateCell("Motivo Trabajo:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.MotivoTrabajo, fontNormal, 3));

//        headerTable.AddCell(CreateCell("Descripción Problema:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.DescripcionProblema, fontNormal, 3));

//        headerTable.AddCell(CreateCell("Ini. Planificada:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.FechainiPlanif.ToString("dd/MM/yyyy HH:mm"), fontNormal));
//        headerTable.AddCell(CreateCell("Fin Planificada:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.FechafinPlanif.ToString("dd/MM/yyyy HH:mm"), fontNormal));

//        headerTable.AddCell(CreateCell("Ini. Real:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.FecreaRealIni.ToString("dd/MM/yyyy") + " " + cabecera.HoraInicialReal.ToString(@"hh\:mm"), fontNormal));
//        headerTable.AddCell(CreateCell("Fin Real:", fontBold));
//        headerTable.AddCell(CreateCell(cabecera.FecreaRealFin.ToString("dd/MM/yyyy") + " " + cabecera.HoraFinalReal.ToString(@"hh\:mm"), fontNormal));

//        if (!string.IsNullOrEmpty(cabecera.Observacion))
//        {
//            headerTable.AddCell(CreateCell("Observación:", fontBold));
//            headerTable.AddCell(CreateCell(cabecera.Observacion, fontNormal, 3));
//        }

//        document.Add(headerTable);

//        if (!string.IsNullOrEmpty(cabecera.ImagenCliente) && cabecera.ImagenCliente.StartsWith("data:image"))
//        {
//            try
//            {
//                string base64Data = cabecera.ImagenCliente.Substring(cabecera.ImagenCliente.IndexOf(',') + 1);
//                byte[] imageBytes = Convert.FromBase64String(base64Data);
//                ImageData imageData = ImageDataFactory.Create(imageBytes);
//                Image img = new Image(imageData)
//                    .SetWidth(100)
//                    .SetHeight(100)
//                    .SetHorizontalAlignment(HorizontalAlignment.RIGHT);

//                document.Add(img);
//            }
//            catch (Exception ex)
//            {
//                document.Add(new Paragraph($"Error al cargar imagen del cliente: {ex.Message}").SetFontSize(8).SetFontColor(ColorConstants.RED));
//            }
//        }

//        document.Add(new Paragraph("\n"));
//    }

//    private void AddTechniciansTable(Document document, List<Tecnico> tecnicos, PdfFont fontBold, PdfFont fontNormal)
//    {
//        document.Add(new Paragraph("TÉCNICOS ASIGNADOS")
//            .SetTextAlignment(TextAlignment.LEFT)
//            .SetFontSize(14)
//            .SetFont(fontBold)
//            .SetMarginBottom(10));

//        if (tecnicos != null && tecnicos.Count > 0)
//        {
//            Table techTable = new Table(UnitValue.CreatePercentArray(new float[] { 2, 2, 1 }))
//                                .UseAllAvailableWidth()
//                                .SetMarginBottom(30);

//            techTable.AddHeaderCell(CreateHeaderCell("Nombre del Técnico", fontBold));
//            techTable.AddHeaderCell(CreateHeaderCell("Cédula", fontBold));
//            techTable.AddHeaderCell(CreateHeaderCell("Foto", fontBold));

//            foreach (var tecnico in tecnicos)
//            {
//                techTable.AddCell(CreateCell(tecnico.NombreTecnico, fontNormal));
//                techTable.AddCell(CreateCell(tecnico.CedulaTecnico, fontNormal));

//                Cell imageCell = new Cell().SetVerticalAlignment(VerticalAlignment.MIDDLE).SetTextAlignment(TextAlignment.CENTER);
//                if (!string.IsNullOrEmpty(tecnico.ImagenTecnicoPerfil) && tecnico.ImagenTecnicoPerfil.StartsWith("data:image"))
//                {
//                    try
//                    {
//                        string base64Data = tecnico.ImagenTecnicoPerfil.Substring(tecnico.ImagenTecnicoPerfil.IndexOf(',') + 1);
//                        byte[] imageBytes = Convert.FromBase64String(base64Data);
//                        ImageData imageData = ImageDataFactory.Create(imageBytes);
//                        Image img = new Image(imageData)
//                            .SetWidth(50)
//                            .SetHeight(50);
//                        imageCell.Add(img);
//                    }
//                    catch (Exception)
//                    {
//                        imageCell.Add(new Paragraph("Error img").SetFontSize(6).SetFontColor(ColorConstants.RED));
//                    }
//                }
//                else
//                {
//                    imageCell.Add(new Paragraph("N/A").SetFontSize(8).SetFont(fontNormal).SetFontColor(ColorConstants.GRAY));
//                }
//                techTable.AddCell(imageCell);
//            }
//            document.Add(techTable);
//        }
//        else
//        {
//            document.Add(new Paragraph("No hay técnicos asignados para este requerimiento.")
//                .SetFontSize(10)
//                .SetFont(fontNormal)
//                .SetMarginBottom(20));
//        }
//    }

//    // Métodos helper ahora estáticos para fácil acceso
//    private static Cell CreateCell(string text, PdfFont font, int colSpan = 1)
//    {
//        return new Cell(1, colSpan)
//            .Add(new Paragraph(text))
//            .SetFont(font)
//            .SetFontSize(10)
//            .SetPadding(5);
//    }

//    private static Cell CreateHeaderCell(string text, PdfFont font)
//    {
//        return new Cell()
//            .Add(new Paragraph(text))
//            .SetFont(font)
//            .SetFontSize(11)
//            .SetPadding(5)
//            .SetBackgroundColor(ColorConstants.LIGHT_GRAY)
//            .SetTextAlignment(TextAlignment.CENTER);
//    }

//    private string GetEstadoDescription(int estado)
//    {
//        return estado switch
//        {
//            1 => "Pendiente",
//            2 => "En Proceso",
//            3 => "Completado",
//            4 => "Cancelado",
//            _ => "Desconocido"
//        };
//    }

//    // La clase FooterEventHandler ahora implementa IPdfDocumentEventHandler
//    private class FooterEventHandler : IEventHandler
//    {
//        private readonly Document doc;
//        private readonly CabeceraRequerimiento cabecera;
//        private readonly PdfFont fontBold;
//        private readonly PdfFont fontNormal;

//        public FooterEventHandler(Document doc, CabeceraRequerimiento cabecera, PdfFont fontBold, PdfFont fontNormal)
//        {
//            this.doc = doc;
//            this.cabecera = cabecera;
//            this.fontBold = fontBold;
//            this.fontNormal = fontNormal;
//        }

//        public void HandleEvent(Event @event)
//        {
//            if (!(@event is PdfDocumentEvent docEvent))
//                return;

//            PdfDocument pdf = docEvent.GetDocument();
//            PdfPage page = docEvent.GetPage();
//            int pageNum = pdf.GetPageNumber(page);

//            Rectangle pageSize = page.GetPageSize();
//            float x = pageSize.GetLeft() + doc.GetLeftMargin();
//            float y = pageSize.GetBottom() + doc.GetBottomMargin();
//            float width = pageSize.GetWidth() - doc.GetLeftMargin() - doc.GetRightMargin();
//            float height = 50;

//            Canvas canvas = new Canvas(page, new Rectangle(x, y, width, height));

//            Table footerTable = new Table(UnitValue.CreatePercentArray(new float[] { 1, 1, 1 }))
//                                .UseAllAvailableWidth()
//                                .SetBorderTop(new SolidBorder(ColorConstants.GRAY, 0.5f));

//            footerTable.AddCell(CreateCell("", fontNormal).SetBorder(Border.NO_BORDER));
//            footerTable.AddCell(CreateCell("Datos de la Empresa", fontBold).SetTextAlignment(TextAlignment.CENTER).SetBorder(Border.NO_BORDER));
//            footerTable.AddCell(CreateCell("", fontNormal).SetBorder(Border.NO_BORDER));

//            footerTable.AddCell(CreateCell("Empresa:", fontBold).SetBorder(Border.NO_BORDER));
//            footerTable.AddCell(CreateCell(cabecera.NombreEmpresa, fontNormal).SetBorder(Border.NO_BORDER));

//            footerTable.AddCell(CreateCell("Teléfono:", fontBold).SetBorder(Border.NO_BORDER));
//            footerTable.AddCell(CreateCell(cabecera.TelefonoEmpresa, fontNormal).SetBorder(Border.NO_BORDER));

//            footerTable.AddCell(CreateCell("Web:", fontBold).SetBorder(Border.NO_BORDER));
//            footerTable.AddCell(CreateCell(cabecera.WebEmpresa, fontNormal).SetBorder(Border.NO_BORDER));

//            canvas.Add(footerTable);

//            canvas.Add(new Paragraph($"Página {pageNum}")
//                .SetTextAlignment(TextAlignment.RIGHT)
//                .SetFontSize(8)
//                .SetFont(fontNormal)
//                .SetFixedPosition(pageSize.GetRight() - doc.GetRightMargin(), pageSize.GetBottom() + 10, doc.GetRightMargin() - 10));

//            canvas.Close();
//        }
//    }
//}
