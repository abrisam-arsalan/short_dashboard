import { db } from "@/lib/db";
import { connection } from "next/server";


export const instant = false;
export default async function IdePage() {
  await connection();
  const kanals = await db.kanal.findMany({
    include: {
      ide: {
        where: { status: "tersedia" },
        orderBy: { skor: "desc" },
        take: 20,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">💡 Ide Tersedia</h1>
        <p className="text-gray-400">Ide yang belum masuk antrean produksi</p>
      </div>

      {kanals.map((kanal) => (
        <div key={kanal.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">{kanal.nama}</h2>
          {kanal.ide.length === 0 ? (
            <div className="text-gray-500">Belum ada ide tersedia. Generate ide baru!</div>
          ) : (
            <div className="space-y-3">
              {kanal.ide.map((ide) => (
                <div key={ide.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-200 font-medium">{ide.judulEn}</h3>
                    <span className="text-yellow-400">{"⭐".repeat(ide.skor)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{ide.transformasi}</p>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`/api/ide/${ide.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Detail →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
