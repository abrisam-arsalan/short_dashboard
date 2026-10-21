import { db } from "@/lib/db";
import { connection } from "next/server";
import { FormUnggahAset } from "@/components/FormUnggahAset";
import { UI } from "@/lib/teks";


export const instant = false;
export default async function AsetPage() {
  await connection();
  const kanals = await db.kanal.findMany();
  const asets = await db.asetVideo.findMany({
    where: { dihapusPada: null },
    include: { kanal: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{UI.aset.judul}</h1>
        <p className="text-gray-400">{UI.aset.subjudul}</p>
      </div>

      {/* Upload per kanal */}
      <div className="grid grid-cols-3 gap-4">
        {kanals.map((kanal) => (
          <div key={kanal.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold text-white mb-3">
              {kanal.nama}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {UI.aset.pathFolder} <code className="text-blue-400">storage/inbox/{kanal.slug}/</code>
            </p>
            <FormUnggahAset kanalSlug={kanal.slug} />
          </div>
        ))}
      </div>

      {/* Daftar file */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">{UI.aset.daftarFile}</h2>
        {asets.length === 0 ? (
          <div className="text-gray-500">Belum ada file</div>
        ) : (
          <div className="space-y-2">
            {asets.map((aset) => (
              <div key={aset.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <div className="text-gray-200 text-sm">{aset.pathFile}</div>
                  <div className="text-xs text-gray-500">
                    {aset.kanal.nama} · {aset.jenis} · {aset.durasiDetik?.toFixed(1)}s · {aset.sumber}
                  </div>
                </div>
                <span
                  className={`
                    px-2 py-1 rounded text-xs
                    ${aset.dihapusPada ? "bg-gray-700 text-gray-500" : "bg-green-900/30 text-green-400"}
                  `}
                >
                  {aset.dihapusPada ? "Dihapus" : "Aktif"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
