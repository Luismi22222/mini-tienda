import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  ShoppingCart, Store, TrendingUp, LogIn, LogOut, Home as HomeIcon,
  Zap, Shield, Users, ArrowRight, Star, CheckCircle2
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
              onClick={() => setLocation("/")}
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Mini-Tienda
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user && (
                <div className="text-sm text-slate-300">
                  <p>Hola, <span className="font-semibold text-orange-400">{user.name || user.email}</span></p>
                </div>
              )}
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => setLocation("/catalog")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Catálogo
                  </Button>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
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
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => setLocation("/register")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
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
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Tu Marketplace <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Seguro</span>
              </h1>
              <p className="text-xl text-slate-300">
                Compra y vende productos con confianza. Sistema de pago seguro, gestión de saldo y transacciones transparentes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => setLocation("/catalog")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
                  >
                    Explorar Catálogo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 px-8 py-6 text-lg"
                  >
                    Mi Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setLocation("/register")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
                  >
                    Comenzar Ahora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => setLocation("/login")}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 px-8 py-6 text-lg"
                  >
                    Iniciar Sesión
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <p className="text-3xl font-bold text-orange-400">30+</p>
                <p className="text-slate-400">Productos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-400">100%</p>
                <p className="text-slate-400">Seguro</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-400">∞</p>
                <p className="text-slate-400">Usuarios</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <ShoppingCart className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="font-semibold text-white">Compra Fácil</p>
                    <p className="text-sm text-slate-400">Catálogo con 30+ productos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <Zap className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="font-semibold text-white">Transacciones Rápidas</p>
                    <p className="text-sm text-slate-400">Pago simulado instantáneo</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <Shield className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="font-semibold text-white">100% Seguro</p>
                    <p className="text-sm text-slate-400">Validaciones en backend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">¿Por qué elegir Mini-Tienda?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: ShoppingCart,
              title: "Carrito Inteligente",
              description: "Gestiona tus compras con facilidad. Agrega, modifica y elimina productos en tiempo real."
            },
            {
              icon: TrendingUp,
              title: "Vende tus Productos",
              description: "Crea tu catálogo personal y vende a otros usuarios. Recibe pagos en tu saldo."
            },
            {
              icon: Users,
              title: "Comunidad Segura",
              description: "Transacciona con confianza. Sistema de validación y protección de datos."
            },
            {
              icon: Zap,
              title: "Saldo Virtual",
              description: "Gestiona tu dinero con un saldo virtual. Compra, vende y transfiere fácilmente."
            },
            {
              icon: Shield,
              title: "Protección Total",
              description: "Contraseñas hasheadas, validaciones backend y transacciones seguras."
            },
            {
              icon: Star,
              title: "Interfaz Moderna",
              description: "Diseño limpio y profesional. Experiencia de usuario optimizada."
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition">
                <Icon className="w-10 h-10 text-orange-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl text-slate-300 mb-8">Únete a Mini-Tienda y empieza a comprar y vender hoy mismo.</p>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/catalog")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
            >
              Ir al Catálogo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setLocation("/register")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
            >
              Registrarse Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 Mini-Tienda. Todos los derechos reservados.</p>
          <p className="mt-2 text-sm">Plataforma de marketplace segura y confiable</p>
        </div>
      </footer>
    </div>
  );
}
