import { useEffect, useRef } from "react";

type PrintEvaluasiProps = {
  row: {
    kodeForm: string;
    tanggalForm: string;
    judul: string;
    noSurat: string;
    unit: string;
    jenis: string;
    nilaiPengajuan: number | null;
    anggaranHps?: number;
    namaAnggaran?: string;
    regAnggaran?: string;
    isFinal?: boolean;
  };
  onClose: () => void;
};

export default function PrintEvaluasi({ row, onClose }: PrintEvaluasiProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (hasPrinted.current || !printRef.current) return;
    hasPrinted.current = true;

    const printContents = printRef.current.innerHTML;

    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);

    const win = frame.contentWindow;
    const doc = win?.document;

    if (doc && win) {
      doc.open();
      doc.write(`
        <!doctype html>
        <html lang="id">
          <head>
            <meta charset="utf-8" />
            <title>Cetak Evaluasi</title>
            <style>
              *, *::before, *::after { box-sizing: border-box; }
              html, body { margin: 0; padding: 0; }

              @page {
                size: A4;
                margin: 15mm 5mm 15mm 0mm;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 11pt;
                line-height: 1.35;
                color: #000;
              }

              .container {
                max-width: 190mm;
                margin: 0 auto;
              }

              h1, h2, h3, h4, h5, h6 { margin: 0; }
              .title { text-align: center; }
              .title h2 { font-size: 14pt; font-weight: 700; }
              .title h3 { font-size: 12pt; font-weight: 600; margin-top: 4px; }
              .form-number { text-align: center; margin: 10px 0 18px; }

              table.outer {
              width: 100%;
              table-layout: fixed;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }
              .outer {
                border: 1px solid #000;
              }
              th, td {
                border: 1px solid #000;
                padding: 6px 8px;
                vertical-align: top;
              }

              .row-2col td {
                border: none !important;
                padding: 4px 6px;
              }
              .row-2col td:first-child {
                width: 26%;
                font-weight: 600;
                background: #f7f7f7;
                text-align: left;
                white-space: nowrap;
              }
              .row-2col td:last-child {
                width: 74%;
                text-align: left;
              }



              .section-title {
                font-weight: 700;
                background: #efefef;
                text-align: left;
                padding: 8px;
              }

              .inner {
                width: 100%;
                border-collapse: collapse;
              }
              .inner th, .inner td {
                border: 1px solid #000;
                padding: 6px 8px;
              }

              .ttd-space {
                height: 80px;
              }

              .italic {
                font-style: italic;
                margin-top: 16px;
              }

              .avoid-break { page-break-inside: avoid; }
            </style>
          </head>
          <body>
            <div class="container">${printContents}</div>
          </body>
        </html>
      `);
      doc.close();

      win.onafterprint = () => {
        document.body.removeChild(frame);
        onClose();
      };

      win.focus();
      win.print();
    } else {
      onClose();
    }
  }, [row, onClose]);

  const rupiah = (v?: number | null) =>
    typeof v === "number" ? v.toLocaleString("id-ID") : "-";

  const tanggal = (s?: string) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div style={{ display: "none" }}>
      <div ref={printRef}>
        <div className="title">
          <h2>FORM EVALUASI PENGADAAN BARANG DAN JASA</h2>
          <h3>LPP AGRO NUSANTARA</h3>
        </div>
        <div className="form-number">
          <strong>Nomor:</strong> {row.kodeForm || "-"}
        </div>

        <table className="outer">
          <tbody>
            <tr>
              <td className="section-title" colSpan={2}>
                Usulan
              </td>
            </tr>
            <tr className="row-2col">
              <td>Nama Proyek</td>
              <td>{row.judul || "-"}</td>
            </tr>
            <tr className="row-2col">
              <td>Diusulkan Oleh</td>
              <td>{row.unit || "-"}</td>
            </tr>
            <tr className="row-2col">
              <td>Nilai Proyek</td>
              <td>Rp {rupiah(row.nilaiPengajuan)}</td>
            </tr>
            <tr className="row-2col">
              <td>Sumber Anggaran</td>
              <td>{row.jenis || "-"}</td>
            </tr>
            <tr className="row-2col">
              <td>Tanggal Usulan</td>
              <td>{tanggal(row.tanggalForm)}</td>
            </tr>

            <tr>
              <td className="section-title" colSpan={2}>
                Evaluasi
              </td>
            </tr>
            <tr className="row-2col">
              <td>Nilai Hasil Evaluasi</td>
              <td>Rp {rupiah(row.anggaranHps)}</td>
            </tr>
            <tr className="row-2col">
              <td>Sumber Anggaran</td>
              <td>
                {row.namaAnggaran || "-"}
                {row.namaAnggaran || row.regAnggaran ? " - " : ""}
                {row.regAnggaran || "-"}
              </td>
            </tr>
            <tr className="row-2col">
              <td>Catatan</td>
              <td style={{ height: "48px" }} />
            </tr>

            <tr>
              <td className="section-title" colSpan={2}>
                Persetujuan Evaluasi
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="avoid-break">
                <table className="inner">
                  <thead>
                    <tr>
                      <th colSpan={2}>Evaluasi Teknis dan Biaya</th>
                      <th colSpan={2}>Evaluasi Anggaran dan Pendanaan</th>
                      <th>Persetujuan Pelaksanaan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Sekretaris Perusahaan</td>
                      <td>SEVP Operation</td>
                      <td>Keuangan</td>
                      <td>SEVP Business Support</td>
                      <td>Direktur</td>
                    </tr>
                    <tr>
                      <td className="ttd-space" />
                      <td className="ttd-space" />
                      <td className="ttd-space" />
                      <td className="ttd-space" />
                      <td className="ttd-space" />
                    </tr>
                    <tr>
                      <td>Tanggal:</td>
                      <td>Tanggal:</td>
                      <td>Tanggal:</td>
                      <td>Tanggal:</td>
                      <td>Tanggal:</td>
                    </tr>
                    <tr>
                      <td>Catatan:</td>
                      <td>Catatan:</td>
                      <td>Catatan:</td>
                      <td>Catatan:</td>
                      <td>Catatan:</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td className="section-title" colSpan={2}>
                Diterima dan Diproses oleh
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="avoid-break">
                <table className="inner">
                  <thead>
                    <tr>
                      <th>Bagian Pengadaan</th>
                      <th>Panitia Pengadaan</th>
                      <th>Tim HPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ height: "60px" }}></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Catatan:</td>
                      <td>Catatan:</td>
                      <td>Catatan:</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="italic">
          Dokumen ini dicetak otomatis dari sistem evaluasi.
        </div>
      </div>
    </div>
  );
}
