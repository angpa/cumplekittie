
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ListaPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Simple "Security": ?pin=1234
    // En un proyecto real esto sería un middleware o auth real.
    const { pin } = await searchParams;

    if (pin !== 'kittie2024') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <p className="text-red-500 font-mono mb-4">ACCESO DENEGADO</p>
                <p className="text-gray-500 text-sm">Este sistema está protegido.</p>
            </div>
        );
    }

    let guests: any[] = [];
    try {
        const { rows } = await sql`SELECT * FROM guests ORDER BY created_at DESC`;
        guests = rows;
    } catch (error) {
        // Tabla no existe aun
        guests = [];
    }

    return (
        <div className="min-h-screen bg-black text-fuchsia-400 font-mono p-8 selection:bg-fuchsia-500 selection:text-white">
            <h1 className="text-2xl mb-8 border-b border-white/20 pb-4">
                SYSTEM_GUEST_LIST.LOG
                <span className="float-right text-xs text-green-500 mt-2">CONNECTED</span>
            </h1>

            <div className="max-w-2xl mx-auto border border-white/10 rounded-lg overflow-hidden bg-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/10 text-white">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">NOMBRE_INVITADX</th>
                            <th className="p-4 text-right">TIMESTAMP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                        {guests.map((guest, i) => (
                            <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-white/30">{guests.length - i}</td>
                                <td className="p-4 font-bold text-white">{guest.name}</td>
                                <td className="p-4 text-right text-xs text-gray-500">
                                    {new Date(guest.created_at).toLocaleString('es-AR', {
                                        timeZone: 'America/Argentina/Buenos_Aires',
                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                            </tr>
                        ))}
                        {guests.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500 italic">
                                    -- NO DATA FOUND --
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center text-xs text-gray-600">
                TOTAL_RECORDS: {guests.length}
            </div>
        </div>
    );
}
