import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { LogOut, ShoppingCart, Package, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: balance } = trpc.auth.getBalance.useQuery();
  const { data: myProducts } = trpc.products.myProducts.useQuery();
  const { data: myPurchases } = trpc.orders.myPurchases.useQuery();
  const { data: mySales } = trpc.orders.mySales.useQuery();

  const totalSalesAmount = mySales?.reduce((sum, sale) => {
    return sum + (parseFloat(sale.priceAtPurchase.toString()) * sale.quantity);
  }, 0) || 0;

  const totalPurchasesAmount = myPurchases?.reduce((sum, order) => {
    return sum + parseFloat(order.totalPrice.toString());
  }, 0) || 0;

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido, {user?.name || user?.email}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Disponible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ${parseFloat(balance?.balance?.toString() || "0").toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Mis Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{myProducts?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                ${totalPurchasesAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                ${totalSalesAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Mis Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Tienes {myProducts?.length || 0} productos publicados
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setLocation("/my-products")} className="flex-1">
                  Ver Productos
                </Button>
                <Button
                  onClick={() => setLocation("/create-product")}
                  variant="outline"
                  className="flex-1"
                >
                  Crear Nuevo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Mis Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Has realizado {myPurchases?.length || 0} compras
              </p>
              <Button onClick={() => setLocation("/my-purchases")} className="w-full">
                Ver Compras
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Mis Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Has vendido {mySales?.length || 0} productos
              </p>
              <Button onClick={() => setLocation("/my-sales")} className="w-full">
                Ver Ventas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Catálogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explora y compra productos de otros vendedores
              </p>
              <Button onClick={() => setLocation("/catalog")} className="w-full">
                Ir al Catálogo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myPurchases && myPurchases.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Últimas Compras</h4>
                  <div className="space-y-2">
                    {myPurchases.slice(0, 3).map((order) => (
                      <div key={order.id} className="text-sm text-gray-600">
                        Orden #{order.id} - ${parseFloat(order.totalPrice.toString()).toFixed(2)} -{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mySales && mySales.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Últimas Ventas</h4>
                  <div className="space-y-2">
                    {mySales.slice(0, 3).map((sale) => (
                      <div key={sale.id} className="text-sm text-gray-600">
                        {sale.product?.name} x{sale.quantity} - $
                        {(parseFloat(sale.priceAtPurchase.toString()) * sale.quantity).toFixed(2)} -{" "}
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
