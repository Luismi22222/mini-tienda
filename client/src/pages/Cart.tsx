import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Home, ChevronRight } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Obtener items del carrito
  const { data: cartItems, isLoading, refetch } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutaciones
  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      toast.success("Producto removido del carrito");
      refetch();
    },
  });

  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const checkoutMutation = trpc.orders.checkout.useMutation({
    onSuccess: (data) => {
      toast.success("¡Compra realizada exitosamente!");
      setShowPaymentModal(false);
      refetch();
      setLocation("/my-purchases");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
          <p className="text-gray-600 mb-6">Para ver tu carrito, necesitas estar autenticado</p>
          <Button onClick={() => setLocation("/login")}>Iniciar Sesión</Button>
        </Card>
      </div>
    );
  }

  // Calcular totales
  const subtotal =
    cartItems?.reduce(
      (sum, item) => sum + parseFloat(item.product?.price || "0") * item.quantity,
      0
    ) || 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => setLocation("/")}>
            <Home className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">Mini-Tienda</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Carrito</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold">Checkout</span>
          </div>

          <Button variant="outline" onClick={() => setLocation("/")}>
            Continuar Comprando
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega productos para comenzar a comprar</p>
            <Button onClick={() => setLocation("/")} className="bg-orange-500 hover:bg-orange-600">
              Ir al Catálogo
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex gap-6 hover:bg-gray-50 transition">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {item.product?.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Cantidad:</label>
                          <Input
                            type="number"
                            min="1"
                            max="1000"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              updateQuantityMutation.mutate({
                                cartItemId: item.id,
                                quantity: newQty,
                              });
                            }}
                            className="w-20"
                          />
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            ${parseFloat(item.product?.price || "0").toFixed(2)} c/u
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            ${(
                              parseFloat(item.product?.price || "0") * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeItemMutation.mutate({ cartItemId: item.id })
                          }
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-20">
                <h2 className="text-lg font-bold mb-6">Resumen del Pedido</h2>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems?.length} artículos)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Impuestos (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 mb-3"
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Procesando..." : "Proceder al Pago"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="w-full"
                >
                  Continuar Comprando
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Envío gratis en compras mayores a $50
                </p>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={async (paymentData) => {
            // Procesar pago simulado
            await checkoutMutation.mutateAsync();
          }}
          isLoading={checkoutMutation.isPending}
        />
      )}
    </div>
  );
}
