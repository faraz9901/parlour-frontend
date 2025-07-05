export default function Spinner({ size = 20 }: { size?: number }) {
    return (
        <div className={`h-[${size}px] w-[${size}px] animate-spin rounded-full border-2 border-t-transparent border-gray-500`} />
    )
}