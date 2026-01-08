export default function TodoLoading() {
    return (
        <div className="w-full max-w-[1440px] min-h-[calc(100vh-110px)] pt-9 mx-auto flex gap-5 items-stretch overflow-x-hidden">
            {/* 사이드바 스켈레톤 */}
            <section className="flex flex-col gap-5 self-stretch w-[360px]">
                <div className="w-full h-full min-h-[600px] bg-white rounded-[24px] animate-pulse" />
            </section>

            {/* 메인 섹션 스켈레톤 */}
            <section className="w-full self-stretch">
                <div className="w-full h-8 bg-gray-200 animate-pulse rounded-md mb-6 max-w-[200px]" />
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full h-40 bg-white rounded-[24px] animate-pulse" />
                    ))}
                </div>
            </section>
        </div>
    );
}
