import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, ArrowLeft } from "lucide-react";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cartItems, isLoading, refetch } = trpc.cart.getItems.useQuery();
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation();
  const checkoutMutation = trpc.orders.checkout.useMutation();

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeItemMutation.mutateAsync({ cartItemId });
      toast.success("Producto eliminado del carrito");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar producto");
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateQuantityMutation.mutateAsync({ cartItemId, quantity });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar cantidad");
    }
  };

  const handleCheckout = async () => {
    try {
      const result = await checkoutMutation.mutateAsync();
      toast.success(`Compra completada. Orden #${result.orderId}`);
      setLocation("/my-purchases");
    } catch (error: any) {
      toast.error(error.message || "Error al finalizar compra");
    }
  };

  const total = cartItems?.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price.toString()) : 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
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
          Continuar Comprando
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

        {!cartItems || cartItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
              <Button onClick={() => setLocation("/catalog")}>
                Ir al Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {item.product?.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {item.product?.description.substring(0, 100)}...
                        </p>
                        <p className="text-green-600 font-bold">
                          ${parseFloat(item.product?.price.toString() || "0").toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumen */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>Gratis</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? "Procesando..." : "Finalizar Compra"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
