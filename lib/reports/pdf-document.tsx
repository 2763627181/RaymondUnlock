import { Document, Font, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { Band, Kpis, TableView, TitleBlock } from "@/lib/reports/pdf-parts";
import { BRAND } from "@/lib/reports/theme";
import type { Report } from "@/lib/reports/types";

// Sin guiones automáticos: el corte silábico inglés partiría palabras en español ("Pan-talla").
Font.registerHyphenationCallback((word) => [word]);

function ReportDocument({ report }: { report: Report }) {
  const { business } = report;
  return (
    <Document title={report.title} author={business.name} creator={business.name}>
      {report.tables.map((table, index) => (
        <Page
          key={table.title}
          size="A4"
          orientation="landscape"
          style={{
            fontFamily: "Helvetica",
            fontSize: 8,
            color: `#${BRAND.ink}`,
            paddingBottom: 46,
          }}
        >
          <Band report={report} />
          <View style={{ paddingHorizontal: 28, paddingTop: 16 }}>
            {index === 0 ? (
              <>
                <TitleBlock report={report} />
                <Kpis report={report} />
              </>
            ) : null}
            <TableView table={table} />
          </View>

          <View
            fixed
            style={{
              position: "absolute",
              bottom: 16,
              left: 28,
              right: 28,
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 0.5,
              borderTopColor: `#${BRAND.border}`,
              paddingTop: 6,
            }}
          >
            <Text style={{ fontSize: 7.5, color: `#${BRAND.muted}` }}>
              {business.name} · {business.phone} · {business.email}
            </Text>
            <Text
              style={{ fontSize: 7.5, color: `#${BRAND.muted}` }}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      ))}
    </Document>
  );
}

/** PDF del informe: A4 horizontal, con la marca, indicadores y tablas que continúan en varias páginas. */
export function buildPdf(report: Report): Promise<Buffer> {
  return renderToBuffer(ReportDocument({ report }));
}
