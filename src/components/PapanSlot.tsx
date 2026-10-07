/**
 * PapanSlot — tampilkan 5 slot jadwal per kanal (FR-18).
 */
import { menitUtcKeJamLokal } from "@/lib/waktu";

interface Slot {
  slotKe: number;
  menitUtc: number;
  aktif: boolean;
  paketJudul?: string;
}

interface Props {
  slots: Slot[];
  namaKanal: string;
}

export function PapanSlot({ slots, namaKanal }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
      <h3 className="font-bold text-white mb-3">📅 Slot Harian — {namaKanal}</h3>
      <div className="grid grid-cols-5 gap-2">
        {slots.map((slot) => (
          <div
            key={slot.slotKe}
            className={`
              rounded-lg p-3 text-center
              ${slot.paketJudul ? "bg-green-900/30 border border-green-700" : "bg-gray-800 border border-gray-700"}
              ${!slot.aktif ? "opacity-50" : ""}
            `}
          >
            <div className="text-xs text-gray-500">Slot {slot.slotKe + 1}</div>
            <div className="text-sm font-medium text-white mt-1">
              {menitUtcKeJamLokal(slot.menitUtc)}
            </div>
            <div className="text-xs text-gray-400 mt-1 truncate">
              {slot.paketJudul ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
