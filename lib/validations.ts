import { Role, TaskStatus } from "./enums";

class Validation {

    empty(value: string, name?: string) {
        return { valid: value.trim() !== "", message: `${name || "Field"} cannot be empty` };
    }

    email(email: string) {
        // Email must be in the format username@domain.extension
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return { valid: emailRegex.test(email), message: "Invalid email address" };
    }

    password(password: string) {
        return { valid: password.length >= 8, message: "Password must be at least 8 characters long" };
    }

    name(name: string) {
        // Name must be at least 3 characters long
        const nameRegex = /^[a-zA-Z0-9 ]+$/;
        return { valid: nameRegex.test(name), message: "Invalid name" };
    }

    role(role: Role) {
        const validRole = Object.values(Role).includes(role);
        return { valid: validRole, message: "Invalid role" };
    }

    status(status: TaskStatus) {
        const validStatus = Object.values(TaskStatus).includes(status);
        return { valid: validStatus, message: "Invalid status" };
    }
}



const validation = new Validation();

export { validation };