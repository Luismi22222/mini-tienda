import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Home, Trash2, Save, X } from "lucide-react";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Queries y mutations
  const { data: users = [], isLoading, refetch } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente");
      setEditingId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar usuario");
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar usuario");
    },
  });

  // Verificar permisos
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Solo administradores pueden acceder a este panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (userData: any) => {
    setEditingId(userData.id);
    setEditData(userData);
  };

  const handleSave = async () => {
    if (!editingId) return;

    const updates: any = {};
    if (editData.name !== users.find((u: any) => u.id === editingId)?.name) {
      updates.name = editData.name;
    }
    if (editData.email !== users.find((u: any) => u.id === editingId)?.email) {
      updates.email = editData.email;
    }
    if (editData.balance !== users.find((u: any) => u.id === editingId)?.balance) {
      updates.balance = editData.balance;
    }
    if (editData.role !== users.find((u: any) => u.id === editingId)?.role) {
      updates.role = editData.role;
    }

    await updateUserMutation.mutateAsync({
      userId: editingId,
      ...updates,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (userId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      await deleteUserMutation.mutateAsync({ userId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setLocation("/")}>
            <Home className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">Mini-Tienda</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin: {user?.name || user?.email}</span>
            <Button onClick={() => setLocation("/")} variant="outline">
              Volver
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Total de usuarios: {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Saldo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rol</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Creado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userData: any) => (
                      <tr key={userData.id} className="border-b border-gray-200 hover:bg-gray-50">
                        {editingId === userData.id ? (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-900">{userData.id}</td>
                            <td className="px-4 py-3">
                              <Input
                                value={editData.name || ""}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="Nombre"
                                className="text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={editData.email || ""}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                placeholder="Email"
                                className="text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={editData.balance || ""}
                                onChange={(e) => setEditData({ ...editData, balance: e.target.value })}
                                placeholder="Saldo"
                                className="text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={editData.role || "user"}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="user">Usuario</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(userData.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSave}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={updateUserMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={handleCancel}
                                  size="sm"
                                  variant="outline"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-900">{userData.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{userData.name || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{userData.email || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ${parseFloat(userData.balance || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                userData.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {userData.role === "admin" ? "Admin" : "Usuario"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(userData.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEdit(userData)}
                                  size="sm"
                                  variant="outline"
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDelete(userData.id)}
                                  size="sm"
                                  variant="destructive"
                                  disabled={deleteUserMutation.isPending || userData.id === user?.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
