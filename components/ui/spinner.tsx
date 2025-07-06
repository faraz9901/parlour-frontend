export default function Spinner({ size = 20 }: { size?: number }) {
    return (
        <div className={`animate-spin rounded-full h-[${size}px] w-[${size}px] border-b-2 border-gray-900`} />
    )
}