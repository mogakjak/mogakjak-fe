export default function GroupLoading() {
    return (
        <main className="w-full h-full max-w-[1440px] mx-auto flex flex-col gap-1 overflow-x-hidden pt-5">
            <div className="flex gap-1 px-6 mb-2">
                <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse" />
            </div>

            <div className="w-full h-full flex gap-5">
                {/* PreviewMain 스켈레톤 */}
                <div className="w-[400px] h-full min-h-[600px] bg-white rounded-2xl animate-pulse" />

                {/* 메인 콘텐츠 스켈레톤 */}
                <div className="w-full h-full bg-white rounded-2xl animate-pulse" />
            </div>
        </main>
    );
}
