import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/product/:id");
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const productId = params?.id ? parseInt(params.id) : null;
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const addToCartMutation = trpc.cart.addItem.useMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      setLocation("/login");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ productId: product!.id, quantity });
      toast.success("Producto agregado al carrito");
      setLocation("/cart");
    } catch (error: any) {
      toast.error(error.message || "Error al agregar al carrito");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-96 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Producto no encontrado</p>
          <Button onClick={() => setLocation("/catalog")}>Volver al Catálogo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/catalog")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Catálogo
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagen */}
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm">Precio</p>
                    <p className="text-4xl font-bold text-green-600">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 border rounded text-center"
                        min="1"
                        max="1000"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Fecha de publicación:</strong> {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
