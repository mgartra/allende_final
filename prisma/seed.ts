import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

//-------------- Funciones Reutilizables --------------------------

async function createRoot(
  root_id: number,
  name: string,
  lastName: string,
  email: string,
  phone: string,
  password: string
) {
  // Verificar si ya existe el root
  const existingRoot = await prisma.root.findUnique({
    where: { root_id }
  });

  if (existingRoot) {
    console.log(` Root con ID ${root_id} ya existe`);
    return existingRoot;
  }
const hashedPassword = await hash(password, 10);
  return await prisma.root.create({
    data: {
      root_id,
      name,
      last_name: lastName,
      email,
      phone,
      password: hashedPassword
    }
  });
}

async function createUser(
  name: string,
  lastName: string,
  birthDate: string,
  email: string,
  phone: string,
  password: string,
  userType: 'librarian' | 'user' = 'user'
) {
  // Verificar si ya existe el user
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`User ${email} ya existe`);
    return existingUser;
  }
const hashedPassword = await hash(password, 10);
  return await prisma.user.create({
    data: {
      name,
      last_name: lastName,
      birth_date: new Date(birthDate),
      email,
      phone,
      password: hashedPassword,
      registration_date: new Date(),
      user_type: userType,
      blocked_until: null
      
    }
  });
}

async function createCategory(
  icon: string | null,
  name: string,
  description: string | null = null
) {
  // Verificar si ya existe la categoría
  const existingCategory = await prisma.category.findUnique({
    where: { name }
  });

  if (existingCategory) {
    console.log(`Categoría "${name}" ya existe`);
    return existingCategory;
  }

  return await prisma.category.create({
    data: { icon, name, description }
  });
}

async function createAuthor(
  name: string,
  lastName: string,
  nationality: string | null = null
) {
  // Verificar si ya existe el autor
  const existingAuthor = await prisma.author.findFirst({
    where: { name, last_name: lastName }
  });

  if (existingAuthor) {
    console.log(`Autor "${name} ${lastName}" ya existe`);
    return existingAuthor;
  }

  return await prisma.author.create({
    data: { name, last_name: lastName, nationality }
  });
}

async function createBook(
  title: string,
  isbn: string,
  summary: string | null,
  publicationYear: number | null,
  totalCopies: number,
  reference: number,
  image: string | null,
  pdf_url: string | null,
  authorIds: number[],
  categoryIds: number[]
) {
  // Verificar si ya existe el libro por ISBN
  const existingBook = await prisma.book.findUnique({
    where: { isbn }
  });

  if (existingBook) {
    console.log(`Libro con ISBN ${isbn} ya existe`);
    return existingBook;
  }

  return await prisma.book.create({
    data: {
      title,
      isbn,
      summary,
      publication_year: publicationYear,
      total_copies: totalCopies,
      available_copies: totalCopies, // Inicialmente todas las copias disponibles
      reference,
      image,
      pdf_url,
      authors: {
        connect: authorIds.map(id => ({ author_id: id }))
      },
      categories: {
        connect: categoryIds.map(id => ({ category_id: id }))
      }
    }
  });
}

//-------------------- Función Principal --------------------------

async function main() {
  console.log('Iniciando la creación de datos de prueba...\n');

  // --- Root (super administrador) ---
  const root = await createRoot(
    1, // ID fijo para el único root
    'María',
    'García',
    'root@allendelibrary.com',
    '600000001',
    '1234567'
  );
  console.log(`Root creado: ${root.name} ${root.last_name}`);

  // --- Librarians ---
  const librarian1 = await createUser(
    'Ana',
    'Martínez',
    '1985-03-15',
    'ana.martinez@allendelibrary.com',
    '611111111',
    'librarian123',
    'librarian'
  );
  const librarian2 = await createUser(
    'Luis',
    'Fernández',
    '1990-07-22',
    'luis.fernandez@allendelibrary.com',
    '622222222',
    'librarian456',
    'librarian'
  );
  console.log(`Bibliotecarios creados: ${librarian1.name}, ${librarian2.name}`);

  // --- Categorías ---
  const literary = await createCategory('1', 'Ficción Literaria y Clásicos', 'Incluye la narrativa de alta calidad y obras fundamentales de la literatura universal.');
  const mistery = await createCategory('2', 'Misterio, Thriller y Novela Negra', 'Agrupa todo lo relacionado con el suspense, crímenes y tramas policíacas.');
  const fictionFantasy = await createCategory('3', 'Fantasía y Ciencia Ficción', 'Engloba la literatura de género especulativo, mundos imaginarios y futurismo.');
  const selfCare = await createCategory('4', 'Autoayuda y Bienestar', 'Desarrollo personal, psicología práctica y espiritualidad.');
  const history = await createCategory('5', 'Historia y Política', 'Análisis del pasado, biografías históricas y geopolítica contemporánea.');
  const scienceNature = await createCategory('6', 'Ciencia y Naturaleza', 'Divulgación científica, ensayos y exploración del mundo natural.');
  const art = await createCategory('7', 'Arte', 'Diseño, fotografía, arquitectura y gastronomía.');
  const young = await createCategory('8', 'Infantil y Juvenil', 'Literatura para adolescentes y niños.');
  const graphic = await createCategory('9', 'Cómics y novela gráfica', 'Manga, cómics europeos y narrativa visual.');
  const humanities = await createCategory('10', 'Humanidades y ensayo', 'Filosofía, sociología y reflexión profunda.');

  console.log('Categorías creadas');

  // --- Autores ---
  const garciaMarquez = await createAuthor('Gabriel', 'García Márquez', 'Colombiano');
  const orwell = await createAuthor('George', 'Orwell', 'Británico');
  const hawking = await createAuthor('Stephen', 'Hawking', 'Británico');
  const woolf = await createAuthor('Virginia', 'Woolf', 'Británica');
  const rojas = await createAuthor('Marian', 'Rojas Estapé', 'Española');
  const navarro = await createAuthor('Julia', 'Navarro', 'Española');
  const tolle = await createAuthor('Eckhart', 'Tolle', 'Alemán');
  const goodall = await createAuthor('Jane', 'Goodall', 'Británica');
  const allende = await createAuthor('Isabel', 'Allende', 'Chilena');
  const king = await createAuthor('Stephen', 'King', 'Estadounidense');
  const simone = await createAuthor('Simone', 'de Beauvoir', 'Francesa');
  const quino = await createAuthor('Joaquín Salvador', 'Lavado Tejón', 'Argentino');
  const beard = await createAuthor('Mary', 'Beard', 'Británica');
  const george = await createAuthor('George R.R.', 'Martin', 'Estadounidense');

  console.log('Autores creados');

  // --- Libros ---
  await createBook(
    'Cien años de soledad',
    '978-0307474728',
    'La gran novela de Gabriel García Márquez que narra la historia de la familia Buendía en el mítico pueblo de Macondo.',
    1967,
    3,
    5,
    '1.jpg',
    '',
    [garciaMarquez.author_id],
    [literary.category_id]
  );

  await createBook(
    'La señora Dalloway',
    '978-8420651156',
    'Novela de Virginia Woolf que transcurre en un solo día en la vida de Clarissa Dalloway en Londres de 1923.',
    1925,
    5,
    5,
    '2.jpg',
    '',
    [woolf.author_id],
    [literary.category_id]
  );

  await createBook(
    'La casa de los espíritus',
    '978-0307476142',
    'Primera novela de Isabel Allende, una saga familiar que abarca cuatro generaciones de la familia Trueba.',
    1982,
    4,
    5,
    '3.jpg',
    '',
    [allende.author_id],
    [literary.category_id]
  );

  await createBook(
    '1984',
    '978-8466332910',
    'Distopía política de George Orwell que describe un futuro totalitario bajo la vigilancia constante del Gran Hermano.',
    1949,
    7,
   5,
    '4.jpg',
    '',
    [orwell.author_id],
    [literary.category_id]
  );

  await createBook(
    'It',
    '978-1501142970',
    'Novela de terror de Stephen King sobre un grupo de niños que enfrentan a una entidad sobrenatural que toma la forma de un payaso.',
    1986,
    6,
    3,
    '5.jpg',
    '',
    [king.author_id],
    [mistery.category_id]
  );

  await createBook(
    'Dime quién soy',
    '978-8401337550',
    'Thriller histórico de Julia Navarro que sigue la vida de una mujer a través de los grandes acontecimientos del siglo XX.',
    2010,
    4,
   5,
    '6.jpg',
    '',
    [navarro.author_id],
    [mistery.category_id]
  );

  await createBook(
    'Juego de Tronos',
    '978-8466664417',
    'Primera entrega de la saga Canción de Hielo y Fuego de George R.R. Martin, ambientada en los Siete Reinos.',
    1996,
    8,
    5,
    '7.jpg',
    '',
    [george.author_id],
    [fictionFantasy.category_id]
  );

  await createBook(
    'Cómo hacer que te pasen cosas buenas',
    '978-8467053302',
    'Bestseller de Marian Rojas Estapé sobre neurociencia y gestión emocional para mejorar la calidad de vida.',
    2018,
    9,
    3,
    '8.jpg',
    '',
    [rojas.author_id],
    [selfCare.category_id]
  );

  await createBook(
    'El poder del ahora',
    '978-8478084579',
    'Guía espiritual de Eckhart Tolle para vivir en el presente y liberarse del sufrimiento psicológico.',
    1997,
    10,
    4,
    '9.jpg',
    'Tolle_Eckhart-El_Poder_del_Ahora.pdf',
    [tolle.author_id],
    [selfCare.category_id]
  );

  await createBook(
    'SPQR: Una historia de la antigua Roma',
    '978-8491390404',
    'Obra magistral de Mary Beard que explora los orígenes y expansión de la antigua Roma desde sus inicios hasta el siglo III d.C.',
    2015,
    2,
    4,
    '10.jpg',
    '',
    [beard.author_id],
    [history.category_id]
  );

  await createBook(
    'Breve historia del tiempo',
    '978-8464243652',
    'Clásico de Stephen Hawking que explica los misterios del universo, los agujeros negros y el origen del cosmos.',
    1988,
    5,
    3,
    '11.jpg',
    '',
    [hawking.author_id],
    [scienceNature.category_id]
  );

  await createBook(
    'A la sombra del hombre',
    '978-8423429363',
    'Memorias de Jane Goodall sobre sus revolucionarios estudios de los chimpancés en Gombe.',
    1971,
    3,
   4,
    '12.jpg',
    '',
    [goodall.author_id],
    [scienceNature.category_id]
  );

  await createBook(
    'Toda Mafalda',
    '978-9505156948',
    'Colección completa de las tiras cómicas de Quino protagonizadas por la niña más crítica y entrañable de la historieta.',
    1992,
    12,
  5,
    '13.jpg',
    '',
    [quino.author_id],
    [graphic.category_id, young.category_id]
  );

  await createBook(
    'El segundo sexo',
    '978-8497593786',
    'Obra fundamental de Simone de Beauvoir que analiza la condición de la mujer en la sociedad occidental.',
    1949,
    4,
    5,
    '14.jpg',
    '',
    [simone.author_id],
    [humanities.category_id]
  );

  console.log('Libros creados');

  // --- Usuarios Lectores ---
  const user1 = await createUser(
    'Claudia',
    'Miran',
    '1990-05-15',
    'miran.claudia@gmail.com',
    '633333333',
    'lector123',
    'user'
  );
  const user2 = await createUser(
    'Miguel',
    'Torres',
    '1985-08-22',
    'torres.miguel@gmail.com',
    '644444444',
    'lector456',
    'user'
  );
  console.log(`Usuarios lectores creados: ${user1.name}, ${user2.name}`);

  // --- Eventos (opcional) ---
  const event1 = await prisma.event.create({
    data: {
      image: 'club.jpg',
      name: 'Club de Lectura: Cien años de soledad',
      description: 'En este encuentro del club de lectura comentaremos la novela Cien años de soledad de Gabriel García Márquez. Los participantes compartirán sus opiniones sobre la historia de la familia Buendía y el mundo de Macondo, analizando sus personajes, temas principales y el estilo de realismo mágico del autor.  ',
      event_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      capacity: 15,
      participants: 0,
      cancelations: 0,
      user_id: librarian1.user_id,
      
    }
  });
  const event2 = await prisma.event.create({
    data: {
      image: 'club.jpg',
      name: 'Taller de Escritura Creativa',
      description: 'Este taller de escritura creativa está dirigido a personas interesadas en desarrollar su imaginación y mejorar sus habilidades narrativas. A través de diferentes ejercicios y propuestas, los participantes aprenderán a crear personajes, construir historias y experimentar con distintos estilos de escritura.',
      event_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      capacity: 20,
      participants: 0,
      cancelations: 0,
      user_id: librarian2.user_id,
      
    }
  });
  console.log(`Eventos creados: ${event1.name} , ${event2.name}`);

  console.log('\n Todos los datos de prueba han sido creados exitosamente');
}

main()
  .catch((e) => {
    console.error('\n Error durante la creación de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(' Conexión a la base de datos cerrada');
  });