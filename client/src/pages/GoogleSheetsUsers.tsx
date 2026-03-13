import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Download, Home, RefreshCw, ExternalLink } from "lucide-react";
import { formatEUR } from "@/lib/currency";

export default function GoogleSheetsUsers() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [sheetUrl, setSheetUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Obtener usuarios
  const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery();

  // Crear Google Sheet con usuarios
  const createSheetMutation = trpc.admin.createGoogleSheet.useMutation({
    onSuccess: (data) => {
      setSheetUrl(data.sheetUrl);
      toast.success("Google Sheet creado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear Google Sheet");
    },
  });

  const handleCreateSheet = async () => {
    if (!users || users.length === 0) {
      toast.error("No hay usuarios para exportar");
      return;
    }

    setIsCreating(true);
    try {
      await createSheetMutation.mutateAsync();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!users || users.length === 0) {
      toast.error("No hay usuarios para descargar");
      return;
    }

    // Crear CSV
    const headers = ["ID", "Email", "Nombre", "Saldo", "Rol", "Método Login", "Fecha Registro"];
    const rows = users.map((u) => [
      u.id,
      u.email || "",
      u.name || "",
      u.balance || "0",
      u.role || "user",
      u.loginMethod || "",
      new Date(u.createdAt).toLocaleDateString("es-ES"),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    // Descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("CSV descargado exitosamente");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setLocation("/")}>
            <Home className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-white">Mini-Tienda</span>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Volver
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Usuarios - Google Sheets</h1>
          <p className="text-slate-400">Exporta y gestiona usuarios en Google Sheets o descarga como CSV</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleCreateSheet}
            disabled={isCreating || !users || users.length === 0}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {isCreating ? "Creando..." : "Crear Google Sheet"}
          </Button>

          <Button
            onClick={handleDownloadCSV}
            disabled={!users || users.length === 0}
            variant="outline"
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar CSV
          </Button>

          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Google Sheet Link */}
        {sheetUrl && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
            <p className="text-sm text-slate-400 mb-2">Google Sheet creado:</p>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 break-all flex items-center gap-2"
            >
              {sheetUrl}
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </Card>
        )}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : !users || users.length === 0 ? (
          <Card className="p-8 text-center bg-slate-800 border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">No hay usuarios</h2>
            <p className="text-slate-400">No hay usuarios registrados en el sistema</p>
          </Card>
        ) : (
          <Card className="overflow-hidden bg-slate-800 border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700 border-b border-slate-600">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Saldo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Método</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-sm text-slate-300">{u.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{u.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{u.name || "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-orange-400">
                        {formatEUR(u.balance || "0")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {u.role === "admin" ? "Admin" : "Usuario"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{u.loginMethod || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(u.createdAt).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Info */}
        <Card className="mt-8 p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Información</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-1">•</span>
              <span>Total de usuarios: <strong>{users?.length || 0}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-1">•</span>
              <span>Puedes crear un Google Sheet con todos los usuarios para colaboración en tiempo real</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-1">•</span>
              <span>También puedes descargar los datos como CSV para análisis local</span>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
