import { getDb } from './server/db.ts';
import { products } from './drizzle/schema.ts';

const productsData = [
  // Electrónica
  {
    name: "Laptop Dell XPS 13",
    description: "Laptop ultraportátil con procesador Intel i7, 16GB RAM, 512GB SSD. Pantalla FHD 13.3 pulgadas. Perfecta para trabajo y entretenimiento.",
    price: 1299.99,
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop"
  },
  {
    name: "iPhone 15 Pro",
    description: "Smartphone Apple con chip A17 Pro, cámara de 48MP, pantalla OLED 6.1 pulgadas. Resistente al agua IP68.",
    price: 999.99,
    imageUrl: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop"
  },
  {
    name: "Samsung Galaxy S24",
    description: "Teléfono Android con pantalla AMOLED 6.2 pulgadas, procesador Snapdragon 8 Gen 3, cámara de 50MP.",
    price: 899.99,
    imageUrl: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop"
  },
  {
    name: "iPad Air 6",
    description: "Tablet de 11 pulgadas con chip M2, pantalla Liquid Retina, compatible con Apple Pencil Pro.",
    price: 799.99,
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop"
  },
  {
    name: "AirPods Pro 2",
    description: "Auriculares inalámbricos con cancelación de ruido activa, audio espacial, 6 horas de batería.",
    price: 249.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
  },
  {
    name: "Sony WH-1000XM5",
    description: "Auriculares over-ear con cancelación de ruido líder en la industria, 30 horas de batería.",
    price: 399.99,
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop"
  },
  {
    name: "Apple Watch Series 9",
    description: "Reloj inteligente con pantalla Retina siempre activa, monitor de salud completo, GPS.",
    price: 399.99,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"
  },
  {
    name: "GoPro Hero 12",
    description: "Cámara de acción 5.3K, resistente al agua, estabilización de imagen avanzada.",
    price: 499.99,
    imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop"
  },
  {
    name: "DJI Air 3S",
    description: "Dron con cámara 4K, alcance de 15km, batería de 46 minutos, sensor de obstáculos.",
    price: 1099.99,
    imageUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&h=500&fit=crop"
  },
  {
    name: "Kindle Paperwhite",
    description: "E-reader con pantalla de 6.8 pulgadas, luz ajustable, resistente al agua, almacenamiento de 32GB.",
    price: 159.99,
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop"
  },
  // Ropa y Accesorios
  {
    name: "Nike Air Max 90",
    description: "Zapatillas deportivas clásicas con tecnología Air Max, cómodas para uso diario.",
    price: 129.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"
  },
  {
    name: "Adidas Ultraboost 23",
    description: "Zapatillas de running con tecnología Boost, diseño moderno, excelente amortiguación.",
    price: 189.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"
  },
  {
    name: "Camiseta Nike Dri-FIT",
    description: "Camiseta deportiva con tecnología Dri-FIT, transpirable, perfecta para entrenamientos.",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"
  },
  {
    name: "Jeans Levi's 501",
    description: "Jeans clásicos de corte recto, tela denim 100% algodón, durables y cómodos.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop"
  },
  {
    name: "Chaqueta The North Face",
    description: "Chaqueta impermeable con tecnología ThermoBall, ideal para clima frío.",
    price: 249.99,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop"
  },
  // Hogar y Jardín
  {
    name: "Cafetera Nespresso",
    description: "Máquina de café automática con 19 bares de presión, calienta rápidamente.",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=500&h=500&fit=crop"
  },
  {
    name: "Licuadora Vitamix",
    description: "Licuadora de alta potencia 2.2 HP, perfecta para smoothies y sopas calientes.",
    price: 449.99,
    imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&h=500&fit=crop"
  },
  {
    name: "Microondas Samsung",
    description: "Microondas de 1000W con tecnología de calentamiento uniforme, 25 litros.",
    price: 179.99,
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop"
  },
  {
    name: "Lámpara LED Inteligente",
    description: "Lámpara RGB con control por aplicación, compatible con Alexa y Google Home.",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=500&fit=crop"
  },
  {
    name: "Almohada Memory Foam",
    description: "Almohada ergonómica con espuma viscoelástica, alivia el dolor de cuello.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500&h=500&fit=crop"
  },
  // Libros y Educación
  {
    name: "Atomic Habits - James Clear",
    description: "Libro sobre cómo construir hábitos efectivos. Bestseller internacional.",
    price: 19.99,
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop"
  },
  {
    name: "El Hábito del Éxito",
    description: "Guía práctica para desarrollar hábitos de éxito en la vida personal y profesional.",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop"
  },
  {
    name: "Python para Principiantes",
    description: "Libro completo para aprender programación en Python desde cero.",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop"
  },
  // Deportes
  {
    name: "Bicicleta Mountain Bike Trek",
    description: "Bicicleta de montaña con suspensión delantera, 21 velocidades, ruedas de 26 pulgadas.",
    price: 599.99,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"
  },
  {
    name: "Pelota de Fútbol Adidas",
    description: "Balón de fútbol oficial con tecnología Tango, cubierta de poliuretano.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1579954614171-828baf2dcdb5?w=500&h=500&fit=crop"
  },
  {
    name: "Raqueta de Tenis Wilson",
    description: "Raqueta profesional con marco de grafito, peso ligero, excelente control.",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34c8?w=500&h=500&fit=crop"
  },
  {
    name: "Mancuernas Ajustables",
    description: "Set de mancuernas ajustables de 5 a 25 kg, ideales para entrenamientos en casa.",
    price: 299.99,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop"
  },
  {
    name: "Yoga Mat Premium",
    description: "Tapete de yoga de 6mm, antideslizante, material ecológico y resistente.",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop"
  },
  // Belleza y Cuidado Personal
  {
    name: "Secador de Cabello Dyson",
    description: "Secador iónico con tecnología de aire caliente, reduce el daño del cabello.",
    price: 399.99,
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop"
  },
  {
    name: "Cepillo de Dientes Eléctrico Oral-B",
    description: "Cepillo de dientes sónico con 3 modos de limpieza, recargable.",
    price: 79.99,
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?w=500&h=500&fit=crop"
  },
  {
    name: "Crema Facial Retinol",
    description: "Crema anti-envejecimiento con retinol puro, reduce arrugas y manchas.",
    price: 59.99,
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"
  },
  {
    name: "Perfume Dior Sauvage",
    description: "Perfume masculino con notas de ámbar y especias, duración de 8 horas.",
    price: 99.99,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop"
  }
];

async function seedProducts() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    console.log('✓ Conectado a la base de datos');

    // Obtener el primer usuario
    const users = await db.query.users.findMany({ limit: 1 });
    
    if (users.length === 0) {
      console.error('❌ No hay usuarios en la base de datos. Por favor, crea un usuario primero.');
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`✓ Usando usuario existente con ID: ${userId}`);

    // Insertar productos
    let insertedCount = 0;
    for (const product of productsData) {
      try {
        await db.insert(products).values({
          userId,
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          imageUrl: product.imageUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        insertedCount++;
        console.log(`✓ Producto insertado: ${product.name}`);
      } catch (error) {
        console.error(`✗ Error al insertar ${product.name}:`, error.message);
      }
    }

    console.log(`\n✅ Se insertaron ${insertedCount}/${productsData.length} productos exitosamente`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedProducts();
