import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";

export default function MySales() {
  const [, setLocation] = useLocation();
  const { data: sales, isLoading } = trpc.orders.mySales.useQuery();

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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Ventas</h1>

        {!sales || sales.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-600 mb-4">No tienes ventas realizadas</p>
              <Button onClick={() => setLocation("/my-products")}>
                Crear Productos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {sale.product?.imageUrl && (
                      <img
                        src={sale.product.imageUrl}
                        alt={sale.product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{sale.product?.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Comprador: {sale.seller?.name}
                      </p>
                      <p className="text-sm">
                        Cantidad: {sale.quantity} x ${parseFloat(sale.priceAtPurchase.toString()).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha: {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${(parseFloat(sale.priceAtPurchase.toString()) * sale.quantity).toFixed(2)}
                      </p>
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
