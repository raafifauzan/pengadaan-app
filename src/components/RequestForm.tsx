import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RequestFormProps {
  onClose: () => void;
}

export const RequestForm = ({ onClose }: RequestFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pengajuan berhasil dibuat!");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Pengajuan</Label>
          <Input id="title" placeholder="Masukkan judul pengajuan" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT Department</SelectItem>
              <SelectItem value="ga">General Affairs</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan detail pengadaan yang dibutuhkan"
          rows={4}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Estimasi Budget</Label>
          <Input id="amount" type="number" placeholder="0" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor (Opsional)</Label>
          <Input id="vendor" placeholder="Nama vendor" />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
          Submit Pengajuan
        </Button>
      </div>
    </form>
  );
};
