
export default function GlobalSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-base-100/60">
            <span className="loading loading-spinner text-primary/80 loading-lg"></span>
        </div>
    )
}
