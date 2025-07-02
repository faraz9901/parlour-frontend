class Validation {
    email(email: string) {
        // Email must be in the format username@domain.extension
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return { valid: emailRegex.test(email), message: "Invalid email address" };
    }

    password(password: string) {
        // Password must be at least 8 characters long and contain at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return { valid: passwordRegex.test(password), message: "Password must be at least 8 characters long and contain at least one letter and one number" };
    }
}



const validation = new Validation();

export { validation };