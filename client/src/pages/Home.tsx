import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShoppingCart, Store, TrendingUp, LogIn } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Mini-Tienda</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button onClick={() => setLocation("/catalog")} variant="default">
                  Ir al Catálogo
                </Button>
                <Button onClick={() => setLocation("/dashboard")} variant="outline">
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setLocation("/login")} variant="outline">
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
                <Button onClick={() => setLocation("/register")} variant="default">
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center text-white">
        <h2 className="text-5xl font-bold mb-6">Bienvenido a Mini-Tienda</h2>
        <p className="text-xl mb-8 text-blue-100">
          La plataforma de marketplace donde puedes comprar y vender productos fácilmente
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setLocation("/catalog")}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Explorar Catálogo
          </Button>
          {!isAuthenticated && (
            <Button
              onClick={() => setLocation("/register")}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Crear Cuenta
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir Mini-Tienda?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Compra y Vende</h4>
              <p className="text-gray-600">
                Acceso a un catálogo completo de productos y la posibilidad de vender los tuyos
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Carrito Seguro</h4>
              <p className="text-gray-600">
                Sistema de carrito con validación de saldo y transacciones seguras
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Gestión de Saldo</h4>
              <p className="text-gray-600">
                Saldo virtual para comprar y recibir pagos por tus ventas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h3>
          <p className="text-lg mb-8 text-blue-100">
            Únete a nuestra comunidad de compradores y vendedores
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setLocation("/register")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Registrarse Ahora
              </Button>
              <Button
                onClick={() => setLocation("/login")}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Iniciar Sesión
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Mini-Tienda. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
