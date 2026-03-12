
import { hash } from 'bcryptjs';

//Función para hasear una contraseña de forma 'manual'
async function hashPassword() {
    const password = 'tuContraseñaSegura';
    const hashed = await hash(password, 10);
    console.log('Hash:', hashed);
}

hashPassword();

