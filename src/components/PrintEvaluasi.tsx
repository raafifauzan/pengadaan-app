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
                margin: 15mm;
              }

              body {
                font-family: "Helvetica", "Segoe UI", Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.45;
                color: #0f0f0f;
                background: #fff;
              }

              .container {
                max-width: 190mm;
                margin: 0 auto;
              }

              .sheet {
                padding: 4mm 4mm 9mm;
              }

              .sheet-header {
                text-align: center;
                margin-bottom: 16px;
              }

              .sheet-header h1 {
                font-size: 18px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }

              .sheet-header p {
                margin: 6px 0 0;
                font-size: 12px;
                letter-spacing: 0.04em;
              }

              .form-number {
                margin-top: 4px;
                font-size: 13px;
                letter-spacing: 0.05em;
              }

              .section {
                margin-top: 14px;
              }

              .section-title {
                font-size: 12px;
                text-transform: uppercase;
                font-weight: bold;
                margin-bottom: 8px;
                letter-spacing: 0.08em;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
              }

              .info-table td {
                padding: 6px 11px;
                border: 1px solid #d1d5db;
                text-align: left;
                vertical-align: middle;
              }

              .info-table td:first-child {
                width: 24%;
                font-weight: 600;
                background: #f9fafb;
              }

              .info-table td:last-child {
                width: 76%;
              }

              .evaluation-table td,
              .evaluation-table th {
                border: 1px solid #d1d5db;
                padding: 6px 11px;
                vertical-align: middle;
              }

              .evaluation-table th {
                width: 24%;
                text-align: left;
                background: #f3f4f6;
              }

              .evaluation-table td {
                width: 76%;
                text-align: left;
              }

              .notes-cell {
                height: 65px;
              }

              .sign-table {
                table-layout: fixed;
              }

              .sign-table th,
              .sign-table td {
                border: 1px solid #d1d5db;
                padding: 9px 7px;
              }

              .sign-table th {
                background: #f3f4f6;
                font-size: 11px;
                text-align: center;
                vertical-align: middle;
              }

              .sign-table td {
                text-align: left;
                vertical-align: bottom;
              }

              .sign-space {
                height: 70px;
              }

              .footer-note {
                margin-top: 18px;
                font-size: 10px;
                text-align: center;
                font-style: italic;
              }
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

  const approvalGroups = [
    {
      title: "Evaluasi Teknis & Biaya",
      roles: ["Sekretaris Perusahaan", "SEVP Operation"],
    },
    {
      title: "Evaluasi Anggaran & Pendanaan",
      roles: ["Divisi Keuangan", "SEVP Business Support"],
    },
    {
      title: "Persetujuan Pelaksanaan",
      roles: ["Direktur Utama"],
    },
  ];
  const approvalRoles = approvalGroups.flatMap((group) => group.roles);

  const processingFlow = ["Bagian Pengadaan", "Panitia Pengadaan", "Tim HPS"];

  return (
    <div style={{ display: "none" }}>
      <div ref={printRef}>
        <div className="sheet">
          <header className="sheet-header">
            <p>PT LPP AGRO NUSANTARA</p>
            <h1>FORM EVALUASI PENGADAAN BARANG/JASA</h1>
            <div className="form-number">
              NO : <strong>{row.kodeForm || "-"}</strong>
            </div>
          </header>

          <section className="section">
            <div className="section-title">Usulan</div>
            <table className="info-table">
              <tbody>
                <tr>
                  <td>Nama Pengajuan</td>
                  <td>{row.judul || "-"}</td>
                </tr>
                <tr>
                  <td>Nomor Surat</td>
                  <td>{row.noSurat || "-"}</td>
                </tr>
                <tr>
                  <td>Unit Pengusul</td>
                  <td>{row.unit || "-"}</td>
                </tr>
                <tr>
                  <td>Tanggal Usulan</td>
                  <td>{tanggal(row.tanggalForm)}</td>
                </tr>
                <tr>
                  <td>Jenis Pengadaan</td>
                  <td>{row.jenis || "-"}</td>
                </tr>
                <tr>
                  <td>Alokasi Anggaran</td>
                  <td>
                    {row.namaAnggaran || "-"}
                    {row.namaAnggaran || row.regAnggaran ? " - " : ""}
                    {row.regAnggaran || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="section">
            <div className="section-title">Hasil Evaluasi</div>
            <table className="evaluation-table">
              <tbody>
                <tr>
                  <th>Nilai Pengajuan</th>
                  <td>Rp {rupiah(row.nilaiPengajuan)}</td>
                </tr>
                <tr>
                  <th>Nilai Evaluasi</th>
                  <td>Rp {rupiah(row.anggaranHps)}</td>
                </tr>
                <tr>
                  <th>Alokasi Anggaran</th>
                  <td>
                    {row.namaAnggaran || "-"}
                    {row.namaAnggaran || row.regAnggaran ? " - " : ""}
                    {row.regAnggaran || "-"}
                  </td>
                </tr>
                <tr>
                  <th>Catatan</th>
                  <td className="notes-cell" />
                </tr>
              </tbody>
            </table>
          </section>

          <section className="section">
            <table className="sign-table">
              <thead>
                <tr>
                  {approvalGroups.map((group) => (
                    <th key={group.title} colSpan={group.roles.length}>
                      {group.title}
                    </th>
                  ))}
                </tr>
                <tr>
                  {approvalRoles.map((role) => (
                    <th key={role}>{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {approvalRoles.map((role) => (
                    <td key={`${role}-sign`} className="sign-space" />
                  ))}
                </tr>
                <tr>
                  {approvalRoles.map((role) => (
                    <td key={`${role}-date`}>Tgl:</td>
                  ))}
                </tr>
                <tr>
                  {approvalRoles.map((role) => (
                    <td key={`${role}-note`}>Catatan:</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>

          <section className="section">
            <table className="sign-table">
              <thead>
                <tr>
                  {processingFlow.map((role) => (
                    <th key={role}>{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {processingFlow.map((role) => (
                    <td key={`${role}-sign`} className="sign-space" />
                  ))}
                </tr>
                <tr>
                  {processingFlow.map((role) => (
                    <td key={`${role}-date`}>Tgl:</td>
                  ))}
                </tr>
                <tr>
                  {processingFlow.map((role) => (
                    <td key={`${role}-note`}>Catatan:</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>

          <div className="footer-note">
            Dokumen ini dicetak otomatis dari Sistem Evaluasi Pengadaan
          </div>
        </div>
      </div>
    </div>
  );
}
