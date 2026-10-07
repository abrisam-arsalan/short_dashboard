import { db } from "@/lib/db";
import { connection } from "next/server";
import { PanelPipeline } from "@/components/PanelPipeline";


export const instant = false;
export default async function JadwalPage() {
  await connection();
  const paket = await db.paketKonten.findMany({
    include: { ide: true, kanal: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📅 Pipeline & Jadwal</h1>
        <p className="text-gray-400">Papan status 8 tahap pipeline</p>
      </div>

      <PanelPipeline
        paket={paket.map((p) => ({
          id: p.id,
          judul: p.ide?.judulEn ?? "Tanpa judul",
          kanal: p.kanal.nama,
          status: p.status,
        }))}
      />
    </div>
  );
}
