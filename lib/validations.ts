import { Role } from "./enums";

class Validation {
    email(email: string) {
        // Email must be in the format username@domain.extension
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return { valid: emailRegex.test(email), message: "Invalid email address" };
    }

    password(password: string) {
        // Password must be at least 8 characters long and contain at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return { valid: passwordRegex.test(password), message: "Password must be at least 8 characters long and contain at least one letter and one number no special characters" };
    }

    name(name: string) {
        // Name must be at least 3 characters long
        const nameRegex = /^[a-zA-Z ]+$/;
        return { valid: nameRegex.test(name), message: "Invalid name" };
    }

    role(role: Role) {
        const validRole = Object.values(Role).includes(role);
        return { valid: validRole, message: "Invalid role" };
    }
}



const validation = new Validation();

export { validation };