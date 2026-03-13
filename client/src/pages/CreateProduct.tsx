import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";

export default function CreateProduct() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const createProductMutation = trpc.products.create.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createProductMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        imageUrl: formData.imageUrl,
      });

      toast.success("Producto creado exitosamente");
      setLocation("/my-products");
    } catch (error: any) {
      toast.error(error.message || "Error al crear producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/my-products")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Mis Productos
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Producto</CardTitle>
            <CardDescription>Completa los detalles de tu producto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Laptop Dell"
                  required
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 255 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe tu producto en detalle..."
                  required
                  maxLength={5000}
                  rows={6}
                  className="w-full border rounded-md p-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/5000 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio (USD) *</label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="99.99"
                  required
                  step="0.01"
                  min="0.01"
                  max="999999.99"
                />
                <p className="text-xs text-gray-500 mt-1">Debe ser un número positivo</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de Imagen (Opcional)</label>
                <Input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Proporciona una URL válida de una imagen
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Crear Producto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/my-products")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
