import React, { useState } from 'react'
import { Input } from './input'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from './button'
import { InputHTMLAttributes } from 'react'


function Password({ ...props }: InputHTMLAttributes<HTMLInputElement>) {

    const [showPassword, setShowPassword] = useState(false)

    const togglePassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="flex items-center gap-2 relative w-full">
            <Input type={showPassword ? "text" : "password"} {...props} />
            <Button type="button" onClick={togglePassword} className="absolute right-0">
                {showPassword ? <Eye /> : <EyeOff />}
            </Button>
        </div>
    )
}

export default Password