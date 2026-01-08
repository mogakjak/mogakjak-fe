export default function GlobalLoading() {
    return (
        <div className="w-full max-w-[1440px] px-9 mx-auto min-h-screen">
            <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-[32px] mt-10 mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-video bg-gray-200 animate-pulse rounded-[24px]" />
                ))}
            </div>
        </div>
    );
}
