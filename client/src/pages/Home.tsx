import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShoppingCart, Store, TrendingUp, LogIn, LogOut, Home as HomeIcon } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Amazon Style */}
      <header className="bg-gradient-to-b from-gray-900 to-gray-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <HomeIcon className="w-8 h-8" />
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
                    onClick={() => setLocation("/catalog")}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ir al Catálogo
                  </Button>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    variant="outline"
                    className="text-white border-white hover:bg-gray-700"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setLocation("/login")}
                    variant="ghost"
                    className="text-white hover:bg-gray-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => setLocation("/register")}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl font-bold mb-6">Bienvenido a Mini-Tienda</h1>
              <p className="text-xl mb-8 text-orange-100">
                La plataforma de marketplace donde puedes comprar y vender productos con facilidad. 
                Acceso a miles de productos y gestión segura de tus transacciones.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setLocation("/catalog")}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Explorar Catálogo
                </Button>
                {!isAuthenticated && (
                  <Button
                    onClick={() => setLocation("/register")}
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 font-bold"
                  >
                    Crear Cuenta
                  </Button>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8 text-center">
                <ShoppingCart className="w-32 h-32 mx-auto text-white opacity-80" />
                <p className="text-white mt-4 font-semibold">30+ Productos Disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            ¿Por qué elegir Mini-Tienda?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Compra y Vende</h3>
              <p className="text-gray-600 leading-relaxed">
                Acceso a un catálogo completo de productos y la posibilidad de vender los tuyos. 
                Gestiona tu tienda personal con facilidad.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Carrito Seguro</h3>
              <p className="text-gray-600 leading-relaxed">
                Sistema de carrito con validación de saldo y transacciones seguras. 
                Paga de forma simulada sin riesgos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Gestión de Saldo</h3>
              <p className="text-gray-600 leading-relaxed">
                Saldo virtual para comprar y recibir pagos por tus ventas. 
                Seguimiento completo de transacciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-orange-600">30+</p>
              <p className="text-gray-600 mt-2">Productos Disponibles</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">100%</p>
              <p className="text-gray-600 mt-2">Transacciones Seguras</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">24/7</p>
              <p className="text-gray-600 mt-2">Disponible Siempre</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Cómo Funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Regístrate", desc: "Crea tu cuenta en segundos" },
              { step: 2, title: "Explora", desc: "Navega por el catálogo" },
              { step: 3, title: "Compra", desc: "Agrega al carrito y paga" },
              { step: 4, title: "Disfruta", desc: "Recibe tus productos" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-10 text-gray-300">
            Únete a nuestra comunidad de compradores y vendedores hoy mismo
          </p>
          {!isAuthenticated ? (
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                onClick={() => setLocation("/register")}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                Registrarse Ahora
              </Button>
              <Button
                onClick={() => setLocation("/login")}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-bold"
              >
                Iniciar Sesión
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setLocation("/catalog")}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ir al Catálogo
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Mini-Tienda</h4>
              <p className="text-sm">La mejor plataforma de marketplace</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Comprador</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Catálogo</a></li>
                <li><a href="#" className="hover:text-white">Mis Compras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Vendedor</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Mis Productos</a></li>
                <li><a href="#" className="hover:text-white">Mis Ventas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Ayuda</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2026 Mini-Tienda. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
