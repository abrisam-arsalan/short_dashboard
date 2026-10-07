import { db } from "@/lib/db";
import { connection } from "next/server";
import { KartuKanal } from "@/components/KartuKanal";
import { PeringatanPanel } from "@/components/PeringatanPanel";
import { UI } from "@/lib/teks";


export const instant = false;
export default async function DashboardPage() {
  await connection();
  const kanals = await db.kanal.findMany({
    include: {
      paket: {
        where: { createdAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
      },
      _count: { select: { paket: true } },
    },
  });

  const peringatan = await db.peringatan.findMany({
    where: { dibaca: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{UI.dashboard.judul}</h1>
        <p className="text-gray-400">{UI.dashboard.subjudul}</p>
      </div>

      <PeringatanPanel
        peringatan={peringatan.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
      />

      {/* Kartu 3 kanal */}
      <div className="grid grid-cols-3 gap-4">
        {kanals.map((kanal) => (
          <KartuKanal
            key={kanal.id}
            slug={kanal.slug}
            nama={kanal.nama}
            handle={kanal.handle}
            niche={kanal.niche}
            killSwitch={kanal.killSwitch}
            antreanHariIni={kanal.paket.length}
            targetHarian={5}
          />
        ))}
      </div>

      {/* Pipeline overview */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">📊 Pipeline Hari Ini</h2>
        <div className="text-sm text-gray-400">
          {kanals.map((k) => (
            <div key={k.id} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
              <span>{k.nama}</span>
              <span>{k.paket.length} paket · {k._count.paket} total</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
