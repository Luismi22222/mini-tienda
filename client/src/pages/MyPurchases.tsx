import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";

export default function MyPurchases() {
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = trpc.orders.myPurchases.useQuery();

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
          Volver al Catálogo
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Compras</h1>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-600 mb-4">No tienes compras realizadas</p>
              <Button onClick={() => setLocation("/catalog")}>
                Ir al Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Orden #{order.id}</CardTitle>
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex gap-4">
                          {item.product?.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.product?.name}</h4>
                            <p className="text-sm text-gray-600">
                              Vendedor: {item.seller?.name}
                            </p>
                            <p className="text-sm">Cantidad: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              ${parseFloat(item.priceAtPurchase.toString()).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: ${(parseFloat(item.priceAtPurchase.toString()) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total de la orden:</span>
                        <span className="text-green-600">
                          ${parseFloat(order.totalPrice.toString()).toFixed(2)}
                        </span>
                      </div>
                    </div>
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
