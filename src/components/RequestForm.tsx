import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface RequestFormValues {
  noSurat: string;
  judul: string;
  jenis: string;
  unit: string;
  nilaiPengajuan: number;
  tglSurat: string;
  email: string;
  catatan?: string;
  lampiranUrl?: string;
}

interface RequestFormProps {
  onClose: () => void;
  onSubmit: (values: RequestFormValues) => Promise<void> | void;
  submitting?: boolean;
}

const UNIT_OPTIONS = ["Korporat", "Operasional", "Keuangan", "SDM", "IT"];
const JENIS_OPTIONS = ["Barang", "Jasa", "Lainnya"];

export const RequestForm = ({ onClose, onSubmit, submitting = false }: RequestFormProps) => {
  const [formValues, setFormValues] = useState({
    noSurat: "",
    judul: "",
    jenis: "",
    unit: "",
    nilaiPengajuan: "",
    tglSurat: "",
    email: "",
    catatan: "",
    lampiranUrl: "",
  });

  const handleChange = (field: keyof typeof formValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const isFormValid =
    Boolean(formValues.noSurat.trim()) &&
    Boolean(formValues.judul.trim()) &&
    Boolean(formValues.jenis) &&
    Boolean(formValues.unit) &&
    Boolean(formValues.nilaiPengajuan) &&
    Boolean(formValues.tglSurat) &&
    Boolean(formValues.email.trim());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;
    await onSubmit({
      noSurat: formValues.noSurat,
      judul: formValues.judul,
      jenis: formValues.jenis,
      unit: formValues.unit,
      nilaiPengajuan: Number(formValues.nilaiPengajuan),
      tglSurat: formValues.tglSurat,
      email: formValues.email,
      catatan: formValues.catatan || undefined,
      lampiranUrl: formValues.lampiranUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="no-surat">Nomor Surat</Label>
          <Input id="no-surat" value={formValues.noSurat} onChange={handleChange("noSurat")} placeholder="123/ABC/I/2025" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tgl-surat">Tanggal Surat</Label>
          <Input id="tgl-surat" type="date" value={formValues.tglSurat} onChange={handleChange("tglSurat")} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="judul">Judul Pengajuan</Label>
        <Input id="judul" value={formValues.judul} onChange={handleChange("judul")} placeholder="Pengadaan perangkat ..." required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select value={formValues.unit} onValueChange={(value) => setFormValues((prev) => ({ ...prev, unit: value }))} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Unit" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Jenis Pengajuan</Label>
          <Select value={formValues.jenis} onValueChange={(value) => setFormValues((prev) => ({ ...prev, jenis: value }))} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              {JENIS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nilai">Nilai Pengajuan</Label>
          <Input
            id="nilai"
            type="number"
            min="0"
            value={formValues.nilaiPengajuan}
            onChange={handleChange("nilaiPengajuan")}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email PIC</Label>
          <Input id="email" type="email" value={formValues.email} onChange={handleChange("email")} placeholder="nama@perusahaan.com" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catatan">Catatan</Label>
        <Textarea id="catatan" value={formValues.catatan} onChange={handleChange("catatan")} rows={3} placeholder="Tambahkan catatan apabila diperlukan" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lampiran">Lampiran URL</Label>
        <Input
          id="lampiran"
          type="url"
          value={formValues.lampiranUrl}
          onChange={handleChange("lampiranUrl")}
          placeholder="https://storage.example.com/lampiran.pdf"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Batal
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow" disabled={submitting || !isFormValid}>
          {submitting ? "Menyimpan..." : "Submit Pengajuan"}
        </Button>
      </div>
    </form>
  );
};
