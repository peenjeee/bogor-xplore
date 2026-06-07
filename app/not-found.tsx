import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-transparent px-4 py-16">
      <div className="w-full max-w-xl border-4 border-[#111111] bg-white p-8 text-center shadow-[10px_10px_0_#111111]">
        <h1 className="text-4xl font-black uppercase text-[#111111]">Halaman tidak ditemukan</h1>
        <p className="mt-3 font-semibold text-[#3b3b3b]">Destinasi atau halaman yang kamu buka tidak tersedia.</p>
        <Button asChild className="mt-6">
          <Link href="/places">
            <ArrowLeft className="size-4" />
            Kembali ke daftar wisata
          </Link>
        </Button>
      </div>
    </main>
  );
}
