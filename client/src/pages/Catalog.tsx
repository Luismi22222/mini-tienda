import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { ShoppingCart, LogIn } from "lucide-react";

export default function Catalog() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const addToCartMutation = trpc.cart.addItem.useMutation();

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      setLocation("/login");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      toast.success("Producto agregado al carrito");
    } catch (error: any) {
      toast.error(error.message || "Error al agregar al carrito");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mini-Tienda</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => setLocation("/cart")}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrito
                </Button>
                <Button variant="outline" onClick={() => setLocation("/my-products")}>
                  Mis Productos
                </Button>
                <Button variant="outline" onClick={() => setLocation("/my-purchases")}>
                  Mis Compras
                </Button>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setLocation("/login")}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
                <Button onClick={() => setLocation("/register")} variant="outline">
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Catálogo de Productos</h2>
          <p className="text-gray-600">Explora nuestros productos disponibles</p>
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
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">
                        ${parseFloat(product.price.toString()).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLocation(`/product/${product.id}`)}
                        variant="outline"
                        className="flex-1"
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        className="flex-1"
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
