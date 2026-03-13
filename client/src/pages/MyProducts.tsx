import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function MyProducts() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading, refetch } = trpc.products.myProducts.useQuery();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleDelete = async (productId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await deleteProductMutation.mutateAsync({ id: productId });
      toast.success("Producto eliminado");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar producto");
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditData(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Productos</h1>
          <Button onClick={() => setLocation("/create-product")}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Producto
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-64 bg-gray-200" />
              </Card>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-600 mb-4">No tienes productos publicados</p>
              <Button onClick={() => setLocation("/create-product")}>
                Crear tu primer producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
                  <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
