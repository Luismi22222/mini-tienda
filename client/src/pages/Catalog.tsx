import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Home, Search, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Catalog() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Obtener productos
  const { data: products, isLoading } = trpc.products.list.useQuery();

  // Agregar al carrito
  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Producto agregado al carrito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (!products) return;

    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, products]);

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      setLocation("/login");
      return;
    }

    addToCartMutation.mutate({
      productId,
      quantity: 1,
    });
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Amazon Style */}
      <header className="bg-gradient-to-b from-gray-900 to-gray-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              onClick={() => setLocation("/")}
            >
              <Home className="w-8 h-8" />
              <span className="text-2xl font-bold">Mini-Tienda</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user && (
                <div className="text-sm">
                  <p className="text-gray-300">Hola, {user.name || user.email}</p>
                </div>
              )}
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/dashboard")}
                    className="text-white hover:bg-gray-700"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/login")}
                    className="text-white hover:bg-gray-700"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setLocation("/register")}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 w-full rounded-full text-gray-900"
                />
              </div>
            </div>

            {/* Cart Button */}
            {isAuthenticated && (
              <Button
                onClick={() => setLocation("/cart")}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 rounded-full px-6"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito</span>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        {isAuthenticated && (
          <div className="bg-gray-800 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-2 flex gap-6 text-sm">
              <button
                onClick={() => setLocation("/my-products")}
                className="hover:text-orange-400 transition"
              >
                Mis Productos
              </button>
              <button
                onClick={() => setLocation("/my-purchases")}
                className="hover:text-orange-400 transition"
              >
                Mis Compras
              </button>
              <button
                onClick={() => setLocation("/my-sales")}
                className="hover:text-orange-400 transition"
              >
                Mis Ventas
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {searchTerm ? `Resultados para "${searchTerm}"` : "Catálogo de Productos"}
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} disponible
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group border border-gray-200"
              >
                {/* Product Image */}
                <div className="relative bg-gray-100 h-48 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col h-full">
                  <h3
                    className="font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-orange-500"
                    onClick={() => setLocation(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2"
                    disabled={addToCartMutation.isPending}
                  >
                    {addToCartMutation.isPending ? "Agregando..." : "Agregar al Carrito"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Vuelve más tarde para ver más productos"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
